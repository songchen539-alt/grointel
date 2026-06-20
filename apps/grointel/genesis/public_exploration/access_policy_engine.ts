// GENESIS-2 — Access Policy Engine
import { AccessEvaluation, PublicSource } from "./exploration_types";

export class AccessPolicyEngine {
  evaluate(source: PublicSource): AccessEvaluation {
    const violations: string[] = [];

    if (source.estimated_cost > 0 && !source.url.includes("api.")) {
      violations.push("Paid API — requires budget allocation");
    }
    if (source.type === "social_profile" && !source.url.includes("twitter.com")) {
      violations.push("Social profile requires public account verification");
    }
    if (source.type === "news" && source.url.includes("paywall")) {
      violations.push("News source may have paywall restrictions");
    }

    const allowed = violations.length === 0;
    return { source_id: source.id, allowed, reason: allowed ? "Access granted" : "Access restricted", policy_violations: violations };
  }
}
