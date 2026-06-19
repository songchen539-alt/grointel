// GroIntel Cognitive Kernel — State
import { KernelState, RealityFidelityScore } from "./kernel_types";

export class KernelStateManager {
  private state: KernelState;

  constructor(kernelId: string) {
    this.state = {
      kernel_id: kernelId,
      status: "initializing",
      uptime_seconds: 0,
      total_events_processed: 0,
      active_entities: [],
      active_signals: [],
      active_predictions: [],
      unresolved_questions: [],
      known_unknowns: [],
      confidence_map: {},
      contradiction_map: {},
      learning_queue: [],
      memory_index_size: 0,
      reality_fidelity_score: null,
      last_event_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    };
  }

  getState(): KernelState {
    return { ...this.state };
  }

  setStatus(status: KernelState["status"]): void {
    this.state.status = status;
  }

  incrementEvents(): void {
    this.state.total_events_processed++;
    this.state.last_event_at = new Date().toISOString();
  }

  updateUptime(): void {
    const start = new Date(this.state.started_at).getTime();
    this.state.uptime_seconds = Math.floor((Date.now() - start) / 1000);
  }

  addEntity(id: string): void {
    if (!this.state.active_entities.includes(id)) {
      this.state.active_entities.push(id);
    }
  }

  addSignal(id: string): void {
    if (!this.state.active_signals.includes(id)) {
      this.state.active_signals.push(id);
    }
  }

  addPrediction(id: string): void {
    if (!this.state.active_predictions.includes(id)) {
      this.state.active_predictions.push(id);
    }
  }

  removePrediction(id: string): void {
    this.state.active_predictions = this.state.active_predictions.filter(p => p !== id);
  }

  addQuestion(question: string): void {
    if (!this.state.unresolved_questions.includes(question)) {
      this.state.unresolved_questions.push(question);
    }
  }

  resolveQuestion(question: string): void {
    this.state.unresolved_questions = this.state.unresolved_questions.filter(q => q !== question);
  }

  addUnknown(unknown: string): void {
    if (!this.state.known_unknowns.includes(unknown)) {
      this.state.known_unknowns.push(unknown);
    }
  }

  updateConfidence(key: string, value: number): void {
    this.state.confidence_map[key] = value;
  }

  addContradiction(entityId: string, contradictionId: string): void {
    if (!this.state.contradiction_map[entityId]) {
      this.state.contradiction_map[entityId] = [];
    }
    this.state.contradiction_map[entityId].push(contradictionId);
  }

  addToLearningQueue(id: string): void {
    this.state.learning_queue.push(id);
  }

  removeFromLearningQueue(id: string): void {
    this.state.learning_queue = this.state.learning_queue.filter(q => q !== id);
  }

  updateMemoryIndexSize(size: number): void {
    this.state.memory_index_size = size;
  }

  updateRealityFidelity(score: RealityFidelityScore): void {
    this.state.reality_fidelity_score = score;
  }

  getSnapshot(): KernelState {
    this.updateUptime();
    return this.getState();
  }
}
