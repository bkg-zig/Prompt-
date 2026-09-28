import React, { useState, useMemo } from 'react';
import * as Diff from 'diff';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Eye,
  Search,
  Maximize2,
  Minimize2,
  Columns,
  AlignJustify,
  FileDiff,
  ArrowRightLeft,
  Sparkles,
  Info
} from 'lucide-react';

export interface GeneratedPromptViewProps {
  masterPrompt?: string;
  previousMasterPrompt?: string;
  promptText?: string;          // Backwards-compatible alias for masterPrompt
  previousPromptText?: string;  // Backwards-compatible alias for previousMasterPrompt
  onCopy: () => void;
  onDownload: () => void;
  qualityScore?: number;
}

export type DiffLineType = 'added' | 'removed' | 'modified' | 'equal';
export type DiffCssClass = 'diff-line-added' | 'diff-line-removed' | 'diff-line-modified' | 'diff-line-equal';

export interface DiffLineItem {
  id: string;
  type: DiffLineType;
  cssClass: DiffCssClass;
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
  previousText?: string;
  wordDiff?: Diff.Change[];
}

export interface DiffMetrics {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  total: number;
}

/**
 * Baseline draft comparison used when no previous compilation run is stored yet,
 * ensuring the visual diff view can be immediately inspected and demonstrated.
 */
const DEFAULT_BASELINE_PROMPT = `# bKGForge - Rohentwurf (Vor Verfeinerung)

## 1. ZIEL & AUFTRAG
Mach bKGForge production ready und übernimm die guten Ideen aus den Vendor-Projekten.
Entwickle die Architektur mit schnellen Prototypen und lockeren Anforderungen.

## 2. TECHNOLOGIE & IMPLEMENTIERUNG
- Schnelle Implementierung ohne strikte Typisierung
- Vendor-Code kopieren und anpassen
- Mock-Objekte und Platzhalter vorerst beibehalten

## 3. QUALITÄTSKRITERIEN
- Grundlegende Tests optional
- Manuelle Prüfung reicht aus
- Sicherheitsrichtlinien später prüfen`;

/**
 * Computes structured line and word diffs using the 'diff' npm package,
 * classifying lines into 'diff-line-added', 'diff-line-removed', and 'diff-line-modified'.
 */
function computeVisualPromptDiff(
  oldPrompt: string,
  newPrompt: string
): { lines: DiffLineItem[]; metrics: DiffMetrics } {
  if (!oldPrompt && !newPrompt) {
    return {
      lines: [],
      metrics: { added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 }
    };
  }

  // 1. Line-level diff with diffLines from npm package 'diff'
  const changes = Diff.diffLines(oldPrompt || '', newPrompt || '', {
    newlineIsToken: false,
    ignoreWhitespace: false
  });

  const rawBlocks: { type: 'added' | 'removed' | 'equal'; lines: string[] }[] = [];

  for (const part of changes) {
    const lines = part.value.replace(/\r\n/g, '\n').split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    if (part.added) {
      rawBlocks.push({ type: 'added', lines });
    } else if (part.removed) {
      rawBlocks.push({ type: 'removed', lines });
    } else {
      rawBlocks.push({ type: 'equal', lines });
    }
  }

  // 2. Synthesize blocks, pairing adjacent removed + added into "modified" lines
  const lines: DiffLineItem[] = [];
  let oldLineIdx = 1;
  let newLineIdx = 1;
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let i = 0;
  while (i < rawBlocks.length) {
    const current = rawBlocks[i];
    const next = rawBlocks[i + 1];

    // Detect modified block (removed immediately followed by added)
    if (current.type === 'removed' && next && next.type === 'added') {
      const removedLines = current.lines;
      const addedLines = next.lines;
      const maxPair = Math.max(removedLines.length, addedLines.length);

      for (let j = 0; j < maxPair; j++) {
        const remLine = removedLines[j];
        const addLine = addedLines[j];

        if (remLine !== undefined && addLine !== undefined) {
          // Word-level diff within the modified line
          const words = Diff.diffWordsWithSpace(remLine, addLine);
          lines.push({
            id: `mod-${oldLineIdx}-${newLineIdx}`,
            type: 'modified',
            cssClass: 'diff-line-modified',
            oldLineNumber: oldLineIdx++,
            newLineNumber: newLineIdx++,
            previousText: remLine,
            text: addLine,
            wordDiff: words
          });
          modifiedCount++;
        } else if (remLine !== undefined) {
          lines.push({
            id: `rem-${oldLineIdx}`,
            type: 'removed',
            cssClass: 'diff-line-removed',
            oldLineNumber: oldLineIdx++,
            text: remLine
          });
          removedCount++;
        } else if (addLine !== undefined) {
          lines.push({
            id: `add-${newLineIdx}`,
            type: 'added',
            cssClass: 'diff-line-added',
            newLineNumber: newLineIdx++,
            text: addLine
          });
          addedCount++;
        }
      }
      i += 2;
      continue;
    }

    if (current.type === 'equal') {
      for (const line of current.lines) {
        lines.push({
          id: `eq-${oldLineIdx}-${newLineIdx}`,
          type: 'equal',
          cssClass: 'diff-line-equal',
          oldLineNumber: oldLineIdx++,
          newLineNumber: newLineIdx++,
          text: line
        });
        unchangedCount++;
      }
    } else if (current.type === 'added') {
      for (const line of current.lines) {
        lines.push({
          id: `add-${newLineIdx}`,
          type: 'added',
          cssClass: 'diff-line-added',
          newLineNumber: newLineIdx++,
          text: line
        });
        addedCount++;
      }
    } else if (current.type === 'removed') {
      for (const line of current.lines) {
        lines.push({
          id: `rem-${oldLineIdx}`,
          type: 'removed',
          cssClass: 'diff-line-removed',
          oldLineNumber: oldLineIdx++,
          text: line
        });
        removedCount++;
      }
    }

    i++;
  }

  return {
    lines,
    metrics: {
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      unchanged: unchangedCount,
      total: lines.length
    }
  };
}

