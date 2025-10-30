import type { ProxyInfo } from '../lib/etherscan';
import { getExplorerUrl } from '../lib/constants';

interface ProxyInfoDisplayProps {
  proxyInfo: ProxyInfo;
  chainId: string;
}

export default function ProxyInfoDisplay({ proxyInfo, chainId }: ProxyInfoDisplayProps) {
  if (!proxyInfo.isProxy) return null;

  return (
    <div className="glass-card rounded-xl border-0 overflow-hidden mb-6">
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
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
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-gray-900 break-all flex-1">
                {proxyInfo.proxyAddress}
              </p>
              {proxyInfo.proxyAddress && getExplorerUrl(chainId, proxyInfo.proxyAddress) && (
                <a
                  href={getExplorerUrl(chainId, proxyInfo.proxyAddress)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-taiko-pink hover:text-taiko-pink/80 transition-colors"
                  title="View on explorer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Implementation</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-gray-900 break-all flex-1">
                {proxyInfo.implementation}
              </p>
              {proxyInfo.implementation && getExplorerUrl(chainId, proxyInfo.implementation) && (
                <a
                  href={getExplorerUrl(chainId, proxyInfo.implementation)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-taiko-pink hover:text-taiko-pink/80 transition-colors"
                  title="View on explorer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
