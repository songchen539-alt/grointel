// GENESIS-1 — Autonomous Scheduler
import { SchedulerPlan, AttentionTopic } from "./genesis_types";

export class AutonomousScheduler {
  private counter = 0;

  createJobs(attentionTopics: AttentionTopic[], pendingQuestions: number, activeHypotheses: number, staleMemories: number): SchedulerPlan[] {
    const plans: SchedulerPlan[] = [];

    for (const at of attentionTopics.slice(0, 3)) {
      plans.push({ id: "plan_" + (++this.counter).toString(16).padStart(6, "0"), company_memory_id: at.entity_id, capabilities: ["observe_website", "observe_linkedin", "observe_news"], priority: Math.round(at.score), reason: at.reason });
    }

    if (pendingQuestions > 0 || activeHypotheses > 0) {
      plans.push({ id: "plan_" + (++this.counter).toString(16).padStart(6, "0"), company_memory_id: "life_cycle", capabilities: ["observe_website"], priority: 60, reason: "Life cycle: pending questions/hypotheses" });
    }

    if (staleMemories > 0) {
      plans.push({ id: "plan_" + (++this.counter).toString(16).padStart(6, "0"), company_memory_id: "stale_refresh", capabilities: ["observe_website", "observe_news"], priority: 40, reason: `${staleMemories} stale memories need refresh` });
    }

    return plans;
  }
}
