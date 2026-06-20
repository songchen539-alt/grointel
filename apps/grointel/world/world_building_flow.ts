// WORLD-1 — World Building Flow
import { RealityCoverageTracker } from "./reality_coverage_tracker";
import { KnowledgeQualityTracker } from "./knowledge_quality_tracker";
import { DecisionAccuracyTracker } from "./decision_accuracy_tracker";
import { BusinessOutcomeTracker } from "./business_outcome_tracker";
import { WorldGapEngine } from "./world_gap_engine";
import { WorldPriorityEngine } from "./world_priority_engine";
import { WorldProgressReporter } from "./world_progress_reporter";
import { WorldBuildingEvent, WorldUnderstandingScore, WorldProgress } from "./world_metrics_types";

export class WorldBuildingFlow {
  public readonly coverage = new RealityCoverageTracker();
  public readonly quality = new KnowledgeQualityTracker();
  public readonly decisions = new DecisionAccuracyTracker();
  public readonly outcomes = new BusinessOutcomeTracker();
  public readonly gaps = new WorldGapEngine();
  public readonly priorities = new WorldPriorityEngine();
  public readonly reporter = new WorldProgressReporter();
  public events: WorldBuildingEvent[] = [];
  private eventCounter = 0;

  recordEvent(type: string, domain: string, details: string, delta: number): WorldBuildingEvent {
    const ev: WorldBuildingEvent = { id: "wbe_" + (++this.eventCounter).toString(16).padStart(6, "0"), type, domain, details, delta, timestamp: new Date().toISOString() };
    this.events.push(ev);
    return ev;
  }

  runFullUpdate(): { score: WorldUnderstandingScore; topGaps: any[]; topPriorities: any[]; progress: WorldProgress } {
    const coverageMetrics = this.coverage.getAll();
    const qualityMetrics = this.quality.getAll();

    const avgCov = this.coverage.averageCoverage();
    const avgQual = this.quality.averageQuality();
    const avgDec = this.decisions.averageAccuracy();
    const totalOutcomes = this.outcomes.totalImprovements();

    const score: WorldUnderstandingScore = {
      reality_coverage: avgCov, knowledge_quality: avgQual,
      decision_accuracy: avgDec, business_outcomes: Math.min(100, totalOutcomes * 5),
      overall: Math.round((avgCov + avgQual + avgDec + Math.min(100, totalOutcomes * 5)) / 4),
    };

    const detectedGaps = this.gaps.detect(coverageMetrics, qualityMetrics);
    const topPriorities = this.priorities.prioritize(detectedGaps);
    const progress = this.reporter.generate(this.events, detectedGaps.length, topPriorities.map(p => p.priority));

    return { score, topGaps: detectedGaps.slice(0, 5), topPriorities: topPriorities.slice(0, 5), progress };
  }
}
