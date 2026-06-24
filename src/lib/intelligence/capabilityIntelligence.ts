// GroIntel Capability Intelligence Engine
// Two layers: Public Capability Scan + Capability Knowledge

export interface CapabilityScanResult {
  profile_url: string;
  normalized_domain: string;
  display_name: string;
  entity_type: string;
  public_summary: string;
  detected_capabilities: Record<string, unknown>[];
  detected_audiences: Record<string, unknown>[];
  detected_markets: Record<string, unknown>[];
  detected_channels: Record<string, unknown>[];
  public_evidence: Record<string, unknown>[];
  sources: Record<string, unknown>[];
  confidence: Record<string, number>;
}

export interface CapabilityKnowledgeResult {
  profile_url: string;
  capability_identity: Record<string, unknown>;
  capability_dna: Record<string, unknown>;
  audience_dna: Record<string, unknown>;
  evidence_summary: Record<string, unknown>;
  strengths: string[];
  limitations: string[];
  preferred_collaborations: string[];
  pricing_signals: Record<string, unknown>;
  availability_signals: Record<string, unknown>;
  knowledge_confidence: Record<string, number>;
}

const PROFILE_PATTERNS: Record<string, {
  display_name: string;
  entity_type: string;
  summary: string;
  capabilities: string[];
  audiences: string[];
  markets: string[];
  channels: string[];
  evidence: string[];
  strengths: string[];
  limitations: string[];
  collaborations: string[];
  pricing: Record<string, unknown>;
  availability: Record<string, unknown>;
}> = {
  "x.com/cobie": {
    display_name: "Cobie",
    entity_type: "crypto_kol",
    summary: "Cobie is a crypto-native commentator and investor voice with strong reach among traders, founders, and high-context Web3 audiences.",
    capabilities: ["Crypto-native distribution", "Market commentary", "Founder and trader audience access", "Narrative framing", "High-signal social amplification"],
    audiences: ["Crypto traders", "Web3 founders", "Investors", "Ethereum and broader crypto community", "High-context Crypto Twitter"],
    markets: ["Web3", "Crypto investing", "DeFi", "SocialFi", "Token launches"],
    channels: ["X / Crypto Twitter", "Podcast appearances", "Community discourse"],
    evidence: ["Long-running public crypto presence", "High-context market commentary", "Strong founder/investor audience trust"],
    strengths: ["Credibility with crypto-native audiences", "Fast narrative distribution", "Strong market literacy", "High trust among advanced users"],
    limitations: ["Not a mainstream consumer channel", "Audience may be skeptical of overt promotion", "Best fit requires product credibility"],
    collaborations: ["Founder-led launches", "Product-native creator loops", "Market education", "Narrative validation", "Selective advisory"],
    pricing: { model: "Selective / relationship-led", range: "Unknown", factors: ["Credibility fit", "product quality", "audience relevance"] },
    availability: { status: "Selective", lead_time: "Unknown", booking: "Relationship or public profile" },
  },
  "bankless.com": {
    display_name: "Bankless",
    entity_type: "web3_media",
    summary: "Bankless is an Ethereum-focused media and education brand with a strong audience across DeFi, wallets, governance, and crypto-native adoption.",
    capabilities: ["Web3 education", "Newsletter distribution", "Podcast storytelling", "Community activation", "Ethereum-native thought leadership"],
    audiences: ["Ethereum users", "DeFi participants", "Web3 builders", "DAO contributors", "Crypto investors"],
    markets: ["Ethereum", "DeFi", "Wallets", "L2 ecosystems", "DAO tooling"],
    channels: ["Newsletter", "Podcast", "YouTube", "X", "Community"],
    evidence: ["Recognized Ethereum media brand", "Recurring podcast and newsletter distribution", "Crypto-native community trust"],
    strengths: ["Educational depth", "Ethereum audience fit", "Multi-channel distribution", "Trusted narrative building"],
    limitations: ["Less suited to low-context consumer campaigns", "Audience expects substance", "Requires clear educational angle"],
    collaborations: ["Sponsored education", "Launch explainers", "Ecosystem narratives", "Founder interviews", "Campaign amplification"],
    pricing: { model: "Media sponsorship", range: "Campaign-dependent", factors: ["Channel mix", "placement", "audience fit"] },
    availability: { status: "Media calendar dependent", lead_time: "2-6 weeks", booking: "Media partnership" },
  },
  "thedefiant.io": {
    display_name: "The Defiant",
    entity_type: "web3_media",
    summary: "The Defiant is a DeFi and Web3 media outlet suited for protocol education, ecosystem storytelling, and industry credibility campaigns.",
    capabilities: ["DeFi media coverage", "Protocol education", "Industry analysis", "Newsletter distribution", "Video and editorial storytelling"],
    audiences: ["DeFi users", "Protocol teams", "Crypto investors", "Web3 operators", "Builders"],
    markets: ["DeFi", "Ethereum", "L2 ecosystems", "Protocol launches", "On-chain finance"],
    channels: ["Website", "Newsletter", "YouTube", "X", "Editorial coverage"],
    evidence: ["Established DeFi publication", "Protocol and ecosystem coverage", "Audience alignment with on-chain finance"],
    strengths: ["DeFi audience precision", "Editorial credibility", "Useful for protocol education", "Strong category relevance"],
    limitations: ["Not a broad retail channel", "Works best with substantial protocol news", "Editorial standards constrain messaging"],
    collaborations: ["Sponsored reports", "Protocol explainers", "Launch education", "Founder interviews", "Market analysis"],
    pricing: { model: "Media sponsorship", range: "Campaign-dependent", factors: ["Format", "reach", "editorial depth"] },
    availability: { status: "Media calendar dependent", lead_time: "2-6 weeks", booking: "Media partnership" },
  },
  "x.com/bitboy_crypto": {
    display_name: "BitBoy Crypto",
    entity_type: "retail_crypto_kol",
    summary: "BitBoy Crypto represents high-reach retail crypto attention with significant audience scale but elevated reputation and suitability risk for serious growth campaigns.",
    capabilities: ["Retail crypto reach", "Fast awareness", "Video and social amplification", "Consumer-facing campaign visibility"],
    audiences: ["Retail crypto users", "Speculative traders", "Token communities", "Crypto newcomers"],
    markets: ["Retail crypto", "Token awareness", "Exchange campaigns", "Consumer crypto"],
    channels: ["X", "YouTube", "Social video", "Community discourse"],
    evidence: ["High public visibility", "Retail crypto recognition", "Controversy and reputation sensitivity"],
    strengths: ["Large retail reach", "Fast awareness generation", "Consumer crypto familiarity"],
    limitations: ["Reputation risk", "Low-intent traffic risk", "Regulatory and trust sensitivity", "Poor fit for high-credibility institutional campaigns"],
    collaborations: ["Awareness-only campaigns", "Retail education with strong disclosure", "Carefully controlled consumer campaigns"],
    pricing: { model: "Sponsorship", range: "Unknown", factors: ["Reach", "risk controls", "content format"] },
    availability: { status: "Unknown", lead_time: "Unknown", booking: "Public profile or management" },
  },
  "youtube.com": {
    display_name: "YouTube Creator",
    entity_type: "creator",
    summary: "A content creator with video production capabilities, audience engagement expertise, and a track record of educational or entertainment content.",
    capabilities: ["Video production", "Content strategy", "Audience engagement", "Educational content", "Sponsorship integration", "Editing and post-production"],
    audiences: ["General consumers", "Niche communities", "Tech enthusiasts", "Educational audiences", "Entertainment seekers"],
    markets: ["Digital content", "Online education", "Brand marketing", "Entertainment"],
    channels: ["YouTube", "Instagram", "Community posts", "Email newsletter"],
    evidence: ["Video portfolio", "Subscriber count", "Engagement metrics", "Sponsorship history"],
    strengths: ["Video storytelling", "Consistent content production", "Audience loyalty", "Cross-platform distribution"],
    limitations: ["Limited B2B reach", "Algorithm dependency", "Monetization constraints"],
    collaborations: ["Brand sponsorships", "Guest appearances", "Cross-channel collabs", "Product reviews"],
    pricing: { model: "Sponsorship-based", range: "$500-$50k per video", factors: ["Subscriber count", "Engagement rate", "Niche relevance"] },
    availability: { status: "Limited (high demand)", lead_time: "2-4 weeks", booking: "Email or management" },
  },
  "linkedin.com": {
    display_name: "LinkedIn Professional",
    entity_type: "agency",
    summary: "A business professional with expertise in B2B consulting, strategic advisory, and professional network building.",
    capabilities: ["B2B consulting", "Strategic advisory", "Professional networking", "Thought leadership", "Executive coaching", "Business development"],
    audiences: ["Business executives", "Mid-level managers", "Entrepreneurs", "HR professionals", "Sales leaders"],
    markets: ["Professional services", "B2B SaaS", "Corporate training", "Executive education"],
    channels: ["LinkedIn", "Webinars", "Executive workshops", "Industry events"],
    evidence: ["Endorsements", "Recommendations", "Content engagement", "Speaking history"],
    strengths: ["Professional network", "Industry expertise", "Executive presence", "Strategic thinking"],
    limitations: ["Consumer market gap", "Platform dependency", "Time zone constraints"],
    collaborations: ["Corporate training", "Advisory roles", "Panel participation", "Strategic partnerships"],
    pricing: { model: "Day rate / retainer", range: "$500-$5k per engagement", factors: ["Experience", "Industry", "Engagement scope"] },
    availability: { status: "Moderate", lead_time: "1-3 weeks", booking: "LinkedIn DM or email" },
  },
  "github.com": {
    display_name: "Open Source Developer",
    entity_type: "creator",
    summary: "A software developer with strong open-source contributions, technical expertise, and community credibility in the developer ecosystem.",
    capabilities: ["Software development", "Open source maintenance", "Code review", "Technical documentation", "API design", "Developer tooling"],
    audiences: ["Software engineers", "Engineering managers", "Open source communities", "Developer tool teams", "Tech startups"],
    markets: ["Developer tools", "Open source software", "Cloud infrastructure", "DevOps"],
    channels: ["GitHub", "Technical blog", "Twitter/X", "Developer forums", "Conference talks"],
    evidence: ["Repository stars", "Contribution history", "Issue resolution", "Code quality metrics"],
    strengths: ["Technical depth", "Open source credibility", "Community trust", "Self-directed work"],
    limitations: ["Limited business context", "Communication style", "Documentation priority"],
    collaborations: ["Technical consulting", "Open source sponsorships", "Code audits", "Developer advocacy"],
    pricing: { model: "Hourly / project-based", range: "$100-$500 per hour", factors: ["Expertise rarity", "Project complexity", "Timeline"] },
    availability: { status: "Variable", lead_time: "1-4 weeks", booking: "GitHub or email" },
  },
  "substack.com": {
    display_name: "Newsletter Writer",
    entity_type: "newsletter",
    summary: "An independent writer and content creator with deep expertise in a specific niche, strong subscriber relationships, and regular publication cadence.",
    capabilities: ["Writing and research", "Content strategy", "Audience building", "Newsletter management", "Paid subscriptions", "Data analysis"],
    audiences: ["Niche professionals", "Industry insiders", "Knowledge workers", "Decision makers", "Curious learners"],
    markets: ["Media", "Publishing", "B2B content", "Industry analysis", "Newsletter economy"],
    channels: ["Email newsletter", "Social media", "Podcast", "Community"],
    evidence: ["Subscriber count", "Open rates", "Paid conversion", "Reader retention"],
    strengths: ["Deep domain expertise", "Trusted voice", "Regular audience engagement", "Data-driven content"],
    limitations: ["Limited multimedia", "Dependence on email", "Monetization ceiling"],
    collaborations: ["Sponsored content", "Cross-promotion", "Affiliate partnerships", "Premium interviews"],
    pricing: { model: "Subscription + sponsorship", range: "$500-$10k per sponsored issue", factors: ["Subscriber count", "Niche relevance", "Engagement"] },
    availability: { status: "Weekly cadence", lead_time: "1-2 weeks", booking: "Email" },
  },
};

function extractDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  try {
    const url = new URL(cleaned);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return cleaned;
  }
}

function findKnownProfile(input: string): string | null {
  const lower = input.toLowerCase();
  for (const known of Object.keys(PROFILE_PATTERNS)) {
    if (lower.includes(known)) return known;
  }
  const domain = extractDomain(input);
  for (const known of Object.keys(PROFILE_PATTERNS)) {
    if (domain.includes(known)) return known;
  }
  return null;
}

export function normalizeProfileUrl(input: string): string {
  let cleaned = input.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
}

export function generateMockCapabilityScan(profileUrl: string): CapabilityScanResult {
  const url = normalizeProfileUrl(profileUrl);
  const domain = extractDomain(profileUrl);
  const known = findKnownProfile(url);

  if (known) {
    const k = PROFILE_PATTERNS[known];
    return {
      profile_url: url,
      normalized_domain: domain,
      display_name: k.display_name,
      entity_type: k.entity_type,
      public_summary: k.summary,
      detected_capabilities: k.capabilities.map((c: string) => ({ name: c, confidence: "high" })),
      detected_audiences: k.audiences.map((a: string) => ({ name: a, evidence: "public_profile" })),
      detected_markets: k.markets.map((m: string) => ({ name: m, type: "detected" })),
      detected_channels: k.channels.map((c: string) => ({ channel: c, evidence: "public" })),
      public_evidence: k.evidence.map((e: string) => ({ type: e, source: domain })),
      sources: [{ type: "profile", url: url, reliability: "high" }],
      confidence: { identity: 85, capabilities: 80, audiences: 75, markets: 70, channels: 70, evidence: 75, overall: 76 },
    };
  }

  return {
    profile_url: url,
    normalized_domain: domain,
    display_name: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
    entity_type: "growth_partner",
    public_summary: "A growth capability provider with emerging public presence. Detailed capability assessment requires more data.",
    detected_capabilities: [{ name: "Growth services", confidence: "medium" }],
    detected_audiences: [{ name: "Business professionals", evidence: "inferred" }],
    detected_markets: [{ name: "Digital services", type: "inferred" }],
    detected_channels: [{ channel: "Direct", evidence: "common" }],
    public_evidence: [{ type: "website", source: domain }],
    sources: [{ type: "profile", url: url, reliability: "medium" }],
    confidence: { identity: 55, capabilities: 40, audiences: 35, markets: 30, channels: 30, evidence: 35, overall: 37 },
  };
}

