import { getExplorerTxUrl } from '../lib/constants';
import { formatUtcTimestamp } from '../lib/format';
import type { DeploymentInfo } from '../lib/etherscan';

interface DeploymentDisplayProps {
  deployment: DeploymentInfo | null;
  chainId: string;
  loading?: boolean;
}

export default function DeploymentDisplay({ deployment, chainId, loading = false }: DeploymentDisplayProps) {
  if (loading) {
    return (
      <div>
        <p className="text-xs text-gray-500 mb-1">Deployed</p>
        <p className="text-xs text-gray-400 font-medium">Loading…</p>
      </div>
    );
  }

  if (!deployment || deployment.timestamp === null) {
    return null;
  }

  const formatted = formatUtcTimestamp(deployment.timestamp);
  const txUrl = deployment.txHash ? getExplorerTxUrl(chainId, deployment.txHash) : null;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">Deployed</p>
      {txUrl ? (
        <a
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-900 font-medium hover:text-gray-600 transition-colors"
          title="View creation transaction on explorer"
        >
          {formatted}
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <p className="text-xs text-gray-900 font-medium">{formatted}</p>
      )}
    </div>
  );
}
