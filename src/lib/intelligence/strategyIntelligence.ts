// GroIntel Strategy Intelligence Engine
// Core reasoning layer: Business Knowledge + Goals + Constraints -> Strategy
// Outputs capability requirements, NOT specific partners

import { GrowthGoal } from "./goalIntelligence";
import { ConstraintModel } from "./constraintIntelligence";

export interface StrategyResult {
  reasoning: string;
  capabilityStack: string[];
  priorities: { item: string; importance: "critical" | "high" | "medium" | "low"; reasoning: string }[];
  riskFactors: { risk: string; likelihood: "high" | "medium" | "low"; mitigation: string }[];
  confidenceScore: number;
}

// Capability ontology — maps goals + constraints to required capabilities
const GOAL_CAPABILITY_MAP: Record<string, { capabilities: string[]; reasoning: string }> = {
  "market-expansion": {
    capabilities: ["market_research", "localization", "partner_development", "demand_generation", "pr", "regional_sales"],
    reasoning: "Entering a new market requires understanding the landscape first, then localizing your offering, building partnerships, and generating demand through local channels.",
  },
  "revenue-growth": {
    capabilities: ["pricing_strategy", "sales_enablement", "channel_development", "customer_success", "upsell_programs"],
    reasoning: "Revenue growth requires optimizing pricing, enabling sales teams, developing new channels, and expanding existing customer relationships.",
  },
  "brand-awareness": {
    capabilities: ["pr", "content_marketing", "social_media", "thought_leadership", "events", "influencer_relations"],
    reasoning: "Brand awareness is built through earned media, compelling content, social presence, and thought leadership that establishes credibility in target segments.",
  },
  "demand-generation": {
    capabilities: ["paid_ads", "content_marketing", "seo", "email_marketing", "webinar", "lead_nurturing"],
    reasoning: "Demand generation combines paid and organic channels to capture attention at the top of funnel and nurture prospects through consideration.",
  },
  "community-growth": {
    capabilities: ["community_management", "developer_relations", "events", "content", "social_media", "advocacy_programs"],
    reasoning: "Community growth requires dedicated management, valuable programming, events that bring people together, and advocacy programs that turn members into champions.",
  },
  "product-adoption": {
    capabilities: ["product_marketing", "user_onboarding", "customer_education", "analytics", "user_research"],
    reasoning: "Product adoption improves through clear value communication, intuitive onboarding, ongoing education, and data-driven optimization of the user experience.",
  },
  "customer-acquisition": {
    capabilities: ["paid_ads", "seo", "sales", "partnerships", "content", "conversion_optimization"],
    reasoning: "Customer acquisition requires a multi-channel approach combining paid acquisition, organic search, direct sales, partnerships, and optimized conversion funnels.",
  },
  "hiring": {
    capabilities: ["employer_branding", "recruitment_marketing", "culture_building", "talent_sourcing"],
    reasoning: "Hiring success depends on employer brand visibility, targeted recruitment marketing, and a strong culture that attracts and retains talent.",
  },
  "partnership-development": {
    capabilities: ["partner_development", "bd", "channel_marketing", "co_selling", "partner_programs"],
    reasoning: "Partnerships require dedicated business development to identify opportunities, structured programs to enable partners, and co-selling motions to drive revenue.",
  },
  "localization": {
    capabilities: ["localization", "cultural_consulting", "regional_pr", "translation", "cross_cultural_marketing"],
    reasoning: "Localization goes beyond translation to include cultural adaptation, regional market understanding, and locally relevant marketing and PR.",
  },
  "fundraising": {
    capabilities: ["investor_relations", "pitch_deck", "financial_modeling", "legal", "due_diligence_prep"],
    reasoning: "Fundraising requires compelling narrative development, robust financial models, legal preparation, and structured investor outreach.",
  },
  "customer-retention": {
    capabilities: ["customer_success", "onboarding", "support", "community", "education", "feedback_systems"],
    reasoning: "Retention improves through proactive customer success, excellent onboarding, responsive support, community belonging, and continuous education.",
  },
};

// Timeline-aware priority ordering
const TIMELINE_PHASES: Record<string, string[]> = {
  short: ["foundation", "execution"],
  medium: ["research", "foundation", "execution", "optimization"],
  long: ["research", "planning", "foundation", "execution", "scaling", "optimization"],
};

const PHASE_LABELS: Record<string, string> = {
  research: "Market Research & Intelligence",
  planning: "Strategic Planning",
  foundation: "Foundation Setup",
  execution: "Core Execution",
  scaling: "Scaling & Optimization",
  optimization: "Ongoing Optimization",
};

