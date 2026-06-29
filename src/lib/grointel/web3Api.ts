import type { Web3GrowthDemand } from "./web3Decision";
import type { Web3GrowthEvent } from "./web3World";

type RequestBody = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function optionalText(value: unknown) {
  const output = text(value);
  return output ? output : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

export function normalizeWeb3GrowthDemand(body: RequestBody): Web3GrowthDemand {
  return {
    projectName: text(body.projectName || body.project_name || body.company || body.project),
    website: optionalText(body.website),
    sector: optionalText(body.sector),
    stage: optionalText(body.stage),
    growthGoal: text(body.growthGoal || body.growth_goal || body.goal),
    targetAudience: optionalText(body.targetAudience || body.target_audience),
    riskTolerance: body.riskTolerance === "low" || body.riskTolerance === "high" || body.riskTolerance === "medium"
      ? body.riskTolerance
      : body.risk_tolerance === "low" || body.risk_tolerance === "high" || body.risk_tolerance === "medium"
        ? body.risk_tolerance
        : "medium",
  };
}

export function dbEventToWeb3Event(event: RequestBody): Web3GrowthEvent {
  if (event.projectIdentity) return event as unknown as Web3GrowthEvent;
  return {
    id: text(event.id),
    project: text(event.project),
    projectIdentity: text(event.project_identity),
    partner: text(event.partner),
    partnerIdentity: text(event.partner_identity),
    partnerType: event.partner_type === "platform" || event.partner_type === "community" || event.partner_type === "media" || event.partner_type === "celebrity" || event.partner_type === "kol"
      ? event.partner_type
      : "kol",
    chainOrSector: text(event.chain_or_sector) || "Web3",
    eventDate: text(event.event_date),
    outcome: event.outcome === "success" || event.outcome === "failure" || event.outcome === "mixed" || event.outcome === "risk"
      ? event.outcome
      : "mixed",
    growthGoal: text(event.growth_goal),
    collaborationFormat: text(event.collaboration_format),
    observedResult: text(event.observed_result),
    whyItWorkedOrFailed: stringArray(event.why_it_worked_or_failed),
    reusablePattern: text(event.reusable_pattern),
    risks: stringArray(event.risks),
    evidenceUrls: stringArray(event.evidence_urls),
    bestForStages: stringArray(event.best_for_stages).length > 0 ? stringArray(event.best_for_stages) : stringArray(event.bestForStages),
    measurableSignals: stringArray(event.measurable_signals).length > 0 ? stringArray(event.measurable_signals) : stringArray(event.measurableSignals),
    supplyProfile: text(event.supply_profile || event.supplyProfile),
  };
}
