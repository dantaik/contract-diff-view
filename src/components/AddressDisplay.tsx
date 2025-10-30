import { getExplorerUrl } from '../lib/constants';

interface AddressDisplayProps {
  address: string;
  chainId: string;
  className?: string;
}

export default function AddressDisplay({ address, chainId, className = '' }: AddressDisplayProps) {
  const explorerUrl = getExplorerUrl(chainId, address);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="font-mono text-xs text-gray-900 break-all">
        {address}
      </span>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          title="View on explorer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}
