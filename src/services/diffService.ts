import * as Diff from 'diff';

export type DiffLineType = 'added' | 'removed' | 'modified' | 'equal';

export interface DiffWordPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DetailedDiffLine {
  type: DiffLineType;
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
  previousText?: string;
  wordDiff?: DiffWordPart[];
}

export interface DiffMetrics {
  addedLinesCount: number;
  removedLinesCount: number;
  modifiedLinesCount: number;
  unchangedLinesCount: number;
  totalLinesCompared: number;
}

/**
 * Uses the industry-standard `diff` library (Myers algorithm) with secondary
 * word-level diffing to pinpoint precise added, removed, and modified line blocks.
 */
export function generateVisualDiff(
  oldStr: string,
  newStr: string
): { lines: DetailedDiffLine[]; metrics: DiffMetrics } {
  if (!oldStr && !newStr) {
    return {
      lines: [],
      metrics: {
        addedLinesCount: 0,
        removedLinesCount: 0,
        modifiedLinesCount: 0,
        unchangedLinesCount: 0,
        totalLinesCompared: 0
      }
    };
  }

  // 1. Compute structured line diff using the diff library
  const changes = Diff.diffLines(oldStr || '', newStr || '', {
    newlineIsToken: false,
    ignoreWhitespace: false
  });

  const rawBlocks: { type: 'added' | 'removed' | 'equal'; lines: string[] }[] = [];

  for (const part of changes) {
    const splitLines = part.value.replace(/\r\n/g, '\n').split('\n');
    // Drop the trailing empty string produced if ending with newline
    if (splitLines.length > 0 && splitLines[splitLines.length - 1] === '') {
      splitLines.pop();
    }

    if (part.added) {
      rawBlocks.push({ type: 'added', lines: splitLines });
    } else if (part.removed) {
      rawBlocks.push({ type: 'removed', lines: splitLines });
    } else {
      rawBlocks.push({ type: 'equal', lines: splitLines });
    }
  }

  // 2. Synthesize blocks into line items, pairing adjacent removed + added into "modified" lines
  const result: DetailedDiffLine[] = [];
  let oldLineIdx = 1;
  let newLineIdx = 1;

  let addedLinesCount = 0;
  let removedLinesCount = 0;
  let modifiedLinesCount = 0;
  let unchangedLinesCount = 0;

  let bIdx = 0;
  while (bIdx < rawBlocks.length) {
    const currentBlock = rawBlocks[bIdx];
    const nextBlock = rawBlocks[bIdx + 1];

    // Detect modified block (removed immediately followed by added)
    if (currentBlock.type === 'removed' && nextBlock && nextBlock.type === 'added') {
      const removedLines = currentBlock.lines;
      const addedLines = nextBlock.lines;
      const maxPair = Math.max(removedLines.length, addedLines.length);

      for (let i = 0; i < maxPair; i++) {
        const remLine = removedLines[i];
        const addLine = addedLines[i];

        if (remLine !== undefined && addLine !== undefined) {
          // Compute character/word-level diff between the two lines
          const wordParts = Diff.diffWordsWithSpace(remLine, addLine);

          result.push({
            type: 'modified',
            oldLineNumber: oldLineIdx++,
            newLineNumber: newLineIdx++,
            previousText: remLine,
            text: addLine,
            wordDiff: wordParts
          });
          modifiedLinesCount++;
        } else if (remLine !== undefined) {
          result.push({
            type: 'removed',
            oldLineNumber: oldLineIdx++,
            text: remLine
          });
          removedLinesCount++;
        } else if (addLine !== undefined) {
          result.push({
            type: 'added',
            newLineNumber: newLineIdx++,
            text: addLine
          });
          addedLinesCount++;
        }
      }
      bIdx += 2;
      continue;
    }

    // Single block handling
    if (currentBlock.type === 'equal') {
      for (const line of currentBlock.lines) {
        result.push({
          type: 'equal',
          oldLineNumber: oldLineIdx++,
          newLineNumber: newLineIdx++,
          text: line
        });
        unchangedLinesCount++;
      }
    } else if (currentBlock.type === 'added') {
      for (const line of currentBlock.lines) {
        result.push({
          type: 'added',
          newLineNumber: newLineIdx++,
          text: line
        });
        addedLinesCount++;
      }
    } else if (currentBlock.type === 'removed') {
      for (const line of currentBlock.lines) {
        result.push({
          type: 'removed',
          oldLineNumber: oldLineIdx++,
          text: line
        });
        removedLinesCount++;
      }
    }

    bIdx++;
  }

  return {
    lines: result,
    metrics: {
      addedLinesCount,
      removedLinesCount,
      modifiedLinesCount,
      unchangedLinesCount,
      totalLinesCompared: result.length
    }
  };
}
