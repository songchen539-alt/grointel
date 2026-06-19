// GroIntel GIE v1 Verification Script
// Tests: goal library, constraint extraction, strategy generation
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";

const stripeKnowledge = {
  business_identity: { name: "Stripe", industry: "Fintech / Payments", country: "US" },
  business_model: { type: "Platform", revenue_model: "Transaction-based", customers: ["Internet businesses", "SaaS"], scale: ">$10B revenue", funding_stage: "Public" },
  market: { overview: ["Global payment processing", "Embedded finance"] },
  goals: ["Expand enterprise segment", "Increase international revenue", "Launch banking services"],
  constraints: { budget: "Sufficient (public company)", timeline: "Ongoing" },
};

async function main() {
  console.log("=== Growth Intelligence Engine v1 Verification ===\n");

  // 1. Goal library
  console.log("1. Goal Library");
  const r1 = await fetch(BASE + "/api/goals");
  const d1 = await r1.json();
  console.log(`  Goals returned: ${d1.total} (expect 12)`);

  const r1b = await fetch(BASE + "/api/goals?slug=market-expansion");
  const d1b = await r1b.json();
  console.log(`  Goal by slug: ${d1b.goal?.name || "FAIL"}`);

  // 2. Goal suggestions
  console.log("\n2. Goal Suggestions from Business Knowledge");
  const r2 = await fetch(BASE + "/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessKnowledge: stripeKnowledge }),
  });
  const d2 = await r2.json();
  console.log(`  Suggestions: ${d2.suggestions?.length || 0} (expect > 0)`);
  if (d2.suggestions?.length > 0) {
    console.log(`  Top: ${d2.suggestions[0].goal.name} (${d2.suggestions[0].relevance}%)`);
  }

  // 3. Constraint extraction
  console.log("\n3. Constraint Extraction");
  const r3 = await fetch(BASE + "/api/constraints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessKnowledge: stripeKnowledge }),
  });
  const d3 = await r3.json();
  const c = d3.constraints || {};
  console.log(`  Stage: ${c.companyStage} | Budget: $${c.budgetMin}-$${c.budgetMax} | Regions: ${c.regions?.join(",")}`);
  console.log(`  Compliance: ${c.complianceNeeds?.join(",") || "none"} | Confidence: ${c.confidence}%`);

  // 4. Strategy generation
  console.log("\n4. Strategy Generation");
  const r4 = await fetch(BASE + "/api/strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goalSlugs: ["market-expansion", "brand-awareness"],
      businessKnowledge: stripeKnowledge,
    }),
  });
  const d4 = await r4.json();
  const s = d4.strategy || {};
  console.log(`  Reasoning: ${s.reasoning?.slice(0, 100)}...`);
  console.log(`  Capability stack: ${s.capabilityStack?.length || 0} items`);
  console.log(`  Priorities: ${s.priorities?.length || 0} items`);
  console.log(`  Risk factors: ${s.riskFactors?.length || 0} items`);
  console.log(`  Confidence: ${s.confidenceScore}%`);

  // 5. Strategy with single goal
  console.log("\n5. Strategy (single goal — localization)");
  const r5 = await fetch(BASE + "/api/strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goalSlugs: ["localization"],
      businessKnowledge: stripeKnowledge,
    }),
  });
  const d5 = await r5.json();
  const s5 = d5.strategy || {};
  console.log(`  Capabilities: ${s5.capabilityStack?.join(", ") || "none"}`);
  console.log(`  Confidence: ${s5.confidenceScore}%`);

  // 6. No goals (edge case)
  console.log("\n6. Edge case — no goals");
  const r6 = await fetch(BASE + "/api/strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalSlugs: [], businessKnowledge: stripeKnowledge }),
  });
  const d6 = await r6.json();
  console.log(`  Error: ${d6.error || "none"}`);
  console.log(`  Strategy empty: ${!d6.strategy}`);

  // 7. Invalid goal slug
  console.log("\n7. Edge case — invalid goal slug");
  const r7 = await fetch(BASE + "/api/strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalSlugs: ["nonexistent-goal"], businessKnowledge: stripeKnowledge }),
  });
  const d7 = await r7.json();
  console.log(`  Error: ${d7.error || "none"}`);

  console.log("\n=== Verification Complete ===");
}

main().catch(console.error);
