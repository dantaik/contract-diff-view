import type { FileDiff } from '../lib/diff';

interface DiffViewerProps {
  diff: FileDiff;
}

export default function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff.hasDiff) {
    return (
      <div className="glass-card rounded-xl border-0 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 font-medium">No changes in this file</p>
        <p className="text-sm text-gray-400 mt-1">The file content is identical in both implementations</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border-0 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-white to-pink-50/30">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-sm font-bold text-gray-700 font-mono">{diff.fileName}</h2>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        {/* Side-by-side diff on desktop, unified on mobile */}
        <div className="hidden md:block diff-viewer" dangerouslySetInnerHTML={{ __html: diff.diffHtml || '' }} />
        <div className="block md:hidden diff-viewer" dangerouslySetInnerHTML={{ __html: diff.diffHtmlUnified || '' }} />
      </div>
    </div>
  );
}
