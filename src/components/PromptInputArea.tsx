import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Code,
  Bug,
  Boxes,
  CheckSquare,
  Search,
  RefreshCw,
  BookOpen,
  ArrowRightLeft,
  Lock,
  CheckCircle2,
  FileText,
  Sliders,
  Play,
  Layers,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PromptMode, VendorModule } from '../types/prompt';
import { PROMPT_MODES } from '../services/promptEngine';

interface PromptInputAreaProps {
  inputPrompt: string;
  onChangeInput: (val: string) => void;
  selectedMode: PromptMode;
  onSelectMode: (mode: PromptMode) => void;
  vendorModules: VendorModule[];
  selectedVendorIds: string[];
  onToggleVendorModule: (id: string) => void;
  projectRoot: string;
  onChangeProjectRoot: (val: string) => void;
  onCompile: () => void;
  isCompiling: boolean;
  enforceZeroStubs: boolean;
  onChangeZeroStubs: (val: boolean) => void;
  enforceRustBackend: boolean;
  onChangeRustBackend: (val: boolean) => void;
  enforceRealVerification: boolean;
  onChangeRealVerification: (val: boolean) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'Vendor-Ideen & Production Ready (Referenzfall)',
    prompt: 'Mach bKGForge production ready und übernimm die guten Ideen aus den Vendor-Projekten.',
    mode: 'production' as PromptMode
  },
  {
    title: 'AST-Graph aus bkg-ffm (Eigenständiges Rust Petgraph)',
    prompt: 'Untersuche bkg-ffm auf dessen Repository-Graph-Analyse. Übernimm nicht dessen Implementierung. Extrahiere das zugrunde liegende Konzept und implementiere eine eigenständige Rust-Version mit petgraph innerhalb der bKGForge-Architektur.',
    mode: 'research' as PromptMode
  },
  {
    title: 'Agenten-Zustandsmaschine aus bkg-af (Tokio FSM)',
    prompt: 'Analysiere den Multi-Turn Agent Loop aus bkg-af. Abstrakte die 8-Phasen-Steuerung in eine typgestützte Rust-FSM mit Tokio-Channels, ohne Stubs und mit echten E2E-Tests.',
    mode: 'coding' as PromptMode
  },
  {
    title: 'Security-Audit & Sandbox-Härtung',
    prompt: 'Führe ein vollständiges Sicherheits-Audit für bKGForge durch. Schließe Path-Traversal-Risiken bei Vendor-Pfaden aus und stelle sicher, dass keine Secrets geloggt werden.',
    mode: 'security' as PromptMode
  }
];

