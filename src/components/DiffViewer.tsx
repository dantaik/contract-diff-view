import type { FileDiff } from '../lib/diff';

interface DiffViewerProps {
  diff: FileDiff;
}

export default function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff.hasDiff) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No changes in this file</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 font-mono">{diff.fileName}</h2>
      </div>
      <div className="overflow-x-auto">
        <div
          className="diff-viewer"
          dangerouslySetInnerHTML={{ __html: diff.diffHtml || '' }}
        />
      </div>
    </div>
  );
}
