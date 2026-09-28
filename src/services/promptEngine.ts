import {
  PromptMode,
  RequirementStructure,
  VendorModule,
  VendorReferenceLink,
  PromptModeInfo
} from '../types/prompt';
import { BKG_FORGE_PROJECT_PROFILE } from './vendorCatalog';

export const PROMPT_MODES: PromptModeInfo[] = [
  {
    id: 'quick',
    label: 'Quick Prompt',
    description: 'Kompakte, prägnante Anweisung für schnelle Eingriffe mit maximaler Klarheit',
    badge: 'Fast',
    iconName: 'Zap',
    suggestedFocus: 'Fokus auf unmittelbare Code-Änderung mit Verifikationspflicht'
  },
  {
    id: 'production',
    label: 'Production Readiness',
    description: 'Härtung, Observability, Fehlerbehandlung, Tests, Performance & Konfiguration',
    badge: 'Core',
    iconName: 'ShieldCheck',
    suggestedFocus: 'Eliminierung aller Mockups, Stubs und Ausbau der Belastbarkeit'
  },
  {
    id: 'coding',
    label: 'Coding Task',
    description: 'Implementierung neuer Komponenten, Rust-Module oder sauberer Logikpfade',
    badge: 'Dev',
    iconName: 'Code',
    suggestedFocus: 'Idiomatisches Rust / React mit vollständiger Testabdeckung'
  },
  {
    id: 'feature',
    label: 'Feature Request',
    description: 'Vollständige Feature-End-to-End-Pipeline von Anforderung bis UI/API',
    badge: 'Feature',
    iconName: 'Sparkles',
    suggestedFocus: 'Durchstich von UI über Schnittstelle bis zur Rust-Speicherschicht'
  },
  {
    id: 'bugfix',
    label: 'Bug Fix',
    description: 'Präzise Ursachenanalyse, minimalinvasiver Fix und Regressions-Test',
    badge: 'Fix',
    iconName: 'Bug',
    suggestedFocus: 'Keine Symptombekämpfung, sondern Behebung des Wurzelproblems'
  },
  {
    id: 'architecture',
    label: 'Architecture Task',
    description: 'Systemdesign, Modulgrenzen, Trait-Definitionen und Entkopplung',
    badge: 'Arch',
    iconName: 'Boxes',
    suggestedFocus: 'Clean Architecture, Ports & Adapters, Rust Trait Hierarchie'
  },
  {
    id: 'review',
    label: 'Code Review',
    description: 'Kritische Begutachtung von Code-Qualität, Sicherheit, Typen und Tests',
    badge: 'Review',
    iconName: 'CheckSquare',
    suggestedFocus: 'Auffinden von unwrap(), Fake-Daten, Sicherheitslücken und Stubs'
  },
  {
    id: 'audit',
    label: 'Repository Audit',
    description: 'Inventur des Ist-Zustands, Abhängigkeiten und unfertigen Baustellen',
    badge: 'Audit',
    iconName: 'Search',
    suggestedFocus: 'Aufdeckung von toten Pfaden und unklaren Vendor-Altlasten'
  },
  {
    id: 'refactor',
    label: 'Refactoring',
    description: 'Strukturverbesserung ohne Verhaltensänderung mit Invarianzprüfung',
    badge: 'Refactor',
    iconName: 'RefreshCw',
    suggestedFocus: 'Reduktion technischer Schulden und Performance-Optimierung'
  },
  {
    id: 'research',
    label: 'Research Task',
    description: 'Vendor-Code analysieren, Konzepte extrahieren und bKGForge-Plan ableiten',
    badge: 'Research',
    iconName: 'BookOpen',
    suggestedFocus: 'Verstehen → Abstrahieren → Neu entwerfen (kein Copy/Paste)'
  },
  {
    id: 'migration',
    label: 'Migration',
    description: 'Portierung von Legacy-Konzepten oder Upgrades von Abhängigkeiten',
    badge: 'Migrate',
    iconName: 'ArrowRightLeft',
    suggestedFocus: 'Rückwärtskompatibilität und migrationssichere Schemata'
  },
  {
    id: 'security',
    label: 'Security Audit',
    description: 'Absicherung gegen Injection, Path Traversal, SSRF, Secret Leaks',
    badge: 'Sec',
    iconName: 'Lock',
    suggestedFocus: 'Härtung aller Eingabepfade und restriktive Berechtigungen'
  },
  {
    id: 'testing',
    label: 'Testing Task',
    description: 'Aufbau echter Unit-, Integrations-, E2E- und Property-Tests',
    badge: 'Test',
    iconName: 'CheckCircle2',
    suggestedFocus: 'Tatsächliche Assertion-Prüfung ohne Dummy-Mocks'
  },
  {
    id: 'documentation',
    label: 'Documentation Task',
    description: 'Architektur-Dokumentation (ADRs), API-Spezifikationen und Runbooks',
    badge: 'Docs',
    iconName: 'FileText',
    suggestedFocus: 'Präzise, reproduzierbare Dokumentation ohne Marketingfloskeln'
  },
  {
    id: 'custom',
    label: 'Custom Mode',
    description: 'Vollständig frei konfigurierbare Prompt-Spezifikation',
    badge: 'Custom',
    iconName: 'Sliders',
    suggestedFocus: 'Flexible Anpassung an Spezialanforderungen'
  }
];

