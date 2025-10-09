interface InputFormProps {
  proxyAddress: string;
  newImplAddress: string;
  onProxyChange: (value: string) => void;
  onNewImplChange: (value: string) => void;
  onCompare: () => void;
  loading: boolean;
}

export default function InputForm({
  proxyAddress,
  newImplAddress,
  onProxyChange,
  onNewImplChange,
  onCompare,
  loading
}: InputFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompare();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="proxy" className="block text-sm font-medium text-gray-700 mb-2">
            Proxy Contract Address
          </label>
          <input
            id="proxy"
            type="text"
            value={proxyAddress}
            onChange={(e) => onProxyChange(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="newimpl" className="block text-sm font-medium text-gray-700 mb-2">
            New Implementation Address
          </label>
          <input
            id="newimpl"
            type="text"
            value={newImplAddress}
            onChange={(e) => onNewImplChange(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            disabled={loading}
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={loading || !proxyAddress || !newImplAddress}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Compare'}
        </button>
      </div>
    </form>
  );
}
