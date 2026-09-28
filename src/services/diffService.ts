export type DiffType = 'equal' | 'added' | 'removed' | 'modified';

export interface DiffLine {
  type: DiffType;
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
  previousText?: string; // used when modified
}

export interface DiffSummary {
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
}

/**
 * Computes a detailed line-by-line diff between two text documents (LCS algorithm).
 * Detects additions, removals, modifications and unchanged lines.
 */
export function computeLineDiff(oldText: string, newText: string): { lines: DiffLine[]; summary: DiffSummary } {
  const oldLines = oldText ? oldText.split('\n') : [];
  const newLines = newText ? newText.split('\n') : [];

  const m = oldLines.length;
  const n = newLines.length;

  // LCS Matrix
  // If inputs are very large, avoid quadratic memory overhead by capped size or standard DP
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1) as unknown as number[]);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to find diff ops
  let i = m;
  let j = n;
  const rawDiff: { type: 'equal' | 'added' | 'removed'; oldIdx?: number; newIdx?: number; text: string }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawDiff.push({
        type: 'equal',
        oldIdx: i,
        newIdx: j,
        text: oldLines[i - 1]
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({
        type: 'added',
        newIdx: j,
        text: newLines[j - 1]
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({
        type: 'removed',
        oldIdx: i,
        text: oldLines[i - 1]
      });
      i--;
    }
  }

  rawDiff.reverse();

  // Second pass: Group adjacent removed and added lines into "modified" lines when they share semantic proximity
  const result: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let idx = 0;
  while (idx < rawDiff.length) {
    const curr = rawDiff[idx];

    // Check if we have a removed followed immediately by an added line (or consecutive pair)
    if (curr.type === 'removed' && idx + 1 < rawDiff.length && rawDiff[idx + 1].type === 'added') {
      const next = rawDiff[idx + 1];
      result.push({
        type: 'modified',
        oldLineNumber: curr.oldIdx,
        newLineNumber: next.newIdx,
        previousText: curr.text,
        text: next.text
      });
      modifiedCount++;
      idx += 2;
      continue;
    }

    if (curr.type === 'equal') {
      result.push({
        type: 'equal',
        oldLineNumber: curr.oldIdx,
        newLineNumber: curr.newIdx,
        text: curr.text
      });
      unchangedCount++;
    } else if (curr.type === 'added') {
      result.push({
        type: 'added',
        newLineNumber: curr.newIdx,
        text: curr.text
      });
      addedCount++;
    } else if (curr.type === 'removed') {
      result.push({
        type: 'removed',
        oldLineNumber: curr.oldIdx,
        text: curr.text
      });
      removedCount++;
    }
    idx++;
  }

  return {
    lines: result,
    summary: {
      addedCount,
      removedCount,
      modifiedCount,
      unchangedCount
    }
  };
}