export function createInitialCapabilityKnowledge(scan: CapabilityScanResult): CapabilityKnowledgeResult {
  const known = findKnownProfile(scan.profile_url || scan.normalized_domain);
  const conf = scan.confidence;

  if (known) {
    const k = PROFILE_PATTERNS[known];
    return {
      profile_url: scan.profile_url,
      capability_identity: { name: k.display_name, type: k.entity_type, source: "profile_scan" },
      capability_dna: { execution: 78, trust: 72, authority: 75, reach: 68, audience_fit: 70, innovation: 72, overall: 73 },
      audience_dna: { primary_audiences: k.audiences, confidence_basis: "public_profile" },
      evidence_summary: { total_items: k.evidence.length, types: k.evidence, quality: "high" },
      strengths: k.strengths,
      limitations: k.limitations,
      preferred_collaborations: k.collaborations,
      pricing_signals: k.pricing,
      availability_signals: k.availability,
      knowledge_confidence: calculateCapabilityKnowledgeConfidence(conf),
    };
  }

  return {
    profile_url: scan.profile_url,
    capability_identity: { name: scan.display_name, type: scan.entity_type, source: "profile_scan" },
    capability_dna: { execution: 40, trust: 35, authority: 35, reach: 30, audience_fit: 35, innovation: 40, overall: 36 },
    audience_dna: { primary_audiences: ["Business professionals"], confidence_basis: "limited_data" },
    evidence_summary: { total_items: 0, types: [], quality: "limited" },
    strengths: ["Adaptable", "Emerging expertise"],
    limitations: ["Limited public track record", "Unproven in target markets"],
    preferred_collaborations: ["Initial projects", "Partnership building", "Portfolio development"],
    pricing_signals: { model: "To be determined", range: "Market rate", factors: ["Experience", "Scope"] },
    availability_signals: { status: "Unknown", lead_time: "TBD", booking: "Website contact" },
    knowledge_confidence: calculateCapabilityKnowledgeConfidence(conf),
  };
}

export function calculateCapabilityKnowledgeConfidence(scanConfidence: Record<string, number>): Record<string, number> {
  const cap = Math.round((scanConfidence.capabilities || 0) * 0.9);
  const aud = Math.round((scanConfidence.audiences || 0) * 0.85);
  const ev = Math.round((scanConfidence.evidence || 0) * 0.8);
  const pricing = Math.round(Math.max(0, (scanConfidence.overall || 0) - 15));
  const avail = Math.round(Math.max(0, (scanConfidence.overall || 0) - 20));
  const vals = [cap, aud, ev, pricing, avail];
  return {
    capability_score: cap,
    audience_fit: aud,
    evidence_quality: ev,
    pricing_clarity: pricing,
    availability: avail,
    overall: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  };
}
