// GroIntel CIE Seed Generator
// Generates realistic Capability DNA, Audience DNA, Evidence, History, Explanations, and Relationships
// for all 100 Growth Passports

import { supabaseUrl, supabaseKey } from "../scripts/lib/connection";

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

// —— ENTITY PROFILES for generating realistic CIE data ——

const INDUSTRIES = ["Fintech", "AI", "Developer Tools", "SaaS", "HR SaaS", "GTM AI", "AI Audio", "AI Video", "Enterprise AI", "Web3", "L1 Blockchain", "Legal AI", "AI Infrastructure", "Growth Marketing", "Content Marketing", "SEO", "Paid Ads", "PR", "Community", "Branding", "Lead Generation", "Video Production", "Social Media", "Email Marketing", "RevOps", "Influencer Marketing", "Market Entry", "CRO", "Developer Relations"];

const REGIONS = ["North America", "Europe", "APAC", "Latin America", "Middle East", "Africa"];

const CHANNELS = ["LinkedIn", "Twitter/X", "YouTube", "Podcast", "Newsletter", "Blog", "Webinar", "Events", "Cold Email", "Paid Ads", "SEO", "Referral", "Community", "Partnerships", "PR"];

const RELATIONSHIP_TYPES = ["works_with", "served", "collaborated_with", "featured_on", "invested_in", "partner_of", "sponsored_by"];

const EVIDENCE_TYPES = ["website", "linkedin", "x", "github", "youtube", "podcast", "newsletter", "case_study", "review", "media_mention", "public_dataset"];

const PERSONAS = [
  { industry: "Fintech", companySizes: ["1-10", "10-50", "50-200"], roles: ["CTO", "Head of Growth", "CFO"], pains: ["Payment friction", "Fraud prevention", "Cross-border compliance"] },
  { industry: "AI", companySizes: ["1-10", "10-50"], roles: ["CEO", "CTO", "Head of Product"], pains: ["Model deployment", "Data quality", "Evaluation"] },
  { industry: "SaaS", companySizes: ["1-10", "10-50", "50-200", "200+"], roles: ["VP Growth", "CMO", "CEO"], pains: ["Customer acquisition cost", "Churn", "Activation"] },
  { industry: "Web3", companySizes: ["1-10", "10-50"], roles: ["Founder", "Community Lead", "Head of BD"], pains: ["User onboarding", "Community growth", "Token distribution"] },
  { industry: "Developer Tools", companySizes: ["1-10", "10-50", "50-200"], roles: ["DevRel", "CEO", "Product"], pains: ["Developer adoption", "Documentation", "API design"] },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
}

function randomScore(min, max) { return Math.round(min + Math.random() * (max - min)); }

// Generate capability DNA scores for an entity
function generateCapabilityScores(entity) {
  const type = entity.entity_type;
  const base = {
    company: 70, agency: 65, creator: 60, community: 50, media: 55, podcast: 50, newsletter: 50,
  };
  const baseScore = base[type] || 55;
  return {
    execution_score: randomScore(baseScore - 15, baseScore + 15),
    trust_score: randomScore(baseScore - 20, baseScore + 10),
    authority_score: randomScore(baseScore - 10, baseScore + 15),
    reach_score: randomScore(baseScore - 25, baseScore + 20),
    audience_fit_score: randomScore(baseScore - 10, baseScore + 10),
    industry_expertise_score: randomScore(baseScore - 5, baseScore + 20),
    pricing_score: randomScore(45, 85),
    availability_score: randomScore(40, 90),
    innovation_score: randomScore(50, 95),
    roi_score: randomScore(40, 80),
    confidence: randomScore(50, 90),
    evidence_count: randomScore(2, 15),
    calculation_version: 1,
    overall_score: 0, // filled below
  };
}

function computeOverall(scores) {
  const weights = {
    execution_score: 0.20, trust_score: 0.15, authority_score: 0.15,
    reach_score: 0.10, audience_fit_score: 0.10, industry_expertise_score: 0.10,
    pricing_score: 0.05, availability_score: 0.05, innovation_score: 0.05, roi_score: 0.05,
  };
  let total = 0;
  for (const [k, w] of Object.entries(weights)) {
    total += (scores[k] || 50) * w;
  }
  return Math.round(Math.min(100, Math.max(0, total)));
}

function generateAudienceDna(entity) {
  const persona = pick(PERSONAS);
  return {
    industries: [entity.primary_industry || persona.industry, ...pickN(INDUSTRIES, 2).filter(i => i !== entity.primary_industry)],
    company_sizes: pickN(persona.companySizes, 2),
    buyer_roles: pickN(persona.roles, 3),
    buyer_stage: pickN(["awareness", "consideration", "decision"], 2),
    budget_range: pick(["$1k-5k/mo", "$5k-20k/mo", "$20k-100k/mo", "$100k+/mo"]),
    regions: pickN(REGIONS, 2),
    languages: ["English"],
    pain_points: pickN(persona.pains, 3),
    preferred_channels: pickN(CHANNELS, 4),
    decision_cycle: pick(["short", "medium", "long"]),
    confidence: randomScore(40, 85),
    metadata: { source: "ci-v1-seed" },
  };
}

function generateEvidence(entity, count) {
  const evidence = [];
  const types = pickN(EVIDENCE_TYPES, Math.min(count, EVIDENCE_TYPES.length));
  for (const type of types) {
    const item = {
      passport_id: entity.passport_id,
      evidence_type: type,
      source_url: entity.website ? `${entity.website}/${type}` : `https://example.com/${type}`,
      source_title: `${entity.display_name} ${type.replace(/_/g, " ")}`,
      source_description: `${pick(["Case study", "Review", "Profile", "Article", "Interview"])} about ${entity.display_name}`,
      source_date: `202${randomScore(3, 6)}-0${randomScore(1, 9)}-0${randomScore(1, 28)}`,
      source_author: entity.display_name,
      source_platform: type === "linkedin" ? "LinkedIn" : type === "x" ? "X" : type === "youtube" ? "YouTube" : type === "podcast" ? "Spotify" : type === "newsletter" ? "Substack" : "Web",
      credibility_score: randomScore(30, 95),
      verification_status: randomScore(0, 100) > 70 ? "auto_verified" : "unverified",
      metadata: { seed: true },
    };
    evidence.push(item);
  }
  return evidence;
}

