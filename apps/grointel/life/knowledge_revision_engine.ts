// LIFE-1 — Knowledge Revision Engine
import { KnowledgeRevision, RevisionType, Hypothesis } from "./life_types";
import { EvidenceAccumulator } from "./evidence_accumulator";
import { HypothesisManager } from "./hypothesis_manager";

export class KnowledgeRevisionEngine {
  private counter = 0;

  revise(manager: HypothesisManager, accumulator: EvidenceAccumulator): KnowledgeRevision[] {
    const revisions: KnowledgeRevision[] = [];
    for (const h of manager.getActive()) {
      const aggConf = accumulator.getAggregatedConfidence(h.id);
      if (aggConf === 0) continue;

      const prevConf = h.confidence;
      let type: RevisionType = "strengthened";
      let reason = "";

      if (aggConf > h.confidence + 10) { type = "strengthened"; reason = "New supporting evidence increases confidence"; }
      else if (aggConf < h.confidence - 15) { type = "weakened"; reason = "Contradictory evidence reduces confidence"; }
      else continue;

      const rev: KnowledgeRevision = { id: "krev_" + (++this.counter).toString(16).padStart(6, "0"), hypothesis_id: h.id, revision_type: type, previous_confidence: prevConf, new_confidence: aggConf, reason, timestamp: new Date().toISOString() };
      revisions.push(rev);
    }
    return revisions;
  }
}
