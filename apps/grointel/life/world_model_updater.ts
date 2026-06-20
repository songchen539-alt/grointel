// LIFE-1 — World Model Updater
import { WorldChangeEvent } from "./life_types";
import { KnowledgeRevision } from "./life_types";

export class WorldModelUpdater {
  private counter = 0;
  private events: WorldChangeEvent[] = [];

  apply(revisions: KnowledgeRevision[]): WorldChangeEvent[] {
    const changes: WorldChangeEvent[] = [];
    for (const rev of revisions) {
      const ev: WorldChangeEvent = {
        id: "wce_" + (++this.counter).toString(16).padStart(6, "0"),
        change_type: rev.revision_type, entity_id: rev.hypothesis_id,
        before: { confidence: rev.previous_confidence },
        after: { confidence: rev.new_confidence },
        reason: rev.reason, timestamp: new Date().toISOString(),
      };
      this.events.push(ev);
      changes.push(ev);
    }
    return changes;
  }

  getAll(): WorldChangeEvent[] { return this.events; }
  count(): number { return this.events.length; }
}
