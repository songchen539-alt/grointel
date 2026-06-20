// GroIntel ROS-5 — Civilization Evaluator
import { CivilizationImpact } from "./wisdom_types";

export class CivilizationEvaluator {
  evaluate(decision: string): CivilizationImpact {
    const desc = decision.toLowerCase();

    const knowledgeGrowth = desc.includes("know") || desc.includes("learn") || desc.includes("explore") ? 85 : 60;
    const truthPreservation = desc.includes("truth") || desc.includes("honest") ? 90 : (desc.includes("optimize") ? 55 : 70);
    const trust = desc.includes("trust") || desc.includes("safe") ? 85 : (desc.includes("aggressive") ? 40 : 65);
    const collectiveIntelligence = desc.includes("share") || desc.includes("collaborate") || desc.includes("learn") ? 80 : 60;
    const humanBenefit = desc.includes("value") || desc.includes("benefit") || desc.includes("civil") ? 85 : 65;
    const longTermResilience = (knowledgeGrowth + truthPreservation + trust + collectiveIntelligence + humanBenefit) / 5 + 10;

    const composite = Math.round((knowledgeGrowth + truthPreservation + trust + collectiveIntelligence + humanBenefit + longTermResilience) / 6);

    return {
      knowledge_growth: knowledgeGrowth,
      truth_preservation: truthPreservation,
      trust,
      collective_intelligence: collectiveIntelligence,
      human_benefit: humanBenefit,
      long_term_resilience: Math.min(100, Math.round(longTermResilience)),
      composite,
    };
  }
}
