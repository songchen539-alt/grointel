// GroIntel LIFE-1 — Life Types
export type HypothesisStatus = "proposed" | "collecting_evidence" | "supported" | "rejected" | "archived";
export type RevisionType = "strengthened" | "weakened" | "split" | "merged" | "archived";
export type LifeEvent = "question_generated" | "hypothesis_created" | "exploration_planned" | "evidence_added" | "knowledge_revised" | "world_updated" | "decision_updated" | "memory_updated";

export interface CuriosityQuestion { id: string; question: string; source: string; confidence: number; related_entities: string[]; generated_at: string; }
export interface Hypothesis { id: string; statement: string; status: HypothesisStatus; confidence: number; evidence: string[]; related_entities: string[]; creation_reason: string; validation_history: { timestamp: string; status: HypothesisStatus; evidence_count: number; confidence: number }[]; created_at: string; updated_at: string; }
export interface ExplorationTask { id: string; question_id: string; capability: string; priority: number; status: "pending" | "completed" | "failed"; }
export interface ExplorationPlan { id: string; question_id: string; tasks: ExplorationTask[]; created_at: string; }
export interface Evidence { id: string; hypothesis_id: string; source: string; signal_type: string; content: string; confidence: number; timestamp: string; }
export interface KnowledgeRevision { id: string; hypothesis_id: string; revision_type: RevisionType; previous_confidence: number; new_confidence: number; reason: string; timestamp: string; }
export interface WorldChangeEvent { id: string; change_type: string; entity_id: string | null; before: Record<string, unknown>; after: Record<string, unknown>; reason: string; timestamp: string; }
export interface LifeMetrics { questions_generated: number; hypotheses_created: number; hypotheses_validated: number; hypotheses_rejected: number; evidence_collected: number; world_updates: number; knowledge_revisions: number; decision_improvements: number; }
export interface LifeEventEntry { id: string; event: LifeEvent; details: string; related_entity_id: string | null; timestamp: string; }
