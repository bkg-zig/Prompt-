import React from 'react';
import {
  X,
  History,
  RotateCcw,
  Trash2,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import { PromptVersion } from '../types/prompt';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: PromptVersion[];
  currentVersionId?: string;
  onRestoreVersion: (version: PromptVersion) => void;
  onDeleteVersion: (id: string) => void;
  onClearHistory: () => void;
  onExportMarkdown: (v: PromptVersion) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  versions,
  currentVersionId,
  onRestoreVersion,
  onDeleteVersion,
  onClearHistory,
  onExportMarkdown
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Prompt-Historie & Versionen
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {versions.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Möchtest du wirklich alle Versionen aus dem Speicher löschen?')) {
                    onClearHistory();
                  }
                }}
                className="text-xs text-zinc-500 hover:text-rose-400 transition-colors p-1"
                title="Historie leeren"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">
              Noch keine Versionen gespeichert.
              <br />
              Kompiliere einen Prompt, um eine Version anzulegen.
            </div>
          ) : (
            versions.map((ver) => {
              const isCurrent = ver.id === currentVersionId;
              const dateStr = new Date(ver.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={ver.id}
                  className={`p-3.5 rounded-lg border transition-all text-xs font-mono space-y-2 ${
                    isCurrent
                      ? 'bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">
                        {ver.version}
                      </span>
                      {/* Zero-Pill unboxed text */}
                      <span className="text-emerald-400 uppercase text-[10px]">
                        {ver.mode}
                      </span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-[11px] text-zinc-500">{dateStr}</span>
                    </div>

                    <span className={ver.qualityScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}>
                      {ver.qualityScore}% Score
                    </span>
                  </div>

                  <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">
                    „{ver.rawInput}“
                  </p>

                  <div className="text-[11px] text-zinc-500 truncate">
                    {ver.changeSummary || 'Initiale Versionierung'}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                      <span>{ver.structured.vendorReferences.length} Vendor-Refs</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onExportMarkdown(ver)}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                        title="Herunterladen (.md)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteVersion(ver.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Version löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onRestoreVersion(ver);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-emerald-600 text-white rounded text-[11px] transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Wiederherstellen</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
