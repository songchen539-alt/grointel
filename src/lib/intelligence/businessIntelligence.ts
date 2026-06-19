// GroIntel Business Intelligence Engine
// Two layers: Public Scan + Business Knowledge

export interface BusinessScanResult {
  website: string;
  normalized_domain: string;
  company_name: string;
  industry: string;
  country: string;
  region: string;
  public_summary: string;
  detected_products: Record<string, unknown>[];
  detected_markets: Record<string, unknown>[];
  detected_growth_channels: Record<string, unknown>[];
  public_signals: Record<string, unknown>[];
  sources: Record<string, unknown>[];
  confidence: Record<string, number>;
}

export interface BusinessKnowledgeResult {
  website: string;
  business_identity: Record<string, unknown>;
  business_model: Record<string, unknown>;
  market: Record<string, unknown>;
  goals: string[];
  constraints: Record<string, unknown>;
  growth_stack: Record<string, unknown>;
  history: Record<string, unknown>[];
  preferences: Record<string, unknown>;
  knowledge_confidence: Record<string, number>;
}

const DOMAIN_KNOWLEDGE: Record<string, {
  company_name: string;
  industry: string;
  country: string;
  region: string;
  summary: string;
  products: string[];
  markets: string[];
  channels: string[];
  signals: string[];
  business_model: Record<string, unknown>;
  constr: Record<string, unknown>;
  growth_stack: Record<string, unknown>;
  goals: string[];
  history: Record<string, unknown>[];
}> = {
  "stripe.com": {
    company_name: "Stripe",
    industry: "Fintech / Payments Infrastructure",
    country: "US", region: "North America",
    summary: "Stripe is a leading payment processing platform that provides internet infrastructure for businesses to accept payments, manage subscriptions, and scale globally.",
    products: ["Payments API", "Stripe Connect", "Billing", "Terminal", "Atlas", "Climate", "Treasury"],
    markets: ["E-commerce payments", "SaaS subscriptions", "Marketplace payments", "Platform monetization", "Embedded finance"],
    channels: ["Self-serve onboarding", "Developer community", "Partner ecosystem", "Content marketing", "Developer documentation"],
    signals: ["Public company (IPO 2024)", "Global expansion into 40+ countries", "Growing enterprise segment", "Banking-as-a-service expansion"],
    business_model: { type: "Platform", revenue_model: "Transaction-based pricing (2.9% + $0.30)", customers: ["Internet businesses", "SaaS", "E-commerce"], scale: ">$10B revenue" },
    constr: { budget: "Sufficient (public company)", timeline: "Ongoing", technical: "Scale global infrastructure", competitive: "Price competition from Adyen, PayPal" },
    growth_stack: { sales: ["Self-serve", "Partner-driven"], marketing: ["Developer advocacy", "Content", "Brand"], product: ["API-first", "Rapid expansion"] },
    goals: ["Expand enterprise segment", "Increase international revenue", "Launch banking services", "Deepen platform ecosystem"],
    history: [{ event: "Founded 2010", impact: "Revolutionized online payments" }, { event: "IPO 2024", impact: "Public market validation" }],
  },
  "openai.com": {
    company_name: "OpenAI",
    industry: "AI / Artificial Intelligence",
    country: "US", region: "North America",
    summary: "OpenAI is an AI research and deployment company dedicated to ensuring artificial general intelligence benefits all of humanity.",
    products: ["GPT-4 family", "ChatGPT", "DALL-E", "Whisper", "Sora", "API platform"],
    markets: ["Enterprise AI", "Consumer AI assistants", "AI developer tools", "Content generation", "Code generation"],
    channels: ["Direct API", "Azure partnership", "ChatGPT consumer app", "Research publications", "Developer community"],
    signals: ["Fastest growing product (ChatGPT)", "Massive compute investment", "Enterprise partnerships", "AGI research milestones"],
    business_model: { type: "Platform + Subscription", revenue_model: "API usage + ChatGPT subscriptions ($20-$200/mo)", customers: ["Developers", "Enterprises", "Consumers"], scale: "$3B+ revenue (est)" },
    constr: { budget: "High (massive funding)", timeline: "Aggressive release cadence", technical: "Compute scaling", competitive: "Open-source model competition" },
    growth_stack: { sales: ["Enterprise sales", "Self-serve API"], marketing: ["Brand", "Research", "Community"], product: ["GPT-4", "DALL-E", "Whisper"] },
    goals: ["Achieve AGI safely", "Scale enterprise adoption", "Expand multimodal", "Build AI platform ecosystem"],
    history: [{ event: "Founded 2015 (non-profit)", impact: "Shifted to capped-profit 2019" }, { event: "Launched ChatGPT Nov 2022", impact: "Fastest growing product" }],
  },
  "clay.com": {
    company_name: "Clay",
    industry: "B2B Data / GTM AI",
    country: "US", region: "North America",
    summary: "Clay is a GTM data and enrichment platform that helps revenue teams research, enrich, and activate prospect data using AI-powered workflows.",
    products: ["Waterfall enrichment", "AI Research Agent", "Claygent", "Data Studio", "API"],
    markets: ["B2B data enrichment", "GTM data platforms", "Revenue operations", "Sales intelligence", "AI-powered data workflows"],
    channels: ["Content marketing", "Community", "GTM thought leadership", "PLG", "Partnerships"],
    signals: ["Series B funding ($50M+)", "Rapid ARR growth", "Enterprise adoption", "AI workflow innovation"],
    business_model: { type: "SaaS", revenue_model: "Subscription tiers ($149/mo to Enterprise)", customers: ["Revenue teams", "Sales", "Marketing"], scale: "$50-100M ARR" },
    constr: { budget: "Well-funded (venture)", timeline: "12-18 month sprint", technical: "Data quality at scale", competitive: "ZoomInfo, Lusha, Apollo" },
    growth_stack: { sales: ["PLG", "Inside sales"], marketing: ["Content", "Community", "GTM thought leadership"], product: ["Enrichment", "AI agent"] },
    goals: ["Default GTM data platform", "Scale enterprise", "Expand data coverage", "AI-native workflows"],
    history: [{ event: "Founded 2017", impact: "Pioneered waterfall enrichment" }, { event: "Series B 2024", impact: "$50M+ funding" }],
  },
  "perplexity.ai": {
    company_name: "Perplexity",
    industry: "AI / AI-powered Search",
    country: "US", region: "North America",
    summary: "Perplexity is an AI-native answer engine providing real-time, cited answers powered by large language models and live web search.",
    products: ["Perplexity Web Search", "Perplexity Pro", "API", "Mobile apps", "Browser extension"],
    markets: ["AI search", "Knowledge discovery", "Research tools", "Enterprise knowledge management"],
    channels: ["Self-serve", "Word of mouth", "Performance marketing", "PR", "Mobile app stores"],
    signals: ["Rapid user growth", "AI search category leader", "Multi-modal expansion", "Enterprise API adoption"],
    business_model: { type: "Platform", revenue_model: "Freemium + subscription ($20/mo Pro) + API", customers: ["Knowledge workers", "Researchers", "Developers"], scale: "$50-100M ARR (est)" },
    constr: { budget: "Moderate (venture-backed)", timeline: "Fast iteration required", technical: "Indexing scale", competitive: "Google search dominance" },
    growth_stack: { sales: ["Self-serve"], marketing: ["Performance", "PR", "Word of mouth"], product: ["Search", "Pro", "API"] },
    goals: ["Disrupt traditional search", "Scale to 100M+ users", "Monetize sustainably", "Enterprise offering"],
    history: [{ event: "Founded 2022", impact: "AI-native search pioneer" }, { event: "Raised $70M+ in 2024", impact: "Growth funding" }],
  },
};

function extractDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  try {
    const url = new URL(cleaned);
    let domain = url.hostname.replace(/^www\./, "");
    if (domain.split(".").length > 2 && !domain.endsWith(".co.uk") && !domain.endsWith(".com.au")) {
      const parts = domain.split(".");
      domain = parts.slice(-2).join(".");
    }
    return domain;
  } catch {
    return cleaned;
  }
}

function findKnownDomain(domain: string): string | null {
  for (const known of Object.keys(DOMAIN_KNOWLEDGE)) {
    if (domain.includes(known) || known.includes(domain)) return known;
  }
  return null;
}

export function normalizeWebsite(input: string): string {
  return extractDomain(input);
}

export function generateMockBusinessScan(website: string): BusinessScanResult {
  const domain = normalizeWebsite(website);
  const known = findKnownDomain(domain);
  
  if (known) {
    const k = DOMAIN_KNOWLEDGE[known];
    const products = (k.products || []).map((p: string) => ({ name: p, detected: true }));
    const markets = (k.markets || []).map((m: string) => ({ name: m, type: "detected" }));
    const channels = (k.channels || []).map((c: string) => ({ channel: c, evidence: "public" }));
    const signals = (k.signals || []).map((s: string) => ({ signal: s, type: "public" }));
    
    return {
      website: known,
      normalized_domain: known,
      company_name: k.company_name,
      industry: k.industry,
      country: k.country,
      region: k.region,
      public_summary: k.summary,
      detected_products: products,
      detected_markets: markets,
      detected_growth_channels: channels,
      public_signals: signals,
      sources: [{ type: "website", url: "https://" + known, reliability: "high" }],
      confidence: { identity: 90, products: 85, market: 80, channels: 75, overall: 82 },
    };
  }

  const genericProducts = [{ name: "Core Platform", detected: true }];
  const genericMarkets = [{ name: "Digital / Technology", type: "inferred" }];
  const genericChannels = [{ channel: "Direct", evidence: "common" }, { channel: "Digital", evidence: "common" }];
  const genericSignals = [{ signal: "Active in digital space", type: "inferred" }];

  return {
    website: domain,
    normalized_domain: domain,
    company_name: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
    industry: "Technology / SaaS",
    country: "US",
    region: "North America",
    public_summary: "A technology company operating in the digital space. Detailed public information is limited.",
    detected_products: genericProducts,
    detected_markets: genericMarkets,
    detected_growth_channels: genericChannels,
    public_signals: genericSignals,
    sources: [{ type: "website", url: "https://" + domain, reliability: "medium" }],
    confidence: { identity: 60, products: 40, market: 45, channels: 40, overall: 46 },
  };
}

