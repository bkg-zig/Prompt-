import React, { useState } from 'react';
import {
  FileText,
  Target,
  Shield,
  Layers,
  Code2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookOpen
} from 'lucide-react';
import { RequirementStructure } from '../types/prompt';

interface RequirementAstViewProps {
  structure: RequirementStructure;
  onCopyJson: () => void;
}

export const RequirementAstView: React.FC<RequirementAstViewProps> = ({
  structure,
  onCopyJson
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    objective: true,
    scope: true,
    requirements: true,
    assumptions: true,
    vendors: true,
    dod: true
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm text-zinc-100">
      {/* Top Header */}
      <div className="bg-zinc-950/80 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Interne Anforderungsstruktur (AST & Wissensgraph)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented button following zero-pill rule */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                activeTab === 'visual'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kategorien-Baum
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                activeTab === 'json'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Raw JSON
            </button>
          </div>

          <button
            onClick={onCopyJson}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title="JSON-Struktur kopieren"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'json' ? (
        <div className="p-4 bg-zinc-950 text-xs font-mono text-zinc-300 overflow-auto max-h-[600px]">
          <pre>{JSON.stringify(structure, null, 2)}</pre>
        </div>
      ) : (
        <div className="p-4 space-y-4 max-h-[650px] overflow-auto">
          {/* 1. Intent & Objective */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
            <button
              onClick={() => toggleSection('objective')}
              className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">
                  1. Intent & Objective (Zieldefinition)
                </span>
              </div>
              {openSections.objective ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {openSections.objective && (
              <div className="mt-3 space-y-2 text-xs border-t border-zinc-800/60 pt-2 font-mono">
                <div>
                  <span className="text-zinc-500">Ursprünglicher Intent: </span>
                  <span className="text-zinc-300">„{structure.intent}“</span>
                </div>
                <div>
                  <span className="text-zinc-500">Präzisiertes Objective: </span>
                  <span className="text-emerald-300 font-semibold">{structure.objective}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                  <span>Wurzel: {structure.project.root}</span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span>Stack: {structure.project.stack.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Scope & Non-Goals */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
            <button
              onClick={() => toggleSection('scope')}
              className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">
                  2. Scope & Anti-Scope-Creep (In-Scope vs. Non-Goals)
                </span>
              </div>
              {openSections.scope ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {openSections.scope && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-zinc-800/60 pt-2 text-xs">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase font-mono mb-1">
                    In Scope
                  </div>
                  <ul className="space-y-1 text-zinc-300 font-mono">
                    {structure.scope.inScope.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-rose-400 uppercase font-mono mb-1">
                    Explizite Non-Goals (Scope-Schutz)
                  </div>
                  <ul className="space-y-1 text-zinc-400 font-mono">
                    {structure.scope.nonGoals.map((ng, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 shrink-0">✕</span>
                        <span>{ng}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 3. Deep Requirements */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
            <button
              onClick={() => toggleSection('requirements')}
              className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">
                  3. Zerlegte Anforderungen (Funktional, Rust-Architektur, Sicherheit)
                </span>
              </div>
              {openSections.requirements ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {openSections.requirements && (
              <div className="mt-3 space-y-3 border-t border-zinc-800/60 pt-2 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 font-bold block mb-1">Funktional:</span>
                  <ul className="space-y-1 text-zinc-300">
                    {structure.requirements.functional.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-1">Rust & System-Architektur:</span>
                  <ul className="space-y-1 text-zinc-300">
                    {structure.requirements.architecture.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-1">Implementierungsregeln (No Stubs):</span>
                  <ul className="space-y-1 text-zinc-300">
                    {structure.requirements.implementation.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-1">Sicherheit (Path Traversal, Zero Secrets):</span>
                  <ul className="space-y-1 text-zinc-300">
                    {structure.requirements.security.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 4. Safe Assumptions vs Unresolved Questions (CRITICAL ANTI-HALLUCINATION) */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
            <button
              onClick={() => toggleSection('assumptions')}
              className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">
                  4. Sichere Annahmen vs. Offene Punkte (Anti-Halluzination)
                </span>
              </div>
              {openSections.assumptions ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {openSections.assumptions && (
              <div className="mt-3 space-y-3 border-t border-zinc-800/60 pt-2 text-xs font-mono">
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase mb-1">
                    Sichere Annahmen (Aus Projektbestand abgeleitet)
                  </div>
                  <ul className="space-y-1 text-zinc-300">
                    {structure.safeAssumptions.map((a, i) => (
                      <li key={i}>✓ {a}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-amber-950/20 border border-amber-800/40 rounded">
                  <div className="text-[11px] font-bold text-amber-400 uppercase mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unaufgelöste Fragen (Offene Punkte – NICHT erfinden!)</span>
                  </div>
                  <ul className="space-y-1 text-amber-200/90">
                    {structure.unresolvedQuestions.map((q, i) => (
                      <li key={i}>? {q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 5. Vendor References Attached */}
          {structure.vendorReferences.length > 0 && (
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
              <button
                onClick={() => toggleSection('vendors')}
                className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">
                    5. Verknüpfte Vendor-Referenzen ({structure.vendorReferences.length})
                  </span>
                </div>
                {openSections.vendors ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>

              {openSections.vendors && (
                <div className="mt-3 space-y-2 border-t border-zinc-800/60 pt-2 text-xs font-mono">
                  {structure.vendorReferences.map((v, i) => (
                    <div key={i} className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                      <div className="font-bold text-zinc-200">{v.vendorName}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Pfad: <span className="text-zinc-300">{v.sourceRepo}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">
                        Konzept: {v.conceptToExtract}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Zielmodul: <span className="text-sky-300">{v.bkgForgeRustTarget}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Definition of Done Checklist */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
            <button
              onClick={() => toggleSection('dod')}
              className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">
                  6. Definition of Done (Strikte 8 Abschlusskriterien)
                </span>
              </div>
              {openSections.dod ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {openSections.dod && (
              <div className="mt-3 space-y-1.5 border-t border-zinc-800/60 pt-2 text-xs font-mono text-zinc-300">
                {structure.definitionOfDone.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 font-bold">[{i + 1}]</span>
                    <span>{d.replace(/^[0-9]\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
