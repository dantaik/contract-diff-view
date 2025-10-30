import type { ConstructorInfo, DecodedParam } from '../types';
import AddressDisplay from './AddressDisplay';

interface ConstructorDisplayProps {
  constructor: ConstructorInfo | null;
  comparisonConstructor?: ConstructorInfo | null;
  variant: 'old' | 'new';
  showChangeBadge?: boolean;
  chainId: string;
}

export default function ConstructorDisplay({
  constructor: ctorInfo,
  comparisonConstructor,
  variant,
  showChangeBadge = false,
  chainId
}: ConstructorDisplayProps) {
  if (!ctorInfo) return null;

  const hasChanged = comparisonConstructor && ctorInfo.arguments !== comparisonConstructor.arguments;
  const highlightColor = variant === 'old' ? 'bg-diff-deletion' : 'bg-diff-addition';

  // Helper to check if a value looks like an Ethereum address
  const isAddress = (value: string, type: string): boolean => {
    return type === 'address' || (type.includes('address') && /^0x[a-fA-F0-9]{40}$/.test(value));
  };

  const renderDecodedParams = (params: DecodedParam[]) => {
    return (
      <div className="bg-gray-50 px-3 py-2 rounded-lg max-h-48 overflow-y-auto space-y-2">
        {params.map((param, idx) => {
          // Check if this parameter changed
          const otherParam = comparisonConstructor?.decodedParams?.[idx];
          const paramChanged = otherParam && otherParam.value !== param.value;

          return (
            <div
              key={idx}
              className={`border-b border-gray-200 last:border-0 pb-2 last:pb-0 ${paramChanged ? `${highlightColor} -mx-3 px-3 py-2 rounded` : ''}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-blue-600 min-w-fit">{param.name}:</span>
                <span className="text-xs text-gray-500">({param.type})</span>
              </div>
              <div className="mt-1">
                {isAddress(param.value, param.type) ? (
                  <AddressDisplay address={param.value} chainId={chainId} className="text-xs" />
                ) : (
                  <div className="font-mono text-xs text-gray-900 break-all">
                    {param.value}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRawArgs = () => (
    <div className="bg-gray-50 px-3 py-2 rounded-lg">
      <pre className="font-mono text-xs text-gray-500">
        {ctorInfo.arguments || 'None'}
      </pre>
    </div>
  );

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">
        Constructor Arguments
        {showChangeBadge && hasChanged && (
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            Changed
          </span>
        )}
      </p>
      {ctorInfo.decodedParams && ctorInfo.decodedParams.length > 0
        ? renderDecodedParams(ctorInfo.decodedParams)
        : renderRawArgs()
      }
    </div>
  );
}