export interface PromptEngineOptions {
  mode: PromptMode;
  userPrompt: string;
  projectRoot?: string;
  selectedVendorModules: VendorModule[];
  customConstraints?: string[];
  enforceZeroStubs?: boolean;
  enforceRustBackend?: boolean;
  enforceRealVerification?: boolean;
  allowAssumptions?: boolean;
}

/**
 * Zerlegt die natürliche Benutzereingabe in eine strukturierte Anforderungsstruktur (AST).
 * Folgt streng den Prinzipien:
 * - Keine Halluzinationen
 * - Sichere Annahmen vs. ungelöste Fragen explizit trennen
 * - Tiefe Verankerung in bKGForge & Rust
 */
export function decomposeRequirements(options: PromptEngineOptions): RequirementStructure {
  const raw = options.userPrompt.trim();
  const root = options.projectRoot || BKG_FORGE_PROJECT_PROFILE.rootPath;
  const mode = options.mode;

  // Analysiere Schlüsselwörter und Absicht
  const isProdReady = /production ready|produktionsreif|härtung|härten|harden/i.test(raw);
  const mentionsVendor = /vendor|bkg-ffm|bkg-af|übernimm|ideen|referenz/i.test(raw);
  const mentionsRust = /rust|cargo|backend|tokio|trait/i.test(raw);
  const mentionsTest = /test|verif|e2e|unit|integration/i.test(raw);
  const mentionsSecurity = /secur|sicherheit|secret|auth|ssrf|traversal/i.test(raw);
  const mentionsUI = /react|ui|ux|frontend|oberfläche|komponente/i.test(raw);

  // Intent & Objective
  let intent = raw;
  if (!intent) {
    intent = 'Produktionsreife Weiterentwicklung und Härtung von bKGForge unter Nutzung relevanter Vendor-Konzepte.';
  }

  let objective = '';
  switch (mode) {
    case 'production':
      objective = `Vollständige Überführung von bKGForge (${root}) in einen reproduzierbaren, gehärteten und verifizierten Produktionszustand ohne Mockups oder Stubs.`;
      break;
    case 'research':
      objective = `Strukturierte Analyse von Vendor-Referenzen (bkg-ffm & bkg-af) und Ableitung einer eigenständigen Rust-Architektur für bKGForge.`;
      break;
    case 'architecture':
      objective = `Entwurf und Etablierung einer modularen, lose gekoppelten Architektur für bKGForge mit klaren Rust-Traits und sauberer Schichtentrennung.`;
      break;
    case 'security':
      objective = `Umfassendes Sicherheits-Audit und Härtung von bKGForge gegen Secret-Leaks, unkontrollierte Dateizugriffe, SSRF und Path Traversal.`;
      break;
    case 'testing':
      objective = `Implementierung einer echten, belastbaren Testsuite (Unit, Integration, E2E) mit realen Assertionen und Pfaddurchstich.`;
      break;
    default:
      objective = `Präzise, produktionsreife Ausführung der Anforderung: "${raw.slice(0, 120)}${raw.length > 120 ? '...' : ''}" innerhalb der bKGForge-Codebase.`;
  }

  // Scope
  const inScope: string[] = [
    `Untersuchung und Modifikation der bKGForge-Wurzel: ${root}`,
    'Explizite Trennung von Fachlogik, Rust-Backend-Services und Benutzeroberfläche',
    'Einhaltung des strengen 8-Phasen-Agenten-Workflows (Inventory bis Final Review)',
    'Echte Ausführung und Verifikation aller betroffenen Funktionspfade'
  ];

  if (mentionsVendor || options.selectedVendorModules.length > 0) {
    inScope.push(
      'Analyse der bereitgestellten Vendor-Referenzen als reine Inspirationsquelle gemäß dem 10-Schritte-Untersuchungsprotokoll',
      'Eigenständige Neuimplementierung aller benötigten Konzepte in idiomatischem Rust'
    );
  }

  if (isProdReady || mode === 'production') {
    inScope.push(
      'Beseitigung aller statischen Demo-Daten, Dummy-Implementierungen und Fake-Antworten',
      'Strukturierte Konfigurationsvalidierung und fehlertolerantes Logging via tracing'
    );
  }

  const outOfScope: string[] = [
    'Veränderung von Quellcode außerhalb von bKGForge oder unbeteiligten Subsystemen',
    'Einführung schwergewichtiger externer Cloud-SaaS-Abhängigkeiten ohne Notwendigkeit',
    'Verwendung veralteter oder unsicherer Third-Party Crates'
  ];

  const nonGoals: string[] = [
    'KEIN blindes Kopieren/Einfügen von Code aus /workspace/projects/bkg-ffm/vendor oder bkg-af/vendor',
    'KEINE Beibehaltung von TODOs oder vorgetäuschten Feature-Mockups als "erledigt"',
    'KEINE Behauptung von Compiler-Erfolgen ohne tatsächlich ausgeführte und dokumentierte Tests',
    'KEIN Aufblähen des Scopes durch unangeforderte Zusatzfeatures ("Scope Creep")'
  ];

  // Requirements
  const functionalReqs: string[] = [
    `Kernfunktionalität exakt gemäß Benutzerabsicht umsetzen: "${raw}"`,
    'Alle interaktiven Steuerelemente und Schnittstellen mit echter Backend-Anbindung versehen',
    'Zustandsänderungen deterministisch und nachvollziehbar protokollieren'
  ];

  const architectureReqs: string[] = [
    'Hexagonale Architektur / Ports & Adapters: Klare Abstraktion externer Schnittstellen',
    'Modulare Entkopplung: Datenhaltung, Domain-Logik und Präsentation bleiben strikt getrennt',
    'Rust-Erstklassigkeit: Starke Typen, Newtype-Pattern, exhaustive Enums für Zustände'
  ];

  const implementationReqs: string[] = [
    'Idiomatisches Rust: std::result::Result für alle fehlbaren Operationen; kein unwrap() oder expect() in Runtime-Pfaden',
    'Asynchrone Verarbeitung mit tokio für I/O-intensive Operationen',
    'Zero-Copy Design: Vermeidung unnötiger Heap-Allokationen bei String- und Buffer-Verarbeitung',
    'Saubere React 19 Frontend-Komponenten: Strikte Typisierung, Barrierefreiheit (WCAG AA), keine leeren Platzhalter'
  ];

  const securityReqs: string[] = [
    'Keine API-Keys, Credentials oder Secrets im Quellcode, in Logs oder in Prompts',
    'Strikte Eingabevalidierung aller Nutzereingaben und API-Payloads',
    'Schutz vor Path Traversal und unkontrollierten Dateisystemzugriffen (insbesondere bei Vendor-Pfaden)',
    'Vendor-Dateien dürfen niemals ungeprüft als ausführbarer Binärcode ausgeführt werden'
  ];

  const testingReqs: string[] = [
    'Unit-Tests für alle neuen Datenmodelle, Parser und State-Transitions',
    'Integrationstests für den echten Datenfluss zwischen Rust-Services und Schnittstellen',
    'Mindestens ein realer End-to-End Test für den primären Workflow',
    'Negative Tests: Gezielte Provokation von ungültigen Eingaben und Überprüfung der Fehlerbehandlung'
  ];

  const documentationReqs: string[] = [
    'Architektur-Entscheidungen (ADR) für neu eingeführte Abstraktionen dokumentieren',
    'Vendor-Synthese dokumentieren: Welches Konzept wurde warum übernommen und wie in Rust neu entworfen?',
    'Aktualisierung der README und Konfigurationshinweise'
  ];

  // Vendor References
  const vendorReferences: VendorReferenceLink[] = options.selectedVendorModules.map((v) => ({
    vendorId: v.id,
    vendorName: v.name,
    sourceRepo: v.sourceLocation,
    conceptToExtract: v.rustReimplementationPlan.conceptToExtract,
    whatToReject: v.rustReimplementationPlan.rejectionList,
    bkgForgeRustTarget: v.rustReimplementationPlan.rustModuleDesign
  }));

  // Safe Assumptions vs Unresolved Questions (CRITICAL: zero hallucination)
  const safeAssumptions: string[] = [
    `Das Projekt bKGForge befindet sich im Verzeichnis ${root}`,
    'Das Ziel-Backend basiert auf modernem Rust (Cargo Workspace mit Tokio-Ökosystem)',
    'Das Frontend basiert auf React mit TypeScript und Tailwind CSS',
    'Vendor-Pfade dienen ausschließlich als lesende Referenzquelle'
  ];

  const unresolvedQuestions: string[] = [];
  if (!mentionsSecurity && !mentionsTest) {
    unresolvedQuestions.push(
      'Gibt es spezifische SLAs oder Latenz-Grenzwerte für die neuen Backend-Endpunkte?',
      'Welches konkrete Persistenz-Backend ist für die Session-Daten im Produktivbetrieb vorgesehen (Embedded RocksDB vs SQLite)?'
    );
  }
  if (!mentionsUI && mentionsRust) {
    unresolvedQuestions.push(
      'Sollen für die Rust-Backend-Funktionen auch dedizierte Frontend-Views im bKGForge Dashboard ergänzt werden?'
    );
  }
  if (unresolvedQuestions.length === 0) {
    unresolvedQuestions.push(
      'Gibt es bestehende Migrationsskripte für ältere bKGForge-Datenbankstände?'
    );
  }

  // Definition of Done (Strict 8 criteria)
  const definitionOfDone: string[] = [
    '1. Vollständige Implementierung: Sämtliche angeforderten Funktionen sind ohne Stubs, TODOs oder Mockups vorhanden.',
    '2. Idiomatisches Rust: Alle Backend-Teile kompilieren fehlerfrei mit rustc und clippy ohne Warnungen.',
    '3. Tatsächliche Tests ausgeführt: Unit- und Integrationstests wurden mit cargo test erfolgreich durchlaufen.',
    '4. Durchstich verifiziert: Der echte Integrationspfad (UI → API → Backend → Service → Persistenz → UI) ist nachweislich funktionsfähig.',
    '5. Keine Scheinerfolge: "Compiles" oder "Looks correct" wird nicht als Testbeweis akzeptiert; Assertionen sind dokumentiert.',
    '6. Keine Vendor-Kopie: Vendor-Code wurde verstanden, abstrahiert und vollständig eigenständig in bKGForge implementiert.',
    '7. Regressionsfreiheit: Bestehende Funktionalitäten von bKGForge sind intakt geblieben.',
    '8. Dokumentation & Review: Architektur-Entscheidungen und verbleibende Restrisiken sind explizit festgehalten.'
  ];

  return {
    intent,
    objective,
    context: `Projekt: bKGForge | Wurzel: ${root} | Vendor-Quellen: /workspace/projects/bkg-ffm/vendor & /workspace/projects/bkg-af/vendor`,
    project: {
      root,
      name: 'bKGForge',
      stack: ['Rust', 'Tokio', 'Petgraph', 'React 19', 'TypeScript', 'Tailwind CSS']
    },
    scope: {
      inScope,
      outOfScope,
      nonGoals
    },
    inputs: [
      `Benutzereingabe: "${raw}"`,
      `Modus: ${mode.toUpperCase()}`,
      `Referenzierte Vendor-Module: ${vendorReferences.length} Module aktiviert`
    ],
    outputs: [
      'Eigenständiger, produktionsreifer Quellcode in bKGForge',
      'Vollständige Rust-Modulimplementierungen mit Traits und Tests',
      'Verifikationsprotokoll mit tatsächlichen Testergebnissen',
      'Architektur-Zusammenfassung und Vendor-Abstraktionsnachweis'
    ],
    requirements: {
      functional: functionalReqs,
      architecture: architectureReqs,
      implementation: implementationReqs,
      security: securityReqs,
      testing: testingReqs,
      documentation: documentationReqs
    },
    constraints: [
      'Niemals Vendor-Code per Copy/Paste übernehmen',
      'Keine Erfindung von APIs, Dateien oder nicht existierenden Testergebnissen',
      'Fehlende Informationen als offene Fragen markieren, nicht willkürlich extrapolieren',
      'Keine Secrets im Quellcode oder in generierten Artefakten'
    ],
    architectureRules: [
      'Klare Modulgrenzen und lose Kopplung',
      'Strikte Result-Fehlerbehandlung in Rust ohne Panics',
      'Exhaustive Pattern Matches bei Statusübergängen'
    ],
    implementationRules: [
      'Keine Stubs, keine TODO-Platzhalter, keine simulierten Antworten',
      'Echte asynchrone I/O-Pfade mit Tokio',
      'Zero-Copy String- und Datenverarbeitung'
    ],
    testingRequirements: [
      'Unit Tests für Kernalgorithmen und Datenmodelle',
      'Integrationstests für Servicegrenzen',
      'E2E-Verifikation des kompletten Benutzerpfads'
    ],
    verificationRequirements: [
      'Prüfung des tatsächlichen Durchstichs: UI → API → Backend → Service → Datenhaltung → Response → UI',
      'Validierung von Grenzfällen und Fehlerszenarien'
    ],
    acceptanceCriteria: [
      'Der geforderte Task ist zu 100% funktionsfähig und durch Tests belegt',
      'Es existieren keine TODO-Kommentare in den betroffenen Pfaden',
      'Alle Vendor-Konzepte wurden eigenständig in Rust neu implementiert'
    ],
    dependencies: [
      'Zugelassen: Offizielle Rust Crates (tokio, serde, petgraph, syn, axum, tracing)',
      'Verboten: Veraltete oder ungeprüfte Fremdpakete aus den Vendor-Verzeichnissen'
    ],
    risks: [
      'Laufzeit-Overhead bei unzureichend optimierter Graph-Traversierung',
      'Abweichungen in Datenstrukturen zwischen Vendor-Vorbild und bKGForge-Domainmodell',
      'Übersehen von Randbedingungen bei der Fehlerbehandlung'
    ],
    safeAssumptions,
    unresolvedQuestions,
    vendorReferences,
    definitionOfDone,
    // Explicit pipeline compliance aliases
    architecture: architectureReqs,
    implementation_requirements: implementationReqs,
    security_requirements: securityReqs,
    testing_requirements: testingReqs,
    documentation_requirements: documentationReqs,
    acceptance_criteria: [
      'Der geforderte Task ist zu 100% funktionsfähig und durch Tests belegt',
      'Es existieren keine TODO-Kommentare in den betroffenen Pfaden',
      'Alle Vendor-Konzepte wurden eigenständig in Rust neu implementiert'
    ],
    non_goals: nonGoals,
    unresolved_questions: unresolvedQuestions
  };
}

