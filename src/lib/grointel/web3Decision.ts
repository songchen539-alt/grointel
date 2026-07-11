import { WEB3_GROWTH_EVENTS, WEB3_SUPPLY_PROFILES, type Web3GrowthEvent, type Web3SupplyProfile } from "./web3World";
import { WEB3_DISCOVERY_TARGETS, type Web3DiscoveryTarget } from "./web3Discovery";
import type { DailyIngestionCandidate } from "./dailyIngestion";

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
  recommendedConcretePartners: Array<Web3SupplyProfile & {
    fitScore: number;
    fitReason: string;
    suggestedFormat: string;
    keyMetric: string;
    primaryRisk: string;
    source?: string;
    tags?: string[];
    matchSignals?: string[];
    liveQualityScore?: number;
    liveSourceCoverage?: string[];
    audienceFit: string;
    recommendedAction: string;
    measurement: string;
    riskControl: string;
  }>;
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

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((item) => item.length > 2 && !["web", "www", "com", "the", "and", "for", "with"].includes(item));
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

function supplyTypeFromDiscovery(target: Web3DiscoveryTarget): Web3SupplyProfile["supplyType"] {
  const text = `${target.name} ${target.identity} ${target.domain} ${target.tags.join(" ")}`.toLowerCase();
  if (includesAny(text, ["data", "analytics", "defillama", "nansen", "arkham", "terminal"])) return "research";
  if (includesAny(text, ["security", "risk", "rekt", "zachxbt", "intelligence"])) return "security";
  if (includesAny(text, ["media", "journalism", "news", "blockworks", "unchained", "the block", "rug radio"])) return "media";
  if (includesAny(text, ["community", "culture", "nft", "creator"])) return "community";
  if (includesAny(text, ["research", "thesis", "fundamentals"])) return "research";
  return "kol";
}

function discoveryToSupplyProfile(target: Web3DiscoveryTarget): Web3SupplyProfile & { source?: string; tags?: string[]; priority?: number } {
  const supplyType = supplyTypeFromDiscovery(target);
  const tags = target.tags;
  const audience = [
    `${tags.slice(0, 3).join(" / ")} audience`,
    target.domain.replace(/^Web3\s*\/\s*/i, ""),
    "crypto-native users",
  ].filter(Boolean);

  const capabilitiesByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["narrative amplification", "crypto-native conversation", "audience activation"],
    media: ["editorial storytelling", "sponsored education", "distribution"],
    community: ["community activation", "culture fit", "collector or creator trust"],
    platform: ["campaign mechanics", "quest design", "conversion tracking"],
    research: ["research-led education", "market credibility", "protocol analysis"],
    security: ["risk scrutiny", "trust validation", "security credibility"],
    creator: ["content creation", "audience education", "community conversion"],
  };
  const formatsByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["public conversation", "launch amplification", "founder discussion"],
    media: ["sponsored education", "founder interview", "newsletter or podcast package"],
    community: ["community activation", "creator campaign", "collector engagement"],
    platform: ["quest campaign", "credential funnel", "tracked onboarding sprint"],
    research: ["research thread", "protocol breakdown", "analyst briefing"],
    security: ["risk transparency review", "security education", "trust signal campaign"],
    creator: ["educational content", "product walkthrough", "campaign landing funnel"],
  };
  const proofByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["qualified traffic", "wallet/account creation", "social velocity"],
    media: ["content engagement", "qualified traffic", "lead/account conversion"],
    community: ["community joins", "activation quality", "retention after campaign"],
    platform: ["quest completion", "qualified wallets", "retained active users"],
    research: ["high-intent traffic", "qualified partner conversations", "research engagement"],
    security: ["trust sentiment", "reduced concern volume", "security disclosure engagement"],
    creator: ["content completion", "referral conversion", "qualified account creation"],
  };
  const risksByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["audience may reject shallow promotion", "attention can decay quickly"],
    media: ["requires substantive story", "editorial standards limit pure promotion"],
    community: ["community backlash if trust is weak", "culture fit matters more than reach"],
    platform: ["incentive farming and low retention", "anti-Sybil design required"],
    research: ["requires accurate technical claims", "slower than hype-led channels"],
    security: ["can amplify unresolved risk", "not a normal paid promotion fit"],
    creator: ["content quality and disclosure matter", "audience fit must be validated"],
  };

  return {
    id: target.id,
    name: target.name,
    identity: target.identity,
    supplyType,
    audience,
    capabilities: capabilitiesByType[supplyType],
    bestFor: tags.map((tag) => `${tag} growth`).slice(0, 4).concat([target.domain.replace(/^Web3\s*\/\s*/i, "")]),
    collaborationFormats: formatsByType[supplyType],
    proofSignals: proofByType[supplyType],
    risks: risksByType[supplyType],
    source: target.source,
    tags,
    priority: target.priority,
  };
}

