import type { ContractSource } from '../lib/etherscan';
import type { ConstructorInfo } from '../types';
import ConstructorDisplay from './ConstructorDisplay';
import AddressDisplay from './AddressDisplay';

interface ImplementationInfoProps {
  source: ContractSource;
  address: string;
  constructor: ConstructorInfo | null;
  comparisonConstructor?: ConstructorInfo | null;
  variant: 'old' | 'new';
  chainId: string;
}

export default function ImplementationInfo({
  source,
  address,
  constructor: ctorInfo,
  comparisonConstructor,
  variant,
  chainId
}: ImplementationInfoProps) {
  const addressBgColor = variant === 'old' ? 'bg-diff-deletion' : 'bg-diff-addition';
  const title = variant === 'old' ? 'Old Implementation' : 'New Implementation';

  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Name</p>
          <p className="text-sm font-bold text-gray-900">{source.contractName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Address</p>
          <div className={`${addressBgColor} px-3 py-2 rounded-lg`}>
            <AddressDisplay address={address} chainId={chainId} />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Compiler</p>
          <p className="text-xs text-gray-900 font-medium">{source.compilerVersion}</p>
        </div>
        {ctorInfo && (
          <ConstructorDisplay
            constructor={ctorInfo}
            comparisonConstructor={comparisonConstructor}
            variant={variant}
            showChangeBadge={variant === 'new'}
            chainId={chainId}
          />
        )}
      </div>
    </div>
  );
}
