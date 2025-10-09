import type { FileDiff } from '../lib/diff';

interface FileListProps {
  files: FileDiff[];
  selectedFile: string | null;
  onSelectFile: (fileName: string) => void;
}

export default function FileList({ files, selectedFile, onSelectFile }: FileListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">Files</h2>
      </div>
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
        {files.map((file) => (
          <button
            key={file.fileName}
            onClick={() => onSelectFile(file.fileName)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              selectedFile === file.fileName ? 'bg-blue-50 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-900 truncate pr-2">
                {file.fileName.split('/').pop()}
              </span>
              {file.hasDiff && (
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Modified
                </span>
              )}
              {file.oldContent === null && (
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Added
                </span>
              )}
              {file.newContent === null && (
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Deleted
                </span>
              )}
            </div>
            {file.fileName.includes('/') && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                {file.fileName.substring(0, file.fileName.lastIndexOf('/'))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