export const GeneratedPromptView: React.FC<GeneratedPromptViewProps> = ({
  masterPrompt,
  previousMasterPrompt,
  promptText,
  previousPromptText,
  onCopy,
  onDownload,
  qualityScore
}) => {
  // Resolve unified prop aliases
  const currentPrompt = masterPrompt ?? promptText ?? '';
  const previousPrompt = previousMasterPrompt ?? previousPromptText ?? '';

  // Local component state: Toggle-Switch for Visual Diff View
  const [isDiffActive, setIsDiffActive] = useState<boolean>(() => {
    return Boolean(previousPrompt && previousPrompt.trim() !== '' && previousPrompt !== currentPrompt);
  });

  // Secondary sub-states for non-diff view and diff layout
  const [previewSubMode, setPreviewSubMode] = useState<'preview' | 'raw'>('preview');
  const [diffLayout, setDiffLayout] = useState<'unified' | 'split'>('unified');
  const [diffFilter, setDiffFilter] = useState<'all' | 'changes-only'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback baseline for visual diff comparison
  const effectivePreviousPrompt = useMemo(() => {
    if (previousPrompt && previousPrompt.trim() !== '') {
      return previousPrompt;
    }
    return DEFAULT_BASELINE_PROMPT;
  }, [previousPrompt]);

  const hasRealPreviousPrompt = Boolean(previousPrompt && previousPrompt.trim() !== '');

  // Diff computation using the 'diff' library
  const { lines: diffLines, metrics: diffMetrics } = useMemo(() => {
    return computeVisualPromptDiff(effectivePreviousPrompt, currentPrompt);
  }, [effectivePreviousPrompt, currentPrompt]);

  // Filtered diff lines for search and changes-only view
  const displayedDiffLines = useMemo(() => {
    let result = diffLines;
    if (diffFilter === 'changes-only') {
      result = result.filter((l) => l.type !== 'equal');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.text.toLowerCase().includes(q) ||
          (l.previousText && l.previousText.toLowerCase().includes(q))
      );
    }
    return result;
  }, [diffLines, diffFilter, searchQuery]);

  const handleCopy = () => {
    onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const lineCount = currentPrompt ? currentPrompt.split('\n').length : 0;
  const wordCount = currentPrompt ? currentPrompt.split(/\s+/).filter(Boolean).length : 0;

  // Toggle switch handler bound to local component state
  const handleToggleDiff = () => {
    setIsDiffActive((prev) => !prev);
  };

  return (
    <div
      className={`generated-prompt-view cyber-panel overflow-hidden shadow-sm flex flex-col transition-all text-zinc-100 ${
        isExpanded ? 'fixed inset-4 z-50 bg-[#020407] border-[#00f6ff] shadow-[0_0_25px_rgba(0,246,255,0.25)]' : 'min-h-[520px]'
      }`}
    >
      {/* ─── Header Toolbar ─── */}
      <div className="bg-[#05070a]/95 border-b border-[#17252d] px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono">
        {/* Left: View Mode Controls & Dedicated Diff Toggle-Switch */}
        <div className="flex items-center gap-3">
          {/* Preview / Raw switch (active when Diff is off) */}
          <div className="flex items-center gap-1 p-0.5 bg-[#080d12] rounded border border-[#17252d]">
            <button
              onClick={() => {
                setPreviewSubMode('preview');
                if (isDiffActive) setIsDiffActive(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none ${
                !isDiffActive && previewSubMode === 'preview'
                  ? 'bg-[#00f6ff]/15 text-[#00f6ff] border border-[#00f6ff]/40 shadow-[0_0_8px_rgba(0,246,255,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0e151d]'
              }`}
              title="Formatierte Markdown-Vorschau anzeigen"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vorschau</span>
            </button>

            <button
              onClick={() => {
                setPreviewSubMode('raw');
                if (isDiffActive) setIsDiffActive(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none ${
                !isDiffActive && previewSubMode === 'raw'
                  ? 'bg-[#00f6ff]/15 text-[#00f6ff] border border-[#00f6ff]/40 shadow-[0_0_8px_rgba(0,246,255,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0e151d]'
              }`}
              title="Reinen Prompt-Text (Raw) anzeigen"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          {/* ─── DEDICATED VISUAL DIFF TOGGLE SWITCH ─── */}
          <div className="flex items-center pl-3 border-l border-[#17252d]">
            <div
              className={`diff-toggle-container flex items-center gap-2.5 px-2.5 py-1 rounded transition-all cursor-pointer border ${
                isDiffActive
                  ? 'bg-[#00f6ff]/10 border-[#00f6ff]/50 shadow-[0_0_10px_rgba(0,246,255,0.2)]'
                  : 'bg-[#080d12]/80 border-[#17252d] hover:border-[#1a3138]'
              }`}
              onClick={handleToggleDiff}
              title="Visuelle Diff-Ansicht zwischen previousMasterPrompt und masterPrompt ein-/ausschalten"
            >
              {/* Accessible Interactive Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isDiffActive}
                data-testid="diff-toggle-switch"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDiff();
                }}
                className={`diff-toggle relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00f6ff] ${
                  isDiffActive
                    ? 'bg-[#00f6ff]/25 border-[#00f6ff] shadow-[0_0_8px_rgba(0,246,255,0.4)]'
                    : 'bg-[#0b1118] border-[#17252d]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                    isDiffActive
                      ? 'translate-x-4 bg-[#00f6ff] shadow-[0_0_6px_#00f6ff]'
                      : 'translate-x-0 bg-[#40515b]'
                  }`}
                />
              </button>

              {/* Toggle Label & Metrics */}
              <div className="flex items-center gap-1.5 select-none">
                <FileDiff
                  className={`w-3.5 h-3.5 ${
                    isDiffActive ? 'text-[#00f6ff]' : 'text-[#78909c]'
                  }`}
                />
                <span
                  className={`text-xs font-semibold tracking-wide ${
                    isDiffActive ? 'text-[#00f6ff]' : 'text-[#78909c]'
                  }`}
                >
                  Visueller Diff
                </span>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDiffActive
                      ? 'bg-[#00f6ff]/20 text-[#d7faff]'
                      : 'bg-[#17252d]/60 text-[#40515b]'
                  }`}
                >
                  (+{diffMetrics.added} / ~{diffMetrics.modified} / -{diffMetrics.removed})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Metadata / Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#78909c] font-mono">
          <span>{lineCount} Zeilen</span>
          <span aria-hidden="true" className="text-[#40515b]">·</span>
          <span>{wordCount} Wörter</span>
          {qualityScore !== undefined && (
            <>
              <span aria-hidden="true" className="text-[#40515b]">·</span>
              <span className={qualityScore >= 85 ? 'text-[#39ff14]' : 'text-[#ffb000]'}>
                Score: {qualityScore}%
              </span>
            </>
          )}
        </div>

        {/* Right: Actions (Search, Copy, Download, Expand) */}
        <div className="flex items-center gap-2">
          {/* Quick search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-[#78909c] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Im Prompt suchen..."
              className="w-36 lg:w-44 bg-[#080d12] border border-[#17252d] rounded pl-7 pr-2 py-1 text-xs text-[#d7faff] placeholder:text-[#40515b] focus:outline-none focus:border-[#00f6ff] font-mono"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#00f6ff]/15 hover:bg-[#00f6ff]/25 text-[#00f6ff] border border-[#00f6ff]/50 shadow-[0_0_8px_rgba(0,246,255,0.2)] rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none"
            title="In Zwischenablage kopieren"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#39ff14]" /> : <Copy className="w-3.5 h-3.5 text-[#00f6ff]" />}
            <span>{isCopied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>

          <button
            onClick={onDownload}
            className="p-1.5 text-[#78909c] hover:text-[#d7faff] hover:bg-[#0e151d] border border-[#17252d] rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none"
            title="Als .md-Datei herunterladen"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-[#78909c] hover:text-[#d7faff] hover:bg-[#0e151d] border border-[#17252d] rounded transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none"
            title={isExpanded ? 'Verkleinern' : 'Vollbild'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Sub-Toolbar for Visual Diff Mode (Legend, Layout, Filter) ─── */}
      {isDiffActive && (
        <div className="bg-[#05070a] border-b border-[#17252d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Color-Coded Decorator Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[#78909c] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="led led-busy" />
              Diff-Indikatoren:
            </span>

            {/* Added Lines (.diff-line-added) */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#39ff14]/10 border border-[#39ff14]/40 text-[#7cff5c] font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_6px_#39ff14] inline-block" />
              <span>+{diffMetrics.added} Hinzugefügt (Grün)</span>
            </div>

            {/* Modified Lines (.diff-line-modified) */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ffb000]/10 border border-[#ffb000]/40 text-[#ffd166] font-semibold text-[11px]">
              <span className="diff-indicator-yellow" />
              <span>~{diffMetrics.modified} Modifiziert (Gelber Indikator)</span>
            </div>

            {/* Removed Lines (.diff-line-removed) */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ff1744]/15 border border-[#ff1744]/40 text-[#ff4d6d] font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#ff1744] shadow-[0_0_6px_#ff1744] inline-block" />
              <span className="line-through decoration-[#ff1744]">-{diffMetrics.removed} Gelöscht (Rot + Durchgestrichen)</span>
            </div>

            {!hasRealPreviousPrompt && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-[#78909c] bg-[#0e151d] px-2 py-0.5 rounded border border-[#17252d]">
                <Info className="w-3 h-3 text-[#ffb000]" />
                Vergleich: Initial-Entwurf vs. Master-Prompt
              </span>
            )}
          </div>

          {/* Diff Controls: Unified vs Split & Changes filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-[#080d12] rounded border border-[#17252d]">
              <button
                onClick={() => setDiffLayout('unified')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                  diffLayout === 'unified' ? 'bg-[#0e151d] text-[#00f6ff] font-medium' : 'text-[#78909c] hover:text-[#d7faff]'
                }`}
                title="Unified View (Einspaltige Zeilenfolge)"
              >
                <AlignJustify className="w-3 h-3" />
                <span>Unified</span>
              </button>
              <button
                onClick={() => setDiffLayout('split')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                  diffLayout === 'split' ? 'bg-[#0e151d] text-[#00f6ff] font-medium' : 'text-[#78909c] hover:text-[#d7faff]'
                }`}
                title="Split View (Zweispaltiger Direktvergleich)"
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
            </div>

            <button
              onClick={() => setDiffFilter(diffFilter === 'all' ? 'changes-only' : 'all')}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                diffFilter === 'changes-only'
                  ? 'bg-[#00f6ff]/15 border-[#00f6ff]/50 text-[#00f6ff] font-medium shadow-[0_0_6px_rgba(0,246,255,0.2)]'
                  : 'bg-[#080d12] border-[#17252d] text-[#78909c] hover:text-[#d7faff]'
              }`}
            >
              {diffFilter === 'changes-only' ? 'Nur Änderungen' : 'Alle Zeilen'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Content Area ─── */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
        {/* NON-DIFF: Raw View */}
        {!isDiffActive && previewSubMode === 'raw' && (
          <pre className="text-[#d7faff] whitespace-pre-wrap font-mono text-xs select-text">
            {currentPrompt}
          </pre>
        )}

        {/* NON-DIFF: Formatted Preview */}
        {!isDiffActive && previewSubMode === 'preview' && (
          <div className="max-w-4xl mx-auto space-y-6 text-[#d7faff]">
            {currentPrompt.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return (
                  <div key={idx} className="pb-3 border-b border-[#17252d]">
                    <h1 className="text-lg sm:text-xl font-bold text-[#00f6ff] tracking-tight font-mono">
                      {block.replace('# ', '')}
                    </h1>
                  </div>
                );
              }
              if (block.startsWith('## ')) {
                return (
                  <div key={idx} className="pt-3 pb-1 border-b border-[#17252d]/80">
                    <h2 className="text-sm sm:text-base font-bold text-[#5cffff] uppercase tracking-wider font-mono">
                      {block.replace('## ', '')}
                    </h2>
                  </div>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xs sm:text-sm font-semibold text-[#ff5cf2] pt-2 font-mono">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('---')) {
                return <hr key={idx} className="border-[#17252d] my-4" />;
              }
              if (block.startsWith('```')) {
                return (
                  <pre
                    key={idx}
                    className="p-3 bg-[#020407] border border-[#17252d] rounded text-xs text-[#00f6ff] overflow-x-auto"
                  >
                    {block.replace(/```[a-z]*/g, '')}
                  </pre>
                );
              }
              return (
                <div key={idx} className="text-xs sm:text-sm text-[#78909c] leading-relaxed font-sans">
                  {block.split('\n').map((line, lIdx) => {
                    const isCheck = line.includes('- [SICHER]') || line.includes('- [OFFEN]');

                    return (
                      <div
                        key={lIdx}
                        className={`py-0.5 ${
                          isCheck && line.includes('[OFFEN]')
                            ? 'text-[#ffd166] bg-[#ffb000]/10 px-2 rounded -mx-2 my-0.5'
                            : isCheck && line.includes('[SICHER]')
                            ? 'text-[#7cff5c]'
                            : ''
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── VISUAL DIFF VIEW: WITH diff-line-added, diff-line-removed, diff-line-modified ─── */}
        {isDiffActive && (
          <div>
            {diffLayout === 'unified' ? (
              /* Unified View: with precise CSS classes diff-line-added, diff-line-removed, diff-line-modified */
              <div className="space-y-0.5 font-mono text-xs select-text border border-[#17252d] rounded overflow-hidden bg-[#020407]">
                {displayedDiffLines.map((line) => {
                  /*
                   * Visual line decoration mapped directly to:
                   * - 'diff-line-added'
                   * - 'diff-line-removed'
                   * - 'diff-line-modified'
                   */
                  let symbol = ' ';
                  if (line.type === 'added') symbol = '+';
                  else if (line.type === 'removed') symbol = '-';
                  else if (line.type === 'modified') symbol = '~';

                  return (
                    <div
                      key={line.id}
                      data-diff-type={line.type}
                      className={`diff-line ${line.cssClass} flex items-start py-1 px-2.5 transition-colors`}
                    >
                      {/* Old line number */}
                      <span className="w-10 text-right pr-2 text-[#40515b] select-none shrink-0 font-mono text-[11px]">
                        {line.oldLineNumber || ''}
                      </span>
                      {/* New line number */}
                      <span className="w-10 text-right pr-3 text-[#40515b] select-none shrink-0 font-mono text-[11px]">
                        {line.newLineNumber || ''}
                      </span>

                      {/* Diff symbol / indicator */}
                      <span
                        className={`w-6 font-bold select-none shrink-0 ${
                          line.type === 'added'
                            ? 'text-[#39ff14]'
                            : line.type === 'removed'
                            ? 'text-[#ff1744]'
                            : line.type === 'modified'
                            ? 'text-[#ffb000]'
                            : 'text-[#40515b]'
                        }`}
                      >
                        {symbol}
                      </span>

                      {/* Line content */}
                      <div className="flex-1 whitespace-pre-wrap break-all">
                        {line.type === 'modified' ? (
                          <div>
                            {/* Deleted/previous version with strikethrough and red background */}
                            {line.previousText && (
                              <div
                                data-diff-type="removed"
                                className="diff-line-removed diff-deleted-text bg-[#ff1744]/15 text-[#ff4d6d] line-through decoration-[#ff1744] px-1.5 py-0.5 rounded-xs text-[11px] mb-1 inline-block w-full border-l-2 border-[#ff1744]"
                              >
                                - {line.previousText}
                              </div>
                            )}

                            {/* Modified version with distinct yellow indicator */}
                            <div className="text-[#ffd166] font-medium flex items-center gap-1.5">
                              <span
                                className="diff-indicator-yellow shrink-0"
                                title="Modifizierte Zeile"
                              />
                              <span className="flex-1">
                                +{' '}
                                {line.wordDiff ? (
                                  line.wordDiff.map((part, pIdx) => {
                                    if (part.added) {
                                      return (
                                        <span
                                          key={pIdx}
                                          className="bg-[#ffb000]/25 text-[#ffd166] underline decoration-[#ffb000] font-semibold rounded-xs px-0.5"
                                        >
                                          {part.value}
                                        </span>
                                      );
                                    }
                                    if (part.removed) {
                                      return (
                                        <span
                                          key={pIdx}
                                          className="bg-[#ff1744]/30 text-[#ff4d6d] line-through opacity-85 px-0.5"
                                        >
                                          {part.value}
                                        </span>
                                      );
                                    }
                                    return <span key={pIdx}>{part.value}</span>;
                                  })
                                ) : (
                                  line.text
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          line.text || ' '
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Split View: Side-by-Side with diff-line-removed on left and diff-line-added / diff-line-modified on right */
              <div className="border border-[#17252d] rounded overflow-hidden bg-[#020407] font-mono text-xs">
                <div className="grid grid-cols-2 bg-[#05070a] border-b border-[#17252d] px-3 py-1.5 text-[#78909c] font-bold text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff1744] shadow-[0_0_4px_#ff1744]" />
                    <span>previousMasterPrompt (Rot / Durchgestrichen)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_4px_#39ff14]" />
                    <span>masterPrompt (Grün hinzugefügt / Gelber Indikator)</span>
                  </div>
                </div>

                <div className="divide-y divide-[#0e151d]">
                  {displayedDiffLines.map((line) => {
                    return (
                      <div key={line.id} className="grid grid-cols-2 text-[11px] divide-x divide-[#17252d]">
                        {/* Left column (previousMasterPrompt) */}
                        <div
                          data-diff-type={line.type === 'removed' ? 'removed' : undefined}
                          className={`p-1.5 flex items-start ${
                            line.type === 'removed' || line.type === 'modified'
                              ? 'diff-line-removed'
                              : 'text-[#78909c]'
                          }`}
                        >
                          <span className="w-8 text-right pr-2 text-[#40515b] select-none shrink-0 font-mono">
                            {line.oldLineNumber || ''}
                          </span>
                          <span className="flex-1 whitespace-pre-wrap break-all">
                            {line.type === 'modified'
                              ? line.previousText
                              : line.type !== 'added'
                              ? line.text
                              : ''}
                          </span>
                        </div>

                        {/* Right column (masterPrompt) */}
                        <div
                          data-diff-type={line.type === 'added' ? 'added' : line.type === 'modified' ? 'modified' : undefined}
                          className={`p-1.5 flex items-start ${
                            line.type === 'added'
                              ? 'diff-line-added'
                              : line.type === 'modified'
                              ? 'diff-line-modified'
                              : 'text-[#78909c]'
                          }`}
                        >
                          <span className="w-8 text-right pr-2 text-[#40515b] select-none shrink-0 font-mono">
                            {line.newLineNumber || ''}
                          </span>
                          <span className="flex-1 whitespace-pre-wrap break-all flex items-center gap-1.5">
                            {line.type === 'modified' && (
                              <span className="diff-indicator-yellow shrink-0" />
                            )}
                            <span>{line.type !== 'removed' ? line.text : ''}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
