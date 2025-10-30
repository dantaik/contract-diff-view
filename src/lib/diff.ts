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
    '',
    { context: Number.MAX_SAFE_INTEGER } // Show entire file context
  );
  return patch;
}

function getBaseName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

export function createFileDiffs(
  oldFiles: Array<{ name: string; content: string }>,
  newFiles: Array<{ name: string; content: string }>
): FileDiff[] {
  const diffs: FileDiff[] = [];
  const processedNewFiles = new Set<string>();

  // Create a map of basename to new files for quick lookup
  const newFilesByBaseName = new Map<string, Array<{ name: string; content: string }>>();
  for (const newFile of newFiles) {
    const baseName = getBaseName(newFile.name);
    if (!newFilesByBaseName.has(baseName)) {
      newFilesByBaseName.set(baseName, []);
    }
    newFilesByBaseName.get(baseName)!.push(newFile);
  }

  // Process files from old version
  for (const oldFile of oldFiles) {
    // First, try to find exact path match
    let newFile = newFiles.find(f => f.name === oldFile.name);

    // If no exact match, try to match by basename
    if (!newFile) {
      const baseName = getBaseName(oldFile.name);
      const candidateFiles = newFilesByBaseName.get(baseName);

      // If there's exactly one file with this basename in the new version, use it
      if (candidateFiles && candidateFiles.length === 1) {
        newFile = candidateFiles[0];
      }
      // If there are multiple files with same basename, we can't reliably match
      // so treat as deleted (keeps current behavior for ambiguous cases)
    }

    if (newFile) {
      processedNewFiles.add(newFile.name);
      const hasDiff = oldFile.content !== newFile.content;
      let diffHtml = '';
      let diffHtmlUnified = '';

      if (hasDiff) {
        // Use a display name that shows both paths if they differ
        const displayName = oldFile.name !== newFile.name
          ? `${oldFile.name} → ${newFile.name}`
          : oldFile.name;

        const unifiedDiff = generateUnifiedDiff(displayName, oldFile.content, newFile.content);
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
        fileName: newFile.name !== oldFile.name ? `${oldFile.name} → ${newFile.name}` : oldFile.name,
        oldContent: oldFile.content,
        newContent: newFile.content,
        hasDiff,
        diffHtml,
        diffHtmlUnified
      });
    } else {
      // File only exists in old version (deleted or couldn't match)
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
    if (!processedNewFiles.has(newFile.name)) {
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
