import type { ProxyInfo } from '../lib/etherscan';
import AddressDisplay from './AddressDisplay';

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
          <p className="text-xs font-semibold text-taiko-pink uppercase tracking-wider">Proxy Contract</p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Name</p>
            <p className="text-sm font-bold text-gray-900">{proxyInfo.proxyContractName || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Proxy Address</p>
            <AddressDisplay address={proxyInfo.proxyAddress!} chainId={chainId} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Implementation</p>
            <AddressDisplay address={proxyInfo.implementation!} chainId={chainId} />
          </div>
        </div>
      </div>
    </div>
  );
}
