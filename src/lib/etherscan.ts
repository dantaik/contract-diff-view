const getApiKeys = (): string[] => {
  const keys: string[] = [];

  // Primary API key from environment
  const primaryKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  console.log('Primary API Key loaded:', primaryKey ? 'Yes' : 'No');
  if (primaryKey) {
    keys.push(primaryKey);
  }

  // Fallback keys from environment (comma-separated)
  const fallbackKeys = import.meta.env.VITE_ETHERSCAN_FALLBACK_KEYS;
  if (fallbackKeys) {
    keys.push(...fallbackKeys.split(',').map((k: string) => k.trim()));
  }

  if (keys.length === 0) {
    throw new Error('No Etherscan API keys configured. Please set VITE_ETHERSCAN_API_KEY in your .env file.');
  }

  console.log(`Total API keys configured: ${keys.length}`);
  return keys;
};

const API_KEYS = getApiKeys();

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
const DEFAULT_CHAIN_ID = '1'; // Ethereum mainnet
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const API_DELAY_MS = 250; // Delay between API calls to avoid rate limits (4 calls per second max)

// Global chainid that can be set by the app
let currentChainId = DEFAULT_CHAIN_ID;

export function setChainId(chainId: string) {
  currentChainId = chainId;
  console.log(`Chain ID set to: ${chainId}`);
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface SourceFile {
  name: string;
  content: string;
}

interface ContractSource {
  address: string;
  files: SourceFile[];
  compilerVersion: string;
  verified: boolean;
}

class EtherscanCache {
  private getCacheKey(address: string, fileName?: string): string {
    return fileName ? `${address}:${fileName}` : address;
  }

  get(address: string, fileName?: string): any | null {
    const key = this.getCacheKey(address, fileName);
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    try {
      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      if (now - entry.timestamp > CACHE_EXPIRY_MS) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  set(address: string, data: any, fileName?: string): void {
    const key = this.getCacheKey(address, fileName);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  }
}

const cache = new EtherscanCache();

// Rate limiting utility
let lastApiCallTime = 0;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < API_DELAY_MS) {
    const waitTime = API_DELAY_MS - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms before next API call`);
    await sleep(waitTime);
  }
  lastApiCallTime = Date.now();
}

async function fetchWithRetry(url: string, maxRetries = 10): Promise<any> {
  let lastError: Error | null = null;
  let retryCount = 0;
  let delayMs = 1000; // Start with 1 second delay

  while (retryCount < maxRetries) {
    for (let i = 0; i < API_KEYS.length; i++) {
      try {
        // Enforce rate limiting before each API call
        await enforceRateLimit();

        const apiKey = API_KEYS[i];
        const urlWithKey = `${url}&chainid=${currentChainId}&apikey=${apiKey}`;
        console.log(`Attempting API call (retry ${retryCount + 1}/${maxRetries}, key ${i + 1}/${API_KEYS.length}, chainId: ${currentChainId})`);

        const response = await fetch(urlWithKey);

        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          console.error('HTTP error:', response.status, response.statusText);
          throw error;
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.status === '1') {
          return data;
        }

        if (data.message === 'NOTOK') {
          const errorMsg = data.result || 'API request failed';

          // Check if it's a rate limit error
          if (errorMsg.includes('rate limit') || errorMsg.includes('Max calls')) {
            console.warn(`Rate limit hit: ${errorMsg}. Retrying after ${delayMs}ms...`);
            await sleep(delayMs);
            // Exponential backoff with max 5 seconds
            delayMs = Math.min(delayMs * 1.5, 5000);
            break; // Break inner loop to retry
          }

          // For other errors, throw immediately
          const error = new Error(errorMsg);
          console.error('API returned NOTOK:', errorMsg);
          throw error;
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If it's not a rate limit error and we're on the last key, increment retry count
        if (!lastError.message.includes('rate limit') && i === API_KEYS.length - 1) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`Request failed, retrying in ${delayMs}ms...`);
            await sleep(delayMs);
            delayMs = Math.min(delayMs * 1.5, 5000);
          }
        }
      }
    }

    retryCount++;
  }

  throw lastError || new Error('Max retries exceeded');
}

export async function getContractSource(address: string): Promise<ContractSource> {
  // Check cache first
  const cached = cache.get(address);
  if (cached) {
    return cached;
  }

  const url = `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${address}`;

  try {
    const data = await fetchWithRetry(url);

    if (!data.result || data.result.length === 0) {
      throw new Error('Contract not found');
    }

    const contractData = data.result[0];

    if (contractData.SourceCode === '') {
      const result: ContractSource = {
        address,
        files: [],
        compilerVersion: '',
        verified: false
      };
      cache.set(address, result);
      return result;
    }

    let files: SourceFile[] = [];

    // Handle multi-file contracts (JSON format)
    if (contractData.SourceCode.startsWith('{{')) {
      const sourceCode = contractData.SourceCode.slice(1, -1);
      const parsed = JSON.parse(sourceCode);

      if (parsed.sources) {
        files = Object.entries(parsed.sources).map(([name, data]: [string, any]) => ({
          name,
          content: data.content
        }));
      }
    } else if (contractData.SourceCode.startsWith('{')) {
      // Single file in JSON format
      try {
        const parsed = JSON.parse(contractData.SourceCode);
        if (parsed.sources) {
          files = Object.entries(parsed.sources).map(([name, data]: [string, any]) => ({
            name,
            content: data.content
          }));
        } else {
          // Fallback to treating as single file
          files = [{
            name: contractData.ContractName + '.sol',
            content: contractData.SourceCode
          }];
        }
      } catch {
        files = [{
          name: contractData.ContractName + '.sol',
          content: contractData.SourceCode
        }];
      }
    } else {
      // Single file
      files = [{
        name: contractData.ContractName + '.sol',
        content: contractData.SourceCode
      }];
    }

    const result: ContractSource = {
      address,
      files,
      compilerVersion: contractData.CompilerVersion,
      verified: true
    };

    cache.set(address, result);
    return result;
  } catch (error) {
    console.error('Error fetching contract source:', error);
    throw error;
  }
}

export async function getProxyImplementation(proxyAddress: string): Promise<string | null> {
  const url = `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${proxyAddress}`;

  try {
    const data = await fetchWithRetry(url);

    if (!data.result || data.result.length === 0) {
      return null;
    }

    const contractData = data.result[0];

    // Check if it's a proxy
    if (contractData.Implementation && contractData.Implementation !== '') {
      return contractData.Implementation;
    }

    return null;
  } catch (error) {
    console.error('Error fetching proxy implementation:', error);
    return null;
  }
}

export type { ContractSource, SourceFile };
