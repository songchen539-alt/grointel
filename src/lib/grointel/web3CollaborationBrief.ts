import type { Web3GrowthDecision, Web3GrowthDemand } from "./web3Decision";

type Partner = Web3GrowthDecision["recommendedConcretePartners"][number];

export interface Web3PartnerBrief {
  partnerId: string;
  partnerName: string;
  partnerIdentity: string;
  supplyType: string;
  fitScore: number;
  whyThisPartner: string;
  collaborationAngle: string;
  suggestedDeliverables: string[];
  outreachMessage: string;
  successMetrics: string[];
  riskControls: string[];
  qualificationQuestions: string[];
}

export interface Web3CollaborationBrief {
  briefTitle: string;
  objective: string;
  targetAudience: string;
  positioning: string;
  partnerShortlist: string[];
  partnerBriefs: Web3PartnerBrief[];
  campaignPlan: Array<{ phase: string; action: string; output: string }>;
  trackingPlan: string[];
  doNotDo: string[];
  nextActionChecklist: string[];
}

function compactList(items: Array<string | undefined>, fallback: string[], limit = 4) {
  const values = items
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => item.trim());
  return [...new Set(values.length > 0 ? values : fallback)].slice(0, limit);
}

function partnerRole(partner: Partner) {
  if (partner.supplyType === "media") return "turn the project story into credible education and distribution";
  if (partner.supplyType === "research") return "validate the thesis with high-intent research and protocol analysis";
  if (partner.supplyType === "security") return "reduce trust friction before public amplification";
  if (partner.supplyType === "community") return "activate culture-native communities with a tighter fit than broad ads";
  if (partner.supplyType === "platform") return "convert attention into measurable onboarding actions";
  return "open qualified crypto-native attention and conversation";
}

function deliverablesFor(partner: Partner, demand: Web3GrowthDemand) {
  const base = [
    `${partner.suggestedFormat} anchored on ${demand.growthGoal}`,
    "tracked referral or campaign link with wallet/account event mapping",
    "post-campaign readout: reach, qualified actions, audience quality, and retained activity",
  ];
  if (partner.supplyType === "media") return ["sponsored educational article or newsletter segment", "founder interview or product explainer", ...base.slice(1)];
  if (partner.supplyType === "research") return ["research thread or protocol breakdown", "analyst briefing with claims/evidence review", ...base.slice(1)];
  if (partner.supplyType === "security") return ["risk transparency review", "security/trust FAQ for campaign traffic", ...base.slice(1)];
  if (partner.supplyType === "platform") return ["quest or credential funnel", "anti-Sybil scoring and completion report", ...base.slice(1)];
  return base;
}

function riskControlsFor(partner: Partner, demand: Web3GrowthDemand) {
  return compactList([
    partner.primaryRisk,
    demand.riskTolerance === "low" ? "pre-approve claims, disclosures, and compliance-sensitive wording" : undefined,
    "start with a small paid or hybrid pilot before scaling spend",
    "separate incentive traffic from retained users in measurement",
  ], ["validate audience fit before payment", "track conversions beyond impressions"], 4);
}

function questionsFor(partner: Partner) {
  return compactList([
    `Can ${partner.name} show recent audience proof for ${partner.audience[0]}?`,
    `Which deliverable has historically produced ${partner.keyMetric}?`,
    "What disclosure, approval, and revision process is required?",
    "Can campaign traffic be tagged by source, wallet/account action, and retention cohort?",
  ], [], 4);
}

function outreachFor(partner: Partner, demand: Web3GrowthDemand) {
  const audience = demand.targetAudience || "crypto-native users";
  return `Hi ${partner.name} team, we are evaluating a focused Web3 growth pilot for ${demand.projectName}. The goal is ${demand.growthGoal} for ${audience}. GroIntel matched you because ${partner.fitReason} We would like to test ${partner.suggestedFormat}, measure ${partner.keyMetric}, and start with a controlled pilot before scaling. Can you share recent audience proof, package options, and the cleanest way to track qualified actions?`;
}

export function buildWeb3CollaborationBrief(
  demand: Web3GrowthDemand,
  decision: Web3GrowthDecision,
  partnerLimit = 5,
): Web3CollaborationBrief {
  const partners = decision.recommendedConcretePartners.slice(0, Math.max(1, Math.min(partnerLimit, 8)));
  const objective = `${demand.projectName} should convert ${demand.growthGoal} into a measurable Web3 collaboration pilot.`;
  const targetAudience = demand.targetAudience || "crypto-native users, builders, traders, or partners that already show intent";
  const measurement = compactList(decision.measurementPlan, ["qualified wallet/account creation", "campaign conversion", "retention after campaign"], 5);

  return {
    briefTitle: `${demand.projectName} Web3 KOL Collaboration Brief`,
    objective,
    targetAudience,
    positioning: `${demand.projectName} should lead with a clear growth proof: why this matters now, what action the audience should take, and how quality will be measured after the campaign.`,
    partnerShortlist: partners.map((partner) => `${partner.name} (${partner.supplyType}, ${partner.fitScore}% fit)`),
    partnerBriefs: partners.map((partner) => ({
      partnerId: partner.id,
      partnerName: partner.name,
      partnerIdentity: partner.identity,
      supplyType: partner.supplyType,
      fitScore: partner.fitScore,
      whyThisPartner: partner.fitReason,
      collaborationAngle: `${partner.name} should ${partnerRole(partner)} for ${demand.projectName}.`,
      suggestedDeliverables: deliverablesFor(partner, demand).slice(0, 4),
      outreachMessage: outreachFor(partner, demand),
      successMetrics: compactList([partner.keyMetric, ...measurement], measurement, 4),
      riskControls: riskControlsFor(partner, demand),
      qualificationQuestions: questionsFor(partner),
    })),
    campaignPlan: [
      { phase: "Qualify", action: "Ask each partner for audience proof, recent campaign examples, disclosure rules, and tracking support.", output: "shortlist with fit, price, risk, and measurement readiness" },
      { phase: "Pilot", action: "Run 1-3 controlled collaborations across different supply types instead of buying one broad blast.", output: "tagged traffic and first qualified actions" },
      { phase: "Measure", action: "Compare reach against qualified actions, retained users, community quality, and trust sentiment.", output: "campaign scorecard and partner ranking" },
      { phase: "Scale", action: "Increase spend only on partners that produce quality actions and repeatable learning.", output: "scaled collaboration plan and memory event for GroIntel" },
    ],
    trackingPlan: measurement,
    doNotDo: compactList([
      "do not optimize only for follower count or impressions",
      "do not launch without tracking links, wallet/account events, or cohort retention",
      ...decision.risks,
      ...decision.avoidPatterns,
    ], ["do not scale spend before the pilot proves audience quality"], 6),
    nextActionChecklist: [
      "choose the top 3 partners from the shortlist",
      "send the generated outreach message with one measurable objective",
      "collect pricing, audience proof, timeline, disclosure rules, and tracking ability",
      "select one KOL, one media/research partner, and one conversion-oriented channel when possible",
      "save the outcome back into GroIntel as a growth event memory",
    ],
  };
}