function generateHistoryEntry(scores, confidence, version) {
  const snapshot = { ...scores };
  delete snapshot.overall_score;
  return {
    passport_id: null, // filled by caller
    capability_snapshot: snapshot,
    overall_score: scores.overall_score,
    confidence,
    reason: `Version ${version}: Baseline capability assessment`,
    evidence_used: Object.keys(scores).filter(k => k.endsWith("_score") && k !== "overall_score").map(k => `${k}: ${scores[k]}`),
    calculated_at: new Date().toISOString(),
  };
}

function generateExplanations(scores, confidence, evidence) {
  const dims = Object.entries(scores).filter(([k]) => k.endsWith("_score") && k !== "overall_score" && k !== "extra_dimensions").slice(0, 5);
  return dims.map(([key, value]) => ({
    passport_id: null,
    capability_name: key.replace(/_score$/, "").replace(/_/g, " "),
    score: value,
    confidence: randomScore(40, confidence),
    reason: `Score ${value}/100 based on ${pick(["rule-based", "evidence-driven", "hybrid"])} analysis using ${randomScore(2, 8)} data points`,
    evidence_used: evidence.slice(0, 2).map(e => e.evidence_type),
    ai_model_version: "cie-v1.0",
    generated_at: new Date().toISOString(),
  }));
}

function generateRelationships(entity, allEntities, passportIdMap) {
  const count = randomScore(1, 5);
  const rels = [];
  const candidates = allEntities.filter(e => e.entity_id !== entity.entity_id).sort(() => 0.5 - Math.random()).slice(0, count);
  for (const target of candidates) {
    const targetPid = passportIdMap[target.entity_id];
    if (!targetPid) continue;
    rels.push({
      source_passport_id: entity.passport_id,
      target_passport_id: targetPid,
      relationship_type: pick(RELATIONSHIP_TYPES),
      confidence: randomScore(40, 85),
      evidence_url: entity.website ? `${entity.website}/relationships` : null,
      description: `${entity.display_name} ${pick(["works with", "partners with", "serves", "collaborates with"])} ${target.display_name}`,
      metadata: { seed: true },
    });
  }
  return rels;
}

async function run() {
  console.log("=== CIE Seed Generator ===\n");

  // Fetch all passports with entities
  const passportsResp = await api("/api/passports");
  if (!passportsResp.success) {
    console.log("FAIL: Could not fetch passports:", passportsResp.error);
    return;
  }
  const passports = passportsResp.passports;
  console.log(`Loaded ${passports.length} passports`);

  // Build entity lookup
  const allEntities = passports.map(p => ({
    passport_id: p.id,
    entity_id: p.entity_id,
    display_name: p.entity?.display_name || "Unknown",
    entity_type: p.entity?.entity_type || "unknown",
    website: p.entity?.website || null,
    primary_industry: p.primary_industry || null,
  }));

  // Build passport_id map
  const passportIdMap = {};
  for (const e of allEntities) {
    passportIdMap[e.entity_id] = e.passport_id;
  }

  let capCount = 0, audCount = 0, evCount = 0, histCount = 0, explCount = 0, relCount = 0, skipCount = 0;

  for (const entity of allEntities) {
    console.log(`\n  Processing: ${entity.display_name} (${entity.entity_type})`);

    // Check if capability_dna already exists
    const existingCheck = await api(`/api/passports/${entity.passport_id}/capability-dna`);
    if (existingCheck.success && existingCheck.capabilityDna) {
      console.log(`    SKIP: capability DNA already exists`);
      skipCount++;
      await sleep(50);
      continue;
    }

    // 1. Generate Capability DNA
    const scores = generateCapabilityScores(entity);
    scores.overall_score = computeOverall(scores);

    const capBody = {
      passport_id: entity.passport_id,
      ...scores,
      last_calculated: new Date().toISOString(),
    };
    // We need to insert via direct Supabase API since the passport APIs don't have POST for CIE
    // Use the entities endpoint instead
    try {
      const postUrl = `${BASE}/api/entities`; // dummy, we'll use direct insert
    } catch(e) {}

    // Generate all data in memory
    const audience = generateAudienceDna(entity);
    const evidence = generateEvidence(entity, scores.evidence_count);
    const history = generateHistoryEntry(scores, scores.confidence, 1);
    const explanations = generateExplanations(scores, scores.confidence, evidence);
    const relationships = generateRelationships(entity, allEntities, passportIdMap);

    console.log(`    Generated: capability DNA, audience DNA, ${evidence.length} evidence, 1 history, ${explanations.length} explanations, ${relationships.length} relationships`);
    capCount++; audCount++; evCount += evidence.length; histCount++; explCount += explanations.length; relCount += relationships.length;
    await sleep(100);
  }

  console.log(`\n=== Results ===`);
  console.log(`  Capability DNA: ${capCount}`);
  console.log(`  Audience DNA: ${audCount}`);
  console.log(`  Evidence items: ${evCount}`);
  console.log(`  History entries: ${histCount}`);
  console.log(`  Explanations: ${explCount}`);
  console.log(`  Relationships: ${relCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`\nDONE - Data generated in memory. Insert via Supabase SQL next.`);
}

run().catch(console.error);
