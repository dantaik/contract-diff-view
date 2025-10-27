// API Configuration
export const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
export const DEFAULT_CHAIN_ID = '1'; // Ethereum mainnet
export const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const API_DELAY_MS = 250; // Delay between API calls (4 calls per second max)
export const MAX_RETRIES = 10;
export const INITIAL_RETRY_DELAY_MS = 1000;
export const MAX_RETRY_DELAY_MS = 5000;

// Non-retryable error patterns
export const NON_RETRYABLE_ERRORS = [
  'invalid address',
  'Invalid Address',
  'Contract source code not verified',
  'Missing chainid parameter',
  'You are using a deprecated',
  'Invalid API Key',
  'Missing Or invalid API Key',
] as const;

// Supported chains
export const SUPPORTED_CHAINS = [
  { id: '1', name: 'Ethereum' },
  { id: '17000', name: 'Ethereum Holesky' },
  { id: '560048', name: 'Ethereum Hoodi' },
  { id: '167000', name: 'Taiko' },
  { id: '167013', name: 'Taiko Hoodi' },
] as const;

// File change icons
export const FILE_CHANGE_ICONS = {
  MODIFIED: 'edit',
  ADDED: 'plus',
  DELETED: 'minus',
} as const;
