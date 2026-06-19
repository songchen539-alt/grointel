// GroIntel Proposal Seed Script
// Creates 10 realistic proposals from existing entities
// Each proposal is a structured growth plan between a business and a capability partner

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const api = async (url, opts = {}) => {
  const res = await fetch(BASE + url, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json", ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
};

// Proposal scenarios
const SCENARIOS = [
  {
    title: "AI SaaS Market Entry: Japan Expansion",
    goal: "Launch and scale AI-powered business intelligence platform in the Japanese market within 6 months, targeting mid-market enterprises.",
    constraints: { budget: "150k-300k", timeline: "6 months", team: "3-5 person local team" },
    strategy: { phase1: "Market research and localization (month 1-2)", phase2: "Channel partner recruitment (month 2-4)", phase3: "Enterprise pilot program (month 4-6)" },
    capability_stack: ["market_entry", "localization", "enterprise_sales", "partnerships", "pr"],
    execution_plan: { milestones: ["Complete market analysis", "Hire local team", "Launch with 3 partners", "10 enterprise pilots"], kpis: ["MRR", "Partner count", "Pilot conversion"] },
    budget_min: 150000, budget_max: 300000, timeline: "6 months",
    expected_outcome: "Established presence in Japan with 10 enterprise accounts and 5 channel partners generating $500k ARR.",
    reasoning: { rationale: "Japan is the 3rd largest SaaS market globally with high enterprise IT spend", risks: ["Language barrier", "Cultural adaptation", "Competition from local players"], mitigations: ["Local partner network", "Gradual rollout"] },
    confidence_score: 72, business_filter: (e) => e.entity_type === "company" && (e.primary_industry || "").toLowerCase().includes("ai"),
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("market entry"),
  },
  {
    title: "Healthcare Tech PR & Positioning Campaign",
    goal: "Establish Stripe as the payment infrastructure leader in healthcare through targeted PR, thought leadership, and industry partnerships.",
    constraints: { budget: "80k-150k", timeline: "4 months", focus: "US healthcare" },
    strategy: { phase1: "Industry narrative development", phase2: "Executive visibility program", phase3: "Healthcare partnership announcements" },
    capability_stack: ["pr", "thought_leadership", "healthcare", "media_relations", "content"],
    execution_plan: { milestones: ["3 bylines in healthcare publications", "2 conference speaking slots", "10 media mentions"], kpis: ["Share of voice", "Media impressions", "Speaking engagements"] },
    budget_min: 80000, budget_max: 150000, timeline: "4 months",
    expected_outcome: "Positioned as the leading payment platform for healthcare with measurable increase in healthcare pipeline.",
    reasoning: { rationale: "Healthcare payment processing is a $XXB market with low fintech penetration", risks: ["Regulatory sensitivity", "Long sales cycles"], mitigations: ["Start with non-regulated use cases"] },
    confidence_score: 68, business_filter: (e) => e.display_name === "Stripe",
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("pr"),
  },
  {
    title: "E-Commerce Growth: Creator Partnership Program",
    goal: "Design and launch a creator partnership program to drive e-commerce adoption through authentic content and social proof.",
    constraints: { budget: "50k-120k", timeline: "3 months" },
    strategy: { phase1: "Creator identification and outreach", phase2: "Program design and incentive structure", phase3: "Campaign execution and measurement" },
    capability_stack: ["influencer_marketing", "creator_management", "social_media", "content", "analytics"],
    execution_plan: { milestones: ["Recruit 20 creators", "Launch 3 campaigns", "200+ content pieces"], kpis: ["Engagement rate", "Referral traffic", "Conversion rate"] },
    budget_min: 50000, budget_max: 120000, timeline: "3 months",
    expected_outcome: "Active creator program driving measurable e-commerce growth with 15% of new customers from creator referrals.",
    reasoning: { rationale: "Creator-led commerce grew 40% YoY", risks: ["Creator fit", "Brand safety"], mitigations: ["Strict guidelines", "Tiered partnership model"] },
    confidence_score: 75, business_filter: (e) => e.entity_type === "company" && (e.primary_industry || "").toLowerCase().includes("saas"),
    capability_filter: (e) => e.entity_type === "creator" || e.entity_type === "agency",
  },
  {
    title: "FinTech Community Growth Engine",
    goal: "Build and scale an engaged developer community for Ramp's API platform to drive adoption and reduce support costs.",
    constraints: { budget: "60k-100k", timeline: "5 months", audience: "Developers" },
    strategy: { phase1: "Community platform setup and content strategy", phase2: "Developer advocacy program", phase3: "Community-led growth mechanics" },
    capability_stack: ["community", "developer_relations", "content", "events", "documentation"],
    execution_plan: { milestones: ["500 community members", "10 technical tutorials", "3 hackathons"], kpis: ["Daily active members", "API adoption", "Support ticket deflection"] },
    budget_min: 60000, budget_max: 100000, timeline: "5 months",
    expected_outcome: "Thriving developer community with 2000+ members, 3x increase in API adoption, 25% reduction in support tickets.",
    reasoning: { rationale: "Developer communities drive 3x faster API adoption", risks: ["Low engagement", "Moderation overhead"], mitigations: ["Gamification", "Community-led moderation"] },
    confidence_score: 70, business_filter: (e) => e.entity_type === "company" && (e.primary_industry || "").toLowerCase().includes("fintech"),
    capability_filter: (e) => e.entity_type === "community" || (e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("community")),
  },
  {
    title: "B2B SaaS SEO Expansion: Enterprise Content Strategy",
    goal: "Grow organic traffic and lead generation for Cursor through comprehensive SEO content strategy targeting developer and engineering leaders.",
    constraints: { budget: "40k-90k", timeline: "8 months", focus: "Enterprise SEO" },
    strategy: { phase1: "Technical SEO audit and content gap analysis", phase2: "Enterprise-focused content production", phase3: "Link building and authority development" },
    capability_stack: ["seo", "content_marketing", "technical_seo", "link_building", "analytics"],
    execution_plan: { milestones: ["50 enterprise-focused articles", "100+ backlinks", "3x organic traffic growth"], kpis: ["Organic traffic", "Keyword rankings", "MQL from organic"] },
    budget_min: 40000, budget_max: 90000, timeline: "8 months",
    expected_outcome: "3x increase in organic traffic with 20% of top-funnel traffic converting to demo requests.",
    reasoning: { rationale: "Enterprise buyers start 70% of purchasing journeys with search", risks: ["Long time to results", "Algorithm changes"], mitigations: ["Diversified keyword strategy", "Brand building"] },
    confidence_score: 65, business_filter: (e) => e.display_name === "Cursor" || e.display_name === "Replit",
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("seo"),
  },
  {
    title: "OpenAI: Developer Relations & Hackathon Program",
    goal: "Strengthen OpenAI's developer ecosystem through structured DevRel program, hackathons, and technical content.",
    constraints: { budget: "100k-200k", timeline: "6 months", audience: "AI Developers" },
    strategy: { phase1: "DevRel team setup and content engine", phase2: "Hackathon series (virtual + in-person)", phase3: "Developer ambassador program" },
    capability_stack: ["developer_relations", "events", "content", "community", "technical_writing"],
    execution_plan: { milestones: ["Recruit 50 ambassadors", "3 hackathons with 1000+ participants", "50 technical blog posts"], kpis: ["API signups", "Developer NPS", "Community activity"] },
    budget_min: 100000, budget_max: 200000, timeline: "6 months",
    expected_outcome: "Strong developer ecosystem with measurable increase in API adoption and developer satisfaction.",
    reasoning: { rationale: "DevRel programs drive 5x higher developer retention", risks: ["Scalability", "Quality control"], mitigations: ["Automated onboarding", "Ambassador program"] },
    confidence_score: 78, business_filter: (e) => e.display_name === "OpenAI",
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("developer relations"),
  },
  {
    title: "Web3 Protocol: Global Marketing Campaign",
    goal: "Launch Monad's global brand awareness campaign targeting developers, validators, and DeFi projects.",
    constraints: { budget: "200k-400k", timeline: "8 months", focus: "Global - APAC focus" },
    strategy: { phase1: "Brand positioning and narrative", phase2: "Multi-channel content and PR", phase3: "Ecosystem partnership development" },
    capability_stack: ["branding", "pr", "content", "social_media", "events", "partnerships"],
    execution_plan: { milestones: ["Global brand launch", "25+ media mentions", "5 ecosystem partnerships"], kpis: ["Brand awareness", "Developer signups", "TVL growth"] },
    budget_min: 200000, budget_max: 400000, timeline: "8 months",
    expected_outcome: "Established as top-3 L1 blockchain by developer mindshare in target markets.",
    reasoning: { rationale: "2026 L1 competition requires strong brand differentiation", risks: ["Market volatility", "Regulatory uncertainty"], mitigations: ["Multi-jurisdiction legal review", "Diversified marketing mix"] },
    confidence_score: 60, business_filter: (e) => e.display_name === "Monad",
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("branding"),
  },
  {
    title: "AI Voice: Enterprise Sales Enablement",
    goal: "Build enterprise sales pipeline for ElevenLabs through targeted ABM campaigns, sales enablement content, and industry partnerships.",
    constraints: { budget: "150k-250k", timeline: "5 months", focus: "Enterprise accounts" },
    strategy: { phase1: "ABM target account identification", phase2: "Sales enablement content production", phase3: "Executive engagement program" },
    capability_stack: ["lead_generation", "content", "sales_enablement", "abm", "partnerships"],
    execution_plan: { milestones: ["50 target accounts", "15 discovery meetings", "3 enterprise deals"], kpis: ["Pipeline value", "Meeting-to-opportunity rate", "Deal velocity"] },
    budget_min: 150000, budget_max: 250000, timeline: "5 months",
    expected_outcome: "Enterprise pipeline worth $5M+ with proven ABM playbook for AI audio vertical.",
    reasoning: { rationale: "Enterprise AI adoption is at inflection point", risks: ["Long enterprise sales cycles", "Budget approval"], mitigations: ["ROI calculators", "Executive summits"] },
    confidence_score: 73, business_filter: (e) => e.display_name === "ElevenLabs",
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("lead generation"),
  },
  {
    title: "Perplexity: Creator & Educator Partnership Program",
    goal: "Develop and launch a creator partnership program for Perplexity, targeting AI educators, researchers, and tech content creators.",
    constraints: { budget: "30k-80k", timeline: "3 months", audience: "AI creators" },
    strategy: { phase1: "Creator identification and outreach", phase2: "Sponsored content and affiliate program", phase3: "Creator advisory board" },
    capability_stack: ["influencer_marketing", "content", "social_media", "community", "partnerships"],
    execution_plan: { milestones: ["30 creator partnerships", "100+ content pieces", "Advisory board formed"], kpis: ["Content reach", "Referral signups", "Creator NPS"] },
    budget_min: 30000, budget_max: 80000, timeline: "3 months",
    expected_outcome: "Scalable creator channel driving 50k+ new signups per quarter through authentic creator content.",
    reasoning: { rationale: "AI product adoption is heavily influenced by creator recommendations", risks: ["Content quality", "Brand alignment"], mitigations: ["Strict briefs", "Tiered partnership model"] },
    confidence_score: 76, business_filter: (e) => e.display_name === "Perplexity",
    capability_filter: (e) => e.entity_type === "creator" || e.entity_type === "agency",
  },
  {
    title: "B2B Data Platform: Content-Led Growth Strategy",
    goal: "Establish Clay as the go-to GTM data platform through comprehensive content marketing targeting revenue leaders.",
    constraints: { budget: "80k-180k", timeline: "9 months", focus: "GTM leaders" },
    strategy: { phase1: "Content engine setup and pillar content", phase2: "Distribution channel expansion", phase3: "Community and user-generated content" },
    capability_stack: ["content_marketing", "seo", "social_media", "community", "email_marketing", "webinar"],
    execution_plan: { milestones: ["100 content pieces", "50k newsletter subscribers", "5 industry reports"], kpis: ["Organic traffic", "Lead quality score", "Content-attributed revenue"] },
    budget_min: 80000, budget_max: 180000, timeline: "9 months",
    expected_outcome: "Content-led growth engine generating 30% of pipeline with established thought leadership in GTM data category.",
    reasoning: { rationale: "Content marketing drives 3x more leads than outbound at 62% lower cost", risks: ["Content saturation", "Long ramp time"], mitigations: ["Data-backed unique insights", "Expert contributors"] },
    confidence_score: 71, business_filter: (e) => e.display_name === "Clay",
    capability_filter: (e) => e.entity_type === "agency" && (e.primary_industry || "").toLowerCase().includes("content marketing"),
  },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function run() {
  console.log("=== Proposal Seed ===\n");

  // Load all entities with passports
  const passportsResp = await api("/api/passports");
  if (!passportsResp.success) {
    console.log("FAIL:", passportsResp.error);
    return;
  }
  const passports = passportsResp.passports;
  console.log(`Loaded ${passports.length} passports`);

  // Build lookup
  const entities = passports.map(p => ({
    passport_id: p.id,
    entity_id: p.entity_id,
    display_name: p.entity?.display_name || "Unknown",
    entity_type: p.entity?.entity_type || "unknown",
    primary_industry: p.primary_industry || null,
  }));

  let created = 0, failed = 0;

  for (const scenario of SCENARIOS) {
    // Find matching business entity
    let business = entities.find(e => e.display_name === (scenario.business_filter.toString().match(/'([^']+)'/)?.[1] || ""));
    // Fallback: find any matching filter
    if (!business) {
      business = entities.find(scenario.business_filter);
    }
    if (!business) {
      // Generic fallback
      business = entities.find(e => e.entity_type === "company");
    }

    // Find matching capability partner
    let capability = entities.find(scenario.capability_filter);
    if (!capability) {
      capability = entities.find(e => e.entity_type === "agency" || e.entity_type === "creator");
    }

    if (!business || !capability) {
      console.log(`  SKIP ${scenario.title}: no matching entities`);
      failed++;
      continue;
    }

    // Create proposal
    const proposalBody = {
      title: scenario.title,
      business_entity_id: business.entity_id,
      capability_entity_id: capability.entity_id,
      passport_id: business.passport_id,
      goal: scenario.goal,
      constraints: scenario.constraints,
      strategy: scenario.strategy,
      capability_stack: scenario.capability_stack,
      execution_plan: scenario.execution_plan,
      budget_min: scenario.budget_min,
      budget_max: scenario.budget_max,
      currency: "USD",
      timeline: scenario.timeline,
      expected_outcome: scenario.expected_outcome,
      reasoning: scenario.reasoning,
      confidence_score: scenario.confidence_score,
      status: "draft",
    };

    const resp = await api("/api/proposals", { method: "POST", body: proposalBody });
    if (resp.success) {
      const pid = resp.proposal?.id || resp.proposal?.proposal?.id || "?";
      console.log(`  CREATED: ${scenario.title.slice(0, 60)}`);
      console.log(`    Business: ${business.display_name}, Partner: ${capability.display_name}`);
      console.log(`    Budget: $${scenario.budget_min/1000}k-$${scenario.budget_max/1000}k, Confidence: ${scenario.confidence_score}%`);
      created++;
    } else {
      console.log(`  FAIL: ${scenario.title} - ${resp.error}`);
      failed++;
    }
    await sleep(300);
  }

  console.log(`\nCreated: ${created}, Failed: ${failed}, Total: ${created + failed}`);
  console.log("DONE");
}

run().catch(console.error);
