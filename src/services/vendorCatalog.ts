import { VendorModule } from '../types/prompt';

export const INITIAL_VENDOR_MODULES: VendorModule[] = [
  {
    id: 'vendor-ffm-ast-graph',
    name: 'FFM Repo Graph & AST Semantic Indexer',
    sourceLocation: '/workspace/projects/bkg-ffm/vendor/repo-graph-ast',
    targetVendorPath: '/srv/bkg/workspace/current/bKGForge/vendor/repo-graph-ast',
    category: 'repo-analysis',
    description: 'Statische Quellcode- und Graphanalyse zur Erfassung von Abhängigkeiten, Symbolen und Modulhierarchien.',
    inventoryStructure: [
      'src/indexer/ast_walker.ts',
      'src/graph/dependency_dag.ts',
      'src/cache/sqlite_store.ts',
      'src/api/query_router.ts',
      'package.json (18 transitive dependencies, node-gyp native bindings)'
    ],
    architectureAnalysis: 'Monolithischer TypeScript-Node.js Service mit schwergewichtigen Regex- und Babel-AST Parsern. Koppelt Parsing, In-Memory Graph und Disk-Persistence eng aneinander.',
    features: [
      'Multi-Language Symbol Extraction (TS, JS, Rust, Python)',
      'Cross-File Reference Resolution',
      'Call Graph & Import Graph Visualization',
      'Cyclic Dependency Detection'
    ],
    uiUxConcepts: 'Interaktiver Node-Link-Graph mit Zoom/Pan und Symbol-Hover-Karten.',
    dataModelsAndInterfaces: 'GraphNode { id, symbol, file, line, kind }, Edge { source, target, relationshipType }',
    algorithmsAndConcepts: "Depth-First Search (DFS) für Zykluserkennung, Tarjan's Strongly Connected Components, Levenshtein Fuzzy Symbol Matching.",
    dependencies: ['@babel/parser', 'better-sqlite3', 'graphlib', 'typescript', 'chokidar'],
    licenseAndOrigin: 'MIT License (Quelle: bkg-ffm Vendor Snapshot v0.8.2)',
    relevantIdeaForBkgForge: 'Die Idee der zweistufigen Symbolauflösung (schneller Shllow-Scan gefolgt von On-Demand Tiefen-AST) und des typisierten Abhängigkeitsgraphen ist für bKGForge hochgradig wertvoll.',
    rustReimplementationPlan: {
      conceptToExtract: 'Deterministischer, speicheroptimierter gerichteter azyklischer Graph (DAG) für Code-Symbole und Modul-Deltas mit Null-Kopien-Slicing.',
      rejectionList: [
        'Kein Node.js/Babel Runtime-Overhead',
        'Kein unkontrolliertes Memory-Leaking in V8 Garbage Collector',
        'Keine Copy/Paste der TypeScript-Heuristiken',
        'Kein dynamisches SQLite Schema ohne Typgarantie'
      ],
      rustModuleDesign: 'bkgforge_core::analysis::graph::SymbolDag unter Verwendung von petgraph::graph::DiGraph und tree-sitter/syn.',
      traitsAndTypes: `pub trait SymbolExtractor {
    fn extract_symbols<'a>(&self, source: &'a str) -> Result<Vec<Symbol<'a>>, ExtractionError>;
}
pub struct SymbolGraph {
    inner: petgraph::graph::DiGraph<SymbolNode, DependencyEdge>,
}`,
      verificationStrategy: 'Echte Unit-Tests mit reproduzierbaren Rust- und TS-Fixtures, Zykluserkennungstestsuite und Memory-Benchmark gegen 100k Zeilen Code.'
    }
  },
  {
    id: 'vendor-af-agent-loop',
    name: 'AF Multi-Turn Agent Orchestrator & State Machine',
    sourceLocation: '/workspace/projects/bkg-af/vendor/agent-orchestrator',
    targetVendorPath: '/srv/bkg/workspace/current/bKGForge/vendor/agent-orchestrator',
    category: 'agent-orchestration',
    description: 'Zustandsbasierte Steuerung von interaktiven Coding- und Review-Agenten mit Tool-Dispatching.',
    inventoryStructure: [
      'core/engine/agent_runner.py',
      'core/state/transition_matrix.json',
      'core/tools/sandbox_executor.py',
      'core/prompts/templates/system_base.jinja2',
      'requirements.txt (langchain, pydantic v1, celery, redis)'
    ],
    architectureAnalysis: 'Python/Celery Event-Driven Workflow. Hohe Laufzeit-Latenz durch dynamische Typisierung und unvollständige Fehlerrückführungen bei Tool-Timeouts.',
    features: [
      'Multi-Phase State Transitions (Plan -> Act -> Verify -> Reflect)',
      'Subagent Task Spawning & Barrier Sync',
      'Tool Execution Sandbox mit Timeout Enforcer',
      'Self-Correction Loop bei Syntax- oder Lint-Fehlern'
    ],
    uiUxConcepts: 'Phasen-Fortschrittsbalken, Live-Stream von Token- und Tool-Aufrufen, Rollback-Button bei Abweichung.',
    dataModelsAndInterfaces: 'AgentContext { session_id, current_phase, tool_history, memory_buffer }, ToolResult<T, E>',
    algorithmsAndConcepts: 'Finite State Machine (FSM) mit guarded Transitions, Backoff-Retry mit exponentiellem Jitter, Token-Budget-Tracking.',
    dependencies: ['pydantic', 'celery', 'redis', 'langchain-core', 'jinja2'],
    licenseAndOrigin: 'Apache 2.0 (Quelle: bkg-af Vendor Snapshot v1.4.1)',
    relevantIdeaForBkgForge: 'Die strikte Phasentrennung (Inventory -> Analysis -> Design -> Implementation -> Testing -> Verification -> Documentation -> Review) als unumstößliche Zustandsmaschine.',
    rustReimplementationPlan: {
      conceptToExtract: 'Typgestützte Zustandsmaschine in Rust mit exhaustiver Match-Prüfung zur Compile-Zeit.',
      rejectionList: [
        'Kein Python/Celery Stack',
        'Keine ungetypten Tool-Outputs (Any / dict)',
        'Keine stillschweigenden Exception-Swallows',
        'Kein LangChain-Ballast'
      ],
      rustModuleDesign: 'bkgforge_agent::state_machine::{State, Event, AgentMachine} basierend auf Tokio MPSC und State-Pattern.',
      traitsAndTypes: `pub enum AgentPhase {
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
    sourceLocation: '/workspace/projects/bkg-ffm/vendor/context-engine',
    targetVendorPath: '/srv/bkg/workspace/current/bKGForge/vendor/context-engine',
    category: 'context-synthesis',
    description: 'Berechnung optimaler Kontextfenster für LLM-Prompts durch Relevanzgewichtung und Token-Budgeting.',
    inventoryStructure: [
      'context/pruner.go',
      'context/token_counter.go',
      'context/relevance_ranker.go',
      'go.mod (tiktoken-go, bleve)'
    ],
    architectureAnalysis: 'Go-Microservice mit heuristischem TF-IDF Ranking und harter Token-Abschneidung. Neigt dazu, kritische Typdefinitionen wegzuschneiden.',
    features: [
      'Exact Token Cost Estimation per LLM Provider',
      'Syntactic Boundary Preservation (schneidet nicht mitten in Funktionen)',
      'Multi-File Snippet Assembly mit Import-Tracing',
      'Relevance Scoring basierend auf User-Query'
    ],
    uiUxConcepts: 'Kontext-Budget-Gauge (z.B. 14.200 / 32.000 Tokens belegt) mit Dateigrößen-Heatmap.',
    dataModelsAndInterfaces: 'ContextChunk { path, byte_range, token_count, relevance_score, is_pinned }',
    algorithmsAndConcepts: 'Knapsack-Optimierung für Token-Budgetierung, AST-Block-Preserving Truncation, Cosine Similarity.',
    dependencies: ['tiktoken-go', 'blevesearch/bleve/v2'],
    licenseAndOrigin: 'BSD-3-Clause (Quelle: bkg-ffm Vendor Snapshot v0.4.0)',
    relevantIdeaForBkgForge: 'Granulares Token-Budgeting mit syntaktischer Integritätsgarantie (niemals Funktionssignaturen oder Struct-Definitionen unvollständig übergeben).',
    rustReimplementationPlan: {
      conceptToExtract: 'Deterministischer Rucksack-Algorithmus zur Kontext-Zusammenstellung mit garantierter AST-Ganzheit.',
      rejectionList: [
        'Kein separater Go-Daemon (in Rust integrieren)',
        'Kein ungenaues Token-Approximieren durch Zeichenlänge / 4',
        'Kein Verlust von übergeordneten Scope-Informationen'
      ],
      rustModuleDesign: 'bkgforge_core::prompt::context::ContextBudgetManager mit zero-copy String-Slicing.',
      traitsAndTypes: `pub struct ContextWindowBudget {
    max_tokens: usize,
    reserved_for_completion: usize,
    pinned_chunks: Vec<CodeChunk>,
}
pub trait ContextSynthesizer {
    fn synthesize(&self, query: &str, candidates: &[CandidateFile]) -> Result<SynthesizedContext, BudgetError>;
}`,
      verificationStrategy: 'Testen gegen standardisierte Benchmark-Codebases; Validierung, dass alle Chunks gültige AST-Knoten bleiben.'
    }
  },
  {
    id: 'vendor-af-verification-harness',
    name: 'AF Real Verification & E2E Validation Harness',
    sourceLocation: '/workspace/projects/bkg-af/vendor/verification-harness',
    targetVendorPath: '/srv/bkg/workspace/current/bKGForge/vendor/verification-harness',
    category: 'verification',
    description: 'Automatisierte Verifikation von Code-Deltas: Build, Testsuite, Integration-Check und Invarianz-Prüfung.',
    inventoryStructure: [
      'runner/pipeline.sh',
      'runner/diff_validator.py',
      'runner/assertion_matrix.yaml',
      'docker/sandbox.Dockerfile'
    ],
    architectureAnalysis: 'Bash/Python Docker-Wrapper mit fragilem Regex-Parsen von Compiler-Outputs. Erkennt Fake-Tests und ungetestete Pfade nur unzureichend.',
    features: [
      'Compilation Status Check (kein blindes "Looks Good")',
      'Test Output Verifier (prüft tatsächliche Assertion-Zahlen > 0)',
      'Git Diff Regression Scanner (prüft ob unbeteiligte Dateien modifiziert wurden)',
      'Artifact Checksum Generator'
    ],
    uiUxConcepts: 'Detaillierter Verifikations-Report mit Ampel-Status (Grün/Gelb/Rot) und klickbaren Fehlermeldungen mit Zeilennummern.',
    dataModelsAndInterfaces: 'VerificationRun { exit_code, passed_assertions, failed_assertions, duration_ms, modified_files }',
    algorithmsAndConcepts: 'Compiler-Log Parsing, Diff Churn Ratio Calculation, Exit Code Trapping.',
    dependencies: ['pytest', 'docker-py', 'gitpython'],
    licenseAndOrigin: 'MIT License (Quelle: bkg-af Vendor Snapshot v2.1.0)',
    relevantIdeaForBkgForge: 'Die strikte Ablehnung von Scheinerfolgen: "Compiles ist kein vollständiger Erfolg, Looks correct ist kein Test, Should work ist kein Ergebnis".',
    rustReimplementationPlan: {
      conceptToExtract: 'Streng typisierte Verifikations-Pipeline mit Prüfung des tatsächlichen Durchstichs (UI -> API -> Backend -> Service -> DB -> Response -> UI).',
      rejectionList: [
        'Kein primitives Regex-Grep auf stdout',
        'Keine unkontrollierten Shell-Scripts ohne Sandboxing',
        'Keine Duldung von Test-Dateien mit 0 Assertions'
      ],
      rustModuleDesign: 'bkgforge_verify::pipeline::VerificationEngine mit Prozessisolierung und Output-Telemetrie.',
      traitsAndTypes: `pub struct TestEvidence {
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
    sourceLocation: '/workspace/projects/bkg-ffm/vendor/task-decomposer',
    targetVendorPath: '/srv/bkg/workspace/current/bKGForge/vendor/task-decomposer',
    category: 'tooling',
    description: 'Zerlegung vager Kundenwünsche in hierarchische Work Breakdown Structures (WBS) mit Abhängigkeitsprüfung.',
    inventoryStructure: [
      'decomposer/dag_builder.ts',
      'decomposer/prompt_rules.json',
      'decomposer/complexity_estimator.ts'
    ],
    architectureAnalysis: 'JavaScript-basierte rekursive Zerlegung mit statischen Heuristiken. Gute Erkennung von Widersprüchen, aber schwache Typisierung.',
    features: [
      'Ambiguity Detection in Natural Language',
      'Subtask Dependency Ordering',
      'Acceptance Criteria Synthesizer',
      'Non-Goal Isolator'
    ],
    uiUxConcepts: 'Hierarchischer Baum mit verschachtelten Checklisten und Prioritäts-Flags.',
    dataModelsAndInterfaces: 'TaskNode { id, title, prerequisites: string[], acceptanceCriteria: string[], nonGoals: string[] }',
    algorithmsAndConcepts: 'Topological Sort for Task Execution Order, Semantic Keyword Inconsistency Matrix.',
    dependencies: ['natural', 'toposort', 'lodash'],
    licenseAndOrigin: 'MIT License (Quelle: bkg-ffm Vendor Snapshot v1.1.2)',
    relevantIdeaForBkgForge: 'Automatisierte Identifikation von impliziten Annahmen und expliziten Non-Goals zur Vermeidung von Scope Creep.',
    rustReimplementationPlan: {
      conceptToExtract: 'Deterministischer Task-DAG Generator mit formaler Validierung zirkulärer Abhängigkeiten und Lücken-Erkennung.',
      rejectionList: [
        'Keine ungenauen JS NLP-Bibliotheken',
        'Keine Vermischung von Geschäftslogik und UI-State',
        'Kein stillschweigendes Ergänzen erfundener APIs'
      ],
      rustModuleDesign: 'bkgforge_planner::wbs::TaskDagBuilder mit Typprüfung auf unaufgelöste Voraussetzungen.',
      traitsAndTypes: `pub struct WorkBreakdownNode {
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

export const BKG_FORGE_PROJECT_PROFILE = {
  rootPath: '/srv/bkg/workspace/current/bKGForge',
  name: 'bKGForge',
  description: 'Enterprise-Grade Knowledge Graph & Agentic Engineering Platform',
  vendorSources: [
    {
      sourceDir: '/workspace/projects/bkg-ffm/vendor',
      targetDir: '/srv/bkg/workspace/current/bKGForge/vendor/bkg-ffm',
      role: 'Research & Technical Concept Reference'
    },
    {
      sourceDir: '/workspace/projects/bkg-af/vendor',
      targetDir: '/srv/bkg/workspace/current/bKGForge/vendor/bkg-af',
      role: 'Agentic Framework & Execution Patterns Reference'
    }
  ],
  stack: {
    backend: 'Rust (tokio, petgraph, syn, serde, axum/actix, tracing)',
    frontend: 'React 19 (TypeScript, Tailwind CSS, motion)',
    storage: 'Embedded Graph / RocksDB / Sled / SQLite (Zero external SaaS dependency)',
    architecture: 'Clean Hexagonal / Ports & Adapters Architecture, Idiomatic Strong Types, Zero-Copy Slicing'
  },
  goldenRules: [
    'Keine Copy/Paste-Übernahme von Vendor-Code',
    'Keine Stubs, keine TODO-Platzhalter, keine simulierten Antworten',
    'Result-basierte Fehlerbehandlung in Rust ohne unwrap() im Produktivpfad',
    'Tatsächliche Verifikation (UI -> API -> Backend -> Service -> Storage -> Response)',
    'Explizite Kennzeichnung sicherer Annahmen vs. ungelöster Fragen'
  ]
};