/**
 * Erzeugt den vollständigen, direkt ausführbaren Master-Prompt für einen Coding-Agenten.
 * Beginnt direkt mit der Agentenaufgabe (keine Meta-Floskeln).
 */
export function compileMasterPrompt(
  req: RequirementStructure,
  options: PromptEngineOptions
): string {
  const vList = req.vendorReferences
    .map(
      (v, idx) => `### Vendor-Referenz ${idx + 1}: ${v.vendorName}
- **Ursprungs-Pfad**: \`${v.sourceRepo}\`
- **Konzept zur Abstraktion**: ${v.conceptToExtract}
- **Ausdrücklich NICHT übernehmen**:
${v.whatToReject.map((r) => `  * ${r}`).join('\n')}
- **Ziel in bKGForge (Eigenständiges Rust-Modul)**: \`${v.bkgForgeRustTarget}\`
- **Leitsatz**: VERSTEHEN → ABSTRAHIEREN → NEU ENTWERFEN → IN BKGFORGE IMPLEMENTIEREN → TESTEN.`
    )
    .join('\n\n');

  return `# AGENTEN-AUFTRAG: ${req.objective}

Du agierst als Principal Software Architect, Rust Engineer und Code-Review-Spezialist für das Projekt bKGForge.
Deine Aufgabe ist es, die folgende Spezifikation vollständig, produktionsreif und verifizierbar in der bKGForge-Codebase umzusetzen.

---

## 1. ROLLE & PROJEKTKONTEXT

- **Projekt-Wurzel**: \`${req.project.root}\`
- **System-Name**: \`${req.project.name}\`
- **Technologie-Stack**: ${req.project.stack.join(', ')}
- **Referenz-Vendor-Pfade**:
  * \`/workspace/projects/bkg-ffm/vendor\`
  * \`/workspace/projects/bkg-af/vendor\`
  * \`${req.project.root}/vendor\` (Ziel für Referenzmaterial)

WICHTIGSTE ARCHITEKTUR-REGEL:
Dies ist kein Wrapper, kein Mockup und keine zusammenkopierte Vendor-Anwendung. Bestehender Vendor-Code darf ausschließlich als technische Inspirations- und Forschungsquelle untersucht werden. Keine Copy/Paste-Übernahme von Implementierungen, keine blind übernommenen Dateien, keine fremden Abhängigkeiten nur weil sie im Vendor vorhanden sind.

---

## 2. AUSGANGS- UND ZIELZUSTAND

- **Ausgangszustand**:
  Das bKGForge-Repository befindet sich in der Entwicklung und benötigt die strukturierte, produktionsreife Realisierung der Zielanforderung unter Berücksichtigung bewährter Architekturkonzepte.
- **Zielzustand**:
  Ein eigenständiges, idiomatisches, performantes und vollständig getestetes System ohne Mockups, ohne Stubs und ohne unvollständige Pfade.

---

## 3. SCOPE & ABGRENZUNG

### In Scope
${req.scope.inScope.map((s) => `- ${s}`).join('\n')}

### Out of Scope
${req.scope.outOfScope.map((s) => `- ${s}`).join('\n')}

### Explizite Non-Goals (Regeln gegen Scope Creep)
${req.scope.nonGoals.map((s) => `- ${s}`).join('\n')}

---

## 4. ANFORDERUNGS-KATALOG

### Funktionale Anforderungen
${req.requirements.functional.map((r) => `- ${r}`).join('\n')}

### Architektur- & Schichtungsanforderungen
${req.requirements.architecture.map((r) => `- ${r}`).join('\n')}

### Implementierungs-Anforderungen (Rust & TypeScript)
${req.requirements.implementation.map((r) => `- ${r}`).join('\n')}

### Sicherheitsanforderungen & Datenschutz
${req.requirements.security.map((r) => `- ${r}`).join('\n')}

### Testanforderungen
${req.requirements.testing.map((r) => `- ${r}`).join('\n')}

### Dokumentationsanforderungen
${req.requirements.documentation.map((r) => `- ${r}`).join('\n')}

---

## 5. VENDOR-REFERENZEN & ABSTRAKTIONSRICHTLINIEN

${
  req.vendorReferences.length > 0
    ? vList
    : `Keine spezifischen Vendor-Module vorausgewählt. Falls bei der Analyse Referenzen in \`/workspace/projects/bkg-ffm/vendor\` oder \`/workspace/projects/bkg-af/vendor\` herangezogen werden, gilt ausnahmslos das 10-Schritte-Protokoll:
1. Repository und Struktur inventarisieren
2. Architektur analysieren
3. Features erfassen
4. UI/UX-Konzepte erfassen
5. Datenmodelle und Schnittstellen untersuchen
6. Relevante Algorithmen identifizieren
7. Abhängigkeiten dokumentieren
8. Lizenz und Herkunft dokumentieren
9. Relevante Idee für bKGForge ableiten
10. Eigenständig in Rust neu implementieren.`
}

