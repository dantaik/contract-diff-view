// @ts-ignore - diff package has types but TS can't find them
import * as Diff from 'diff';
import { html } from 'diff2html';

export interface FileDiff {
  fileName: string;
  oldContent: string | null;
  newContent: string | null;
  hasDiff: boolean;
  diffHtml?: string;
  diffHtmlUnified?: string;
}

export function generateUnifiedDiff(
  fileName: string,
  oldContent: string,
  newContent: string
): string {
  const patch = Diff.createPatch(
    fileName,
    oldContent,
    newContent,
    '',
    ''
  );
  return patch;
}

export function createFileDiffs(
  oldFiles: Array<{ name: string; content: string }>,
  newFiles: Array<{ name: string; content: string }>
): FileDiff[] {
  const diffs: FileDiff[] = [];
  const processedFiles = new Set<string>();

  // Process files that exist in both versions
  for (const oldFile of oldFiles) {
    const newFile = newFiles.find(f => f.name === oldFile.name);
    processedFiles.add(oldFile.name);

    if (newFile) {
      const hasDiff = oldFile.content !== newFile.content;
      let diffHtml = '';

      let diffHtmlUnified = '';

      if (hasDiff) {
        const unifiedDiff = generateUnifiedDiff(oldFile.name, oldFile.content, newFile.content);
        diffHtml = html(unifiedDiff, {
          drawFileList: false,
          matching: 'lines',
          outputFormat: 'side-by-side'
        });
        diffHtmlUnified = html(unifiedDiff, {
          drawFileList: false,
          matching: 'lines',
          outputFormat: 'line-by-line'
        });
      }

      diffs.push({
        fileName: oldFile.name,
        oldContent: oldFile.content,
        newContent: newFile.content,
        hasDiff,
        diffHtml,
        diffHtmlUnified
      });
    } else {
      // File only exists in old version (deleted)
      const unifiedDiff = generateUnifiedDiff(oldFile.name, oldFile.content, '');
      const diffHtml = html(unifiedDiff, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side'
      });
      const diffHtmlUnified = html(unifiedDiff, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'line-by-line'
      });

      diffs.push({
        fileName: oldFile.name,
        oldContent: oldFile.content,
        newContent: null,
        hasDiff: true,
        diffHtml,
        diffHtmlUnified
      });
    }
  }

  // Process files that only exist in new version (added)
  for (const newFile of newFiles) {
    if (!processedFiles.has(newFile.name)) {
      const unifiedDiff = generateUnifiedDiff(newFile.name, '', newFile.content);
      const diffHtml = html(unifiedDiff, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side'
      });
      const diffHtmlUnified = html(unifiedDiff, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'line-by-line'
      });

      diffs.push({
        fileName: newFile.name,
        oldContent: null,
        newContent: newFile.content,
        hasDiff: true,
        diffHtml,
        diffHtmlUnified
      });
    }
  }

  return diffs;
}