export const PromptInputArea: React.FC<PromptInputAreaProps> = ({
  inputPrompt,
  onChangeInput,
  selectedMode,
  onSelectMode,
  vendorModules,
  selectedVendorIds,
  onToggleVendorModule,
  projectRoot,
  onChangeProjectRoot,
  onCompile,
  isCompiling,
  enforceZeroStubs,
  onChangeZeroStubs,
  enforceRustBackend,
  onChangeRustBackend,
  enforceRealVerification,
  onChangeRealVerification
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getModeIcon = (id: PromptMode) => {
    switch (id) {
      case 'quick': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'production': return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'coding': return <Code className="w-3.5 h-3.5 text-sky-400" />;
      case 'feature': return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'bugfix': return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'architecture': return <Boxes className="w-3.5 h-3.5 text-indigo-400" />;
      case 'review': return <CheckSquare className="w-3.5 h-3.5 text-teal-400" />;
      case 'audit': return <Search className="w-3.5 h-3.5 text-blue-400" />;
      case 'refactor': return <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />;
      case 'research': return <BookOpen className="w-3.5 h-3.5 text-emerald-300" />;
      case 'migration': return <ArrowRightLeft className="w-3.5 h-3.5 text-yellow-400" />;
      case 'security': return <Lock className="w-3.5 h-3.5 text-red-400" />;
      case 'testing': return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case 'documentation': return <FileText className="w-3.5 h-3.5 text-zinc-300" />;
      case 'custom': return <Sliders className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const currentModeInfo = PROMPT_MODES.find((m) => m.id === selectedMode) || PROMPT_MODES[0];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompile();
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm text-zinc-100 space-y-4">
      {/* Top row: Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Schnell-Vorlagen / Typische Aufgaben
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            Ctrl + Enter zum Kompilieren
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChangeInput(preset.prompt);
                onSelectMode(preset.mode);
              }}
              className="px-2.5 py-1 text-xs text-left bg-zinc-800/80 hover:bg-zinc-800 hover:text-white border border-zinc-700/60 rounded text-zinc-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt Input Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="user-prompt" className="text-xs font-semibold text-zinc-300 font-mono">
            Aufgabenstellung / Natürliche Anweisung (Benutzereingabe)
          </label>
          <span className="text-xs text-zinc-500 font-mono">
            {inputPrompt.length} Zeichen
          </span>
        </div>

        <textarea
          id="user-prompt"
          value={inputPrompt}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          placeholder="z.B. Mach bKGForge production ready und übernimm die guten Ideen aus den Vendor-Projekten."
          className="w-full bg-zinc-950 border border-zinc-700/90 rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors resize-y min-h-[96px]"
        />
      </div>

      {/* Mode Selector - Segmented Control following zero-pill rule */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Prompt-Modus & Zielausrichtung
          </span>
          <span className="text-xs text-emerald-400/90 font-mono">
            {currentModeInfo.suggestedFocus}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-1 bg-zinc-950 border border-zinc-800/80 rounded-lg">
          {PROMPT_MODES.map((m) => {
            const isActive = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
                title={m.description}
              >
                {getModeIcon(m.id)}
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendor Reference Selector Bar */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-zinc-300 font-mono">
              Aktive Vendor-Referenzen (Forschungs- & Inspirationsquellen)
            </span>
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">
            {selectedVendorIds.length} von {vendorModules.length} aktiv (Verstehen → Abstrahieren → Neu entwerfen)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {vendorModules.map((vm) => {
            const isSelected = selectedVendorIds.includes(vm.id);
            return (
              <button
                key={vm.id}
                onClick={() => onToggleVendorModule(vm.id)}
                className={`flex items-center gap-2 px-2.5 py-1 text-xs rounded border transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-300 font-medium'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700'
                }`}
                title={`${vm.description}\n\nKonzept: ${vm.rustReimplementationPlan.conceptToExtract}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-emerald-400' : 'bg-zinc-600'
                  }`}
                />
                <span className="font-mono">{vm.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced options accordion */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono py-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
        >
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span>Erweiterte Architektur- & Qualitäts-Gates</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="block text-zinc-400 mb-1 font-mono">
                Projekt-Wurzelverzeichnis
              </label>
              <input
                type="text"
                value={projectRoot}
                onChange={(e) => onChangeProjectRoot(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded p-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enforceZeroStubs}
                  onChange={(e) => onChangeZeroStubs(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                />
                <span className="text-zinc-300">Zero-Stubs erzwingen</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enforceRustBackend}
                  onChange={(e) => onChangeRustBackend(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                />
                <span className="text-zinc-300">Reines Rust-Backend</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enforceRealVerification}
                  onChange={(e) => onChangeRealVerification(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                />
                <span className="text-zinc-300">Echte E2E-Verifikation</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex items-center justify-between">
        <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          <span>Analysiert, zerlegt in AST & erzeugt vollwertigen 8-Phasen-Prompt</span>
        </div>

        <button
          onClick={onCompile}
          disabled={isCompiling || !inputPrompt.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-lg text-sm transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isCompiling ? 'Kompiliere Prompt...' : 'Master-Prompt kompilieren'}</span>
        </button>
      </div>
    </div>
  );
};
