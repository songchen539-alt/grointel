// GroIntel AI Core - Rule Engine
// Deterministic scoring for matching growth needs with channels/services.

import { FeatureVector, Channel, ChannelService, ScoreBreakdown, Reason } from "./types";

export interface RuleEngineInput {
  features: FeatureVector;
  channel: Channel;
  service: ChannelService | null;
}

export interface RuleEngineOutput {
  scores: ScoreBreakdown;
  overall: number;
  reasons: Reason[];
  confidence: "High" | "Medium" | "Low";
}

const WEIGHTS = {
  industry: 30,
  problem: 25,
  region: 15,
  budget: 15,
  timeline: 10,
  history: 5,
};

export function evaluate(input: RuleEngineInput): RuleEngineOutput {
  const scores: ScoreBreakdown = {
    industry: scoreIndustry(input.features, input.channel),
    problem: scoreProblem(input.features, input.service),
    region: scoreRegion(input.features, input.channel),
    budget: scoreBudget(input.features, input.channel, input.service),
    timeline: scoreTimeline(input.features, input.service),
    history: 0, // Future: historical outcome data
  };

  const overall = Math.round(
    (scores.industry * (WEIGHTS.industry / 100)) +
    (scores.problem * (WEIGHTS.problem / 100)) +
    (scores.region * (WEIGHTS.region / 100)) +
    (scores.budget * (WEIGHTS.budget / 100)) +
    (scores.timeline * (WEIGHTS.timeline / 100)) +
    (scores.history * (WEIGHTS.history / 100))
  );

  const reasons = generateReasons(scores, input);

  const confidence = computeConfidence(scores);

  return { scores, overall, reasons, confidence };
}

function scoreIndustry(features: FeatureVector, channel: Channel): number {
  const needIndustry = features.industry.toLowerCase();
  const targetIndustries = (channel.targetIndustries || []).map((i) => i.toLowerCase());

  if (targetIndustries.length === 0) return 50; // Neutral if no data
  if (targetIndustries.some((i) => needIndustry.includes(i) || i.includes(needIndustry))) return 100;
  if (targetIndustries.some((i) => isAdjacentIndustry(needIndustry, i))) return 50;
  return 10;
}

function scoreProblem(features: FeatureVector, service: ChannelService | null): number {
  if (!service) return 50;
  const problems = features.problems;
  if (problems.length === 0) return 50;
  const serviceText = (service.problemSolved + " " + service.growthOutcome + " " + service.serviceType).toLowerCase();
  const matches = problems.filter((p) => serviceText.includes(p));
  if (matches.length >= 3) return 100;
  if (matches.length >= 1) return 70;
  return 30;
}

function scoreRegion(features: FeatureVector, channel: Channel): number {
  const needRegion = features.region.toLowerCase();
  const channelRegion = (channel.region || "").toLowerCase();

  if (!channelRegion || channelRegion === "global") return 75;
  if (channelRegion.includes("global") || channelRegion === "worldwide") return 75;
  if (needRegion.includes(channelRegion) || channelRegion.includes(needRegion)) return 100;
  if (isAdjacentRegion(needRegion, channelRegion)) return 50;
  return 10;
}

function scoreBudget(features: FeatureVector, channel: Channel, service: ChannelService | null): number {
  const needMax = features.budgetMax;
  if (needMax === 0) return 75; // No budget info, assume flexible

  const channelMin = service?.startingPrice || channel.minBudget;
  const channelMax = service?.maxPrice || channel.maxBudget;

  if (!channelMin && !channelMax) return 50;
  if (needMax >= (channelMin || 0) && needMax <= (channelMax || Infinity)) return 100;
  if (channelMin && needMax >= channelMin * 0.7) return 50; // Within 70%
  return 10;
}

function scoreTimeline(features: FeatureVector, service: ChannelService | null): number {
  if (!service?.timeline) return 75;
  const needTimeline = features.timeline;
  const serviceTimeline = service.timeline.toLowerCase();
  if (serviceTimeline.includes("flexible") || serviceTimeline.includes("varies")) return 75;
  return 75; // Default neutral
}

function generateReasons(scores: ScoreBreakdown, input: RuleEngineInput): Reason[] {
  const reasons: Reason[] = [];

  if (scores.industry >= 80) {
    reasons.push({ category: "industry", message: "Strong industry match between need and channel expertise", weight: WEIGHTS.industry });
  } else if (scores.industry >= 40) {
    reasons.push({ category: "industry", message: "Partial industry alignment", weight: WEIGHTS.industry * 0.5 });
  }

  if (scores.problem >= 80) {
    reasons.push({ category: "problem", message: "Channel service directly addresses the stated business problem", weight: WEIGHTS.problem });
  } else if (scores.problem >= 50) {
    reasons.push({ category: "problem", message: "Partial problem alignment with available services", weight: WEIGHTS.problem * 0.5 });
  }

  if (scores.region >= 80) {
    reasons.push({ category: "region", message: "Regional expertise matches target market", weight: WEIGHTS.region });
  }

  if (scores.budget >= 80) {
    reasons.push({ category: "budget", message: "Budget range is compatible with pricing", weight: WEIGHTS.budget });
  } else if (scores.budget <= 20) {
    reasons.push({ category: "budget", message: "Budget may be insufficient for this channel", weight: WEIGHTS.budget });
  }

  return reasons;
}

function computeConfidence(scores: ScoreBreakdown): "High" | "Medium" | "Low" {
  const avg = (scores.industry + scores.problem + scores.region + scores.budget + scores.timeline) / 5;
  if (avg >= 70) return "High";
  if (avg >= 40) return "Medium";
  return "Low";
}

function isAdjacentIndustry(a: string, b: string): boolean {
  const adjacencies: Record<string, string[]> = {
    "financial technology": ["saas", "technology"],
    "artificial intelligence": ["technology", "saas", "developer tools"],
    "web3 / blockchain": ["technology", "developer tools"],
    saas: ["technology", "financial technology"],
  };
  const adj = adjacencies[a] || [];
  return adj.some((x) => b.includes(x) || x.includes(b));
}

function isAdjacentRegion(a: string, b: string): boolean {
  const pairs: [string, string][] = [
    ["north america", "europe"],
    ["europe", "middle east"],
    ["apac / sea", "north america"],
    ["latin america", "north america"],
  ];
  return pairs.some(([x, y]) => (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x)));
}
