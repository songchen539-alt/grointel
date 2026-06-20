// GroIntel GENESIS-1 — Genesis Types
export type KernelState = "created" | "running" | "paused" | "stopped";
export type AttentionTopic = { entity_id: string; score: number; reason: string; timestamp: string; };
export type SchedulerPlan = { id: string; company_memory_id: string; capabilities: string[]; priority: number; reason: string; };

export interface Event { topic: string; data: Record<string, unknown>; timestamp: string; }
export interface EnergyBudget { remaining: number; total: number; utilization: number; pressure: "low" | "medium" | "high" | "critical"; }
export interface WorldCycle { cycle_count: number; last_observation_cycle: number; last_learning_cycle: number; last_decision_cycle: number; last_world_update: number; }
export interface KernelMetrics { observations_completed: number; questions_generated: number; hypotheses_validated: number; knowledge_revisions: number; world_updates: number; decisions_improved: number; queue_throughput: number; runtime_utilization: number; attention_shifts: number; }
export interface KernelEvent { id: string; event: string; details: string; timestamp: string; }
