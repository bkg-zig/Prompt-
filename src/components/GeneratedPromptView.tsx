import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Eye,
  GitCompare,
  Search,
  Maximize2,
  Minimize2,
  Columns,
  AlignJustify,
  Plus,
  Minus,
  Edit3
} from 'lucide-react';
import { computeLineDiff, DiffLine, DiffSummary } from '../services/diffService';

interface GeneratedPromptViewProps {
  promptText: string;
  previousPromptText?: string;
  onCopy: () => void;
  onDownload: () => void;
  qualityScore?: number;
}

export const GeneratedPromptView: React.FC<GeneratedPromptViewProps> = ({
  promptText,
  previousPromptText,
  onCopy,
  onDownload,
  qualityScore
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'diff'>(
    previousPromptText && previousPromptText !== promptText ? 'diff' : 'preview'
  );
  const [diffLayout, setDiffLayout] = useState<'unified' | 'split'>('unified');
  const [diffFilter, setDiffFilter] = useState<'all' | 'changes-only'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const lineCount = promptText ? promptText.split('\n').length : 0;
  const wordCount = promptText ? promptText.split(/\s+/).filter(Boolean).length : 0;

  // Compute visual line diff when previousPromptText is present
  const { diffLines, diffSummary } = useMemo(() => {
    if (!previousPromptText) {
      return {
        diffLines: [] as DiffLine[],
        diffSummary: { addedCount: 0, removedCount: 0, modifiedCount: 0, unchangedCount: 0 } as DiffSummary
      };
    }
    const computed = computeLineDiff(previousPromptText, promptText);
    return {
      diffLines: computed.lines,
      diffSummary: computed.summary
    };
  }, [previousPromptText, promptText]);

  const displayedDiffLines = useMemo(() => {
    if (diffFilter === 'changes-only') {
      return diffLines.filter((l) => l.type !== 'equal');
    }
    return diffLines;
  }, [diffLines, diffFilter]);

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col transition-all text-zinc-100 ${
        isExpanded ? 'fixed inset-4 z-50 bg-zinc-950 border-zinc-700' : 'min-h-[520px]'
      }`}
    >
      {/* Top toolbar */}
      <div className="bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: View mode segmented control (following zero-pill rule) */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
              viewMode === 'preview'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Formatierte Vorschau</span>
          </button>

          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
              viewMode === 'raw'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Raw Markdown</span>
          </button>

          <button
            onClick={() => setViewMode('diff')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
              viewMode === 'diff'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-sky-400" />
            <span>Visuelles Diff</span>
            {previousPromptText && (
              <span className="text-[10px] text-zinc-400 font-mono">
                (+{diffSummary.addedCount} / ~{diffSummary.modifiedCount} / -{diffSummary.removedCount})
              </span>
            )}
          </button>
        </div>

        {/* Center: Metadata without pill enclosures */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span>{lineCount} Zeilen</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>{wordCount} Wörter</span>
          {qualityScore !== undefined && (
            <>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className={qualityScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}>
                Qualität: {qualityScore}%
              </span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick search input */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Im Prompt suchen..."
              className="w-36 lg:w-44 bg-zinc-900 border border-zinc-700/80 rounded pl-7 pr-2 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            title="In Zwischenablage kopieren"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>

          <button
            onClick={onDownload}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title="Als .md-Datei herunterladen"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title={isExpanded ? 'Verkleinern' : 'Vollbild'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-toolbar for Visual Diff mode */}
      {viewMode === 'diff' && (
        <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-semibold">Diff-Modus:</span>

            {/* Zero-pill diff stats */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Plus className="w-3 h-3" />
                {diffSummary.addedCount} Zeilen hinzugefügt
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Edit3 className="w-3 h-3" />
                {diffSummary.modifiedCount} Zeilen modifiziert
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Minus className="w-3 h-3" />
                {diffSummary.removedCount} Zeilen gelöscht
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Split vs Unified */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded border border-zinc-800">
              <button
                onClick={() => setDiffLayout('unified')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                  diffLayout === 'unified' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Unified View (Einspaltig)"
              >
                <AlignJustify className="w-3 h-3" />
                <span>Unified</span>
              </button>
              <button
                onClick={() => setDiffLayout('split')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                  diffLayout === 'split' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Split View (Nebeneinander)"
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
            </div>

            {/* Filter: All vs Changes only */}
            <button
              onClick={() => setDiffFilter(diffFilter === 'all' ? 'changes-only' : 'all')}
              className={`px-2 py-1 rounded border text-[11px] transition-colors ${
                diffFilter === 'changes-only'
                  ? 'bg-sky-950/60 border-sky-700 text-sky-300 font-medium'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {diffFilter === 'changes-only' ? 'Nur Änderungen aktiv' : 'Alle Zeilen anzeigen'}
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
        {/* Raw View */}
        {viewMode === 'raw' && (
          <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-xs select-text">
            {promptText}
          </pre>
        )}

        {/* Formatted Preview */}
        {viewMode === 'preview' && (
          <div className="max-w-4xl mx-auto space-y-6 text-zinc-200">
            {promptText.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return (
                  <div key={idx} className="pb-3 border-b border-zinc-800">
                    <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono text-emerald-400">
                      {block.replace('# ', '')}
                    </h1>
                  </div>
                );
              }
              if (block.startsWith('## ')) {
                return (
                  <div key={idx} className="pt-3 pb-1 border-b border-zinc-800/60">
                    <h2 className="text-sm sm:text-base font-bold text-zinc-100 uppercase tracking-wider font-mono">
                      {block.replace('## ', '')}
                    </h2>
                  </div>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xs sm:text-sm font-semibold text-emerald-300 pt-2 font-mono">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('---')) {
                return <hr key={idx} className="border-zinc-800 my-4" />;
              }
              if (block.startsWith('```')) {
                return (
                  <pre
                    key={idx}
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs text-emerald-300 overflow-x-auto"
                  >
                    {block.replace(/```[a-z]*/g, '')}
                  </pre>
                );
              }
              // Normal list or paragraph
              return (
                <div key={idx} className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                  {block.split('\n').map((line, lIdx) => {
                    const isCheck = line.includes('- [SICHER]') || line.includes('- [OFFEN]');

                    return (
                      <div
                        key={lIdx}
                        className={`py-0.5 ${
                          isCheck && line.includes('[OFFEN]')
                            ? 'text-amber-300 bg-amber-950/20 px-2 rounded -mx-2 my-0.5'
                            : isCheck && line.includes('[SICHER]')
                            ? 'text-emerald-300/90'
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

        {/* Visual Line Diff View */}
        {viewMode === 'diff' && (
          <div>
            {!previousPromptText ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono space-y-2">
                <GitCompare className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-400 font-semibold">Kein direkter Vorgänger-Prompt vorhanden.</p>
                <p>
                  Kompiliere den Prompt erneut (oder führe eine automatische Schärfung durch), um den genauen
                  Vorher-Nachher-Vergleich mit Hervorhebung modifizierter, entfernter und hinzugefügter Zeilen zu sehen.
                </p>
              </div>
            ) : diffLayout === 'unified' ? (
              /* Unified View */
              <div className="space-y-0.5 font-mono text-xs select-text border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950">
                {displayedDiffLines.map((line, idx) => {
                  let rowStyle = 'hover:bg-zinc-900/60 text-zinc-400';
                  let symbol = ' ';
                  let borderMarker = 'border-transparent';

                  if (line.type === 'added') {
                    rowStyle = 'bg-emerald-950/30 text-emerald-200 hover:bg-emerald-950/50';
                    symbol = '+';
                    borderMarker = 'border-emerald-500';
                  } else if (line.type === 'removed') {
                    rowStyle = 'bg-rose-950/30 text-rose-300 line-through opacity-85 hover:bg-rose-950/50';
                    symbol = '-';
                    borderMarker = 'border-rose-500';
                  } else if (line.type === 'modified') {
                    rowStyle = 'bg-amber-950/25 text-amber-200 hover:bg-amber-950/40';
                    symbol = '~';
                    borderMarker = 'border-amber-500';
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start border-l-2 py-0.5 px-2 transition-colors ${rowStyle} ${borderMarker}`}
                    >
                      {/* Old line number */}
                      <span className="w-10 text-right pr-2 text-zinc-600 select-none shrink-0 font-mono text-[11px]">
                        {line.oldLineNumber || ''}
                      </span>
                      {/* New line number */}
                      <span className="w-10 text-right pr-3 text-zinc-600 select-none shrink-0 font-mono text-[11px]">
                        {line.newLineNumber || ''}
                      </span>
                      {/* Diff symbol */}
                      <span
                        className={`w-5 font-bold select-none shrink-0 ${
                          line.type === 'added'
                            ? 'text-emerald-400'
                            : line.type === 'removed'
                            ? 'text-rose-400'
                            : line.type === 'modified'
                            ? 'text-amber-400'
                            : 'text-zinc-600'
                        }`}
                      >
                        {symbol}
                      </span>
                      {/* Line content */}
                      <div className="flex-1 whitespace-pre-wrap break-all">
                        {line.type === 'modified' && line.previousText ? (
                          <div>
                            <div className="text-rose-400/80 line-through text-[11px] mb-0.5">
                              - {line.previousText}
                            </div>
                            <div className="text-amber-200 font-medium">
                              + {line.text}
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
              /* Split View (Side-by-Side) */
              <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950 font-mono text-xs">
                <div className="grid grid-cols-2 bg-zinc-900/90 border-b border-zinc-800 px-3 py-1.5 text-zinc-400 font-bold text-[11px]">
                  <div>Vorgänger-Version (Vorher)</div>
                  <div>Aktueller Master-Prompt (Nachher)</div>
                </div>

                <div className="divide-y divide-zinc-900">
                  {displayedDiffLines.map((line, idx) => {
                    return (
                      <div key={idx} className="grid grid-cols-2 text-[11px] divide-x divide-zinc-900">
                        {/* Left column (previous) */}
                        <div
                          className={`p-1.5 flex items-start ${
                            line.type === 'removed'
                              ? 'bg-rose-950/30 text-rose-300'
                              : line.type === 'modified'
                              ? 'bg-amber-950/20 text-rose-400/90'
                              : 'text-zinc-400'
                          }`}
                        >
                          <span className="w-8 text-right pr-2 text-zinc-600 select-none shrink-0">
                            {line.oldLineNumber || ''}
                          </span>
                          <span className="flex-1 whitespace-pre-wrap break-all">
                            {line.type === 'modified' ? line.previousText : line.type !== 'added' ? line.text : ''}
                          </span>
                        </div>

                        {/* Right column (new) */}
                        <div
                          className={`p-1.5 flex items-start ${
                            line.type === 'added'
                              ? 'bg-emerald-950/30 text-emerald-200'
                              : line.type === 'modified'
                              ? 'bg-amber-950/25 text-amber-200'
                              : 'text-zinc-400'
                          }`}
                        >
                          <span className="w-8 text-right pr-2 text-zinc-600 select-none shrink-0">
                            {line.newLineNumber || ''}
                          </span>
                          <span className="flex-1 whitespace-pre-wrap break-all">
                            {line.type !== 'removed' ? line.text : ''}
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
