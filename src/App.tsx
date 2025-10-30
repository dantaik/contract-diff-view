import { useState, useEffect } from 'react';
import { getContractSource, checkIfProxy, setChainId, setApiKey, type ContractSource, type ProxyInfo } from './lib/etherscan';
import { createFileDiffs, type FileDiff } from './lib/diff';
import { decodeConstructorArguments } from './lib/decoder';
import DiffViewer from './components/DiffViewer';
import InputForm from './components/InputForm';
import FileList from './components/FileList';
import ImplementationInfo from './components/ImplementationInfo';
import ProxyInfoDisplay from './components/ProxyInfoDisplay';
import type { URLParams, ConstructorInfo } from './types';

function App() {
  const [proxyAddress, setProxyAddress] = useState('');
  const [newImplAddress, setNewImplAddress] = useState('');
  const [oldImplAddress, setOldImplAddress] = useState('');
  const [chainIdState, setChainIdState] = useState('1'); // Default to Ethereum
  const [apiKey, setApiKeyState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [oldSource, setOldSource] = useState<ContractSource | null>(null);
  const [newSource, setNewSource] = useState<ContractSource | null>(null);
  const [oldConstructor, setOldConstructor] = useState<ConstructorInfo | null>(null);
  const [newConstructor, setNewConstructor] = useState<ConstructorInfo | null>(null);
  const [fileDiffs, setFileDiffs] = useState<FileDiff[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('etherscan_api_key');
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
      setApiKey(savedApiKey);
    }
  }, []);

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParams: URLParams = {
      addr: params.get('addr') || undefined,
      newimpl: params.get('newimpl') || undefined,
      chainid: params.get('chainid') || undefined
    };

    // Set chain ID if provided in URL
    if (urlParams.chainid) {
      setChainIdState(urlParams.chainid);
      setChainId(urlParams.chainid);
    }

    if (urlParams.addr) {
      setProxyAddress(urlParams.addr);
    }
    if (urlParams.newimpl) {
      setNewImplAddress(urlParams.newimpl);
    }

    if (urlParams.addr && urlParams.newimpl) {
      handleCompare(urlParams.addr, urlParams.newimpl);
    }
  }, []);

  // Clear results when inputs change
  const clearResults = () => {
    setOldSource(null);
    setNewSource(null);
    setOldConstructor(null);
    setNewConstructor(null);
    setFileDiffs([]);
    setSelectedFile(null);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setProxyInfo(null);
  };

  // Handler for chain ID change
  const handleChainIdChange = (newChainId: string) => {
    setChainIdState(newChainId);
    setChainId(newChainId);
    clearResults();
  };

  // Handler for proxy address change
  const handleProxyAddressChange = (value: string) => {
    setProxyAddress(value);
    clearResults();
  };

  // Handler for new implementation address change
  const handleNewImplAddressChange = (value: string) => {
    setNewImplAddress(value);
    clearResults();
  };

  // Handler for API key change
  const handleApiKeyChange = (value: string) => {
    setApiKeyState(value);
    setApiKey(value);
    // Save to localStorage
    if (value) {
      localStorage.setItem('etherscan_api_key', value);
    } else {
      localStorage.removeItem('etherscan_api_key');
    }
  };

  const handleCompare = async (proxy?: string, newImpl?: string) => {
    const addrParam = proxy || proxyAddress;
    const newImplAddr = newImpl || newImplAddress;

    if (!addrParam || !newImplAddr) {
      setError('Please provide both addresses');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setOldSource(null);
    setNewSource(null);
    setOldConstructor(null);
    setNewConstructor(null);
    setFileDiffs([]);
    setSelectedFile(null);
    setProxyInfo(null);

    try {
      // Check if the address is a proxy
      let proxyInfoData: ProxyInfo;
      try {
        proxyInfoData = await checkIfProxy(addrParam);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        const errorStack = err instanceof Error ? err.stack : undefined;
        setError(`Failed to fetch address information: ${errorMsg}`);
        setErrorDetails(errorStack || `Error: ${errorMsg}\n\nAddress: ${addrParam}\nChain ID: ${chainIdState}`);
        setLoading(false);
        return;
      }

      let currentImpl: string;

      if (proxyInfoData.isProxy && proxyInfoData.implementation) {
        // Address is a proxy - get the implementation
        setProxyInfo(proxyInfoData);
        currentImpl = proxyInfoData.implementation;
      } else {
        // Address is not a proxy - treat it as the old implementation directly
        setProxyInfo(null);
        currentImpl = addrParam;
      }

      setOldImplAddress(currentImpl);

      // Fetch both implementations with better error handling
      let oldSourceData, newSourceData;

      try {
        oldSourceData = await getContractSource(currentImpl);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        const errorStack = err instanceof Error ? err.stack : undefined;
        setError(`Failed to fetch old implementation (${currentImpl}): ${errorMsg}`);
        setErrorDetails(errorStack || `Error: ${errorMsg}\n\nAddress: ${currentImpl}\nChain ID: ${chainIdState}`);
        setLoading(false);
        return;
      }

      try {
        newSourceData = await getContractSource(newImplAddr);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        const errorStack = err instanceof Error ? err.stack : undefined;
        setError(`Failed to fetch new implementation (${newImplAddr}): ${errorMsg}`);
        setErrorDetails(errorStack || `Error: ${errorMsg}\n\nAddress: ${newImplAddr}\nChain ID: ${chainIdState}`);
        setLoading(false);
        return;
      }

      if (!oldSourceData.verified) {
        setError(`Old implementation (${currentImpl}) is not verified on Etherscan`);
        setLoading(false);
        return;
      }

      if (!newSourceData.verified) {
        setError(`New implementation (${newImplAddr}) is not verified on Etherscan`);
        setLoading(false);
        return;
      }

      setOldSource(oldSourceData);
      setNewSource(newSourceData);

      // Use cached constructor arguments and ABI from contract source data
      // Decode constructor arguments using cached ABI
      const oldDecodedParams = oldSourceData.abi && oldSourceData.constructorArguments
        ? decodeConstructorArguments(oldSourceData.abi, oldSourceData.constructorArguments)
        : null;
      const newDecodedParams = newSourceData.abi && newSourceData.constructorArguments
        ? decodeConstructorArguments(newSourceData.abi, newSourceData.constructorArguments)
        : null;

      setOldConstructor({
        address: currentImpl,
        arguments: oldSourceData.constructorArguments ?? null,
        decodedParams: oldDecodedParams
      });

      setNewConstructor({
        address: newImplAddr,
        arguments: newSourceData.constructorArguments ?? null,
        decodedParams: newDecodedParams
      });

      // Generate diffs
      const diffs = createFileDiffs(oldSourceData.files, newSourceData.files);
      setFileDiffs(diffs);

      // Select first file with changes
      const firstDiff = diffs.find(d => d.hasDiff);
      if (firstDiff) {
        setSelectedFile(firstDiff.fileName);
      } else if (diffs.length > 0) {
        setSelectedFile(diffs[0].fileName);
      }

      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('addr', addrParam);
      url.searchParams.set('newimpl', newImplAddr);
      url.searchParams.set('chainid', chainIdState);
      window.history.pushState({}, '', url.toString());

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      const errorStack = err instanceof Error ? err.stack : undefined;
      setError(errorMsg);
      setErrorDetails(errorStack || `Error: ${errorMsg}\n\nAddress: ${addrParam}\nNew Implementation: ${newImplAddr}\nChain ID: ${chainIdState}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedDiff = fileDiffs.find(d => d.fileName === selectedFile);
  const changedFilesCount = fileDiffs.filter(d => d.hasDiff).length;

  // Calculate combined cache statistics
  const totalCached = (oldSource?.cacheStats?.cached || 0) + (newSource?.cacheStats?.cached || 0);
  const totalFetched = (oldSource?.cacheStats?.fetched || 0) + (newSource?.cacheStats?.fetched || 0);

  // Always filter to show only changed files
  const displayedFiles = fileDiffs.filter(d => d.hasDiff);

  return (
    <div className="min-h-screen">
      <header className="glass-card border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="CodeDiff" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                CodeDiff
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Compare verified smart contract implementations from Etherscan.io across EVM chains
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-full px-6 py-8">
        <InputForm
          proxyAddress={proxyAddress}
          newImplAddress={newImplAddress}
          chainId={chainIdState}
          apiKey={apiKey}
          onProxyChange={handleProxyAddressChange}
          onNewImplChange={handleNewImplAddressChange}
          onChainIdChange={handleChainIdChange}
          onApiKeyChange={handleApiKeyChange}
          onCompare={() => handleCompare()}
          loading={loading}
        />

        {error && (
          <div className="mt-6 glass-card border-0 rounded-xl p-8 bg-red-50/80">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800 max-w-2xl">{error}</p>
              {errorDetails && (
                <div className="mt-4 w-full max-w-3xl">
                  <button
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 mx-auto"
                  >
                    {showErrorDetails ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Hide technical details
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Show technical details
                      </>
                    )}
                  </button>
                  {showErrorDetails && (
                    <div className="mt-3 p-4 bg-red-100/50 rounded-lg border border-red-200">
                      <pre className="text-xs text-left text-red-900 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                        {errorDetails}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-taiko-pink absolute top-0"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading contract sources...</p>
            <p className="mt-2 text-sm text-gray-500">This may take a moment</p>
          </div>
        )}

        {!loading && oldSource && newSource && (
          <div className="mt-8 space-y-6">
            {proxyInfo && proxyInfo.isProxy && (
              <ProxyInfoDisplay proxyInfo={proxyInfo} chainId={chainIdState} />
            )}
            <div className="glass-card rounded-xl border-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200/50">
                <ImplementationInfo
                  source={oldSource}
                  address={oldImplAddress}
                  constructor={oldConstructor}
                  comparisonConstructor={newConstructor}
                  variant="old"
                  chainId={chainIdState}
                />
                <ImplementationInfo
                  source={newSource}
                  address={newImplAddress}
                  constructor={newConstructor}
                  comparisonConstructor={oldConstructor}
                  variant="new"
                  chainId={chainIdState}
                />
              </div>

              {/* Statistics Bar */}
              {changedFilesCount > 0 && (
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-pink-50/30 border-t border-gray-200/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium border border-gray-200/50">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-900 font-semibold">{changedFilesCount}</span>
                      <span className="text-gray-600">file{changedFilesCount !== 1 ? 's' : ''} changed</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium border border-gray-200/50">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="text-gray-900 font-semibold">{totalFetched}</span>
                      <span className="text-gray-600">fetched from remote</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium border border-gray-200/50">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                      <span className="text-gray-900 font-semibold">{totalCached}</span>
                      <span className="text-gray-600">loaded from cache</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-3">
                <FileList
                  files={displayedFiles}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              </div>
              <div className="col-span-12 lg:col-span-9">
                {selectedDiff && (
                  <DiffViewer diff={selectedDiff} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
