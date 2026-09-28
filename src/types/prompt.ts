export type PromptMode =
  | 'quick'
  | 'coding'
  | 'feature'
  | 'bugfix'
  | 'architecture'
  | 'review'
  | 'audit'
  | 'refactor'
  | 'research'
  | 'production'
  | 'migration'
  | 'security'
  | 'testing'
  | 'documentation'
  | 'custom';

export interface PromptModeInfo {
  id: PromptMode;
  label: string;
  description: string;
  badge: string;
  iconName: string;
  suggestedFocus: string;
}

export interface VendorReferenceLink {
  vendorId: string;
  vendorName: string;
  sourceRepo: string;
  conceptToExtract: string;
  whatToReject: string[];
  bkgForgeRustTarget: string;
}

export interface RequirementStructure {
  // Core Pipeline Fields
  intent: string;
  objective: string;
  context: string;
  project: {
    root: string;
    name: string;
    stack: string[];
  };
  scope: {
    inScope: string[];
    outOfScope: string[];
    nonGoals: string[];
  };
  inputs: string[];
  outputs: string[];
  requirements: {
    functional: string[];
    architecture: string[];
    implementation: string[];
    security: string[];
    testing: string[];
    documentation: string[];
  };
  constraints: string[];
  architectureRules: string[];
  implementationRules: string[];
  testingRequirements: string[];
  verificationRequirements: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  risks: string[];
  safeAssumptions: string[];
  unresolvedQuestions: string[];
  vendorReferences: VendorReferenceLink[];
  definitionOfDone: string[];

  // Snake_case aliases to ensure full compliance with exact API requirements
  architecture?: string[];
  implementation_requirements?: string[];
  security_requirements?: string[];
  testing_requirements?: string[];
  documentation_requirements?: string[];
  acceptance_criteria?: string[];
  non_goals?: string[];
  unresolved_questions?: string[];
}

export interface VendorModule {
  id: string;
  name: string;
  sourceLocation: string;
  targetVendorPath: string;
  category: 'repo-analysis' | 'agent-orchestration' | 'context-synthesis' | 'verification' | 'tooling' | 'storage';
  description: string;
  inventoryStructure: string[];
  architectureAnalysis: string;
  features: string[];
  uiUxConcepts: string;
  dataModelsAndInterfaces: string;
  algorithmsAndConcepts: string;
  dependencies: string[];
  licenseAndOrigin: string;
  relevantIdeaForBkgForge: string;
  rustReimplementationPlan: {
    conceptToExtract: string;
    rejectionList: string[];
    rustModuleDesign: string;
    traitsAndTypes: string;
    verificationStrategy: string;
  };
}

export interface PromptVersion {
  id: string;
  version: string;
  timestamp: string;
  rawInput: string;
  mode: PromptMode;
  structured: RequirementStructure;
  masterPrompt: string;
  changeSummary: string;
  qualityScore: number;
}

export interface QualityAuditResult {
  score: number; // 0-100
  rating: 'exceptional' | 'solid' | 'needs_work' | 'critical';
  ambiguities: string[];
  contradictions: string[];
  missingAcceptanceCriteria: string[];
  missingTests: string[];
  scopeRisks: string[];
  hiddenAssumptions: string[];
  unverifiableClaims: string[];
  actionableRecommendations: string[];
}
