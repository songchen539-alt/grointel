// GroIntel ROS-4 — Knowledge Validation (reality/prediction/learning/human)
import { KnowledgeFact, KnowledgeValidation, KnowledgeStatus } from "./knowledge_types";

let vCounter = 0;
function genId(): string { return "kval_" + (++vCounter).toString(16).padStart(6, "0"); }

export class KnowledgeValidationEngine {
  validate(fact: KnowledgeFact, realityScore: number, predictionScore: number, learningScore: number, humanApproved = false): KnowledgeValidation {
    const composite = Math.round(realityScore * 0.4 + predictionScore * 0.25 + learningScore * 0.25 + (humanApproved ? 10 : 0));
    return {
      id: genId(), fact_id: fact.id,
      reality_score: realityScore, prediction_score: predictionScore,
      learning_score: learningScore, human_approved: humanApproved,
      composite_score: Math.min(composite, 100),
      validated_at: new Date().toISOString(),
    };
  }

  getStatusFromScore(score: number): KnowledgeStatus {
    if (score >= 80) return "stable";
    if (score >= 60) return "validated";
    if (score >= 40) return "candidate";
    if (score >= 20) return "deprecated";
    return "archived";
  }

  setStatus(fact: KnowledgeFact, validation: KnowledgeValidation): KnowledgeFact {
    const newStatus = this.getStatusFromScore(validation.composite_score);
    return { ...fact, validation_status: newStatus, confidence: validation.composite_score };
  }
}
