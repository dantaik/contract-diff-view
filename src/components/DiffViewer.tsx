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
      <div className="px-6 py-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-taiko-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Code Comparison</p>
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
