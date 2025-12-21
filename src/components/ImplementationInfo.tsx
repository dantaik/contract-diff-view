import type { ContractSource } from '../lib/etherscan';
import type { ConstructorInfo } from '../types';
import ConstructorDisplay from './ConstructorDisplay';
import AddressDisplay from './AddressDisplay';
import PanelTitle from './PanelTitle';

interface ImplementationInfoProps {
  source: ContractSource;
  comparisonSource?: ContractSource;
  address: string;
  constructor: ConstructorInfo | null;
  comparisonConstructor?: ConstructorInfo | null;
  variant: 'old' | 'new';
  chainId: string;
}

export default function ImplementationInfo({
  source,
  comparisonSource,
  address,
  constructor: ctorInfo,
  comparisonConstructor,
  variant,
  chainId
}: ImplementationInfoProps) {
  const diffBgColor = variant === 'old' ? 'bg-diff-deletion' : 'bg-diff-addition';
  const title = variant === 'old' ? 'Old Implementation' : 'New Implementation';

  // Helper to determine if a value differs from comparison
  const isDifferent = (value: string | undefined, comparisonValue: string | undefined) => {
    return value !== comparisonValue;
  };

  const nameDiffers = comparisonSource && isDifferent(source.contractName, comparisonSource.contractName);
  const compilerDiffers = comparisonSource && isDifferent(source.compilerVersion, comparisonSource.compilerVersion);
  const evmVersionDiffers = comparisonSource && isDifferent(source.evmVersion, comparisonSource.evmVersion);

  return (
    <div className="p-6">
      <div className="mb-4">
        <PanelTitle>{title}</PanelTitle>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Name</p>
          <p className={`text-sm font-bold text-gray-900 ${nameDiffers ? `${diffBgColor} px-2 py-1 rounded` : ''}`}>
            {source.contractName}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Address</p>
          <div className={`${diffBgColor} px-3 py-2 rounded-lg`}>
            <AddressDisplay address={address} chainId={chainId} />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Compiler</p>
          <p className={`text-xs text-gray-900 font-medium ${compilerDiffers ? `${diffBgColor} px-2 py-1 rounded` : ''}`}>
            {source.compilerVersion}
          </p>
        </div>
        {(source.evmVersion || (comparisonSource && comparisonSource.evmVersion)) && (
          <div>
            <p className="text-xs text-gray-500 mb-1">EVM Version</p>
            <p className={`text-xs text-gray-900 font-medium ${evmVersionDiffers ? `${diffBgColor} px-2 py-1 rounded` : ''}`}>
              {source.evmVersion || 'N/A'}
            </p>
          </div>
        )}
        {ctorInfo && (
          <ConstructorDisplay
            constructor={ctorInfo}
            comparisonConstructor={comparisonConstructor}
            variant={variant}
            chainId={chainId}
          />
        )}
      </div>
    </div>
  );
}
