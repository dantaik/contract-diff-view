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
  const addressBgColor = variant === 'old' ? 'bg-red-50' : 'bg-green-50';
  const title = variant === 'old' ? 'Old Implementation' : 'New Implementation';
  const icon = variant === 'old'
    ? <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    : <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>;

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        </div>
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
          />
        )}
      </div>
    </div>
  );
}
