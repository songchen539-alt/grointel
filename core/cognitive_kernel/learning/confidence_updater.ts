// GroIntel Cognitive Kernel — Confidence Updater
import { KernelCorrection, ConfidenceUpdate } from "./learning_types";

let confCounter = 0;
let confVersions = new Map<string, number>();
function genId(): string { return "cu_" + (++confCounter).toString(16).padStart(6, "0"); }
function getVersion(targetId: string): number {
  const v = (confVersions.get(targetId) || 0) + 1;
  confVersions.set(targetId, v);
  return v;
}

export class ConfidenceUpdater {
  private history: Map<string, ConfidenceUpdate[]> = new Map();

  generateUpdate(correction: KernelCorrection, currentConfidence: number): ConfidenceUpdate {
    let newConfidence = currentConfidence;

    switch (correction.correction_type) {
      case "increase_confidence":
        newConfidence = Math.min(100, currentConfidence + 10);
        break;
      case "decrease_confidence":
        newConfidence = Math.max(0, currentConfidence - 20);
        break;
      case "adjust_rule_weight":
        newConfidence = Math.round(currentConfidence * 0.95);
        break;
      default:
        break;
    }

    const update: ConfidenceUpdate = {
      id: genId(),
      correction_id: correction.id,
      target_id: correction.target_id,
      target_type: correction.target_type,
      confidence_before: currentConfidence,
      confidence_after: newConfidence,
      version: getVersion(correction.target_id),
      created_at: new Date().toISOString(),
    };

    if (!this.history.has(correction.target_id)) {
      this.history.set(correction.target_id, []);
    }
    this.history.get(correction.target_id)!.push(update);

    return update;
  }

  getHistory(targetId: string): ConfidenceUpdate[] {
    return this.history.get(targetId) || [];
  }

  getLatestConfidence(targetId: string): number | null {
    const updates = this.history.get(targetId);
    return updates && updates.length > 0 ? updates[updates.length - 1].confidence_after : null;
  }

  clear(): void {
    this.history.clear();
    confVersions.clear();
  }
}
