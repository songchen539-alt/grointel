// GroIntel Cognitive Kernel — Learning Trace
import { LearningTrace, PredictionValidation, OutcomeComparison, LearningInsight, KernelCorrection, ConfidenceUpdate } from "./learning_types";

let traceCounter = 0;
function genId(): string { return "lt_" + (++traceCounter).toString(16).padStart(6, "0"); }

export class LearningTraceRecorder {
  private traces: Map<string, LearningTrace> = new Map();

  record(
    predictionId: string,
    validation: PredictionValidation,
    comparison: OutcomeComparison,
    insight: LearningInsight,
    corrections: KernelCorrection[],
    confidenceUpdates: ConfidenceUpdate[],
  ): LearningTrace {
    const trace: LearningTrace = {
      id: genId(),
      prediction_id: predictionId,
      validation,
      comparison,
      insight,
      corrections,
      confidence_updates: confidenceUpdates,
      created_at: new Date().toISOString(),
    };
    this.traces.set(trace.id, trace);
    return trace;
  }

  getTrace(id: string): LearningTrace | null {
    return this.traces.get(id) || null;
  }

  getTracesByPrediction(predictionId: string): LearningTrace[] {
    return Array.from(this.traces.values()).filter(t => t.prediction_id === predictionId);
  }

  getAll(): LearningTrace[] {
    return Array.from(this.traces.values());
  }

  clear(): void {
    this.traces.clear();
  }
}