export type ExpandedWeb3SupplyProfile = Web3SupplyProfile & {
  source?: string;
  tags?: string[];
  priority?: number;
  liveQualityScore?: number;
  liveSourceCoverage?: string[];
};

function dailyCandidateToSupplyProfile(candidate: DailyIngestionCandidate): ExpandedWeb3SupplyProfile | null {
  if (candidate.side !== "supply") return null;
  const text = `${candidate.name} ${candidate.identity} ${candidate.domain} ${candidate.tags.join(" ")}`.toLowerCase();
  const supplyType: Web3SupplyProfile["supplyType"] = includesAny(text, ["media", "news", "writer", "journalist", "podcast", "editorial"])
    ? "media"
    : includesAny(text, ["research", "analyst", "data", "defi"])
      ? "research"
      : includesAny(text, ["security", "risk", "audit", "hack"])
        ? "security"
        : candidate.kind === "partner"
          ? "media"
          : "kol";
  const capabilityByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["crypto-native conversation", "audience activation", "narrative amplification"],
    media: ["live editorial coverage", "sponsored education", "current narrative distribution"],
    community: ["community activation", "culture fit", "retention feedback"],
    platform: ["campaign mechanics", "tracked onboarding", "conversion reporting"],
    research: ["current market analysis", "protocol education", "research-led credibility"],
    security: ["risk scrutiny", "trust validation", "security education"],
    creator: ["content creation", "audience education", "community conversion"],
  };
  const formatsByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["public conversation", "launch amplification", "founder discussion"],
    media: ["live media brief", "sponsored educational article", "founder interview"],
    community: ["community activation", "creator campaign", "feedback sprint"],
    platform: ["quest campaign", "tracked onboarding sprint", "credential funnel"],
    research: ["research thread", "protocol breakdown", "analyst briefing"],
    security: ["risk transparency review", "security education", "trust signal campaign"],
    creator: ["educational content", "product walkthrough", "campaign landing funnel"],
  };
  const proofByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["qualified traffic", "wallet/account creation", "social velocity"],
    media: ["content engagement", "qualified traffic", "lead/account conversion"],
    community: ["community joins", "activation quality", "retention after campaign"],
    platform: ["quest completion", "qualified wallets", "retained active users"],
    research: ["high-intent traffic", "qualified partner conversations", "research engagement"],
    security: ["trust sentiment", "reduced concern volume", "security disclosure engagement"],
    creator: ["content completion", "referral conversion", "qualified account creation"],
  };
  const risksByType: Record<Web3SupplyProfile["supplyType"], string[]> = {
    kol: ["audience may reject shallow promotion", "attention can decay quickly"],
    media: ["requires substantive story", "editorial standards limit pure promotion"],
    community: ["community backlash if trust is weak", "culture fit matters more than reach"],
    platform: ["incentive farming and low retention", "anti-Sybil design required"],
    research: ["requires accurate technical claims", "slower than hype-led channels"],
    security: ["can amplify unresolved risk", "not a normal paid promotion fit"],
    creator: ["content quality and disclosure matter", "audience fit must be validated"],
  };

  return {
    id: candidate.id,
    name: candidate.name,
    identity: candidate.identity,
    supplyType,
    audience: [
      `${candidate.tags.slice(0, 4).join(" / ")} audience`,
      candidate.domain.replace(/^Web3\s*\/\s*/i, ""),
      "crypto-native users",
    ],
    capabilities: capabilityByType[supplyType],
    bestFor: candidate.tags.map((tag) => `${tag} growth`).slice(0, 4).concat([candidate.domain.replace(/^Web3\s*\/\s*/i, "")]),
    collaborationFormats: formatsByType[supplyType],
    proofSignals: proofByType[supplyType],
    risks: risksByType[supplyType],
    source: candidate.source,
    tags: candidate.tags,
    priority: candidate.priority,
    liveQualityScore: typeof (candidate as any).liveQualityScore === "number" ? (candidate as any).liveQualityScore : undefined,
    liveSourceCoverage: Array.isArray((candidate as any).liveSourceCoverage) ? (candidate as any).liveSourceCoverage : undefined,
  };
}

