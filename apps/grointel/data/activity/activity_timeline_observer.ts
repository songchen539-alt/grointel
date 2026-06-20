// GroIntel DATA-3 — Activity Timeline Observer
import { GrowthTimeline } from "./activity_types";

export class ActivityTimelineObserver {
  private counter = 0;
  observe(activityId: string, plannedStart: string, plannedEnd: string, actualStart: string | null, actualEnd: string | null, durationDays: number, timeToResultDays: number): GrowthTimeline {
    return { id:"atl_"+(++this.counter).toString(16).padStart(6,"0"), activity_id: activityId, planned_start: plannedStart, planned_end: plannedEnd, actual_start: actualStart, actual_end: actualEnd, duration_days: durationDays, time_to_result_days: timeToResultDays };
  }
}
