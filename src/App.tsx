import { useState, useEffect } from 'react';
import { getContractSource, getProxyImplementation, setChainId, type ContractSource } from './lib/etherscan';
import { createFileDiffs, type FileDiff } from './lib/diff';
import DiffViewer from './components/DiffViewer';
import InputForm from './components/InputForm';
import FileList from './components/FileList';
import type { URLParams } from './types';

function App() {
  const [proxyAddress, setProxyAddress] = useState('');
  const [newImplAddress, setNewImplAddress] = useState('');
  const [oldImplAddress, setOldImplAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldSource, setOldSource] = useState<ContractSource | null>(null);
  const [newSource, setNewSource] = useState<ContractSource | null>(null);
  const [fileDiffs, setFileDiffs] = useState<FileDiff[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  const handleCompare = async (proxy?: string, newImpl?: string) => {
    const proxyAddr = proxy || proxyAddress;
    const newImplAddr = newImpl || newImplAddress;

    if (!proxyAddr || !newImplAddr) {
      setError('Please provide both proxy address and new implementation address');
      return;
    }

    setLoading(true);
    setError(null);
    setOldSource(null);
    setNewSource(null);
    setFileDiffs([]);
    setSelectedFile(null);

    try {
      // Get current implementation from proxy
      const currentImpl = await getProxyImplementation(proxyAddr);

      if (!currentImpl) {
        setError('Could not fetch current implementation from proxy. Make sure the address is a valid proxy contract.');
        setLoading(false);
        return;
      }

      setOldImplAddress(currentImpl);

      // Fetch both implementations
      const [oldSourceData, newSourceData] = await Promise.all([
        getContractSource(currentImpl),
        getContractSource(newImplAddr)
      ]);

      if (!oldSourceData.verified) {
        setError('Old implementation is not verified on Etherscan');
        setLoading(false);
        return;
      }

      if (!newSourceData.verified) {
        setError('New implementation is not verified on Etherscan');
        setLoading(false);
        return;
      }

      setOldSource(oldSourceData);
      setNewSource(newSourceData);

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
      url.searchParams.set('addr', proxyAddr);
      url.searchParams.set('newimpl', newImplAddr);
      window.history.pushState({}, '', url.toString());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedDiff = fileDiffs.find(d => d.fileName === selectedFile);
  const changedFilesCount = fileDiffs.filter(d => d.hasDiff).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Smart Contract Upgrade Diff Viewer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compare verified smart contract implementations on Ethereum
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <InputForm
          proxyAddress={proxyAddress}
          newImplAddress={newImplAddress}
          onProxyChange={setProxyAddress}
          onNewImplChange={setNewImplAddress}
          onCompare={() => handleCompare()}
          loading={loading}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-700">Loading contract sources...</span>
          </div>
        )}

        {!loading && oldSource && newSource && (
          <div className="mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Old Implementation</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{oldImplAddress}</p>
                  <p className="text-gray-500 text-xs mt-1">{oldSource.compilerVersion}</p>
                </div>
                <div>
                  <p className="text-gray-500">New Implementation</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{newImplAddress}</p>
                  <p className="text-gray-500 text-xs mt-1">{newSource.compilerVersion}</p>
                </div>
              </div>
              {changedFilesCount > 0 && (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">{changedFilesCount}</span> file{changedFilesCount !== 1 ? 's' : ''} changed
                </p>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FileList
                  files={fileDiffs}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              </div>
              <div className="col-span-9">
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
