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
    <header className="sticky top-0 z-30 bg-[#020407]/95 backdrop-blur-md border-b border-[#17252d] text-[#d7faff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 font-mono">
        {/* Brand & Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xs bg-[#00f6ff]/10 border border-[#00f6ff]/40 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,246,255,0.25)]">
            <Terminal className="w-5 h-5 text-[#00f6ff]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wider text-white font-mono uppercase text-[#00f6ff]">
                SYS://bKGForge
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#ff00e5]/10 border border-[#ff00e5]/30 text-[#ff5cf2] font-semibold uppercase tracking-widest font-mono">
                AI://PROMPT-CREATOR
              </span>
            </div>

            {/* Zero-Pill Unboxed Text Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#78909c] truncate font-mono">
              <span className="truncate max-w-[220px] sm:max-w-xs text-[#d7faff]" title={projectRoot}>
                ROOT://{projectRoot.replace('/srv/bkg/workspace/current/', '')}
              </span>
              <span aria-hidden="true" className="text-[#17252d]">·</span>
              <span className="text-[#39ff14] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] led-pulse inline-block" />
                RUST CORE
              </span>
              <span aria-hidden="true" className="text-[#17252d]">·</span>
              <span className="text-[#00f6ff]">{vendorCount} VENDOR REFS</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#78909c] hover:text-[#00f6ff] hover:bg-[#080d12] border border-transparent hover:border-[#17252d] rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase"
            title="Neuen Prompt erstellen (Eingabe leeren)"
          >
            <PlusCircle className="w-4 h-4 text-[#78909c]" />
            <span className="hidden sm:inline">Neu</span>
          </button>

          <button
            onClick={onOpenVendorHub}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#d7faff] bg-[#080d12] hover:bg-[#0b1118] border border-[#17252d] hover:border-[#007f87] rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase"
            title="Vendor-Forschungs-Hub: bkg-ffm & bkg-af Referenzen prüfen"
          >
            <BookOpen className="w-4 h-4 text-[#00f6ff]" />
            <span className="hidden sm:inline">Vendor-Hub</span>
            <span className="text-xs text-[#00f6ff]/80 font-mono">[{vendorCount}]</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#d7faff] bg-[#080d12] hover:bg-[#0b1118] border border-[#17252d] hover:border-[#007f87] rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase"
            title="Prompt-Historie & Versionen"
          >
            <History className="w-4 h-4 text-[#ff00e5]" />
            <span className="hidden sm:inline">Historie</span>
            {historyCount > 0 && (
              <span className="text-xs text-[#ff5cf2]/80 font-mono">[{historyCount}]</span>
            )}
          </button>

          <div className="h-5 w-[1px] bg-[#17252d] mx-1 hidden sm:block" />

          {hasGeneratedPrompt && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onCopyMasterPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#00f6ff]/15 hover:bg-[#00f6ff]/25 border border-[#00f6ff] text-[#00f6ff] shadow-[0_0_8px_rgba(0,246,255,0.35)] rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase"
                title="Master-Prompt in Zwischenablage kopieren (Ctrl+Shift+C)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Prompt kopieren</span>
              </button>

              <div className="relative group">
                <button
                  className="p-1.5 text-[#78909c] hover:text-[#00f6ff] bg-[#080d12] border border-[#17252d] rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none"
                  title="Exportieren (.md / .json)"
                >
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-[#080d12] border border-[#00f6ff]/50 rounded-xs shadow-[0_0_15px_rgba(0,246,255,0.2)] py-1 hidden group-hover:block hover:block z-40">
                  <button
                    onClick={onExportMarkdown}
                    className="w-full text-left px-3 py-2 text-xs text-[#d7faff] hover:bg-[#0b1118] hover:text-[#00f6ff] flex items-center justify-between"
                  >
                    <span>Markdown (.md)</span>
                    <span className="text-[10px] text-[#00f6ff] font-mono">AGENT</span>
                  </button>
                  <button
                    onClick={onExportJson}
                    className="w-full text-left px-3 py-2 text-xs text-[#d7faff] hover:bg-[#0b1118] hover:text-[#00f6ff] flex items-center justify-between"
                  >
                    <span>Struktur (.json)</span>
                    <span className="text-[10px] text-[#ff00e5] font-mono">AST</span>
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
