// GroIntel CIE Engine Tests
// Tests for Capability Intelligence Calculator, Confidence, Health, and XAI modules

import { calculateCapability } from "../calculateCapability";
import { calculateConfidence } from "../calculateConfidence";
import { calculateHealth, calculateCompleteness } from "../calculateHealth";
import { generateExplanation, generateFullExplanation, generateOverallExplanation } from "../generateExplanation";
import { PassportData, EntityData, EvidenceItem } from "../types";

// --- Mock Data ---
const mockEntity: EntityData = {
  id: "entity-1",
  entity_type: "company",
  display_name: "TestCorp",
  website: "https://testcorp.io",
  country: "US",
  languages: ["en"],
};

const mockPassport: PassportData = {
  id: "passport-1",
  headline: "AI Growth Platform",
  description: "We help companies grow with AI",
  mission: "Democratize growth intelligence",
  primary_industry: "AI/SaaS",
  secondary_industries: ["Fintech", "Developer Tools"],
  primary_region: "North America",
  service_regions: ["US", "EU", "APAC"],
  company_size: "50-200",
  team_size: 80,
  year_founded: 2019,
  pricing_level: "Premium",
  availability: "High",
  overall_completion: 70,
};

const mockMinimalPassport: PassportData = {
  id: "passport-2",
  headline: null,
  description: null,
  mission: null,
  primary_industry: null,
  secondary_industries: null,
  primary_region: null,
  service_regions: null,
  company_size: null,
  team_size: null,
  year_founded: null,
  pricing_level: null,
  availability: null,
  overall_completion: 10,
};

const mockEvidence: EvidenceItem[] = [
  { evidence_type: "case_study", source_url: "https://example.com/cs1", source_title: "Growth Case Study 1", source_description: null, source_date: "2025-06-01", source_author: null, source_platform: null, credibility_score: 80, verification_status: "auto_verified", metadata: {} },
  { evidence_type: "linkedin", source_url: "https://linkedin.com/company/testcorp", source_title: null, source_description: null, source_date: null, source_author: null, source_platform: "linkedin", credibility_score: 70, verification_status: "unverified", metadata: {} },
  { evidence_type: "review", source_url: "https://g2.com/testcorp", source_title: "G2 Review", source_description: null, source_date: "2025-09-01", source_author: null, source_platform: "G2", credibility_score: 85, verification_status: "auto_verified", metadata: {} },
  { evidence_type: "website", source_url: "https://testcorp.io", source_title: "TestCorp Website", source_description: null, source_date: "2026-01-01", source_author: null, source_platform: null, credibility_score: 50, verification_status: "unverified", metadata: {} },
  { evidence_type: "podcast", source_url: "https://podcast.example.com", source_title: "CEO Interview", source_description: null, source_date: "2025-03-01", source_author: "Host", source_platform: "Spotify", credibility_score: 60, verification_status: "unverified", metadata: {} },
];

// --- Tests ---

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error("FAIL: " + msg);
  console.log("  PASS: " + msg);
}

// ========================================
// Test: calculateCapability
// ========================================
console.log("=== calculateCapability ===");

// Full passport
const result = calculateCapability(
  mockPassport,
  mockEntity,
  { website: 1, linkedin: 1, case_study: 1, review: 2 },
  { linkedin: 5000, x: 12000 },
  3
);

assert(result.scores.execution_score > 0, "execution_score should be > 0");
assert(result.scores.trust_score > 0, "trust_score should be > 0");
assert(result.scores.authority_score > 0, "authority_score should be > 0");
assert(result.scores.reach_score > 0, "reach_score should be > 0");
assert(result.scores.overall_score > 0, "overall_score should be > 0");
assert(result.scores.overall_score <= 100, "overall_score should be <= 100");
assert(result.confidence > 0, "confidence should be > 0");
assert(result.evidence_count === 5, "evidence_count should be 5");
assert(result.calculation_version === 1, "version should be 1");
assert(result.history_entry.overall_score === result.scores.overall_score, "history should match");
assert(result.history_entry.evidence_used.length > 0, "history should include evidence");