export function generateStrategy(
  goals: GrowthGoal[],
  constraints: ConstraintModel,
  businessContext: string,
): StrategyResult {
  if (goals.length === 0) {
    return {
      reasoning: "No specific goals provided. A growth strategy cannot be generated without defined objectives.",
      capabilityStack: [],
      priorities: [],
      riskFactors: [],
      confidenceScore: 0,
    };
  }

  // Collect capabilities across all goals
  const allCapabilities = new Set<string>();
  const reasoningParts: string[] = [];
  const priorities: StrategyResult["priorities"] = [];
  const riskFactors: StrategyResult["riskFactors"] = [];
  const capabilityScores: Record<string, number> = {};

  // Analyze each goal
  for (const goal of goals) {
    const mapping = GOAL_CAPABILITY_MAP[goal.slug];
    if (!mapping) continue;

    // Add capabilities
    for (const cap of mapping.capabilities) {
      allCapabilities.add(cap);
      capabilityScores[cap] = (capabilityScores[cap] || 0) + 1;
    }

    reasoningParts.push(mapping.reasoning);

    // Goal-specific risk factors
    if (goal.slug === "market-expansion") {
      riskFactors.push({ risk: "Market entry timing and local competition", likelihood: "medium", mitigation: "Phase entry with pilot market first" });
    }
    if (goal.slug === "brand-awareness") {
      riskFactors.push({ risk: "Brand message may not resonate in early stages", likelihood: "medium", mitigation: "Test messaging with target segments before scaling" });
    }
    if (goal.slug === "community-growth") {
      riskFactors.push({ risk: "Community may not reach critical mass", likelihood: "high", mitigation: "Seed with existing advocates and set realistic milestones" });
    }
    if (goal.slug === "localization") {
      riskFactors.push({ risk: "Cultural misalignment in new markets", likelihood: "medium", mitigation: "Engage local experts and run pilot before full launch" });
    }
  }

  // Sort capabilities by frequency across goals
  const rankedCapabilities = Object.entries(capabilityScores)
    .sort((a, b) => b[1] - a[1])
    .map(([cap]) => cap);

  // Build reasoning
  const contextIntro = `Based on analysis of ${businessContext || "the business context"} with ${goals.length} goal${goals.length > 1 ? "s" : ""}: ${goals.map(g => g.name).join(", ")}.`;
  const constraintContext = buildConstraintContext(constraints);
  const fullReasoning = `${contextIntro}\n\n${constraintContext ? constraintContext + "\n\n" : ""}${reasoningParts.join("\n\n")}\n\nRecommended capability stack prioritizes ${rankedCapabilities.slice(0, 3).join(", ")} based on impact across selected goals.`;

  // Determine timeline phase
  const urgency = constraints.urgency || "medium";
  const timelineKey = urgency === "high" ? "short" : urgency === "low" ? "long" : "medium";
  const phases = TIMELINE_PHASES[timelineKey] || TIMELINE_PHASES.medium;

  // Build execution priorities
  let priorityIndex = 0;
  for (const phase of phases) {
    const phaseLabel = PHASE_LABELS[phase] || phase;
    const phaseCaps = rankedCapabilities.slice(priorityIndex, priorityIndex + Math.ceil(rankedCapabilities.length / phases.length));
    for (const cap of phaseCaps) {
      const imp = priorityIndex <= 1 ? "critical" as const : priorityIndex <= 3 ? "high" as const : "medium" as const;
      priorities.push({
        item: cap.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        importance: imp,
        reasoning: `Required in the ${phaseLabel} phase for ${goals.map(g => g.name).join(", ")}`,
      });
      priorityIndex++;
    }
  }

  // Add general risk factors
  if (constraints.budgetMin && constraints.budgetMin < 50000 && goals.length > 2) {
    riskFactors.push({ risk: "Budget may be insufficient for multiple goals", likelihood: "high", mitigation: "Prioritize goals and stagger execution timeline" });
  }
  if (constraints.urgency === "high") {
    riskFactors.push({ risk: "High urgency may compromise depth of execution", likelihood: "medium", mitigation: "Focus on highest-impact capabilities first" });
  }

  const confidenceScore = calculateStrategyConfidence(goals, constraints, rankedCapabilities.length);

  return {
    reasoning: fullReasoning,
    capabilityStack: rankedCapabilities,
    priorities,
    riskFactors: deduplicateRiskFactors(riskFactors),
    confidenceScore,
  };
}

function buildConstraintContext(constraints: ConstraintModel): string {
  const parts: string[] = [];
  if (constraints.budgetMin && constraints.budgetMax) {
    parts.push(`Budget range: $${constraints.budgetMin.toLocaleString()} - $${constraints.budgetMax.toLocaleString()}`);
  }
  if (constraints.timeline) parts.push(`Timeline: ${constraints.timeline}`);
  if (constraints.regions.length > 0) parts.push(`Target regions: ${constraints.regions.join(", ")}`);
  if (constraints.companyStage) parts.push(`Company stage: ${constraints.companyStage}`);
  if (constraints.urgency) parts.push(`Urgency: ${constraints.urgency}`);
  return parts.length > 0 ? `Constraints: ${parts.join(" | ")}` : "";
}

function calculateStrategyConfidence(goals: GrowthGoal[], constraints: ConstraintModel, capabilityCount: number): number {
  let score = 30;
  score += Math.min(30, goals.length * 10);
  if (constraints.confidence > 50) score += 15;
  if (constraints.budgetMin && constraints.budgetMin > 0) score += 10;
  if (constraints.regions.length > 0) score += 5;
  if (capabilityCount > 3) score += 10;
  return Math.min(100, score);
}

function deduplicateRiskFactors(factors: StrategyResult["riskFactors"]): StrategyResult["riskFactors"] {
  const seen = new Set<string>();
  return factors.filter(f => {
    const key = f.risk.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
