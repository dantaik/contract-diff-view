import { SUPPORTED_CHAINS } from '../lib/constants';

interface InputFormProps {
  proxyAddress: string;
  newImplAddress: string;
  chainId: string;
  apiKey: string;
  onProxyChange: (value: string) => void;
  onNewImplChange: (value: string) => void;
  onChainIdChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onCompare: () => void;
  loading: boolean;
}

export default function InputForm({
  proxyAddress,
  newImplAddress,
  chainId,
  apiKey,
  onProxyChange,
  onNewImplChange,
  onChainIdChange,
  onApiKeyChange,
  onCompare,
  loading
}: InputFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompare();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 border-0">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label htmlFor="chain" className="block text-sm font-semibold text-gray-700">
            Chain
          </label>
          <select
            id="chain"
            value={chainId}
            onChange={(e) => onChainIdChange(e.target.value)}
            className="input-field"
            disabled={loading}
          >
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} - {chain.id}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="proxy" className="block text-sm font-semibold text-gray-700">
            Old Implementation Address/Upgradable Proxy
          </label>
          <input
            id="proxy"
            type="text"
            value={proxyAddress}
            onChange={(e) => onProxyChange(e.target.value)}
            placeholder="0x..."
            className="input-field"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="newimpl" className="block text-sm font-semibold text-gray-700">
            New Implementation Address
          </label>
          <input
            id="newimpl"
            type="text"
            value={newImplAddress}
            onChange={(e) => onNewImplChange(e.target.value)}
            placeholder="0x..."
            className="input-field"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="apikey" className="block text-sm font-semibold text-gray-700">
            API Key <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              id="apikey"
              type="text"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Your Etherscan API key"
              className="input-field pr-10"
              disabled={loading}
            />
            {apiKey && (
              <button
                type="button"
                onClick={() => onApiKeyChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                disabled={loading}
                title="Clear API key"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading || !proxyAddress || !newImplAddress}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            'Compare Contracts'
          )}
        </button>
      </div>
    </form>
  );
}
