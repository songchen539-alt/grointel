// GroIntel RWS-2 — Attention Engine
import { AttentionFilter } from "./attention_filter";
import { AttentionAllocator } from "./attention_allocator";
import { AttentionTraceRecorder } from "./attention_trace";
import { AttentionDecision, AttentionDecisionValue, AttentionTrace } from "./attention_types";
import { WorldEvent } from "../reality_stream/world_types";
import { Goal } from "../goals/goal_types";

export class AttentionEngine {
  public filter: AttentionFilter;
  public allocator: AttentionAllocator;
  public trace: AttentionTraceRecorder;

  constructor() {
    this.filter = new AttentionFilter();
    this.allocator = new AttentionAllocator();
    this.trace = new AttentionTraceRecorder();
  }

  evaluate(event: WorldEvent, goals: Goal[]): { decision: AttentionDecision; trace: AttentionTrace; shouldProcess: boolean } {
    const decision = this.filter.evaluate(event, goals);
    const trace = this.allocator.allocate(event, decision, goals);
    this.trace.record(trace);
    return { decision, trace, shouldProcess: this.filter.shouldProcess(decision) };
  }

  getStats(): { total: number; ignored: number; monitored: number; processed: number; escalated: number; deepAnalyzed: number } {
    const all = this.trace.getTraces(100000);
    return {
      total: all.length,
      ignored: all.filter(t => t.decision === "ignore").length,
      monitored: all.filter(t => t.decision === "monitor").length,
      processed: all.filter(t => t.decision === "process").length,
      escalated: all.filter(t => t.decision === "escalate").length,
      deepAnalyzed: all.filter(t => t.decision === "deep_analyze").length,
    };
  }
}
