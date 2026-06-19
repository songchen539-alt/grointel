// GroIntel Cognitive Kernel — Core Types

export type EntityType = "company" | "creator" | "agency" | "community" | "software" | "investor" | "university" | "media" | "government" | "unknown";

export type EventType =
  | "OBSERVATION_RECEIVED"
  | "SIGNAL_EXTRACTED"
  | "MEMORY_UPDATED"
  | "CONTRADICTION_DETECTED"
  | "REASONING_COMPLETED"
  | "PREDICTION_CREATED"
  | "DECISION_PROPOSED"
  | "ACTION_RECOMMENDED"
  | "FEEDBACK_RECEIVED"
  | "LEARNING_COMPLETED"
  | "REALITY_FIDELITY_CHANGED"
  | "KERNEL_INITIALIZED"
  | "KERNEL_ERROR";

export type SignalSource = "observation" | "interaction" | "inference" | "prediction" | "feedback" | "external_api" | "user_input";

export type ContradictionStatus = "detected" | "investigating" | "resolved" | "superseded";

export type MemoryOperation = "create" | "update" | "link" | "compress";

export interface KernelConfig {
  kernel_id: string;
  kernel_version: string;
  created_at: string;
  reality_fidelity_threshold: number;
  prediction_validation_enabled: boolean;
  auto_contradiction_detection: boolean;
}

export interface RealityEvent {
  id: string;
  type: EventType;
  source: SignalSource;
  payload: unknown;
  confidence: number;
  timestamp: string;
  trace_id: string;
}

export interface Observation {
  id: string;
  event_id: string;
  source: SignalSource;
  entity_id: string | null;
  entity_type: EntityType | null;
  signal_type: string;
  raw_data: unknown;
  extracted_data: Record<string, unknown>;
  confidence: number;
  evidence_links: string[];
  created_at: string;
}

export interface Signal {
  id: string;
  observation_id: string;
  entity_id: string | null;
  signal_type: string;
  strength: number;
  novelty: number;
  urgency: number;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  external_ids: Record<string, string>;
  attributes: Record<string, unknown>;
  capabilities: Record<string, number>;
  relationships: string[];
  trust_score: number;
  confidence: number;
  first_observed_at: string;
  last_updated_at: string;
}

export interface Relationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  type: string;
  strength: number;
  confidence: number;
  evidence_links: string[];
  first_observed_at: string;
  last_updated_at: string;
}

export interface MemoryRecord {
  id: string;
  entity_id: string | null;
  observation_id: string;
  event_type: EventType;
  content: unknown;
  evidence_links: string[];
  contradiction_links: string[];
  confidence_before: number;
  confidence_after: number;
  version: number;
  operation: MemoryOperation;
  created_at: string;
}

export interface ReasoningTrace {
  id: string;
  trigger_event_id: string;
  input_observations: string[];
  input_memories: string[];
  reasoning_steps: ReasoningStep[];
  conclusion: ReasoningConclusion;
  created_at: string;
}

export interface ReasoningStep {
  step_number: number;
  operation: string;
  input: unknown;
  output: unknown;
  confidence: number;
}

export interface ReasoningConclusion {
  claim: string;
  evidence_summary: string;
  assumptions: string[];
  contradictions: string[];
  confidence: number;
  unknowns: string[];
  next_questions: string[];
}

export interface Prediction {
  id: string;
  target_entity_id: string;
  target_field: string;
  predicted_state: unknown;
  current_state: unknown;
  time_horizon_seconds: number;
  probability: number;
  confidence: number;
  evidence: string[];
  assumptions: string[];
  unknown_variables: string[];
  status: "active" | "validated" | "invalidated" | "expired";
  validation_due_at: string;
  actual_outcome: unknown | null;
  prediction_error: number | null;
  created_at: string;
  validated_at: string | null;
}

export interface Decision {
  id: string;
  trigger_event_id: string;
  options: DecisionOption[];
  selected_option: string;
  reasoning_trace_id: string;
  confidence: number;
  risk_assessment: RiskAssessment;
  created_at: string;
}

export interface DecisionOption {
  label: string;
  expected_outcome: unknown;
  probability: number;
  confidence: number;
  risks: string[];
  tradeoffs: string[];
}

export interface RiskAssessment {
  overall_risk: number;
  risk_factors: { factor: string; severity: number; likelihood: number }[];
  mitigation_suggestions: string[];
}

export interface ActionProposal {
  id: string;
  decision_id: string;
  action_type: string;
  target_entity_id: string;
  description: string;
  expected_impact: string;
  confidence: number;
  status: "proposed" | "approved" | "executed" | "failed";
  created_at: string;
  executed_at: string | null;
  outcome: string | null;
}

export interface Feedback {
  id: string;
  prediction_id: string | null;
  action_proposal_id: string | null;
  expected_outcome: unknown;
  actual_outcome: unknown;
  error: number;
  source: string;
  confidence: number;
  created_at: string;
}

export interface LearningRecord {
  id: string;
  feedback_id: string;
  prediction_id: string | null;
  previous_belief: unknown;
  updated_belief: unknown;
  correction_reason: string;
  confidence_delta: number;
  policy_updates: string[];
  created_at: string;
}

export interface ContradictionRecord {
  id: string;
  claim_a: string;
  claim_b: string;
  evidence_a: string[];
  evidence_b: string[];
  severity: number;
  status: ContradictionStatus;
  resolution: string | null;
  next_action: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface RealityFidelityScore {
  overall: number;
  components: {
    evidence_strength: number;
    source_quality: number;
    freshness: number;
    contradiction_rate: number;
    prediction_accuracy: number;
    cross_validation: number;
    uncertainty: number;
  };
  confidence: number;
  missing_evidence: string[];
  recommended_next_observation: string[];
  calculated_at: string;
}

export interface KernelState {
  kernel_id: string;
  status: "initializing" | "running" | "paused" | "error";
  uptime_seconds: number;
  total_events_processed: number;
  active_entities: string[];
  active_signals: string[];
  active_predictions: string[];
  unresolved_questions: string[];
  known_unknowns: string[];
  confidence_map: Record<string, number>;
  contradiction_map: Record<string, string[]>;
  learning_queue: string[];
  memory_index_size: number;
  reality_fidelity_score: RealityFidelityScore | null;
  last_event_at: string;
  started_at: string;
}

export interface ModuleRegistration {
  name: string;
  version: string;
  capabilities: string[];
  input_events: EventType[];
  output_events: EventType[];
  health_status: "healthy" | "degraded" | "unhealthy";
  last_run_at: string | null;
  error_count: number;
}

export interface KernelMetrics {
  reality_fidelity: number;
  prediction_accuracy: number;
  learning_velocity: number;
  knowledge_density: number;
  contradiction_resolution_rate: number;
  observation_freshness: number;
  memory_growth: number;
  decision_confidence: number;
  civilization_contribution_score: number;
  recorded_at: string;
}
