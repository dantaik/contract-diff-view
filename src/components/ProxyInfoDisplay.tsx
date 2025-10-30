import type { ProxyInfo } from '../lib/etherscan';

interface ProxyInfoDisplayProps {
  proxyInfo: ProxyInfo;
}

export default function ProxyInfoDisplay({ proxyInfo }: ProxyInfoDisplayProps) {
  if (!proxyInfo.isProxy) return null;

  return (
    <div className="glass-card rounded-xl border-0 overflow-hidden mb-6">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-blue-50/30 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">Proxy Contract Detected</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Proxy Address</p>
            <p className="font-mono text-xs text-gray-900 break-all bg-purple-50 px-3 py-2 rounded-lg">
              {proxyInfo.proxyAddress}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Implementation</p>
            <p className="font-mono text-xs text-gray-900 break-all bg-blue-50 px-3 py-2 rounded-lg">
              {proxyInfo.implementation}
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800">
              This is an upgradeable proxy contract. The comparison below shows the difference between the current implementation and the new implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
