import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FolderGit2,
  Cpu,
  Layers,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
  Code2,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { VendorModule } from '../types/prompt';

interface VendorResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorModules: VendorModule[];
  selectedVendorIds: string[];
  onToggleVendorModule: (id: string) => void;
  onAddCustomVendor: (module: VendorModule) => void;
}

export const VendorResearchModal: React.FC<VendorResearchModalProps> = ({
  isOpen,
  onClose,
  vendorModules,
  selectedVendorIds,
  onToggleVendorModule,
  onAddCustomVendor
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(vendorModules[0]?.id || '');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Vendor Form State
  const [newName, setNewName] = useState('');
  const [newOrigin, setNewOrigin] = useState('/workspace/projects/bkg-ffm/vendor/new-tool');
  const [newCategory, setNewCategory] = useState<VendorModule['category']>('repo-analysis');
  const [newDesc, setNewDesc] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newRejections, setNewRejections] = useState('');
  const [newRustDesign, setNewRustDesign] = useState('');

  if (!isOpen) return null;

  const currentModule = vendorModules.find((m) => m.id === selectedModuleId) || vendorModules[0];

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newConcept.trim()) return;

    const newModule: VendorModule = {
      id: `vendor-custom-${Date.now()}`,
      name: newName.trim(),
      sourceLocation: newOrigin.trim(),
      targetVendorPath: `/srv/bkg/workspace/current/bKGForge/vendor/${newName.toLowerCase().replace(/\s+/g, '-')}`,
      category: newCategory,
      description: newDesc.trim() || 'Benutzerdefiniertes Vendor-Referenzmodul',
      inventoryStructure: ['src/', 'Cargo.toml / package.json', 'README.md'],
      architectureAnalysis: 'Forschungsreferenz zur Konzeptübertragung.',
      features: ['Kernlogik analysieren', 'Architekturkonzept extrahieren'],
      uiUxConcepts: 'Kontextuelle Darstellung',
      dataModelsAndInterfaces: 'Interfaces und Schemata',
      algorithmsAndConcepts: 'Spezifische Algorithmen',
      dependencies: ['Fremdbibliotheken dokumentiert'],
      licenseAndOrigin: 'Zu prüfen',
      relevantIdeaForBkgForge: newConcept.trim(),
      rustReimplementationPlan: {
        conceptToExtract: newConcept.trim(),
        rejectionList: newRejections
          ? newRejections.split('\n').filter(Boolean)
          : ['Keine direkte Codeübernahme', 'Keine fremden Laufzeiten'],
        rustModuleDesign: newRustDesign.trim() || 'bkgforge_core::custom_feature',
        traitsAndTypes: 'pub trait CustomFeature {\n    // Reimplementierung in Rust\n}',
        verificationStrategy: 'Unit- und Integrationstests'
      }
    };

    onAddCustomVendor(newModule);
    setSelectedModuleId(newModule.id);
    setIsAddingNew(false);
    // Reset
    setNewName('');
    setNewConcept('');
    setNewDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                Vendor-Forschungs- & Inspirations-Hub
              </h2>
              {/* Zero-Pill Unboxed Text Metadata */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                <span>/workspace/projects/bkg-ffm/vendor</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>/workspace/projects/bkg-af/vendor</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="text-emerald-400">10-Schritte-Untersuchung</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'Zurück zur Übersicht' : 'Neue Vendor-Referenz erfassen'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: List of vendor modules */}
          <div className="w-72 sm:w-80 border-r border-zinc-800 bg-zinc-950/90 overflow-y-auto p-3 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1 font-mono">
              Inventarisierte Vendor-Module
            </div>

            {vendorModules.map((vm) => {
              const isActive = vm.id === currentModule?.id && !isAddingNew;
              const isSelectedForPrompt = selectedVendorIds.includes(vm.id);

              return (
                <div
                  key={vm.id}
                  onClick={() => {
                    setSelectedModuleId(vm.id);
                    setIsAddingNew(false);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-700 text-white'
                      : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/50 text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs font-mono line-clamp-1">
                      {vm.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVendorModule(vm.id);
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        isSelectedForPrompt
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title={isSelectedForPrompt ? 'Im Prompt aktiv' : 'Zum Prompt hinzufügen'}
                    >
                      {isSelectedForPrompt ? 'Aktiv' : '+ Prompt'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                    {vm.description}
                  </p>

                  <div className="mt-2 text-[10px] text-zinc-500 font-mono truncate">
                    {vm.sourceLocation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Main Panel: 10-Step Protocol Details or Add New Form */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/40">
            {isAddingNew ? (
              <form onSubmit={handleAddNew} className="max-w-2xl space-y-4 font-mono text-xs">
                <div className="border-b border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Neue Vendor-Referenz inventarisieren</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Erfasse ein weiteres Repository aus <code>/workspace/projects/...</code> nach dem 10-Schritte-Schema.
                  </p>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">Name des Moduls</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="z.B. FFM Context Ranker"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 mb-1">Quell-Pfad (Vendor)</label>
                    <input
                      type="text"
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1">Kategorie</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                    >
                      <option value="repo-analysis">repo-analysis</option>
                      <option value="agent-orchestration">agent-orchestration</option>
                      <option value="context-synthesis">context-synthesis</option>
                      <option value="verification">verification</option>
                      <option value="tooling">tooling</option>
                      <option value="storage">storage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">Beschreibung</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    placeholder="Worum geht es in diesem Vendor-Code?"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                  />
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded space-y-3">
                  <div className="text-emerald-400 font-bold">
                    Schritt 9 & 10: Relevante Idee & Rust-Neuimplementierung
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Zu extrahierendes Konzept</label>
                    <textarea
                      value={newConcept}
                      onChange={(e) => setNewConcept(e.target.value)}
                      rows={2}
                      placeholder="Welches technische Problem wird gelöst und wie soll das abstrakte Konzept lauten?"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-rose-400 mb-1">
                      Was darf ausdrücklich NICHT übernommen werden (Anti-Copy-Paste Liste, pro Zeile ein Punkt)
                    </label>
                    <textarea
                      value={newRejections}
                      onChange={(e) => setNewRejections(e.target.value)}
                      rows={2}
                      placeholder="z.B. Keine Node.js Laufzeit&#10;Keine dynamischen Typen"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sky-400 mb-1">Geplantes Rust-Zielmodul</label>
                    <input
                      type="text"
                      value={newRustDesign}
                      onChange={(e) => setNewRustDesign(e.target.value)}
                      placeholder="z.B. bkgforge_core::analysis::custom_ranker"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded transition-colors"
                >
                  Referenz speichern & inventarisieren
                </button>
              </form>
            ) : currentModule ? (
              <div className="space-y-6 max-w-3xl">
                {/* Module title card */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-mono">
                      {currentModule.name}
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">
                      [{currentModule.category}]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    {currentModule.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono pt-1">
                    <div>Quelle: <span className="text-zinc-200">{currentModule.sourceLocation}</span></div>
                    <div>Ziel-Referenz: <span className="text-zinc-200">{currentModule.targetVendorPath}</span></div>
                  </div>
                </div>

                {/* The 10-Step Investigation Protocol Sheet */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    10-Schritte-Untersuchungsbericht für bKGForge
                  </h4>

                  {/* 1. Inventory & Structure */}
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                    <span className="font-bold text-zinc-300">1. Repository- & Dateistruktur:</span>
                    <ul className="list-disc list-inside text-zinc-400 text-[11px] space-y-0.5 pt-1">
                      {currentModule.inventoryStructure.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Architecture */}
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                    <span className="font-bold text-zinc-300">2. Architektur-Analyse:</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      {currentModule.architectureAnalysis}
                    </p>
                  </div>

                  {/* 3. Features */}
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                    <span className="font-bold text-zinc-300">3. Erfasste Features:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentModule.features.map((feat, i) => (
                        <span key={i} className="text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4 & 5. UI/UX & Data Models */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                      <span className="font-bold text-zinc-300">4. UI/UX-Konzepte:</span>
                      <p className="text-zinc-400 text-[11px]">{currentModule.uiUxConcepts}</p>
                    </div>

                    <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                      <span className="font-bold text-zinc-300">5. Datenmodelle & Interfaces:</span>
                      <p className="text-zinc-400 text-[11px]">{currentModule.dataModelsAndInterfaces}</p>
                    </div>
                  </div>

                  {/* 6 & 7. Algorithms & Dependencies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                      <span className="font-bold text-zinc-300">6. Relevante Algorithmen:</span>
                      <p className="text-zinc-400 text-[11px]">{currentModule.algorithmsAndConcepts}</p>
                    </div>

                    <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                      <span className="font-bold text-zinc-300">7. Abhängigkeiten & 8. Lizenz:</span>
                      <p className="text-zinc-400 text-[11px]">
                        Abhängigkeiten: {currentModule.dependencies.join(', ')}
                      </p>
                      <p className="text-zinc-500 text-[10px] mt-1">{currentModule.licenseAndOrigin}</p>
                    </div>
                  </div>

                  {/* 9 & 10. The Golden Steps: bKGForge Reimplementation Plan */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>9. Relevante Kernidee für bKGForge</span>
                    </div>
                    <p className="text-zinc-200 text-xs leading-relaxed">
                      {currentModule.relevantIdeaForBkgForge}
                    </p>

                    <div className="border-t border-emerald-800/40 pt-3 space-y-2">
                      <div className="text-sky-300 font-bold flex items-center gap-1.5">
                        <Code2 className="w-4 h-4" />
                        <span>10. Eigenständige Rust-Neuimplementierung (Kein Copy/Paste!)</span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <span className="text-zinc-400">Extrahiertes Konzept:</span>
                        <div className="text-white bg-zinc-950 p-2 rounded border border-zinc-800">
                          {currentModule.rustReimplementationPlan.conceptToExtract}
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <span className="text-rose-400 font-semibold">
                          Ausdrücklich NICHT übernehmen (Verbotener Vendor-Ballast):
                        </span>
                        <ul className="list-disc list-inside text-rose-300 space-y-0.5">
                          {currentModule.rustReimplementationPlan.rejectionList.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <span className="text-zinc-400">Rust Moduldesign & Traits:</span>
                        <pre className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-emerald-300 font-mono text-[11px] overflow-x-auto">
                          {currentModule.rustReimplementationPlan.traitsAndTypes}
                        </pre>
                      </div>

                      <div className="text-[11px] text-zinc-400">
                        <span className="text-zinc-300 font-semibold">Verifikationsstrategie: </span>
                        {currentModule.rustReimplementationPlan.verificationStrategy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
