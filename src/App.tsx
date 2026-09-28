import React, { useState, useEffect, useCallback } from 'react';
import {
  PromptMode,
  RequirementStructure,
  VendorModule,
  PromptVersion,
  QualityAuditResult
} from './types/prompt';
import { INITIAL_VENDOR_MODULES, BKG_FORGE_PROJECT_PROFILE } from './services/vendorCatalog';
import {
  decomposeRequirements,
  compileMasterPrompt,
  generateCompactSummary,
  PROMPT_MODES
} from './services/promptEngine';
import {
  auditPromptQuality,
  refineRequirementStructure
} from './services/qualityAuditor';
import {
  loadPromptHistory,
  savePromptVersion,
  deletePromptVersion,
  clearPromptHistory,
  exportPromptAsMarkdown,
  exportPromptAsJson
} from './services/historyStorage';

import { Header } from './components/Header';
import { PromptInputArea } from './components/PromptInputArea';
import { GeneratedPromptView } from './components/GeneratedPromptView';
import { RequirementAstView } from './components/RequirementAstView';
import { QualityAuditPanel } from './components/QualityAuditPanel';
import { CompactSummaryCard } from './components/CompactSummaryCard';
import { VendorResearchModal } from './components/VendorResearchModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TechnicalInventoryView } from './components/TechnicalInventoryView';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  FileText,
  Layers,
  ShieldCheck,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  Boxes
} from 'lucide-react';

