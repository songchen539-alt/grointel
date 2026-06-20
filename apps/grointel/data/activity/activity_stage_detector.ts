// GroIntel DATA-3 — Activity Stage Detector
import { ActivityStatus, GrowthActivity } from "./activity_types";

export class ActivityStageDetector {
  private static transitions: Record<ActivityStatus, ActivityStatus[]> = {
    planned: ["started"], started: ["executing"], executing: ["completed", "failed"],
    completed: ["validated", "failed"], validated: [], failed: [], cancelled: [],
  };

  canTransition(from: ActivityStatus, to: ActivityStatus): boolean {
    return ActivityStageDetector.transitions[from]?.includes(to) || false;
  }

  transition(activity: GrowthActivity, to: ActivityStatus): void {
    if (!this.canTransition(activity.status, to)) {
      throw new Error(`Invalid activity transition: ${activity.status} -> ${to}`);
    }
    const now = new Date().toISOString();
    activity.status = to;
    activity.updated_at = now;
    if (to === "started") activity.started_at = now;
    if (to === "completed" || to === "failed" || to === "cancelled") activity.completed_at = now;
    if (to === "validated") activity.validated_at = now;
    activity.version++;
    activity.history.push({ timestamp: now, change: `Status: ${to}`, status: to, confidence: activity.confidence });
  }
}
