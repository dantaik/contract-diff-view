import type { ProxyInfo } from '../lib/etherscan';

interface ProxyInfoDisplayProps {
  proxyInfo: ProxyInfo;
}

export default function ProxyInfoDisplay({ proxyInfo }: ProxyInfoDisplayProps) {
  if (!proxyInfo.isProxy) return null;

  return (
    <div className="glass-card rounded-xl border-0 overflow-hidden mb-6">
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proxy Contract</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Name</p>
            <p className="text-sm font-bold text-gray-900">{proxyInfo.proxyContractName || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Proxy Address</p>
            <p className="font-mono text-xs text-gray-900 break-all">
              {proxyInfo.proxyAddress}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Implementation</p>
            <p className="font-mono text-xs text-gray-900 break-all">
              {proxyInfo.implementation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
