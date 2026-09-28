import React from 'react';
import {
  Target,
  Shield,
  ListChecks,
  CheckCircle2,
  BookOpen,
  FileCode2,
  Copy
} from 'lucide-react';
import { RequirementStructure } from '../types/prompt';

interface CompactSummaryCardProps {
  structure: RequirementStructure;
  onCopySummary: () => void;
}

export const CompactSummaryCard: React.FC<CompactSummaryCardProps> = ({
  structure,
  onCopySummary
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm text-zinc-100 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Kompakte Aufgaben-Zusammenfassung (Executive Summary)
          </h3>
        </div>

        <button
          onClick={onCopySummary}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
        >
          <Copy className="w-3 h-3" />
          <span>Zusammenfassung kopieren</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Left Column: Target & Scope */}
        <div className="space-y-3">
          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Target className="w-3.5 h-3.5" />
              <span>Ziel (Objective)</span>
            </div>
            <p className="text-zinc-200 leading-relaxed pt-1">
              {structure.objective}
            </p>
            <div className="text-[11px] text-zinc-500 pt-1">
              Wurzel: <span className="text-zinc-400">{structure.project.root}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Scope & Non-Goals</span>
            </div>
            <div className="text-zinc-300 text-[11px]">
              <span className="text-emerald-400 font-semibold">In Scope: </span>
              {structure.scope.inScope.length} Kern-Ziele
            </div>
            <div className="text-zinc-400 text-[11px]">
              <span className="text-rose-400 font-semibold">Non-Goals: </span>
              {structure.scope.nonGoals.slice(0, 2).join(' · ')}
            </div>
          </div>
        </div>

        {/* Right Column: References & DoD */}
        <div className="space-y-3">
          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Vendor-Referenzen & Rust-Ziele</span>
            </div>
            {structure.vendorReferences.length === 0 ? (
              <p className="text-zinc-500 text-[11px]">Keine Vendor-Module zugewiesen.</p>
            ) : (
              <div className="space-y-1.5 pt-1 text-[11px]">
                {structure.vendorReferences.map((v, i) => (
                  <div key={i} className="text-zinc-300">
                    <span className="text-emerald-400">→ {v.vendorName}: </span>
                    <span className="text-zinc-400">Konzept extrahieren, in </span>
                    <span className="text-sky-300">{v.bkgForgeRustTarget}</span>
                    <span className="text-zinc-400"> neu implementieren.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Definition of Done (Auszug)</span>
            </div>
            <ul className="text-zinc-300 text-[11px] space-y-1 pt-1">
              {structure.definitionOfDone.slice(0, 3).map((d, i) => (
                <li key={i} className="truncate">
                  {d}
                </li>
              ))}
              <li className="text-zinc-500 italic">+ weitere 5 strenge Qualitätskriterien</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