export default function App() {
  // Input State
  const [inputPrompt, setInputPrompt] = useState<string>(
    'Mach bKGForge production ready und übernimm die guten Ideen aus den Vendor-Projekten.'
  );
  const [selectedMode, setSelectedMode] = useState<PromptMode>('production');
  const [projectRoot, setProjectRoot] = useState<string>(BKG_FORGE_PROJECT_PROFILE.rootPath);

  // Vendor Catalog
  const [vendorModules, setVendorModules] = useState<VendorModule[]>(INITIAL_VENDOR_MODULES);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([
    'vendor-ffm-ast-graph',
    'vendor-af-agent-loop',
    'vendor-af-verification-harness'
  ]);

  // Constraints & Quality Gates
  const [enforceZeroStubs, setEnforceZeroStubs] = useState<boolean>(true);
  const [enforceRustBackend, setEnforceRustBackend] = useState<boolean>(true);
  const [enforceRealVerification, setEnforceRealVerification] = useState<boolean>(true);

  // Output & AST State
  const [currentStructure, setCurrentStructure] = useState<RequirementStructure | null>(null);
  const [masterPrompt, setMasterPrompt] = useState<string>('');
  const [previousMasterPrompt, setPreviousMasterPrompt] = useState<string | undefined>(undefined);
  const [auditResult, setAuditResult] = useState<QualityAuditResult | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>(undefined);

  // View & UI State
  const [activeTab, setActiveTab] = useState<'prompt' | 'structure' | 'audit' | 'summary' | 'inventory'>('prompt');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isVendorHubOpen, setIsVendorHubOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = loadPromptHistory();
    setHistory(saved);
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compile Handler
  const handleCompile = useCallback(
    (customText?: string, customMode?: PromptMode, notes?: string) => {
      setIsCompiling(true);
      const text = customText !== undefined ? customText : inputPrompt;
      const mode = customMode !== undefined ? customMode : selectedMode;

      if (!text.trim()) {
        addToast('error', 'Leere Eingabe', 'Bitte gib eine Anforderung oder ein Ziel ein.');
        setIsCompiling(false);
        return;
      }

      // 1. Hole aktive Vendor Module
      const activeVendors = vendorModules.filter((v) => selectedVendorIds.includes(v.id));

      // 2. Zerlege in Anforderungsstruktur (AST)
      const structure = decomposeRequirements({
        mode,
        userPrompt: text,
        projectRoot,
        selectedVendorModules: activeVendors,
        enforceZeroStubs,
        enforceRustBackend,
        enforceRealVerification
      });

      // 3. Generiere Master-Prompt
      const compiled = compileMasterPrompt(structure, {
        mode,
        userPrompt: text,
        projectRoot,
        selectedVendorModules: activeVendors
      });

      // 4. Audit durchführen
      const audit = auditPromptQuality(compiled, structure);

      // 5. Versionierung
      if (masterPrompt) {
        setPreviousMasterPrompt(masterPrompt);
      }

      const versionNum = `v1.${history.length + 1}`;
      const savedVersion = savePromptVersion({
        version: versionNum,
        rawInput: text,
        mode,
        structured: structure,
        masterPrompt: compiled,
        changeSummary: notes || (masterPrompt ? 'Aktualisierung des Master-Prompts' : 'Ersterstellung des Master-Prompts'),
        qualityScore: audit.score
      });

      setCurrentStructure(structure);
      setMasterPrompt(compiled);
      setAuditResult(audit);
      setCurrentVersionId(savedVersion.id);
      setHistory(loadPromptHistory());
      setIsCompiling(false);

      addToast(
        'success',
        'Master-Prompt erfolgreich kompiliert',
        `${compiled.split('\n').length} Zeilen generiert. Qualität: ${audit.score}%.`
      );
    },
    [
      inputPrompt,
      selectedMode,
      projectRoot,
      vendorModules,
      selectedVendorIds,
      enforceZeroStubs,
      enforceRustBackend,
      enforceRealVerification,
      masterPrompt,
      history.length
    ]
  );

  // Initial compilation on first load if empty
  useEffect(() => {
    if (!masterPrompt) {
      handleCompile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard Shortcuts: Ctrl+Enter, Ctrl+Shift+C
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompile();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        if (masterPrompt) {
          navigator.clipboard.writeText(masterPrompt);
          addToast('success', 'In Zwischenablage kopiert', 'Master-Prompt ist bereit für Coding-Agenten.');
        }
      }
      if (e.key === 'Escape') {
        setIsVendorHubOpen(false);
        setIsHistoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleCompile, masterPrompt]);

  // Automated Refinement Action
  const handleApplyRefinement = () => {
    if (!currentStructure) return;
    setIsRefining(true);

    const refinedStructure = refineRequirementStructure(currentStructure);
    const activeVendors = vendorModules.filter((v) => selectedVendorIds.includes(v.id));

    const compiledRefined = compileMasterPrompt(refinedStructure, {
      mode: selectedMode,
      userPrompt: inputPrompt,
      projectRoot,
      selectedVendorModules: activeVendors
    });

    const newAudit = auditPromptQuality(compiledRefined, refinedStructure);

    setPreviousMasterPrompt(masterPrompt);
    setMasterPrompt(compiledRefined);
    setCurrentStructure(refinedStructure);
    setAuditResult(newAudit);

    const versionNum = `v1.${history.length + 1}-refined`;
    const saved = savePromptVersion({
      version: versionNum,
      rawInput: inputPrompt,
      mode: selectedMode,
      structured: refinedStructure,
      masterPrompt: compiledRefined,
      changeSummary: 'Automatisierte Schärfung & Behebung von Unklarheiten/Lücken',
      qualityScore: newAudit.score
    });

    setCurrentVersionId(saved.id);
    setHistory(loadPromptHistory());
    setIsRefining(false);

    addToast(
      'success',
      'Prompt geschärft',
      `Qualitäts-Score verbessert auf ${newAudit.score}%. Lücken wurden geschlossen.`
    );
  };

  const handleCopyMasterPrompt = () => {
    if (!masterPrompt) return;
    navigator.clipboard.writeText(masterPrompt);
    addToast('success', 'Master-Prompt kopiert', 'Direkt in die Konsole oder an den Agenten übergeben.');
  };

  const handleCopyJsonAst = () => {
    if (!currentStructure) return;
    navigator.clipboard.writeText(JSON.stringify(currentStructure, null, 2));
    addToast('success', 'AST-Struktur kopiert', 'JSON-Format in Zwischenablage.');
  };

  const handleCopySummary = () => {
    if (!currentStructure) return;
    const summary = generateCompactSummary(currentStructure);
    const text = `PROMPT-ZUSAMMENFASSUNG für bKGForge
Ziel: ${summary.target}
Scope: ${summary.scope}
Vendor-Referenzen: ${summary.vendorReferencesCount}
Definition of Done:
${summary.dodChecklist.join('\n')}`;
    navigator.clipboard.writeText(text);
    addToast('success', 'Zusammenfassung kopiert');
  };

  const handleExportMarkdown = (ver?: PromptVersion) => {
    const textToExport = ver ? ver.masterPrompt : masterPrompt;
    const modeName = ver ? ver.mode : selectedMode;
    const filename = `bkgforge-prompt-${modeName}-${Date.now()}.md`;
    exportPromptAsMarkdown(filename, textToExport);
    addToast('info', 'Exportiert', `Datei ${filename} heruntergeladen.`);
  };

  const handleExportJson = () => {
    if (!currentStructure) return;
    const filename = `bkgforge-requirements-ast-${Date.now()}.json`;
    exportPromptAsJson(filename, currentStructure);
    addToast('info', 'Exportiert', `Datei ${filename} heruntergeladen.`);
  };

  const handleRestoreVersion = (ver: PromptVersion) => {
    setInputPrompt(ver.rawInput);
    setSelectedMode(ver.mode);
    setCurrentStructure(ver.structured);
    setPreviousMasterPrompt(masterPrompt);
    setMasterPrompt(ver.masterPrompt);
    setAuditResult(auditPromptQuality(ver.masterPrompt, ver.structured));
    setCurrentVersionId(ver.id);
    addToast('info', 'Version wiederhergestellt', `${ver.version} geladen.`);
  };

  const handleDeleteVersion = (id: string) => {
    const updated = deletePromptVersion(id);
    setHistory(updated);
    addToast('info', 'Version entfernt');
  };

  const handleClearHistory = () => {
    clearPromptHistory();
    setHistory([]);
    addToast('info', 'Historie geleert');
  };

  const handleToggleVendor = (id: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomVendor = (module: VendorModule) => {
    setVendorModules((prev) => [module, ...prev]);
    setSelectedVendorIds((prev) => [...prev, module.id]);
    addToast('success', 'Vendor-Referenz hinzugefügt', `${module.name} inventarisiert.`);
  };

  const handleNewPrompt = () => {
    setInputPrompt('');
    setSelectedMode('production');
    addToast('info', 'Neuer Entwurf', 'Eingabefeld geleert.');
  };

  return (
    <div className="min-h-screen cyber-grid text-[#d7faff] flex flex-col font-sans selection:bg-[#00f6ff] selection:text-[#020407]">
      {/* Global Header */}
      <Header
        currentMode={selectedMode}
        projectRoot={projectRoot}
        vendorCount={selectedVendorIds.length}
        historyCount={history.length}
        onOpenVendorHub={() => setIsVendorHubOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewPrompt={handleNewPrompt}
        onCopyMasterPrompt={handleCopyMasterPrompt}
        onExportMarkdown={() => handleExportMarkdown()}
        onExportJson={handleExportJson}
        hasGeneratedPrompt={!!masterPrompt}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top: Input & Mode & Vendor Configuration */}
        <PromptInputArea
          inputPrompt={inputPrompt}
          onChangeInput={setInputPrompt}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          vendorModules={vendorModules}
          selectedVendorIds={selectedVendorIds}
          onToggleVendorModule={handleToggleVendor}
          projectRoot={projectRoot}
          onChangeProjectRoot={setProjectRoot}
          onCompile={() => handleCompile()}
          isCompiling={isCompiling}
          enforceZeroStubs={enforceZeroStubs}
          onChangeZeroStubs={setEnforceZeroStubs}
          enforceRustBackend={enforceRustBackend}
          onChangeRustBackend={setEnforceRustBackend}
          enforceRealVerification={enforceRealVerification}
          onChangeRealVerification={setEnforceRealVerification}
        />

        {/* View Navigation Tabs (Cyberpunk Command Center style) */}
        <div className="flex items-center justify-between border-b border-[#17252d] pb-2 font-mono">
          <div className="flex items-center gap-1.5 p-1 bg-[#080d12] rounded-xs border border-[#17252d]">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase ${
                activeTab === 'prompt'
                  ? 'bg-[#00f6ff]/15 text-[#00f6ff] border border-[#00f6ff]/40 shadow-[0_0_8px_rgba(0,246,255,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0b1118]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#00f6ff]" />
              <span>Master-Prompt</span>
            </button>

            <button
              onClick={() => setActiveTab('structure')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase ${
                activeTab === 'structure'
                  ? 'bg-[#00f6ff]/15 text-[#00f6ff] border border-[#00f6ff]/40 shadow-[0_0_8px_rgba(0,246,255,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0b1118]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00f6ff]" />
              <span>Anforderungs-AST</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#ff00e5] focus-visible:outline-none uppercase ${
                activeTab === 'audit'
                  ? 'bg-[#ff00e5]/15 text-[#ff5cf2] border border-[#ff00e5]/40 shadow-[0_0_8px_rgba(255,0,229,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0b1118]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff00e5]" />
              <span>Audit & Refinement</span>
              {auditResult && (
                <span className="text-[11px] font-mono text-[#ff5cf2]/90">
                  [{auditResult.score}%]
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#ffb000] focus-visible:outline-none uppercase ${
                activeTab === 'summary'
                  ? 'bg-[#ffb000]/15 text-[#ffd166] border border-[#ffb000]/40 shadow-[0_0_8px_rgba(255,176,0,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0b1118]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 text-[#ffb000]" />
              <span>Zusammenfassung</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors focus-visible:ring-1 focus-visible:ring-[#00f6ff] focus-visible:outline-none uppercase ${
                activeTab === 'inventory'
                  ? 'bg-[#00f6ff]/15 text-[#00f6ff] border border-[#00f6ff]/40 shadow-[0_0_8px_rgba(0,246,255,0.25)]'
                  : 'text-[#78909c] hover:text-[#d7faff] hover:bg-[#0b1118]'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-[#00f6ff]" />
              <span>Technische Inventur</span>
            </button>
          </div>

          {/* Quick status text */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#78909c] font-mono">
            <span>TARGET://bKGForge</span>
            <span aria-hidden="true" className="text-[#17252d]">·</span>
            <span className="text-[#39ff14] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] led-pulse inline-block" />
              8-PHASEN PIPELINE
            </span>
          </div>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === 'prompt' && (
            <GeneratedPromptView
              masterPrompt={masterPrompt}
              previousMasterPrompt={previousMasterPrompt}
              promptText={masterPrompt}
              previousPromptText={previousMasterPrompt}
              onCopy={handleCopyMasterPrompt}
              onDownload={() => handleExportMarkdown()}
              qualityScore={auditResult?.score}
            />
          )}

          {activeTab === 'structure' && currentStructure && (
            <RequirementAstView
              structure={currentStructure}
              onCopyJson={handleCopyJsonAst}
            />
          )}

          {activeTab === 'audit' && auditResult && (
            <QualityAuditPanel
              auditResult={auditResult}
              onApplyRefinement={handleApplyRefinement}
              isRefining={isRefining}
            />
          )}

          {activeTab === 'summary' && currentStructure && (
            <CompactSummaryCard
              structure={currentStructure}
              onCopySummary={handleCopySummary}
            />
          )}

          {activeTab === 'inventory' && (
            <TechnicalInventoryView
              onSelectVendorForPrompt={(id) => {
                if (!selectedVendorIds.includes(id)) {
                  setSelectedVendorIds((prev) => [...prev, id]);
                }
                setActiveTab('prompt');
                addToast('success', 'Vendor hinzugefügt', 'Modul in den Master-Prompt übernommen.');
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 py-4 mt-auto text-zinc-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold">bKGForge Engineering Suite</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Verstehen → Abstrahieren → Neu entwerfen → In Rust implementieren → Testen</span>
          </div>
          <div>
            <span>Version v1.0.0 · Zero-Hallucination & Zero-Mockups Policy</span>
          </div>
        </div>
      </footer>

      {/* Vendor Research Hub Modal */}
      <VendorResearchModal
        isOpen={isVendorHubOpen}
        onClose={() => setIsVendorHubOpen(false)}
        vendorModules={vendorModules}
        selectedVendorIds={selectedVendorIds}
        onToggleVendorModule={handleToggleVendor}
        onAddCustomVendor={handleAddCustomVendor}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={history}
        currentVersionId={currentVersionId}
        onRestoreVersion={handleRestoreVersion}
        onDeleteVersion={handleDeleteVersion}
        onClearHistory={handleClearHistory}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
