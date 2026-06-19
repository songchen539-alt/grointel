// GroIntel Cognitive Kernel — Test Fixtures
// Sample RealityEvents for testing the cognitive pipeline
import { RealityEvent, EventType, SignalSource } from "../kernel_types";

let fixCounter = 0;
function genId(): string { return "fixture_" + (++fixCounter).toString(16).padStart(4, "0"); }
function ts(): string { return new Date().toISOString(); }
function trace(): string { return "trace_" + Math.random().toString(36).slice(2, 10); }

export function makeEvent(type: EventType, payload: Record<string, unknown>, source: SignalSource = "observation", confidence = 80): RealityEvent {
  return {
    id: genId(),
    type,
    source,
    payload,
    confidence,
    timestamp: ts(),
    trace_id: trace(),
  };
}

// Fixture 1: Company raised funding
export const COMPANY_FUNDING_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "Stripe",
  amount: "$500M",
  series: "Series I",
  industry: "Fintech",
  country: "US",
  signal_type: "funding_signal",
  event_type: "funding",
  description: "Stripe raised $500M at $70B valuation",
}, "external_api", 85);

// Fixture 2: Company announced layoffs
export const COMPANY_LAYOFF_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "Tech Corp",
  headcount: 500,
  event_type: "layoff",
  industry: "Technology",
  signal_type: "risk_signal",
  description: "Tech Corp laid off 500 employees",
}, "observation", 90);

// Fixture 3: Creator launched new product
export const CREATOR_PRODUCT_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  creator_name: "Alice Creator",
  product_name: "CreatorOS",
  event_type: "product_launch",
  signal_type: "product_signal",
  description: "Alice Creator launched a new SaaS product for creators",
}, "observation", 75);

// Fixture 4: AI startup released new model
export const AI_MODEL_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "OpenAI",
  product_name: "GPT-5",
  technology: "AI",
  event_type: "product_launch",
  signal_type: "technology_signal",
  description: "OpenAI released GPT-5 with breakthrough capabilities",
  industry: "AI",
  country: "US",
}, "external_api", 90);

// Fixture 5: Government announced regulation
export const REGULATION_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  event_type: "regulation",
  country: "EU",
  signal_type: "civilization_signal",
  industry: "Technology",
  description: "EU announced new AI regulation framework",
}, "external_api", 80);

// Fixture 6: Market demand increased
export const MARKET_DEMAND_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  market_name: "AI Infrastructure",
  event_type: "demand_increase",
  signal_type: "demand_signal",
  description: "Demand for AI infrastructure increased 300% YoY",
  industry: "Technology",
}, "observation", 70);

// Fixture 7: Conflicting source (contradicts Fixture 2)
export const CONFLICTING_LAYOFF_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "Tech Corp",
  headcount: 50,
  event_type: "layoff",
  industry: "Technology",
  signal_type: "risk_signal",
  description: "Tech Corp laid off 50 employees (smaller than previously reported)",
}, "observation", 60);

// Fixture 8: Growth milestone
export const GROWTH_MILESTONE_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "Notion",
  event_type: "milestone",
  signal_type: "growth_signal",
  description: "Notion reached 100M users",
  industry: "SaaS",
  country: "US",
}, "observation", 85);

// Fixture 9: Hiring signal
export const HIRING_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "Anthropic",
  headcount: 200,
  event_type: "hiring",
  signal_type: "hiring_signal",
  industry: "AI",
  description: "Anthropic is hiring 200 new employees for research",
}, "observation", 75);

// Fixture 10: Trust signal
export const TRUST_EVENT = makeEvent("OBSERVATION_RECEIVED", {
  company_name: "Meta",
  event_type: "compliance",
  signal_type: "trust_signal",
  industry: "Technology",
  description: "Meta achieved SOC 2 Type II certification",
  country: "US",
}, "observation", 70);
