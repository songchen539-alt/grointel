// LIFE-1 — Curiosity Engine
import { CuriosityQuestion } from "./life_types";

export class CuriosityEngine {
  private counter = 0;

  generate(signals: string[], confidences: { entity: string; confidence: number }[], memoryCount: number): CuriosityQuestion[] {
    const questions: CuriosityQuestion[] = [];

    if (signals.some(s => s.includes("hiring") || s.includes("jobs"))) {
      questions.push(this.make("Why did hiring change?", signals.join(", "), 70, confidences.map(c => c.entity)));
    }
    if (signals.some(s => s.includes("funding"))) {
      questions.push(this.make("What caused the funding event?", "funding_signal", 80, confidences.map(c => c.entity)));
    }
    if (confidences.some(c => c.confidence < 50)) {
      questions.push(this.make("Why did confidence decrease?", `low confidence: ${confidences.filter(c => c.confidence < 50).map(c => c.entity).join(",")}`, 65, confidences.filter(c => c.confidence < 50).map(c => c.entity)));
    }
    if (memoryCount > 0 && signals.length > 2) {
      questions.push(this.make("Could this become a reusable pattern?", `${signals.length} signals observed`, 55, []));
    }
    if (signals.length > 0) {
      questions.push(this.make("Which similar companies show the same pattern?", `signals: ${signals.slice(0, 3).join(", ")}`, 60, []));
    }

    return questions;
  }

  private make(question: string, source: string, confidence: number, entities: string[]): CuriosityQuestion {
    return { id: "cq_" + (++this.counter).toString(16).padStart(6, "0"), question, source, confidence, related_entities: entities, generated_at: new Date().toISOString() };
  }
}
