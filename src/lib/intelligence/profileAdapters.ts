import type {
  DbBusinessKnowledgeProfile,
  DbCapabilityKnowledgeProfile,
} from "@/lib/db/types";
import type {
  Channel,
  ChannelService,
  GrowthNeed,
} from "@/lib/ai/recommendation/types";

type JsonRecord = Record<string, unknown>;

export interface AdaptedCapability {
  channel: Channel;
  service: ChannelService;
  confidence: number;
  missingFields: string[];
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

function stringifyItems(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return JSON.stringify(item);
        return "";
      })
      .filter(Boolean)
      .join("; ");
  }
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return JSON.stringify(value);
  return "";
}

function firstString(values: unknown[], fallback = ""): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function parseBudgetRange(value: unknown): { min: number; max: number } {
  const text = stringifyItems(value).toLowerCase();
  if (!text) return { min: 0, max: 0 };

  const multipliers: Record<string, number> = { k: 1000, m: 1000000 };
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*([km])?/g)];
  const nums = matches.map((match) => {
    const amount = Number(match[1] || 0);
    const multiplier = match[2] ? multipliers[match[2]] || 1 : 1;
    return Math.round(amount * multiplier);
  }).filter((num) => num > 0);

  if (nums.length === 0) return { min: 0, max: 0 };
  if (nums.length === 1) return { min: 0, max: nums[0] };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function averageConfidence(confidence: unknown): number {
  const record = asRecord(confidence);
  const values = Object.values(record).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function missingFieldsFromConfidence(confidence: unknown, threshold = 60): string[] {
  const record = asRecord(confidence);
  return Object.entries(record)
    .filter(([, value]) => typeof value === "number" && value < threshold)
    .map(([field]) => field);
}

function extractAudienceIndustries(audienceDna: JsonRecord): string[] {
  const explicit = [
    ...asStringArray(audienceDna.industries),
    ...asStringArray(audienceDna.target_industries),
  ];
  if (explicit.length > 0) return explicit;

  return [...new Set(asStringArray(audienceDna.primary_audiences)
    .map((audience) => {
      const lower = audience.toLowerCase();
      if (lower.includes("tech") || lower.includes("developer")) return "Technology";
      if (lower.includes("business") || lower.includes("executive")) return "B2B";
      if (lower.includes("consumer")) return "Consumer";
      return audience;
    }))];
}

export function businessKnowledgeToGrowthNeed(profile: DbBusinessKnowledgeProfile): GrowthNeed {
  const identity = asRecord(profile.business_identity);
  const model = asRecord(profile.business_model);
  const market = asRecord(profile.market);
  const constraints = asRecord(profile.constraints);
  const preferences = asRecord(profile.preferences);
  const goals = asStringArray(profile.goals);
  const budget = parseBudgetRange(constraints.budget);

  const companyName = firstString([
    identity.name,
    profile.website,
  ], "Unknown Company");

  const targetMarket = firstString([
    market.target,
    stringifyItems(market.overview),
    identity.region,
  ], "Global");

  const targetCustomer = firstString([
    stringifyItems(model.customers),
    model.customer,
    model.icp,
  ], "Unknown customer");

  const growthGoal = firstString([
    goals[0],
    preferences.primary_growth_goal,
    preferences.priority_capability,
  ], "Improve growth efficiency");

  return {
    id: profile.id,
    companyName,
    website: profile.website,
    industry: firstString([identity.industry], "Technology"),
    region: firstString([identity.region, targetMarket], "Global"),
    stage: firstString([identity.stage, constraints.company_stage], "Growth Stage"),
    growthGoal,
    targetMarket,
    targetCustomer,
    currentChallenge: firstString([
      constraints.challenge,
      constraints.current_challenge,
      growthGoal,
    ], growthGoal),
    budgetMin: budget.min,
    budgetMax: budget.max,
    currency: asString(constraints.currency) || "USD",
    timeline: firstString([constraints.timeline, constraints.timeline_text], "3-6 months"),
    preferredChannels: asStringArray(preferences.preferred_channels),
  };
}

export function capabilityKnowledgeToChannel(profile: DbCapabilityKnowledgeProfile): AdaptedCapability {
  const identity = asRecord(profile.capability_identity);
  const capabilityDna = asRecord(profile.capability_dna);
  const audienceDna = asRecord(profile.audience_dna);
  const evidence = asRecord(profile.evidence_summary);
  const pricing = asRecord(profile.pricing_signals);
  const availability = asRecord(profile.availability_signals);
  const confidence = averageConfidence(profile.knowledge_confidence);
  const budget = parseBudgetRange(pricing.range);

  const displayName = firstString([
    identity.name,
    profile.profile_url,
  ], "Unknown Capability");

  const primaryCapability = firstString([
    capabilityDna.primary,
    capabilityDna.primary_capability,
    stringifyItems(profile.strengths),
    "Growth services",
  ], "Growth services");

  const targetIndustries = extractAudienceIndustries(audienceDna);
  const primaryAudiences = asStringArray(audienceDna.primary_audiences);
  const serviceTypes = [
    primaryCapability,
    ...asStringArray(profile.preferred_collaborations),
  ].filter(Boolean);

  const channel: Channel = {
    id: profile.id,
    channelName: displayName,
    website: profile.profile_url,
    category: firstString([identity.type], "growth_partner"),
    region: firstString([
      stringifyItems(audienceDna.regions),
      availability.region,
      "Global",
    ], "Global"),
    serviceTypes,
    targetIndustries,
    targetClientStage: asStringArray(audienceDna.company_sizes),
    pricingModel: firstString([pricing.model], "Unknown"),
    minBudget: budget.min,
    maxBudget: budget.max,
    currency: asString(pricing.currency) || "USD",
    growthOutcomes: stringifyItems(profile.preferred_collaborations) || primaryCapability,
    caseStudies: stringifyItems(evidence.strongest) || stringifyItems(evidence.types),
  };

  const service: ChannelService = {
    id: `${profile.id}:primary`,
    channelId: profile.id,
    serviceName: primaryCapability,
    serviceType: primaryCapability,
    problemSolved: [
      primaryCapability,
      stringifyItems(profile.strengths),
      stringifyItems(profile.preferred_collaborations),
    ].filter(Boolean).join("; "),
    growthOutcome: stringifyItems(profile.preferred_collaborations) || primaryCapability,
    deliverables: stringifyItems(profile.strengths) || primaryCapability,
    timeline: firstString([availability.lead_time, availability.status], "Flexible"),
    pricingModel: channel.pricingModel,
    startingPrice: channel.minBudget,
    maxPrice: channel.maxBudget,
    currency: channel.currency,
    targetRegion: channel.region,
    targetIndustry: targetIndustries.join(", ") || primaryAudiences.join(", ") || "General",
    successMetrics: stringifyItems(evidence.types) || "Audience fit, trust, and conversion quality",
    caseStudy: stringifyItems(evidence.strongest) || stringifyItems(evidence),
  };

  return {
    channel,
    service,
    confidence,
    missingFields: missingFieldsFromConfidence(profile.knowledge_confidence),
  };
}