---

## 6. EXPLIZITE ANNAHMEN & OFFENE PUNKTE (ANTI-HALLUZINATION)

### Sichere Annahmen
${req.safeAssumptions.map((a) => `- [SICHER] ${a}`).join('\n')}

### Unaufgelöste Fragen (Offene Punkte – NICHT erfinden!)
${req.unresolvedQuestions.map((q) => `- [OFFEN] ${q}`).join('\n')}

*Hinweis für den Agenten*: Erfinde keine APIs, keine Dateipfade und keine Testergebnisse für offene Punkte. Arbeite ausschließlich mit dem tatsächlichen Projektbestand.

---

## 7. VERPFLICHTENDER AGENTEN-WORKFLOW (8 PHASEN)

Der Agent MUSS die Arbeit in folgenden 8 aufeinander aufbauenden Phasen durchführen:

### PHASE 1: INVENTORY
- Projekt \`${req.project.root}\` vollständig untersuchen.
- Verzeichnisbaum, vorhandene Cargo.toml, src-Dateien und Konfigurationen inventarisieren.
- Keine Implementierung beginnen, bevor der relevante Bestand verstanden wurde.

### PHASE 2: ANALYSIS
- Bestehende Architektur, Abhängigkeiten, Schnittstellen und relevante Vendor-Referenzen analysieren.
- Eventuelle Konflikte mit bestehendem Code identifizieren.

### PHASE 3: DESIGN
- Konkreten Implementierungsplan erstellen.
- Modulgrenzen, Rust-Traits und Datenstrukturen festlegen.
- Bestehende Architektur respektieren und nur notwendige Änderungen vornehmen.

### PHASE 4: IMPLEMENTATION
- Funktionalität vollständig und sauber implementieren.
- STRIKTE REGEL: Keine Stubs, keine TODO-Platzhalter, keine Fake-Responses, keine Demo-Implementierungen.
- Fehlerbehandlung in Rust über \`Result<T, E>\` ohne leichtfertiges \`.unwrap()\`.

### PHASE 5: TESTING
- Tatsächliche Tests ausführen:
  * Unit Tests (\`cargo test --lib\`)
  * Integration Tests (\`cargo test --test ...\`)
  * UI / E2E Tests sofern Frontend-Komponenten betroffen sind.
- Kein "Looks correct" – Testergebnisse müssen messbare Assertionen aufweisen.

### PHASE 6: VERIFICATION
- Den tatsächlichen Funktionspfad von Ende zu Ende prüfen:
  \`UI → API → Backend → Service → Datenhaltung → Response → UI\`
- Externe Schnittstellen und I/O-Grenzen unter Last oder mit Randdaten validieren.

### PHASE 7: DOCUMENTATION
- Architektur- und Implementierungsentscheidungen (ADR) dokumentieren.
- Schnittstellen und Datenmodelle klar beschreiben.

### PHASE 8: FINAL REVIEW
- Änderungen gegen ursprüngliche Anforderungen prüfen.
- Explizit im Abschlussbericht festhalten:
  * Was vollständig implementiert wurde
  * Was getestet wurde (inkl. exakter Befehle und Resultate)
  * Was nicht getestet werden konnte und warum
  * Welche offenen Punkte oder Risiken verbleiben.

---

## 8. DEFINITION OF DONE (ABSCHLUSSKRITERIEN)

Eine Aufgabe gilt erst dann als abgeschlossen, wenn:
${req.definitionOfDone.map((d) => `- ${d}`).join('\n')}

Starte jetzt mit PHASE 1 (INVENTORY) auf der bKGForge-Codebase.`;
}

/**
 * Erstellt eine kompakte Übersicht für das Dashboard.
 */
export function generateCompactSummary(req: RequirementStructure): {
  target: string;
  scope: string;
  keyRequirements: string[];
  vendorReferencesCount: number;
  openQuestionsCount: number;
  testsCount: number;
  dodChecklist: string[];
} {
  return {
    target: req.objective,
    scope: `${req.scope.inScope.length} Anforderungen im Scope, ${req.scope.nonGoals.length} Non-Goals`,
    keyRequirements: req.requirements.functional.concat(req.requirements.architecture.slice(0, 2)),
    vendorReferencesCount: req.vendorReferences.length,
    openQuestionsCount: req.unresolvedQuestions.length,
    testsCount: req.testingRequirements.length,
    dodChecklist: req.definitionOfDone
  };
}
