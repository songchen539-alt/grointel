// WORLD-1 — World Gap Engine
import { WorldGap, RealityCoverageMetric, KnowledgeQualityMetric } from "./world_metrics_types";

export class WorldGapEngine {
  detect(coverage: RealityCoverageMetric[], quality: KnowledgeQualityMetric[]): WorldGap[] {
    const gaps: WorldGap[] = [];

    for (const c of coverage) {
      if (c.coverage_pct < 50) gaps.push({
        id: "gap_" + Math.random().toString(36).slice(2, 8), type: "coverage", description: `Low coverage in ${c.domain}: ${c.coverage_pct}%`, severity: c.coverage_pct < 20 ? "critical" : c.coverage_pct < 35 ? "high" : "medium", current_value: c.coverage_pct, target_value: 80, priority_score: Math.round((80 - c.coverage_pct) * 1.5),
      });
    }

    for (const q of quality) {
      if (q.stale_knowledge_pct > 30) gaps.push({
        id: "gap_" + Math.random().toString(36).slice(2, 8), type: "stale_knowledge", description: `${q.stale_knowledge_pct}% stale knowledge in ${q.domain}`, severity: q.stale_knowledge_pct > 50 ? "critical" : "high", current_value: q.stale_knowledge_pct, target_value: 10, priority_score: Math.round(q.stale_knowledge_pct * 2),
      });
      if (q.evidence_density < 30) gaps.push({
        id: "gap_" + Math.random().toString(36).slice(2, 8), type: "weak_evidence", description: `Low evidence density in ${q.domain}: ${q.evidence_density}`, severity: q.evidence_density < 15 ? "high" : "medium", current_value: q.evidence_density, target_value: 60, priority_score: Math.round((60 - q.evidence_density) * 1.2),
      });
    }

    return gaps.sort((a, b) => b.priority_score - a.priority_score);
  }
}
