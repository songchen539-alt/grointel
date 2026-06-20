// GroIntel ROS-5 — Long-term Reasoner
import { LongTermImpact } from "./wisdom_types";

export class LongTermReasoner {
  evaluate(decision: string, current_knowledge_quality = 60, current_trust = 70): LongTermImpact {
    const desc = decision.toLowerCase();

    const knowledgeQuality1y = Math.min(100, current_knowledge_quality + (desc.includes("learn") || desc.includes("explore") ? 15 : 5));
    const trust1y = Math.min(100, current_trust + (desc.includes("trust") || desc.includes("safe") ? 10 : (desc.includes("optimize") || desc.includes("aggressive") ? -10 : 0)));
    const compoundLearning3y = Math.min(100, (knowledgeQuality1y + trust1y) / 2 + (desc.includes("learn") ? 10 : 0));
    const strategicOptionality3y = desc.includes("explore") || desc.includes("expand") ? 80 : (desc.includes("optimize") ? 60 : 70);
    const resilience10y = Math.round((knowledgeQuality1y + trust1y + compoundLearning3y + strategicOptionality3y) / 4);

    const composite = Math.round((knowledgeQuality1y + trust1y + compoundLearning3y + strategicOptionality3y + resilience10y) / 5);

    return {
      knowledge_quality_1y: knowledgeQuality1y,
      trust_1y: trust1y,
      compound_learning_3y: compoundLearning3y,
      strategic_optionality_3y: strategicOptionality3y,
      resilience_10y: resilience10y,
      composite,
    };
  }
}