export function dailySupplyCandidatesToProfiles(candidates: DailyIngestionCandidate[] = []) {
  return candidates
    .map(dailyCandidateToSupplyProfile)
    .filter((profile): profile is ExpandedWeb3SupplyProfile => Boolean(profile));
}

export function getExpandedSupplyProfiles(extraProfiles: ExpandedWeb3SupplyProfile[] = []) {
  const profiles = [...WEB3_SUPPLY_PROFILES];
  const seen = new Set(profiles.map((profile) => `${profile.name}|${profile.identity}`.toLowerCase()));
  for (const target of WEB3_DISCOVERY_TARGETS.filter((item) => item.segment === "supply")) {
    const profile = discoveryToSupplyProfile(target);
    const key = `${profile.name}|${profile.identity}`.toLowerCase();
    if (seen.has(key)) continue;
    profiles.push(profile);
    seen.add(key);
  }
  for (const profile of extraProfiles) {
    const key = `${profile.name}|${profile.identity}`.toLowerCase();
    if (seen.has(key)) continue;
    profiles.push(profile);
    seen.add(key);
  }
  return profiles;
}

function matchSignals(demand: Web3GrowthDemand, profile: Web3SupplyProfile & { tags?: string[] }) {
  const demandTokens = tokenize(demandText(demand));
  const text = profileText(profile).toLowerCase();
  const tags = profile.tags || [];
  const signals = [
    ...tags.filter((tag) => includesAny(demandText(demand), [tag])),
    ...demandTokens.filter((token) => text.includes(token)).slice(0, 5),
  ];
  return [...new Set(signals)].slice(0, 6);
}

function diversifyPartners<T extends Web3SupplyProfile & { fitScore: number }>(partners: T[], limit = 10) {
  const selected: T[] = [];
  const typeCounts = new Map<string, number>();

  for (const partner of partners) {
    const count = typeCounts.get(partner.supplyType) || 0;
    if (count >= 3 && selected.length < Math.ceil(limit * 0.8)) continue;
    selected.push(partner);
    typeCounts.set(partner.supplyType, count + 1);
    if (selected.length >= limit) break;
  }

  if (selected.length < limit) {
    for (const partner of partners) {
      if (selected.some((item) => item.id === partner.id)) continue;
      selected.push(partner);
      if (selected.length >= limit) break;
    }
  }

  return selected;
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
  if (includesAny(demandValue, ["asia", "china", "apac", "korea", "japan"]) && includesAny(text, ["asia", "news", "media"])) score += 12;
  if (includesAny(demandValue, ["solana", "memecoin", "trader", "perp", "trading"]) && includesAny(text, ["solana", "memecoin", "trader", "markets"])) score += 14;
  if (includesAny(demandValue, ["data", "analytics", "dashboard", "on-chain", "whale"]) && includesAny(text, ["data", "analytics", "on-chain", "wallets"])) score += 14;
  if (includesAny(demandValue, ["social", "creator", "nft", "culture", "consumer"]) && includesAny(text, ["social", "creator", "nft", "culture", "consumer", "community"])) score += 12;
  if (demand.riskTolerance === "low" && profile.risks.some((risk) => /speculation|volatility|hype|retail/i.test(risk))) score -= 10;
  if (demand.riskTolerance === "low" && profile.supplyType === "security") score += 8;
  if ("priority" in profile && typeof profile.priority === "number") score += Math.round((profile.priority - 75) / 5);
  if ("liveQualityScore" in profile && typeof profile.liveQualityScore === "number") score += Math.round((profile.liveQualityScore - 70) / 4);
  if ("liveSourceCoverage" in profile && Array.isArray(profile.liveSourceCoverage)) score += Math.min(6, profile.liveSourceCoverage.length * 2);

  return Math.max(0, Math.min(100, score));
}

function liveQualityMeta(profile: Web3SupplyProfile) {
  const expanded = profile as ExpandedWeb3SupplyProfile;
  return {
    score: typeof expanded.liveQualityScore === "number" ? expanded.liveQualityScore : undefined,
    coverage: Array.isArray(expanded.liveSourceCoverage) ? expanded.liveSourceCoverage : [],
  };
}

