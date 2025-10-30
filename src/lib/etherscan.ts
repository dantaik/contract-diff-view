import {
  ETHERSCAN_API_URL,
  DEFAULT_CHAIN_ID,
  CACHE_EXPIRY_MS,
  API_DELAY_MS,
  NON_RETRYABLE_ERRORS,
} from './constants';

const getApiKeys = (): string[] => {
  const keys: string[] = [];

  const primaryKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  console.log('Primary API Key loaded:', primaryKey ? 'Yes' : 'No');
  if (primaryKey) {
    keys.push(primaryKey);
  }

  const fallbackKeys = import.meta.env.VITE_ETHERSCAN_FALLBACK_KEYS;
  if (fallbackKeys) {
    keys.push(...fallbackKeys.split(',').map((k: string) => k.trim()));
  }

  console.log(`Total API keys configured: ${keys.length}`);
  return keys;
};

const API_KEYS = getApiKeys();

// Global chainid that can be set by the app
let currentChainId = DEFAULT_CHAIN_ID;

export function setChainId(chainId: string) {
  currentChainId = chainId;
  console.log(`Chain ID set to: ${chainId}`);
}

// Global custom API key that can be set by the app
let customApiKey = '';

export function setApiKey(apiKey: string) {
  customApiKey = apiKey;
  console.log('Custom API key set:', apiKey ? 'Yes' : 'No');
}

function getActiveApiKeys(): string[] {
  // If custom API key is set, use it exclusively
  if (customApiKey) {
    return [customApiKey];
  }
  // Otherwise use environment keys
  return API_KEYS.length > 0 ? API_KEYS : [];
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
  contractName: string;
  files: SourceFile[];
  compilerVersion: string;
  verified: boolean;
  constructorArguments?: string | null;
  abi?: any[] | null;
  cacheStats?: {
    cached: number;
    fetched: number;
  };
}

class EtherscanCache {
  private readonly CACHE_VERSION = 'v2'; // Increment when cache structure changes

  private getCacheKey(address: string, fileName?: string): string {
    const chainKey = `chain${currentChainId}`;
    const versionKey = `${this.CACHE_VERSION}:${chainKey}`;
    return fileName ? `${versionKey}:${address}:${fileName}` : `${versionKey}:${address}`;
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

// Helper function to check if error is non-retryable
function isNonRetryableError(errorMessage: string): boolean {
  return NON_RETRYABLE_ERRORS.some(msg => errorMessage.includes(msg));
}

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

  const activeKeys = getActiveApiKeys();
  const isCustomKey = customApiKey !== ''; // Track if using custom key

  if (activeKeys.length === 0) {
    throw new Error('No Etherscan API keys available. Please provide an API key or configure environment variables.');
  }

  while (retryCount < maxRetries) {
    for (let i = 0; i < activeKeys.length; i++) {
      try {
        // Enforce rate limiting before each API call
        await enforceRateLimit();

        const apiKey = activeKeys[i];
        const urlWithKey = `${url}&chainid=${currentChainId}&apikey=${apiKey}`;
        console.log(`Attempting API call (retry ${retryCount + 1}/${maxRetries}, key ${i + 1}/${activeKeys.length}, chainId: ${currentChainId})`);

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

          // Check if it's a non-retryable error (invalid address, contract not found, etc.)
          if (isNonRetryableError(errorMsg)) {
            console.error('Non-retryable error:', errorMsg);
            throw new Error(errorMsg);
          }

          // For other errors, throw immediately (don't retry indefinitely)
          const error = new Error(errorMsg);
          console.error('API returned NOTOK:', errorMsg);
          throw error;
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if it's a non-retryable error - if so, throw immediately
        if (isNonRetryableError(lastError.message)) {
          throw lastError;
        }

        // If using custom API key and it fails, don't retry with fallback keys
        if (isCustomKey) {
          throw lastError;
        }

        // If it's not a rate limit error and we're on the last key, increment retry count
        if (!lastError.message.includes('rate limit') && i === activeKeys.length - 1) {
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
    // Add cache stats for fully cached contract
    return {
      ...cached,
      cacheStats: {
        cached: cached.files.length,
        fetched: 0
      }
    };
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
        contractName: contractData.ContractName || 'Unknown',
        files: [],
        compilerVersion: '',
        verified: false,
        constructorArguments: null,
        abi: null,
        cacheStats: {
          cached: 0,
          fetched: 0
        }
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

    // Extract constructor arguments from the same response
    const constructorArguments = contractData.ConstructorArguments && contractData.ConstructorArguments !== ''
      ? contractData.ConstructorArguments
      : null;

    // Parse ABI if available
    let abi: any[] | null = null;
    if (contractData.ABI && contractData.ABI !== 'Contract source code not verified') {
      try {
        abi = JSON.parse(contractData.ABI);
      } catch (e) {
        console.warn('Failed to parse ABI:', e);
      }
    }

    const result: ContractSource = {
      address,
      contractName: contractData.ContractName,
      files,
      compilerVersion: contractData.CompilerVersion,
      verified: true,
      constructorArguments,
      abi,
      cacheStats: {
        cached: 0,
        fetched: files.length
      }
    };

    cache.set(address, result);
    return result;
  } catch (error) {
    console.error('Error fetching contract source:', error);
    throw error;
  }
}

export interface ProxyInfo {
  isProxy: boolean;
  implementation?: string;
  proxyAddress?: string;
  proxyContractName?: string;
}

export async function checkIfProxy(address: string): Promise<ProxyInfo> {
  const url = `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${address}`;

  try {
    const data = await fetchWithRetry(url);

    if (!data.result || data.result.length === 0) {
      return { isProxy: false };
    }

    const contractData = data.result[0];

    // Check if it's a proxy
    if (contractData.Implementation && contractData.Implementation !== '') {
      return {
        isProxy: true,
        implementation: contractData.Implementation,
        proxyAddress: address,
        proxyContractName: contractData.ContractName || 'Unknown'
      };
    }

    return { isProxy: false };
  } catch (error) {
    console.error('Error checking if proxy:', error);

    // Re-throw API key errors and other critical errors
    if (error instanceof Error) {
      const errorMsg = error.message;
      if (errorMsg.includes('Invalid API Key') ||
          errorMsg.includes('Missing Or invalid API Key') ||
          errorMsg.includes('rate limit')) {
        throw error;
      }
    }

    return { isProxy: false };
  }
}

export async function getProxyImplementation(proxyAddress: string): Promise<string | null> {
  const proxyInfo = await checkIfProxy(proxyAddress);
  return proxyInfo.implementation || null;
}

export async function getContractABI(address: string): Promise<any[] | null> {
  const url = `${ETHERSCAN_API_URL}?module=contract&action=getabi&address=${address}`;

  try {
    const data = await fetchWithRetry(url);

    if (!data.result || data.result === 'Contract source code not verified') {
      return null;
    }

    // Parse the ABI JSON string
    const abi = JSON.parse(data.result);
    return abi;
  } catch (error) {
    console.error('Error fetching contract ABI:', error);
    return null;
  }
}

export async function getConstructorArguments(address: string): Promise<string | null> {
  const url = `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${address}`;

  try {
    const data = await fetchWithRetry(url);

    if (!data.result || data.result.length === 0) {
      return null;
    }

    const contractData = data.result[0];

    // ConstructorArguments is a hex string of the encoded constructor arguments
    if (contractData.ConstructorArguments && contractData.ConstructorArguments !== '') {
      return contractData.ConstructorArguments;
    }

    return null;
  } catch (error) {
    console.error('Error fetching constructor arguments:', error);
    return null;
  }
}

export type { ContractSource, SourceFile };
