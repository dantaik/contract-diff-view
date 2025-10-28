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

export interface DecodedParam {
  name: string;
  type: string;
  value: string;
}

export interface ConstructorInfo {
  address: string;
  arguments: string | null;
  decodedParams: DecodedParam[] | null;
}