function supplyFitReason(profile: Web3SupplyProfile, demand: Web3GrowthDemand) {
  const liveMeta = liveQualityMeta(profile);
  const liveQuality = typeof liveMeta.score === "number"
    ? ` It carries a live quality score of ${liveMeta.score}/100 from ${liveMeta.coverage.length > 0 ? liveMeta.coverage.join(", ") : "live discovery"}.`
    : "";
  const goal = demand.growthGoal.toLowerCase();
  if (goal.includes("trust") || goal.includes("risk") || goal.includes("security")) {
    return `${profile.name} is useful when the campaign depends on ${profile.bestFor[0]}; validate with ${profile.proofSignals[0]}.${liveQuality}`;
  }
  if (goal.includes("quest") || goal.includes("onboarding") || goal.includes("wallet")) {
    return `${profile.name} can help turn Web3 attention into ${profile.proofSignals[0]} through ${profile.collaborationFormats[0]}.${liveQuality}`;
  }
  if (goal.includes("defi") || goal.includes("protocol")) {
    return `${profile.name} fits protocol education and high-intent audiences; use ${profile.collaborationFormats[0]} and track ${profile.proofSignals[0]}.${liveQuality}`;
  }
  return `${profile.name} matches ${profile.audience[0]} and is best for ${profile.bestFor[0]}; start with ${profile.collaborationFormats[0]}.${liveQuality}`;
}

function audienceFit(profile: Web3SupplyProfile, demand: Web3GrowthDemand) {
  const target = demand.targetAudience || "the target Web3 audience";
  return `${profile.name} reaches ${profile.audience[0]} and should be evaluated against ${target}.`;
}

function recommendedAction(profile: Web3SupplyProfile, demand: Web3GrowthDemand) {
  const goal = demand.growthGoal.toLowerCase();
  if (goal.includes("trust") || goal.includes("risk") || goal.includes("security")) {
    return `Use ${profile.collaborationFormats[0]} to make the project's risk posture and proof points explicit before broad amplification.`;
  }
  if (goal.includes("quest") || goal.includes("onboarding") || goal.includes("wallet")) {
    return `Run ${profile.collaborationFormats[0]} with tracked referrals and a narrow activation event before scaling spend.`;
  }
  if (goal.includes("research") || goal.includes("education") || goal.includes("defi") || goal.includes("protocol")) {
    return `Start with ${profile.collaborationFormats[0]} focused on the strongest product narrative, then retarget engaged users.`;
  }
  return `Start with ${profile.collaborationFormats[0]} and validate whether this partner can produce qualified demand, not only attention.`;
}

function measurement(profile: Web3SupplyProfile) {
  return `Primary metric: ${profile.proofSignals[0]}; supporting checks: ${profile.proofSignals.slice(1, 3).join(", ") || "qualified engagement and retained activity"}.`;
}

function riskControl(profile: Web3SupplyProfile, demand: Web3GrowthDemand) {
  const risk = profile.risks[0] || "Audience fit risk";
  if (demand.riskTolerance === "low") {
    return `Run a limited test first because ${risk}; require disclosure, tracking, and post-campaign retention checks.`;
  }
  return `Monitor ${risk}; keep budget gated behind measurable conversion quality.`;
}

export function decideWeb3Growth(
  demand: Web3GrowthDemand,
  events: Web3GrowthEvent[] = WEB3_GROWTH_EVENTS,
  extraSupplyProfiles: ExpandedWeb3SupplyProfile[] = [],
): Web3GrowthDecision {
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
  const scoredConcretePartners = getExpandedSupplyProfiles(extraSupplyProfiles)
    .map((profile) => {
      const liveMeta = liveQualityMeta(profile);
      return {
        ...profile,
        fitScore: scoreSupplyProfile(demand, profile),
        fitReason: supplyFitReason(profile, demand),
        suggestedFormat: profile.collaborationFormats[0] || "Targeted collaboration",
        keyMetric: profile.proofSignals[0] || "qualified conversion",
        primaryRisk: profile.risks[0] || "Audience fit risk",
        matchSignals: matchSignals(demand, profile),
        liveQualityScore: liveMeta.score,
        liveSourceCoverage: liveMeta.coverage,
        audienceFit: audienceFit(profile, demand),
        recommendedAction: recommendedAction(profile, demand),
        measurement: measurement(profile),
        riskControl: riskControl(profile, demand),
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || a.supplyType.localeCompare(b.supplyType) || a.name.localeCompare(b.name));
  const recommendedConcretePartners = diversifyPartners(scoredConcretePartners, 10);
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
      "Shortlist across at least three supply types: KOL attention, media education, and research/data/trust validation.",
      "Design evidence collection before launch: referral links, campaign wallets, community joins, conversion events, and retention checks.",
      "Run a small controlled collaboration before scaling spend.",
      "Feed campaign results back into GroIntel as a growth event memory.",
    ],
    confidence,
  };
}
