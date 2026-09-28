export interface ModuleInventoryFile {
  path: string;
  type: 'rust' | 'typescript' | 'config' | 'doc' | 'schema';
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  path: string;
  category: 'core' | 'vendor-ffm' | 'vendor-af' | 'target-bkgforge';
  status: 'production-ready' | 'reference-only' | 'in-design' | 'hardened';
  architecture: string;
  features: string[];
  uiUxConcepts: string;
  dataModels: string;
  interfaces: string;
  algorithms: string;
  dependencies: string[];
  licenseAndOrigin: string;
  relevanceForBkgForge: string;
  rustReimplementationPlan: {
    targetCrateOrModule: string;
    conceptToExtract: string;
    rejectionList: string[];
    idiomaticRustTraits: string;
    verificationStrategy: string;
  };
}

export const TECHNICAL_INVENTORY: InventoryItem[] = [
  {
    id: 'bkgforge-core-engine',
    name: 'bKGForge Knowledge Graph & Agent Core',
    path: '/srv/bkg/workspace/current/bKGForge',
    category: 'core',
    status: 'production-ready',
    architecture: 'Clean Hexagonal Architecture (Ports & Adapters) in idiomatic Rust mit Tokio Asynchronität, Strong Newtypes und Result-basierter Fehlerfortpflanzung. Entkoppeltes React 19 Frontend über REST/SSE.',
    features: [
      'Deterministische Anforderungszerlegung (Natural Language -> AST)',
      'Strikter 8-Phasen-Workflow für Coding-Agents (Inventory bis Final Review)',
      'Echtzeit-Qualitäts-Audit mit quantitativer Risikobewertung (0-100)',
      'Zero-Stubs & Zero-Mockups Enforcement Engine',
      'Automatisierte Schärfung & Lücken-Schließung ohne Halluzinationen',
      'Visuelles Line-by-Line Diffing mit Added/Modified/Removed Erkennung',
      'Vendor-Research-Hub mit 10-Schritte-Abstraktionsprotokoll',
      'Versionierungs-Historie mit Rollback und Export'
    ],
    uiUxConcepts: 'Zero-Pill Typografie-Hierarchie, Segmented Controls, monospaced Dateninspektion, fokussiertes High-Contrast Dark Theme (zinc-950/zinc-900), Live-Diff Split/Unified View.',
    dataModels: 'RequirementStructure (intent, objective, scope, inputs, outputs, requirements, constraints, architecture, implementation_requirements, security_requirements, testing_requirements, documentation_requirements, acceptance_criteria, non_goals, dependencies, risks, unresolved_questions), PromptVersion, QualityAuditResult, DiffLine.',
    interfaces: 'REST-Endpunkte für Agent-Orchestration, SSE-Stream für Tool-Execution-Events, JSON-LD Schema und standardisierte Markdown Deliverables.',
    algorithms: 'Longest Common Subsequence (LCS) Diffing, Topologische Sortierung von Task-DAGs, AST-Block-Preserving Token Slicing, Knapsack Kontext-Budgetierung.',
    dependencies: ['Rust 1.80+ (tokio, petgraph, syn, serde, axum, tracing)', 'React 19', 'TypeScript 5.8+', 'Tailwind CSS v4'],
    licenseAndOrigin: 'Proprietär / bKGForge Enterprise Internal Core',
    relevanceForBkgForge: 'Zentrales Produktionssystem; alle externen Vendor-Ideen fließen hier als eigenständige Rust-Implementierungen ein.',
    rustReimplementationPlan: {
      targetCrateOrModule: 'bkgforge_core',
      conceptToExtract: 'Hexagonale Kernplattform mit strikter Trennung von Domain, Ports und Adaptern.',
      rejectionList: ['Keine Fremdlaufzeiten (Node/Python/Go) im Backend', 'Kein unwrap() im Produktivpfad'],
      idiomaticRustTraits: `pub trait AgentEngine {
    async fn execute_phase(&self, phase: AgentPhase) -> Result<PhaseEvidence, EngineError>;
}`,
      verificationStrategy: 'End-to-End Pfaddurchstich: UI -> API -> Rust Engine -> Graph Storage -> Response'
    }
  },
  {
    id: 'vendor-ffm-ast-graph',
    name: 'FFM Repo Graph & AST Semantic Indexer',
    path: '/workspace/projects/bkg-ffm/vendor/repo-graph-ast',
    category: 'vendor-ffm',
    status: 'reference-only',
    architecture: 'Monolithischer TypeScript/Node.js Service. Koppelt AST-Parsing via Babel und Regex eng an In-Memory Object Graphs und synchrones SQLite.',
    features: [
      'Multi-Language Symbol Extraction (TS, JS, Rust, Python)',
      'Cross-File Reference Resolution',
      'Call Graph & Import Dependency Visualizer',
      'Cyclic Dependency & Tarjan SCC Detection'
    ],
    uiUxConcepts: 'D3/Canvas Force-Directed Graph mit Zoom, Pan und Symbol-Karten.',
    dataModels: 'GraphNode { id, symbol, file, line, kind }, Edge { source, target, relationshipType }',
    interfaces: 'Lokaler Express JSON RPC Router, synchrone better-sqlite3 Anbindung.',
    algorithms: 'Depth-First Search (DFS) für Zyklenerkennung, Tarjan Strongly Connected Components (SCC), Levenshtein Fuzzy Symbol Matching.',
    dependencies: ['@babel/parser', 'better-sqlite3', 'graphlib', 'typescript', 'chokidar'],
    licenseAndOrigin: 'MIT License (bkg-ffm Vendor Snapshot v0.8.2)',
    relevanceForBkgForge: 'Die zweistufige Symbolauflösung (schneller Flach-Scan + On-Demand AST) und der typisierte Abhängigkeitsgraph sind für bKGForge essenziell.',
    rustReimplementationPlan: {
      targetCrateOrModule: 'bkgforge_core::analysis::graph::SymbolDag',
      conceptToExtract: 'Deterministischer, speicheroptimierter gerichteter azyklischer Graph (DAG) für Code-Symbole und Modul-Deltas mit Zero-Copy String Slicing.',
      rejectionList: [
        'Kein Node.js/Babel Runtime-Overhead',
        'Kein V8 Garbage Collector Memory Leaking bei großen Repositories',
        'Keine ungetypten dynamischen SQLite-Tabellen'
      ],
      idiomaticRustTraits: `pub trait SymbolExtractor {
    fn extract_symbols<'a>(&self, source: &'a str) -> Result<Vec<Symbol<'a>>, ExtractionError>;
}
pub struct SymbolGraph {
    inner: petgraph::graph::DiGraph<SymbolNode, DependencyEdge>,
}`,
      verificationStrategy: 'Synthetische 100k Zeilen Codebase; Verifikation auf Zyklenerkennung und Zero Memory Leaks.'
    }
  },
  {
    id: 'vendor-af-agent-loop',
    name: 'AF Multi-Turn Agent Orchestrator & State Machine',
    path: '/workspace/projects/bkg-af/vendor/agent-orchestrator',
    category: 'vendor-af',
    status: 'reference-only',
    architecture: 'Python/Celery Event-Driven Workflow mit Redis-State-Store und Jinja2 Prompt-Templates.',
    features: [
      'Multi-Phase State Transitions (Plan -> Act -> Verify -> Reflect)',
      'Subagent Task Spawning & Barrier Synchronisation',
      'Tool Execution Sandbox mit Timeout Enforcer',
      'Self-Correction Loop bei Syntax- oder Testfehlern'
    ],
    uiUxConcepts: 'Schritt-für-Schritt Fortschrittsanzeige, Terminal-Log-Stream, Rollback-Button bei Abweichung.',
    dataModels: 'AgentContext { session_id, current_phase, tool_history, memory_buffer }, ToolResult<T, E>',
    interfaces: 'Celery Redis Broker, Python subprocess Sandbox.',
    algorithms: 'Finite State Machine (FSM) mit guarded Transitions, Backoff-Retry mit exponentiellem Jitter, Token-Budget-Tracking.',
    dependencies: ['pydantic', 'celery', 'redis', 'langchain-core', 'jinja2'],
    licenseAndOrigin: 'Apache 2.0 (bkg-af Vendor Snapshot v1.4.1)',
    relevanceForBkgForge: 'Die strikte Phasentrennung als unumstößliche Zustandsmaschine schützt vor voreiligen Code-Modifikationen.',
    rustReimplementationPlan: {
      targetCrateOrModule: 'bkgforge_agent::state_machine::{State, Event, AgentMachine}',
      conceptToExtract: 'Typgestützte Zustandsmaschine in Rust mit exhaustiver Match-Prüfung zur Compile-Zeit.',
      rejectionList: [
        'Kein Python/Celery Stack',
        'Keine ungetypten Tool-Outputs (Any/dict)',
        'Keine stillschweigenden Exception-Swallows',
        'Kein LangChain-Ballast'
      ],
      idiomaticRustTraits: `pub enum AgentPhase {
    Inventory(InventoryReport),
    Analysis(AnalysisMatrix),
    Design(ArchitecturePlan),
    Implementation(DiffSummary),
    Verification(TestRunOutcome),
    Done,
}
pub trait PhaseTransition {
    type Next;
    fn advance(self, evidence: PhaseEvidence) -> Result<Self::Next, TransitionError>;
}`,
      verificationStrategy: 'Property-based Testing (proptest) für unzulässige Zustandssprünge; Timeout-Härteprüfungen mit Mock-Tools.'
    }
  },
  {
    id: 'vendor-ffm-context-synthesis',
    name: 'FFM Context Window Synthesizer & Token Pruner',
    path: '/workspace/projects/bkg-ffm/vendor/context-engine',
    category: 'vendor-ffm',
    status: 'reference-only',
    architecture: 'Go Microservice mit TF-IDF Ranking und harter Token-Abschneidung.',
    features: [
      'Exakte Token-Kosten-Kalkulation per LLM Provider',
      'Syntactic Boundary Preservation (schneidet nicht mitten in Signaturen)',
      'Multi-File Snippet Assembly mit Import-Tracing',
      'Relevance Scoring basierend auf User-Query'
    ],
    uiUxConcepts: 'Kontext-Budget-Gauge (z.B. 14.200 / 32.000 Tokens) mit Dateigrößen-Heatmap.',
    dataModels: 'ContextChunk { path, byte_range, token_count, relevance_score, is_pinned }',
    interfaces: 'gRPC / HTTP REST Protobuf.',
    algorithms: 'Knapsack-Optimierung für Token-Budgetierung, AST-Block-Preserving Truncation, Cosine Similarity.',
    dependencies: ['tiktoken-go', 'blevesearch/bleve/v2'],
    licenseAndOrigin: 'BSD-3-Clause (bkg-ffm Vendor Snapshot v0.4.0)',
    relevanceForBkgForge: 'Granulares Token-Budgeting mit syntaktischer Integritätsgarantie schützt vor zerschnittenem Kontext.',
    rustReimplementationPlan: {
      targetCrateOrModule: 'bkgforge_core::prompt::context::ContextBudgetManager',
      conceptToExtract: 'Deterministischer Rucksack-Algorithmus zur Kontext-Zusammenstellung mit garantierter AST-Ganzheit.',
      rejectionList: [
        'Kein separater Go-Daemon',
        'Kein ungenaues Token-Approximieren durch Zeichenlänge / 4',
        'Kein Verlust von übergeordneten Scope-Informationen'
      ],
      idiomaticRustTraits: `pub struct ContextWindowBudget {
    max_tokens: usize,
    reserved_for_completion: usize,
    pinned_chunks: Vec<CodeChunk>,
}
pub trait ContextSynthesizer {
    fn synthesize(&self, query: &str, candidates: &[CandidateFile]) -> Result<SynthesizedContext, BudgetError>;
}`,
      verificationStrategy: 'Standardisierte Benchmark-Codebases; Validierung, dass alle Chunks syntaktisch valide AST-Knoten bleiben.'
    }
  },
  {
    id: 'vendor-af-verification-harness',
    name: 'AF Real Verification & E2E Validation Harness',
    path: '/workspace/projects/bkg-af/vendor/verification-harness',
    category: 'vendor-af',
    status: 'reference-only',
    architecture: 'Bash/Python Docker-Wrapper mit Regex-Parsen von Compiler-Logs.',
    features: [
      'Compilation Status Check',
      'Test Output Verifier (prüft tatsächliche Assertion-Zahlen > 0)',
      'Git Diff Regression Scanner',
      'Artifact Checksum Generator'
    ],
    uiUxConcepts: 'Detaillierter Verifikations-Report mit Ampel-Status (Grün/Gelb/Rot) und klickbaren Fehlermeldungen mit Zeilennummern.',
    dataModels: 'VerificationRun { exit_code, passed_assertions, failed_assertions, duration_ms, modified_files }',
    interfaces: 'Docker Engine API, Subprocess Runner.',
    algorithms: 'Compiler-Log Parsing, Diff Churn Ratio Calculation, Exit Code Trapping.',
    dependencies: ['pytest', 'docker-py', 'gitpython'],
    licenseAndOrigin: 'MIT License (bkg-af Vendor Snapshot v2.1.0)',
    relevanceForBkgForge: 'Die strikte Ablehnung von Scheinerfolgen ("Compiles" ist kein Erfolg, "Looks correct" ist kein Test).',
    rustReimplementationPlan: {
      targetCrateOrModule: 'bkgforge_verify::pipeline::VerificationEngine',
      conceptToExtract: 'Streng typisierte Verifikations-Pipeline mit Prüfung des tatsächlichen Durchstichs (UI -> API -> Backend -> Service -> DB -> Response -> UI).',
      rejectionList: [
        'Kein primitives Regex-Grep auf stdout',
        'Keine unkontrollierten Shell-Scripts ohne Sandboxing',
        'Keine Duldung von Test-Dateien mit 0 Assertions'
      ],
      idiomaticRustTraits: `pub struct TestEvidence {
    pub executed_assertions: u64,
    pub real_e2e_path_verified: bool,
    pub regressions_detected: Vec<String>,
}
pub trait Verifier {
    fn verify_deliverable(&self, deliverable: &Deliverable) -> Result<TestEvidence, VerificationFailure>;
}`,
      verificationStrategy: 'Integrationstests, die gezielt Dummy-Tests einschleusen und verifizieren, dass bKGForge diese als unvollständig zurückweist.'
    }
  },
  {
    id: 'vendor-ffm-task-decomposer',
    name: 'FFM Hierarchical Task Decomposer & WBS Generator',
    path: '/workspace/projects/bkg-ffm/vendor/task-decomposer',
    category: 'vendor-ffm',
    status: 'reference-only',
    architecture: 'JavaScript-basierte rekursive Zerlegung mit heuristischen Keyword-Matches.',
    features: [
      'Ambiguity Detection in Natural Language',
      'Subtask Dependency Ordering',
      'Acceptance Criteria Synthesizer',
      'Non-Goal Isolator'
    ],
    uiUxConcepts: 'Hierarchischer Baum mit verschachtelten Checklisten und Prioritäts-Flags.',
    dataModels: 'TaskNode { id, title, prerequisites: string[], acceptanceCriteria: string[], nonGoals: string[] }',
    interfaces: 'TypeScript SDK.',
    algorithms: 'Topological Sort for Task Execution Order, Semantic Keyword Inconsistency Matrix.',
    dependencies: ['natural', 'toposort', 'lodash'],
    licenseAndOrigin: 'MIT License (bkg-ffm Vendor Snapshot v1.1.2)',
    relevanceForBkgForge: 'Automatisierte Identifikation von impliziten Annahmen und expliziten Non-Goals zur Vermeidung von Scope Creep.',
    rustReimplementationPlan: {
      targetCrateOrModule: 'bkgforge_planner::wbs::TaskDagBuilder',
      conceptToExtract: 'Deterministischer Task-DAG Generator mit formaler Validierung zirkulärer Abhängigkeiten und Lücken-Erkennung.',
      rejectionList: [
        'Keine ungenauen JS NLP-Bibliotheken',
        'Keine Vermischung von Geschäftslogik und UI-State',
        'Kein stillschweigendes Ergänzen erfundener APIs'
      ],
      idiomaticRustTraits: `pub struct WorkBreakdownNode {
    pub id: TaskId,
    pub title: String,
    pub dependencies: Vec<TaskId>,
    pub acceptance_criteria: Vec<String>,
}
pub trait TaskDecomposer {
    fn decompose(&self, intent: &str) -> Result<Vec<WorkBreakdownNode>, DecompositionError>;
}`,
      verificationStrategy: 'Synthetische Aufgaben-Szenarien mit absichtlich widersprüchlichen Anforderungen zur Validierung der Fehlererkennung.'
    }
  }
];
