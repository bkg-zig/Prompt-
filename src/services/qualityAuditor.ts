import { RequirementStructure, QualityAuditResult } from '../types/prompt';

export function auditPromptQuality(
  promptText: string,
  structure?: RequirementStructure
): QualityAuditResult {
  const ambiguities: string[] = [];
  const contradictions: string[] = [];
  const missingAcceptanceCriteria: string[] = [];
  const missingTests: string[] = [];
  const scopeRisks: string[] = [];
  const hiddenAssumptions: string[] = [];
  const unverifiableClaims: string[] = [];
  const actionableRecommendations: string[] = [];

  const textLower = promptText.toLowerCase();

  // 1. Prüfe auf Unklarheiten (Ambiguities)
  if (promptText.length < 50) {
    ambiguities.push('Sehr kurze Aufgabenbeschreibung ohne Kontext- oder Detailspezifikation.');
    actionableRecommendations.push('Füge konkrete technische Ziele und Randbedingungen hinzu.');
  }
  if (textLower.includes('irgendwie') || textLower.includes('vielleicht') || textLower.includes('etc.') || textLower.includes('und so weiter')) {
    ambiguities.push('Vage Füllwörter entdeckt ("irgendwie", "vielleicht", "etc."), die zu willkürlicher Interpretation führen.');
    actionableRecommendations.push('Ersetze unpräzise Ausdrücke durch exakt benannte Datenstrukturen und Interfaces.');
  }

  // 2. Prüfe auf Widersprüche (Contradictions)
  if (textLower.includes('kein test') && textLower.includes('production ready')) {
    contradictions.push('Widerspruch: "Production ready" deklariert, aber "keine Tests" gefordert.');
  }
  if (textLower.includes('kopiere') && textLower.includes('kein vendor copy')) {
    contradictions.push('Widerspruch: Aufforderung zum Kopieren kollidiert mit der bKGForge Anti-Copy-Paste-Richtlinie.');
  }

  // 3. Prüfe Akzeptanzkriterien
  if (
    !textLower.includes('definition of done') &&
    !textLower.includes('akzeptanz') &&
    (!structure || structure.acceptanceCriteria.length === 0)
  ) {
    missingAcceptanceCriteria.push('Es sind keine formalen Akzeptanzkriterien oder "Definition of Done" definiert.');
    actionableRecommendations.push('Ergänze messbare Kriterien (z. B. 0 Compiler-Warnungen, alle Tests grün, Durchstich geprüft).');
  }

  // 4. Prüfe Testanforderungen
  if (
    !textLower.includes('cargo test') &&
    !textLower.includes('unit test') &&
    !textLower.includes('integration') &&
    (!structure || structure.testingRequirements.length === 0)
  ) {
    missingTests.push('Fehlende Teststrategie: Weder Unit-, Integrations- noch E2E-Tests spezifiziert.');
    actionableRecommendations.push('Lege konkrete Testbefehle fest (z.B. cargo test --lib, cargo test --test integration).');
  }

  // 5. Scope-Risiken & Explosion
  if (textLower.includes('alles neu') || textLower.includes('komplett umschreiben') || textLower.includes('alles modernisieren')) {
    scopeRisks.push('Hohes Risiko von Scope-Explosion: Formulierungen wie "alles neu" führen zu unkontrolliertem Refactoring.');
    actionableRecommendations.push('Begrenze den Scope auf explizit benannte Module und Dateien.');
  }
  if (!textLower.includes('non-goals') && (!structure || structure.scope.nonGoals.length === 0)) {
    scopeRisks.push('Keine Non-Goals deklariert. Coding-Agenten neigen ohne Non-Goals zu Scope Creep.');
    actionableRecommendations.push('Definiere mindestens 3 explizite Non-Goals (was bewusst NICHT getan werden soll).');
  }

  // 6. Versteckte Annahmen
  if (!textLower.includes('rust') && !textLower.includes('cargo')) {
    hiddenAssumptions.push('Die Zielsprache Rust wird im Prompt nicht explizit benannt und bleibt eine implizite Annahme.');
    actionableRecommendations.push('Erwähne Rust und die zugehörigen Architekturregeln (Result<T, E>, Tokio) explizit.');
  }
  if (textLower.includes('schnell') && !textLower.includes('ms') && !textLower.includes('benchmark')) {
    hiddenAssumptions.push('Performance-Anforderung "schnell" ist subjektiv und ohne quantifizierbaren Richtwert.');
  }

  // 7. Unüberprüfbare Aussagen
  if (textLower.includes('sieht gut aus') || textLower.includes('sollte funktionieren') || textLower.includes('looks correct')) {
    unverifiableClaims.push('Subjektive Formulierung ("sieht gut aus / sollte funktionieren") anstelle echter Verifikation.');
    actionableRecommendations.push('Ersetze durch den Nachweis des vollständigen Funktionspfads (UI -> API -> Backend -> DB).');
  }

  // Score-Berechnung
  let score = 100;
  score -= ambiguities.length * 12;
  score -= contradictions.length * 20;
  score -= missingAcceptanceCriteria.length * 15;
  score -= missingTests.length * 15;
  score -= scopeRisks.length * 10;
  score -= hiddenAssumptions.length * 8;
  score -= unverifiableClaims.length * 10;
  score = Math.max(10, Math.min(100, score));

  let rating: QualityAuditResult['rating'] = 'exceptional';
  if (score < 50) rating = 'critical';
  else if (score < 75) rating = 'needs_work';
  else if (score < 90) rating = 'solid';

  return {
    score,
    rating,
    ambiguities,
    contradictions,
    missingAcceptanceCriteria,
    missingTests,
    scopeRisks,
    hiddenAssumptions,
    unverifiableClaims,
    actionableRecommendations
  };
}

