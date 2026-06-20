// GroIntel ROS-5 — Judgement Engine
import { Judgement, JudgementVerdict, WisdomRecommendation } from "./wisdom_types";
import { PrincipleRegistry } from "./principle_registry";
import { ValueSystem } from "./value_system";

let jCounter = 0;
function genId(): string { return "judge_" + (++jCounter).toString(16).padStart(6, "0"); }

export class JudgementEngine {
  constructor(
    public readonly principles: PrincipleRegistry = new PrincipleRegistry(),
    public readonly values: ValueSystem = new ValueSystem(),
  ) {}

  judge(targetId: string, description: string): Judgement {
    const principleScores = this.principles.evaluateAgainst(description);
    const valueScores = this.values.evaluateAgainst(description);

    const principleAvg = Math.round(principleScores.reduce((s, p) => s + p.score, 0) / Math.max(1, principleScores.length));
    const valueAvg = Math.round(valueScores.reduce((s, v) => s + v.score, 0) / Math.max(1, valueScores.length));
    const compositeScore = Math.round(principleAvg * 0.6 + valueAvg * 0.4);

    const verdict = this.getVerdict(compositeScore);
    const recommendation = this.getRecommendation(verdict, description);

    return {
      id: genId(), target_id: targetId, target_description: description,
      principle_scores: principleScores.map(p => ({ principle_id: p.principle.id, score: p.score, reason: p.reason })),
      value_scores: valueScores.map(v => ({ value_id: v.value.id, score: v.score, reason: v.reason })),
      composite_score: compositeScore, verdict, recommendation, created_at: new Date().toISOString(),
    };
  }

  getVerdict(score: number): JudgementVerdict {
    if (score >= 85) return "pass";
    if (score >= 70) return "caution";
    if (score >= 50) return "warn";
    if (score >= 30) return "fail";
    return "defer";
  }

  private getRecommendation(verdict: JudgementVerdict, desc: string): string {
    switch (verdict) {
      case "pass": return "Proceed — aligns with all principles and values";
      case "caution": return "Proceed with awareness — minor concerns identified";
      case "warn": return "Review before proceeding — significant concerns identified";
      case "fail": return "Do not proceed — violates core principles";
      case "defer": return "Defer — insufficient information for judgement";
    }
  }
}
