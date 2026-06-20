// GroIntel DATA-3 — Activity Normalizer
import { GrowthActivity, ActivityCategory, ActivityStatus } from "./activity_types";

export class ActivityNormalizer {
  normalize(category: ActivityCategory, name: string, objective: string, ownerId: string, channels: string[], region: string, industry: string): GrowthActivity {
    return {
      id: "act_" + (++ActivityNormalizer.counter).toString(16).padStart(6, "0"),
      category, name, objective, owner_id: ownerId, participant_ids: [], channels,
      region, industry, duration_days: 30, status: "planned",
      created_at: new Date().toISOString(), started_at: null, completed_at: null, validated_at: null, updated_at: new Date().toISOString(),
      confidence: 50, version: 1,
      history: [{ timestamp: new Date().toISOString(), change: "Created", status: "planned", confidence: 50 }],
    };
  }
  private static counter = 0;
}
