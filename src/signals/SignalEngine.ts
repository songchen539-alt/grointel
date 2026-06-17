// GroIntel Signal Engine
// Generates mock signals for the feed.
// Each source is independently replaceable with real API calls.

import { FeedSignal, SignalType, SignalPriority } from "./SignalTypes";
import { getAllCompanies } from "@/lib/companyKnowledgeGraph";

const signalTypes: SignalType[] = [
  "Funding", "Hiring", "Expansion", "Product Launch", "Partnership",
  "Community Growth", "SEO Growth", "GitHub Activity", "Media Coverage", "Conference",
];

const priorityPool: SignalPriority[] = ["High", "High", "Medium", "Medium", "Low"];

const summaryTemplates: Record<SignalType, string[]> = {
  "Funding": [
    "Raised $%dM in Series %s funding led by top-tier VCs",
    "Closed %s seed round of $%dM from strategic investors",
    "Secured $%dM in venture funding for %s expansion",
  ],
  "Hiring": [
    "Hiring %d+ engineers across %s and product teams",
    "Opened %d new positions in growth and %s",
    "Building out %s team — %d roles currently open",
  ],
  "Expansion": [
    "Expanding into %s market with local team",
    "Launched operations in %s with initial team of %d",
    "Opening new office in %s to serve regional clients",
  ],
  "Product Launch": [
    "Launched %s — a new platform for %s teams",
    "Released v%d of core product with major %s improvements",
    "Introduced %s feature to address enterprise needs",
  ],
  "Partnership": [
    "Partnered with %s to expand %s capabilities",
    "New integration with %s for seamless %s workflows",
    "Strategic alliance with %s in the %s space",
  ],
  "Community Growth": [
    "Community crossed %d members on Discord with %d%% MoM growth",
    "Developer community grew %d%% to %d+ active members",
    "%dK+ community members across %d platforms",
  ],
  "SEO Growth": [
    "Organic traffic up %d%% MoM driven by technical content",
    "SEO domain authority improved from %d to %d points",
    "Ranking for %d+ new keywords in target market",
  ],
  "GitHub Activity": [
    "Repository crossed %d stars with %d active contributors",
    "%d commits in the last 30 days across %d repos",
    "Open-source SDK adoption growing %d%% month over month",
  ],
  "Media Coverage": [
    "Featured in %s for breakthrough %s technology",
    "Covered by %s — \"The future of %s\"",
    "Profile in %s discussing %s industry trends",
  ],
  "Conference": [
    "Speaking at %s conference next month",
    "Hosting %s — the premier event for %s builders",
    "Presenting at %s — expecting %d+ attendees",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSignalForCompany(company: { name: string; website: string; industry: string; markets: string[] }): FeedSignal {
  const type = pick(signalTypes);
  const templates = summaryTemplates[type];
  const template = pick(templates);
  const now = new Date();
  now.setHours(now.getHours() - randomInt(0, 48));

  const markets = ["Singapore", "Japan", "UAE", "Europe", "Latin America", "South Korea"];
  const companies = ["OpenAI", "Google Cloud", "AWS", "Stripe", "Vercel", "Supabase", "Coinbase", "a16z", "Sequoia"];
  const sectors = ["AI", "Web3", "fintech", "developer tools", "DeFi", "gaming", "infrastructure"];
  const conferences = ["ETHGlobal", "Solana Breakpoint", "Token2049", "AI Summit", "DevCon"];

  const summary = template
    .replace(/%d/g, () => String(randomInt(2, 500)))
    .replace(/%s/g, () => pick([...markets, ...companies, ...sectors, ...conferences]));

  return {
    id: `${type.toLowerCase()}_${company.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    companyName: company.name,
    companyUrl: company.website,
    type,
    priority: pick(priorityPool),
    confidence: randomInt(60, 98),
    publishedAt: now.toISOString(),
    summary: summary.charAt(0).toUpperCase() + summary.slice(1),
  };
}

export function generateSignalFeed(count: number = 30): FeedSignal[] {
  const companies = getAllCompanies();
  const signals: FeedSignal[] = [];

  // Generate multiple signals per company
  for (const company of companies) {
    const numSignals = randomInt(1, 3);
    for (let i = 0; i < numSignals; i++) {
      signals.push(generateSignalForCompany(company));
    }
  }

  // Fill remaining with more signals from random companies
  while (signals.length < count) {
    const company = pick(companies);
    signals.push(generateSignalForCompany(company));
  }

  // Sort by time (newest first)
  signals.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return signals.slice(0, count);
}

export function getSignalsForCompany(companyName: string, signals: FeedSignal[]): FeedSignal[] {
  return signals
    .filter((s) => s.companyName.toLowerCase() === companyName.toLowerCase())
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);
}

export function getSignalsByType(type: SignalType, signals: FeedSignal[]): FeedSignal[] {
  return signals.filter((s) => s.type === type);
}

export function getHighPrioritySignals(signals: FeedSignal[]): FeedSignal[] {
  return signals.filter((s) => s.priority === "High");
}