// Minimal passport
const minResult = calculateCapability(
  mockMinimalPassport,
  { ...mockEntity, entity_type: "creator" },
  {},
  {},
  0
);
assert(minResult.scores.overall_score > 0, "minimal should still produce a score");
assert(minResult.confidence < 60, "minimal should have lower confidence");
assert(minResult.evidence_count === 0, "no evidence = 0");

// ========================================
// Test: calculateConfidence
// ========================================
console.log("\n=== calculateConfidence ===");

const highConf = calculateConfidence(mockPassport, mockEvidence);
assert(highConf >= 30, "good data should have decent confidence");
assert(highConf <= 100, "confidence <= 100");

const lowConf = calculateConfidence(mockMinimalPassport, []);
assert(lowConf < 30, "minimal data = low confidence");

const noPassportConf = calculateConfidence(null as unknown as PassportData, []);
assert(noPassportConf === 0, "null passport = 0 confidence");

// ========================================
// Test: calculateHealth
// ========================================
console.log("\n=== calculateHealth ===");

const health = calculateHealth(mockPassport, mockEvidence, 75, 80);
assert(health.health_score > 0, "health score > 0");
assert(health.health_score <= 100, "health score <= 100");
assert(health.completeness_score > 0, "completeness > 0");
assert(health.factors.length === 5, "5 health factors");

const lowHealth = calculateHealth(mockMinimalPassport, [], 30, 20);
assert(lowHealth.health_score < 60, "minimal data = lower health");

// ========================================
// Test: calculateCompleteness
// ========================================
console.log("\n=== calculateCompleteness ===");

const complete = calculateCompleteness(mockPassport);
assert(complete.total_required === 10, "10 required fields");
assert(complete.total_filled === 10, "mock passport fills all 10");
assert(complete.completeness_score === 100, "100% complete");

const incomplete = calculateCompleteness(mockMinimalPassport);
assert(incomplete.total_filled === 0, "minimal fills nothing");
assert(incomplete.completeness_score === 0, "0% complete");
assert(incomplete.missing_fields.length === 10, "10 missing fields");

// ========================================
// Test: generateExplanation
// ========================================
console.log("\n=== generateExplanation ===");

const explanation = generateExplanation("execution_score", 85, 75, mockEvidence);
assert(explanation.capability_name === "execution_score", "correct name");
assert(explanation.score === 85, "correct score");
assert(explanation.confidence === 75, "correct confidence");
assert(explanation.reason.length > 20, "reason should be detailed");
assert(explanation.ai_model_version === "cie-v1.0", "correct version");
assert(explanation.generated_at.length > 0, "has timestamp");

const lowExplanation = generateExplanation("reach_score", 20, 30, []);
assert(lowExplanation.reason.includes("limited"), "low score reason");

// ========================================
// Test: generateFullExplanation
// ========================================
console.log("\n=== generateFullExplanation ===");

const full = generateFullExplanation(result.scores, 80, mockEvidence);
assert(full.length > 0, "should have explanations");
assert(full.some(e => e.capability_name.includes("execution")), "includes specific dims");

// ========================================
// Test: generateOverallExplanation
// ========================================
console.log("\n=== generateOverallExplanation ===");

const overall = generateOverallExplanation(result.scores, 80, 5, "TestCorp");
assert(overall.capability_name === "overall", "overall explanation");
assert(overall.reason.includes("TestCorp"), "includes entity name");
assert(overall.reason.includes("80"), "includes confidence");

// Weak scores
const weakScores = { ...result.scores, execution_score: 30, trust_score: 25 };
const weakOverall = generateOverallExplanation(weakScores, 50, 0, "WeakCorp");
assert(weakOverall.reason.includes("improvement"), "mentions improvement areas");

// ========================================
// Results
// ========================================
console.log("\n=== All CIE tests passed ===");
