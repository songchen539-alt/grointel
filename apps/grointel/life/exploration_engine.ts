// LIFE-1 — Exploration Engine
import { ExplorationPlan, ExplorationTask, CuriosityQuestion } from "./life_types";

export class ExplorationEngine {
  private counter = 0;

  plan(question: CuriosityQuestion): ExplorationPlan {
    const capabilities = this.determineCapabilities(question);
    const tasks: ExplorationTask[] = capabilities.map((cap, i) => ({
      id: "ext_" + (++this.counter).toString(16).padStart(6, "0"),
      question_id: question.id, capability: cap,
      priority: i + 1, status: "pending",
    }));
    return { id: "exp_" + (++this.counter).toString(16).padStart(6, "0"), question_id: question.id, tasks, created_at: new Date().toISOString() };
  }

  private determineCapabilities(question: CuriosityQuestion): string[] {
    const q = question.question.toLowerCase();
    if (q.includes("hiring")) return ["observe_jobs", "observe_linkedin", "observe_news"];
    if (q.includes("funding")) return ["observe_funding", "observe_news", "observe_social"];
    if (q.includes("confidence")) return ["observe_reviews", "observe_traffic", "observe_pricing"];
    if (q.includes("pattern")) return ["observe_website", "observe_product", "observe_community"];
    if (q.includes("similar")) return ["observe_website", "observe_social", "observe_news"];
    return ["observe_website"];
  }
}
