// GroIntel DATA-5 — Cause Extractor
import { CauseNode, CauseEdge, CauseNodeType, CauseEdgeType } from "./cause_types";

export class CauseExtractor {
  private nc = 0; private ec = 0;

  createNode(type: CauseNodeType, name: string, confidence = 50): CauseNode {
    return { id: "cn_" + (++this.nc).toString(16).padStart(6, "0"), type, name, confidence, created_at: new Date().toISOString() };
  }

  createEdge(sourceId: string, targetId: string, type: CauseEdgeType, strength = 50, confidence = 50, evidence: string[] = []): CauseEdge {
    return { id: "ce_" + (++this.ec).toString(16).padStart(6, "0"), source_id: sourceId, target_id: targetId, type, strength, confidence, evidence, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
}