/**
 * Führt eine automatisierte Prompt-Verbesserung durch:
 * Hebt vage Annahmen auf, schließt Lücken, ergänzt Testregeln und Non-Goals,
 * OHNE die ursprüngliche Intention des Benutzers zu verfälschen.
 */
export function refineRequirementStructure(
  original: RequirementStructure
): RequirementStructure {
  const refined: RequirementStructure = JSON.parse(JSON.stringify(original));

  // 1. Sichere Ergänzung von Non-Goals zur Scope-Absicherung
  const essentialNonGoals = [
    'Kein blindes Kopieren fremder Abhängigkeiten aus Vendor-Quellen',
    'Keine Ausweitung auf nicht betroffene Submodule von bKGForge',
    'Keine Duldung von unvollständigen Stub-Implementierungen'
  ];
  for (const ng of essentialNonGoals) {
    if (!refined.scope.nonGoals.includes(ng)) {
      refined.scope.nonGoals.push(ng);
    }
  }

  // 2. Schärfung der Testanforderungen
  if (refined.requirements.testing.length < 3) {
    refined.requirements.testing.push(
      'Automatisierte Ausführung der Rust-Testsuite mit `cargo test --all` und Protokollierung aller Assertions',
      'Testen von Negativpfaden und Fehlerbehandlung für unzulässige Eingabewerte',
      'End-to-End Pfadprüfung des Durchstichs ohne Mockup-Rückgabewerte'
    );
  }

  // 3. Schärfung der Definition of Done
  if (refined.definitionOfDone.length < 5) {
    refined.definitionOfDone.push(
      'Alle Code-Änderungen sind fehlerfrei kompiliert und mit echten Tests verifiziert',
      'Keine unwrap()-Aufrufe in Produktivcode-Pfaden',
      'Dokumentation der Architektur-Entscheidungen im Repository'
    );
  }

  // 4. Markierung verbleibender Unklarheiten
  if (refined.unresolvedQuestions.length === 0) {
    refined.unresolvedQuestions.push(
      'Gibt es bestehende Performance-Benchmarks für die modifizierten Datenpfade?'
    );
  }

  return refined;
}
