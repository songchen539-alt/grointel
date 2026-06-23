import { WEB3_GROWTH_EVENTS, type Web3GrowthEvent } from "./web3World";

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
  collaborationPatterns: string[];
  avoidPatterns: string[];
  matchedEvents: Array<Web3GrowthEvent & { relevance: number; reason: string }>;
  risks: string[];
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
  const collaborationPatterns = [...new Set(successful.map((event) => event.reusablePattern))];
  const avoidPatterns = [...new Set(risky.map((event) => event.reusablePattern))];
  const risks = [...new Set(matchedEvents.flatMap((event) => event.risks))].slice(0, 8);
  const confidence = Math.round(matchedEvents.reduce((sum, event) => sum + event.relevance, 0) / Math.max(1, matchedEvents.length));

  return {
    recommendedSupply: recommendedSupply.length > 0 ? recommendedSupply : ["Crypto-native KOL network", "Web3 media and community partner"],
    recommendedPartnerProfiles: recommendedPartnerProfiles.length > 0
      ? recommendedPartnerProfiles
      : ["Crypto-native KOL with product-native audience", "Web3 media partner with measurable distribution", "Quest platform with anti-Sybil controls"],
    collaborationPatterns,
    avoidPatterns,
    matchedEvents,
    risks,
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
