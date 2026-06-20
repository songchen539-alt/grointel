// GENESIS-2 — Signal Extraction Engine
import { ExtractedSignal, ExplorationPlan } from "./exploration_types";

export class SignalExtractionEngine {
  private counter = 0;

  extract(plan: ExplorationPlan, mockContent: Record<string, string> = {}): ExtractedSignal[] {
    const signals: ExtractedSignal[] = [];

    for (const step of plan.steps) {
      const content = mockContent[step.source_type] || `Mock content from ${step.source_type} for ${plan.entity_name}`;
      const type = this.detectSignalType(step.source_type);
      signals.push({
        id: "sig_" + (++this.counter).toString(16).padStart(6, "0"),
        plan_id: plan.id, source_type: step.source_type,
        signal_type: type, content,
        confidence: 60, evidence: `Source: ${step.url}`,
        timestamp: new Date().toISOString(),
      });
    }

    return signals;
  }

  private detectSignalType(sourceType: string): string {
    const map: Record<string, string> = {
      website: "company_info", blog: "content_velocity", jobs: "hiring_signal",
      github: "technology_adoption", news: "news_mention", documentation: "product_update",
      product_updates: "product_launch", community: "community_growth", changelog: "product_update",
      rss: "content_velocity", atom: "content_velocity", social_profile: "social_growth",
    };
    return map[sourceType] || "general_observation";
  }
}
