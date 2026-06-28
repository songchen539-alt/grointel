import { WEB3_GROWTH_EVENTS, WEB3_SUPPLY_PROFILES, type Web3GrowthEvent, type Web3SupplyProfile } from "./web3World";

export interface Web3GrowthDemand {
  projectName: string;
  website?: string;
  sector?: string;
  stage?: string;
  growthGoal: string;
  targetAudience?: string;
  riskTolerance?: "low" | "medium" | "high";
}

export interface Web3GrowthDecision {
  recommendedSupply: string[];
  recommendedPartnerProfiles: string[];
  recommendedConcretePartners: Array<Web3SupplyProfile & { fitScore: number; fitReason: string; suggestedFormat: string; keyMetric: string; primaryRisk: string }>;
  collaborationPatterns: string[];
  avoidPatterns: string[];
  matchedEvents: Array<Web3GrowthEvent & { relevance: number; reason: string }>;
  risks: string[];
  measurementPlan: string[];
  qualificationQuestions: string[];
  nextActions: string[];
  confidence: number;
}

function includesAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function eventText(event: Web3GrowthEvent) {
  return [
    event.project,
    event.partner,
    event.partnerType,
    event.chainOrSector,
    event.growthGoal,
    event.collaborationFormat,
    event.observedResult,
    event.reusablePattern,
    ...event.whyItWorkedOrFailed,
    ...event.risks,
  ].join(" ");
}

function demandText(demand: Web3GrowthDemand) {
  return [demand.projectName, demand.website, demand.sector, demand.stage, demand.growthGoal, demand.targetAudience, demand.riskTolerance]
    .filter(Boolean)
    .join(" ");
}

function scoreEvent(demand: Web3GrowthDemand, event: Web3GrowthEvent) {
  const demandText = [demand.sector, demand.stage, demand.growthGoal, demand.targetAudience].filter(Boolean).join(" ");
  const text = eventText(event);
  let score = 30;

  if (demand.sector && includesAny(text, demand.sector.split(/[,\s/]+/).filter(Boolean))) score += 18;
  if (includesAny(text, demand.growthGoal.split(/[,\s/]+/).filter((item) => item.length > 3))) score += 22;
  if (demand.targetAudience && includesAny(text, demand.targetAudience.split(/[,\s/]+/).filter((item) => item.length > 3))) score += 12;
  if (event.outcome === "success") score += 12;
  if (event.outcome === "mixed") score += 6;
  if (event.outcome === "failure" && demand.riskTolerance === "low") score += 10;
  if (event.outcome === "risk" && demand.riskTolerance === "low") score += 8;
  if (includesAny(demandText, ["quest", "onboarding", "airdrop", "ecosystem"]) && event.collaborationFormat.toLowerCase().includes("quest")) score += 18;
  if (includesAny(demandText, ["community", "trust", "nft"]) && event.partnerType === "community") score += 16;
  if (includesAny(demandText, ["mainstream", "consumer", "brand"]) && event.partnerType === "celebrity") score += 10;

  return Math.min(100, score);
}

function supplyFromEvent(event: Web3GrowthEvent) {
  if (event.partnerType === "platform") return "Quest / credential growth platform";
  if (event.partnerType === "community") return "Community-native creator and collector network";
  if (event.partnerType === "media") return "Web3 media and newsletter partner";
  if (event.partnerType === "celebrity") return "Mainstream celebrity or brand ambassador";
  if (event.partnerType === "kol") return "Crypto-native KOL network";
  return "Web3 growth partner";
}

function profileText(profile: Web3SupplyProfile) {
  return [
    profile.name,
    profile.identity,
    profile.supplyType,
    ...profile.audience,
    ...profile.capabilities,
    ...profile.bestFor,
    ...profile.collaborationFormats,
    ...profile.proofSignals,
    ...profile.risks,
  ].join(" ");
}

function scoreSupplyProfile(demand: Web3GrowthDemand, profile: Web3SupplyProfile) {
  const text = profileText(profile);
  const demandValue = demandText(demand);
  let score = 35;

  if (demand.sector && includesAny(text, demand.sector.split(/[,\s/]+/).filter((item) => item.length > 2))) score += 14;
  if (includesAny(text, demand.growthGoal.split(/[,\s/]+/).filter((item) => item.length > 3))) score += 20;
  if (demand.targetAudience && includesAny(text, demand.targetAudience.split(/[,\s/]+/).filter((item) => item.length > 3))) score += 16;
  if (includesAny(demandValue, ["quest", "airdrop", "wallet", "onboarding", "l2", "ethereum"]) && includesAny(text, ["education", "ethereum", "l2", "wallet", "onboarding"])) score += 12;
  if (includesAny(demandValue, ["defi", "protocol", "liquidity", "deposit", "trading"]) && includesAny(text, ["defi", "protocol", "research", "on-chain"])) score += 14;
  if (includesAny(demandValue, ["trust", "security", "risk", "scam", "compliance"]) && includesAny(text, ["security", "trust", "risk", "transparency"])) score += 16;
  if (includesAny(demandValue, ["consumer", "retail", "exchange", "mainstream"]) && includesAny(text, ["retail", "consumer", "education", "video"])) score += 10;
  if (includesAny(demandValue, ["institution", "fund", "bd", "partnership", "enterprise"]) && includesAny(text, ["institutional", "research", "partner", "briefing"])) score += 14;
  if (demand.riskTolerance === "low" && profile.risks.some((risk) => /speculation|volatility|hype|retail/i.test(risk))) score -= 10;
  if (demand.riskTolerance === "low" && profile.supplyType === "security") score += 8;

  return Math.max(0, Math.min(100, score));
}

