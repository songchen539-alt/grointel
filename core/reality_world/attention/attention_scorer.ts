// GroIntel RWS-2 — Attention Scorer
import { WorldEvent } from "../reality_stream/world_types";
import { Goal } from "../goals/goal_types";

export class AttentionScorer {
  score(event: WorldEvent, goals: Goal[]): {
    goal_alignment: number;
    novelty: number;
    urgency: number;
    impact: number;
    uncertainty: number;
    risk: number;
    opportunity: number;
    total: number;
  } {
    const goalAlignment = this.calcGoalAlignment(event, goals);
    const novelty = this.calcNovelty(event);
    const urgency = this.calcUrgency(event);
    const impact = this.calcImpact(event);
    const uncertainty = this.calcUncertainty(event);
    const risk = this.calcRisk(event);
    const opportunity = this.calcOpportunity(event);

    const total = Math.round(
      goalAlignment * 0.25 + novelty * 0.15 + urgency * 0.15 +
      impact * 0.15 + uncertainty * 0.10 + risk * 0.10 + opportunity * 0.10
    );

    return { goal_alignment: goalAlignment, novelty, urgency, impact, uncertainty, risk, opportunity, total };
  }

  private calcGoalAlignment(event: WorldEvent, goals: Goal[]): number {
    if (goals.length === 0) return 30;
    const matches = goals.filter(g => g.target_domains.includes(event.domain)).length;
    return Math.min(100, matches * 20 + 20);
  }

  private calcNovelty(event: WorldEvent): number {
    return event.importance > 80 ? 80 : event.importance > 60 ? 60 : event.importance > 40 ? 40 : 20;
  }

  private calcUrgency(event: WorldEvent): number {
    return event.importance > 80 ? 85 : event.importance > 60 ? 65 : event.importance > 40 ? 45 : 25;
  }

  private calcImpact(event: WorldEvent): number {
    return event.confidence > 80 ? event.importance : Math.round(event.importance * 0.7);
  }

  private calcUncertainty(event: WorldEvent): number {
    return Math.max(0, 100 - event.confidence);
  }

  private calcRisk(event: WorldEvent): number {
    const riskTypes = ["layoff", "decline", "risk", "threat", "regulation", "conflict"];
    return riskTypes.some(t => event.event_type.includes(t)) ? Math.min(100, event.importance + 10) : 20;
  }

  private calcOpportunity(event: WorldEvent): number {
    const oppTypes = ["funding", "growth", "launch", "expansion", "milestone", "breakthrough"];
    return oppTypes.some(t => event.event_type.includes(t)) ? Math.min(100, event.importance + 10) : 20;
  }
}
