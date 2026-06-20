// GroIntel DATA-3 — Activity Entity Linker
import { GrowthActivity } from "./activity_types";

export class ActivityEntityLinker {
  link(activity: GrowthActivity, participantId: string): void {
    if (!activity.participant_ids.includes(participantId)) {
      activity.participant_ids.push(participantId);
    }
  }

  getLinkedEntityTypes(): string[] {
    return ["company", "agency", "creator", "software", "ai_agent", "community", "investor", "founder", "product", "capability"];
  }
}
