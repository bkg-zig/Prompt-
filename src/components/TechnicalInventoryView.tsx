import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  FolderGit2,
  Code2,
  Cpu,
  Layers,
  Shield,
  FileCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TECHNICAL_INVENTORY, InventoryItem } from '../services/technicalInventory';

interface TechnicalInventoryViewProps {
  onSelectVendorForPrompt?: (vendorId: string) => void;
}

export const TechnicalInventoryView: React.FC<TechnicalInventoryViewProps> = ({
  onSelectVendorForPrompt
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string>(TECHNICAL_INVENTORY[0].id);

  const filteredItems = TECHNICAL_INVENTORY.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'core' && item.category === 'core') ||
      (selectedCategory === 'vendor' && (item.category === 'vendor-ffm' || item.category === 'vendor-af'));

    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.architecture.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.algorithms.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm text-zinc-100 space-y-4 p-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-mono">
              Vollständige Technische Inventur & Vendor-Referenz-Matrix
            </h2>
          </div>
          {/* Zero-Pill unboxed metadata */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-1">
            <span className="text-emerald-400">/srv/bkg/workspace/current/bKGForge</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>/workspace/projects/bkg-ffm/vendor</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>/workspace/projects/bkg-af/vendor</span>
          </div>
        </div>

        {/* Filter Controls (Following Zero-Pill Rule) */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Inventur durchsuchen..."
              className="w-48 bg-zinc-950 border border-zinc-700/80 rounded pl-7 pr-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Alle ({TECHNICAL_INVENTORY.length})
            </button>
            <button
              onClick={() => setSelectedCategory('core')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                selectedCategory === 'core'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              bKGForge Core
            </button>
            <button
              onClick={() => setSelectedCategory('vendor')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                selectedCategory === 'vendor'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Vendor-Forschung
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          const isCore = item.category === 'core';

          return (
            <div
              key={item.id}
              className={`rounded-lg border transition-all ${
                isCore
                  ? 'bg-zinc-950 border-emerald-500/50 shadow-xs'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Header Card */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : item.id)}
                className="p-4 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{item.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isCore ? 'text-emerald-400' : 'text-sky-400'
                      }`}
                    >
                      [{item.status}]
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 font-mono truncate max-w-xl">
                    Pfad: <span className="text-zinc-300">{item.path}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-zinc-500 font-mono hidden md:inline">
                    {item.licenseAndOrigin}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Expanded Deep Inspection Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-zinc-850 space-y-4 text-xs font-mono">
                  {/* Architecture & Stack */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        Architektur & Schichtung:
                      </span>
                      <p className="text-zinc-300 leading-relaxed text-[11px] font-sans">
                        {item.architecture}
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        Verwendete Technologien & Abhängigkeiten:
                      </span>
                      <ul className="text-zinc-300 space-y-0.5 text-[11px]">
                        {item.dependencies.map((dep, dIdx) => (
                          <li key={dIdx}>• {dep}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Features & UI/UX */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        Bestehende Features:
                      </span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.features.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[11px]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        UI/UX-Konzepte:
                      </span>
                      <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">
                        {item.uiUxConcepts}
                      </p>
                    </div>
                  </div>

                  {/* Data Models, Interfaces & Algorithms */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        Datenmodelle:
                      </span>
                      <p className="text-zinc-300 text-[11px] font-sans">{item.dataModels}</p>
                    </div>

                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        Schnittstellen:
                      </span>
                      <p className="text-zinc-300 text-[11px] font-sans">{item.interfaces}</p>
                    </div>

                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <span className="text-zinc-400 font-bold block mb-1">
                        Relevante Algorithmen:
                      </span>
                      <p className="text-zinc-300 text-[11px] font-sans">{item.algorithms}</p>
                    </div>
                  </div>

                  {/* The Golden Core: Relevanz & Idiomatischer Rust-Neuimplementierungsplan */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Relevanz für bKGForge & Abstraktionsziel</span>
                      </div>
                      <span className="text-sky-300 font-mono text-[11px]">
                        Ziel: {item.rustReimplementationPlan.targetCrateOrModule}
                      </span>
                    </div>

                    <p className="text-zinc-200 text-xs font-sans leading-relaxed">
                      {item.relevanceForBkgForge}
                    </p>

                    {/* Anti-Copy-Paste Rejection List */}
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded">
                      <div className="text-rose-400 font-bold text-[11px] mb-1">
                        Ausdrücklich NICHT übernehmen (Verbotener Vendor-Ballast):
                      </div>
                      <ul className="text-rose-300 text-[11px] space-y-0.5">
                        {item.rustReimplementationPlan.rejectionList.map((rej, rIdx) => (
                          <li key={rIdx}>✕ {rej}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Rust Trait Definition */}
                    <div>
                      <div className="text-zinc-400 font-semibold mb-1 text-[11px]">
                        Idiomatisches Rust Trait & Schnittstellendesign:
                      </div>
                      <pre className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-emerald-300 font-mono text-[11px] overflow-x-auto">
                        {item.rustReimplementationPlan.idiomaticRustTraits}
                      </pre>
                    </div>

                    <div className="text-[11px] text-zinc-400">
                      <span className="text-zinc-300 font-semibold">Verifikationsstrategie: </span>
                      {item.rustReimplementationPlan.verificationStrategy}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
