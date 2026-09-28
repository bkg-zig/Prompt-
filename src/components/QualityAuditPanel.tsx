import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wand2,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { QualityAuditResult } from '../types/prompt';

interface QualityAuditPanelProps {
  auditResult: QualityAuditResult;
  onApplyRefinement: () => void;
  isRefining: boolean;
}

export const QualityAuditPanel: React.FC<QualityAuditPanelProps> = ({
  auditResult,
  onApplyRefinement,
  isRefining
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (score >= 75) return 'text-sky-400 border-sky-500/40 bg-sky-950/20';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  };

  const getRatingLabel = (rating: QualityAuditResult['rating']) => {
    switch (rating) {
      case 'exceptional': return 'Exzellent (Agent-Bereit)';
      case 'solid': return 'Solide (Geringe Lücken)';
      case 'needs_work': return 'Überarbeitungsbedarf (Unklare Stellen)';
      case 'critical': return 'Kritisch (Zu vage / Widersprüchlich)';
    }
  };

  const totalIssues =
    auditResult.ambiguities.length +
    auditResult.contradictions.length +
    auditResult.missingAcceptanceCriteria.length +
    auditResult.missingTests.length +
    auditResult.scopeRisks.length +
    auditResult.hiddenAssumptions.length +
    auditResult.unverifiableClaims.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm text-zinc-100 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-mono font-bold ${getScoreColor(
              auditResult.score
            )}`}
          >
            <span className="text-base">{auditResult.score}</span>
            <span className="text-[9px] uppercase tracking-tighter -mt-1">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-100 font-mono">
                Prompt-Qualitäts- & Integritäts-Audit
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {getRatingLabel(auditResult.rating)}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automatische Prüfung auf Widersprüche, vage Annahmen, fehlende Tests und Scope-Explosion.
            </p>
          </div>
        </div>

        {/* 1-Click Action to improve */}
        <button
          onClick={onApplyRefinement}
          disabled={isRefining || auditResult.score >= 95}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          title="Schließt Lücken, ergänzt Non-Goals und schärft Akzeptanzkriterien"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{isRefining ? 'Schärfe Prompt...' : 'Automatisch schärfen & Lücken schließen'}</span>
        </button>
      </div>

      {/* Issues Breakdown */}
      {totalIssues === 0 ? (
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center gap-2 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hervorragend! Keine Widersprüche, Lücken oder unverifizierbare Aussagen gefunden.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {/* Ambiguities & Contradictions */}
          {(auditResult.ambiguities.length > 0 || auditResult.contradictions.length > 0) && (
            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Unklarheiten & Widersprüche</span>
              </div>
              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {auditResult.contradictions.map((c, i) => (
                  <li key={`c-${i}`} className="text-rose-300">• [Widerspruch] {c}</li>
                ))}
                {auditResult.ambiguities.map((a, i) => (
                  <li key={`a-${i}`} className="text-zinc-300">• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Tests & Acceptance Criteria */}
          {(auditResult.missingTests.length > 0 || auditResult.missingAcceptanceCriteria.length > 0) && (
            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Fehlende Tests & Akzeptanzkriterien</span>
              </div>
              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {auditResult.missingTests.map((t, i) => (
                  <li key={`t-${i}`}>• {t}</li>
                ))}
                {auditResult.missingAcceptanceCriteria.map((c, i) => (
                  <li key={`ac-${i}`}>• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scope Risks */}
          {auditResult.scopeRisks.length > 0 && (
            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Scope-Creep Risiken</span>
              </div>
              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {auditResult.scopeRisks.map((s, i) => (
                  <li key={`s-${i}`}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hidden Assumptions */}
          {auditResult.hiddenAssumptions.length > 0 && (
            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Versteckte Annahmen</span>
              </div>
              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {auditResult.hiddenAssumptions.map((h, i) => (
                  <li key={`h-${i}`}>• {h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {auditResult.actionableRecommendations.length > 0 && (
        <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg text-xs font-mono">
          <span className="text-emerald-400 font-semibold uppercase text-[11px] block mb-1">
            Empfohlene Architektur-Maßnahmen:
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {auditResult.actionableRecommendations.map((rec, i) => (
              <span
                key={i}
                className="text-zinc-300 bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1 text-[11px]"
              >
                {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