function supplyFitReason(profile: Web3SupplyProfile, demand: Web3GrowthDemand) {
  const goal = demand.growthGoal.toLowerCase();
  if (goal.includes("trust") || goal.includes("risk") || goal.includes("security")) {
    return `${profile.name} is useful when the campaign depends on ${profile.bestFor[0]}; validate with ${profile.proofSignals[0]}.`;
  }
  if (goal.includes("quest") || goal.includes("onboarding") || goal.includes("wallet")) {
    return `${profile.name} can help turn Web3 attention into ${profile.proofSignals[0]} through ${profile.collaborationFormats[0]}.`;
  }
  if (goal.includes("defi") || goal.includes("protocol")) {
    return `${profile.name} fits protocol education and high-intent audiences; use ${profile.collaborationFormats[0]} and track ${profile.proofSignals[0]}.`;
  }
  return `${profile.name} matches ${profile.audience[0]} and is best for ${profile.bestFor[0]}; start with ${profile.collaborationFormats[0]}.`;
}

export function decideWeb3Growth(demand: Web3GrowthDemand, events: Web3GrowthEvent[] = WEB3_GROWTH_EVENTS): Web3GrowthDecision {
  const matchedEvents = events
    .map((event) => ({
      ...event,
      relevance: scoreEvent(demand, event),
      reason: event.reusablePattern,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);

  const successful = matchedEvents.filter((event) => event.outcome === "success" || event.outcome === "mixed");
  const risky = matchedEvents.filter((event) => event.outcome === "failure" || event.outcome === "risk");
  const recommendedSupply = [...new Set(successful.map(supplyFromEvent))];
  const recommendedPartnerProfiles = [...new Set(successful.map((event) => `${event.partner} (${event.partnerType}, ${event.chainOrSector})`))];
  const recommendedConcretePartners = WEB3_SUPPLY_PROFILES
    .map((profile) => ({
      ...profile,
      fitScore: scoreSupplyProfile(demand, profile),
      fitReason: supplyFitReason(profile, demand),
      suggestedFormat: profile.collaborationFormats[0] || "Targeted collaboration",
      keyMetric: profile.proofSignals[0] || "qualified conversion",
      primaryRisk: profile.risks[0] || "Audience fit risk",
    }))
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5);
  const collaborationPatterns = [...new Set(successful.map((event) => event.reusablePattern))];
  const avoidPatterns = [...new Set(risky.map((event) => event.reusablePattern))];
  const risks = [...new Set(matchedEvents.flatMap((event) => event.risks))].slice(0, 8);
  const measurementPlan = [...new Set(matchedEvents.flatMap((event) => event.measurableSignals || []))].slice(0, 8);
  const confidence = Math.round(matchedEvents.reduce((sum, event) => sum + event.relevance, 0) / Math.max(1, matchedEvents.length));
  const stageSignals = [...new Set(matchedEvents.flatMap((event) => event.bestForStages || []))].slice(0, 4);

  return {
    recommendedSupply: recommendedSupply.length > 0 ? recommendedSupply : ["Crypto-native KOL network", "Web3 media and community partner"],
    recommendedPartnerProfiles: recommendedPartnerProfiles.length > 0
      ? recommendedPartnerProfiles
      : ["Crypto-native KOL with product-native audience", "Web3 media partner with measurable distribution", "Quest platform with anti-Sybil controls"],
    recommendedConcretePartners,
    collaborationPatterns,
    avoidPatterns,
    matchedEvents,
    risks,
    measurementPlan: measurementPlan.length > 0
      ? measurementPlan
      : ["tracked referrals", "qualified wallet/account creation", "campaign conversion", "retention after campaign"],
    qualificationQuestions: [
      `Which growth outcome matters most for ${demand.projectName}: awareness, wallets/users, volume, community quality, or qualified leads?`,
      "What is the minimum acceptable evidence for success: on-chain actions, traffic conversion, CRM leads, community joins, or revenue?",
      "Which audience must the partner already own: builders, traders, collectors, founders, retail users, or institutions?",
      "What risks are unacceptable: regulatory exposure, low-intent traffic, community backlash, or short-term farming?",
      stageSignals.length > 0
        ? `Does the project match these proven stages: ${stageSignals.join(", ")}?`
        : "Is the project stage ready for public amplification, or should it first run a smaller validation campaign?",
    ],
    nextActions: [
      "Clarify the growth goal into one measurable outcome: wallets, deposits, trading volume, community activation, or qualified leads.",
      "Select 3-5 KOL/community partners whose audience matches the project stage instead of optimizing only for follower count.",
      "Design evidence collection before launch: referral links, campaign wallets, community joins, conversion events, and retention checks.",
      "Run a small controlled collaboration before scaling spend.",
      "Feed campaign results back into GroIntel as a growth event memory.",
    ],
    confidence,
  };
}
