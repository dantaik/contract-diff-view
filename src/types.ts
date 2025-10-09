export interface URLParams {
  addr?: string;
  newimpl?: string;
  chainid?: string;
}

export interface AppState {
  proxyAddress: string;
  oldImplementation: string;
  newImplementation: string;
  loading: boolean;
  error: string | null;
}