export function createInitialBusinessKnowledge(scan: BusinessScanResult): BusinessKnowledgeResult {
  const known = findKnownDomain(scan.website);
  
  if (known) {
    const k = DOMAIN_KNOWLEDGE[known];
    return {
      website: known,
      business_identity: { name: k.company_name, industry: k.industry, country: k.country, region: k.region, source: "website_scan" },
      business_model: k.business_model,
      market: { overview: k.markets.map((m: string) => m), sources: ["website_scan"] },
      goals: k.goals,
      constraints: k.constr,
      growth_stack: k.growth_stack,
      history: k.history,
      preferences: { pricing: "Subscription/transaction", engagement: "Digital-first" },
      knowledge_confidence: calculateBusinessKnowledgeConfidence(scan),
    };
  }

  return {
    website: scan.website,
    business_identity: { name: scan.company_name, industry: scan.industry, country: scan.country, region: scan.region, source: "website_scan" },
    business_model: { type: "SaaS / Digital Services", revenue_model: "Subscription or usage", customers: ["Businesses"], scale: "Growth stage" },
    market: { overview: ["Digital market"], sources: ["website_scan"] },
    goals: ["Achieve product-market fit", "Scale customer acquisition", "Build sustainable growth engine"],
    constraints: { budget: "Growth stage", timeline: "6-12 month horizon", technical: "Scalability", competitive: "Competitive landscape" },
    growth_stack: { sales: ["Direct", "Self-serve"], marketing: ["Content", "SEO"], product: ["Core platform"] },
    history: [{ event: "Founded (est)", impact: "Building in growth market" }],
    preferences: { pricing: "Subscription", engagement: "Digital-first" },
    knowledge_confidence: calculateBusinessKnowledgeConfidence(scan),
  };
}

export function calculateBusinessKnowledgeConfidence(scan: BusinessScanResult): Record<string, number> {
  const id = (scan.confidence?.identity || 0);
  const bm = Math.round((scan.confidence?.identity || 0) * 0.8);
  const mkt = Math.round((scan.confidence?.market || 0) * 0.9);
  const gls = Math.round(Math.max(0, (scan.confidence?.overall || 0) - 10));
  const cns = Math.round(Math.max(0, (scan.confidence?.overall || 0) - 15));
  const overall = Math.round((id + bm + mkt + gls + cns) / 5);
  return { identity: id, business_model: bm, market: mkt, goals: gls, constraints: cns, overall };
}
