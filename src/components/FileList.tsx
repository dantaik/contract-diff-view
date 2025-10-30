import type { FileDiff } from '../lib/diff';

interface FileListProps {
  files: FileDiff[];
  selectedFile: string | null;
  onSelectFile: (fileName: string) => void;
  totalFetched: number;
  totalCached: number;
}

export default function FileList({ files, selectedFile, onSelectFile, totalFetched, totalCached }: FileListProps) {
  return (
    <div className="glass-card rounded-xl border-0 overflow-hidden sticky top-32">
      <div className="px-6 py-6 border-b border-gray-200/50">
        <p className="text-xs font-semibold text-taiko-pink uppercase tracking-wider mb-3">Solidity Source Files</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>{totalFetched} fetched from remote</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>{totalCached} loaded from cache</span>
          </div>
        </div>
      </div>
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto space-y-1 px-2 pb-2">
        {files.map((file) => {
          const isSelected = selectedFile === file.fileName;
          const isModified = file.hasDiff && file.oldContent !== null && file.newContent !== null;
          const isAdded = file.oldContent === null;
          const isDeleted = file.newContent === null;

          return (
            <button
              key={file.fileName}
              onClick={() => onSelectFile(file.fileName)}
              className={`w-full px-4 py-3 text-left hover:bg-taiko-pink/5 transition-colors duration-150 rounded-lg ${
                isSelected ? 'bg-taiko-pink/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-mono text-gray-900 truncate block">
                    {file.fileName.split('/').pop()}
                  </span>
                  {file.fileName.includes('/') && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate opacity-60">
                      {file.fileName.substring(0, file.fileName.lastIndexOf('/'))}
                    </div>
                  )}
                </div>
                {file.hasDiff && (
                  <div className="flex-shrink-0 mt-0.5">
                    {isAdded && (
                      <div className="w-6 h-6 rounded-md bg-pink-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                    {isDeleted && (
                      <div className="w-6 h-6 rounded-md bg-pink-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </div>
                    )}
                    {isModified && (
                      <div className="w-6 h-6 rounded-md bg-pink-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
