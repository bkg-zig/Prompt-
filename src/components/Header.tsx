import React from 'react';
import {
  Terminal,
  History,
  BookOpen,
  Download,
  Copy,
  FolderGit2,
  Sparkles,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { PromptMode } from '../types/prompt';

interface HeaderProps {
  currentMode: PromptMode;
  projectRoot: string;
  vendorCount: number;
  historyCount: number;
  onOpenVendorHub: () => void;
  onOpenHistory: () => void;
  onNewPrompt: () => void;
  onCopyMasterPrompt: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  hasGeneratedPrompt: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  projectRoot,
  vendorCount,
  historyCount,
  onOpenVendorHub,
  onOpenHistory,
  onNewPrompt,
  onCopyMasterPrompt,
  onExportMarkdown,
  onExportJson,
  hasGeneratedPrompt
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-mono">
                bKGForge
              </span>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Prompt-Creator
              </span>
            </div>

            {/* Zero-Pill Unboxed Text Metadata */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 truncate font-mono">
              <span className="truncate max-w-[220px] sm:max-w-xs text-zinc-300" title={projectRoot}>
                {projectRoot}
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-emerald-400">Rust Core</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{vendorCount} Vendor-Referenzen</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title="Neuen Prompt erstellen (Eingabe leeren)"
          >
            <PlusCircle className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Neu</span>
          </button>

          <button
            onClick={onOpenVendorHub}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title="Vendor-Forschungs-Hub: bkg-ffm & bkg-af Referenzen prüfen"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Vendor-Hub</span>
            <span className="text-xs text-zinc-500 font-mono">({vendorCount})</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title="Prompt-Historie & Versionen"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Historie</span>
            {historyCount > 0 && (
              <span className="text-xs text-zinc-500 font-mono">({historyCount})</span>
            )}
          </button>

          <div className="h-5 w-[1px] bg-zinc-800 mx-1 hidden sm:block" />

          {hasGeneratedPrompt && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onCopyMasterPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                title="Master-Prompt in Zwischenablage kopieren (Ctrl+Shift+C)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Prompt kopieren</span>
              </button>

              <div className="relative group">
                <button
                  className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  title="Exportieren (.md / .json)"
                >
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-700/80 rounded shadow-xl py-1 hidden group-hover:block hover:block z-40">
                  <button
                    onClick={onExportMarkdown}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Markdown (.md)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">AGENT</span>
                  </button>
                  <button
                    onClick={onExportJson}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Struktur (.json)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">AST</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
