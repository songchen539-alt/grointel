// GroIntel AI Core - Unit Tests
// Run: npx vitest run or npx tsx src/lib/ai/__tests__/core.test.ts

import { extractFeatures } from "../recommendation/features";
import { evaluate } from "../recommendation/ruleEngine";
import { generateExplanation } from "../recommendation/explain";
import { scoreIndustry, scoreRegion, scoreBudget } from "../recommendation/ruleEngine";
import { computeScore } from "../recommendation/scoring";
import { recommend } from "../recommendation/recommendation";
import { MockEmbeddingProvider } from "../embedding/embedding";
import { cosineSimilarity } from "../embedding/vector";
import { GrowthNeed, Channel, ChannelService, RecommendationRequest } from "../recommendation/types";

// Test fixtures
const mockNeed: GrowthNeed = {
  id: "test-1",
  companyName: "TestCo",
  website: "testco.io",
  industry: "Artificial Intelligence",
  region: "APAC / SEA",
  stage: "Growth Stage",
  growthGoal: "Expand into Southeast Asian markets",
  targetMarket: "SEA",
  targetCustomer: "Enterprise",
  currentChallenge: "Market entry and local partnerships",
  budgetMin: 30000,
  budgetMax: 80000,
  currency: "USD",
  timeline: "3 months",
  preferredChannels: ["agency", "partnerships"],
};

const mockChannel: Channel = {
  id: "ch-1",
  channelName: "SEA Growth Agency",
  website: "seagrowth.com",
  category: "agency",
  region: "SEA",
  serviceTypes: ["market entry", "partnerships"],
  targetIndustries: ["Artificial Intelligence", "SaaS"],
  targetClientStage: ["growth"],
  pricingModel: "project",
  minBudget: 25000,
  maxBudget: 100000,
  currency: "USD",
  growthOutcomes: "SEA market entry and partnerships",
  caseStudies: "Helped 5 AI companies enter SEA",
};

const mockService: ChannelService = {
  id: "svc-1",
  channelId: "ch-1",
  serviceName: "SEA Market Entry",
  serviceType: "market entry",
  problemSolved: "Companies struggle to enter SEA without local partnerships",
  growthOutcome: "Established partnerships and first customers",
  deliverables: "Partner identification and intro meetings",
  timeline: "90 days",
  pricingModel: "project",
  startingPrice: 25000,
  maxPrice: 50000,
  currency: "USD",
  targetRegion: "SEA",
  targetIndustry: "AI",
  successMetrics: "Partner meetings booked",
  caseStudy: "Previous client results",
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.log(`  FAIL: ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== GroIntel AI Core Tests ===\n");

  // Test 1: Feature Extraction
  console.log("1. Feature Extraction");
  const features = extractFeatures(mockNeed);
  assert(features.industry === "Artificial Intelligence", "Industry extraction");
  assert(features.region === "APAC / SEA", "Region extraction");
  assert(features.budgetMax === 80000, "Budget extraction");
  assert(features.companySize === "Mid-Market", "Company size estimation");
  assert(features.problems.length > 0, "Problem extraction");

  // Test 2: Rule Engine Scoring
  console.log("\n2. Rule Engine Scoring");
  const result = evaluate({ features, channel: mockChannel, service: mockService });
  assert(result.overall > 0, "Overall score computed");
  assert(result.overall <= 100, "Overall score within range");
  assert(result.scores.industry >= 0, "Industry score computed");
  assert(result.scores.problem >= 0, "Problem score computed");
  assert(result.scores.budget >= 0, "Budget score computed");
  assert(result.reasons.length > 0, "Reasons generated");
  assert(["High", "Medium", "Low"].includes(result.confidence), "Confidence level set");

  // Test 3: Explanation Engine
  console.log("\n3. Explanation Engine");
  const explanation = generateExplanation(result.overall, result.scores, result.reasons, result.confidence);
  assert(explanation.summary.length > 0, "Summary generated");
  assert(explanation.details.length > 0, "Details generated");
  assert(explanation.score === result.overall, "Score matches");

  // Test 4: Scoring Engine
  console.log("\n4. Scoring Engine");
  const computed = computeScore(result.scores);
  assert(computed >= 0 && computed <= 100, "Score computed correctly");
  assert(typeof computed === "number", "Score is number");

  // Test 5: Embedding (Mock)
  console.log("\n5. Mock Embedding");
  const provider = new MockEmbeddingProvider();
  const vec1 = await provider.generateEmbedding("AI startup in Southeast Asia");
  const vec2 = await provider.generateEmbedding("AI market entry in SEA");
  const vec3 = await provider.generateEmbedding("E-commerce platform in Europe");
  assert(vec1.length === 8, "Vector dimension correct");
  const simAB = provider.similarity(vec1, vec2);
  const simAC = provider.similarity(vec1, vec3);
  assert(typeof simAB === "number", "Similarity is number");

  // Test 6: Cosine Similarity
  console.log("\n6. Cosine Similarity");
  const a = [1, 0, 0];
  const b = [0, 1, 0];
  const c = [1, 0, 0];
  assert(cosineSimilarity(a, a) === 1, "Same vector similarity = 1");
  assert(cosineSimilarity(a, b) === 0, "Orthogonal vectors similarity = 0");
  assert(cosineSimilarity(a, c) === 1, "Equal vectors similarity = 1");

  // Test 7: Full Recommendation Pipeline
  console.log("\n7. Recommendation Pipeline");
  const request: RecommendationRequest = {
    growthNeed: mockNeed,
    channels: [mockChannel],
    services: [mockService],
  };
  const recs = recommend(request);
  assert(recs.length > 0, "Recommendations generated");
  assert(recs[0].overallScore > 0, "Top recommendation has score");
  assert(recs[0].reasons.length > 0, "Top recommendation has reasons");
  assert(recs[0].channelId === "ch-1", "Correct channel matched");

  // Test 8: No match scenario
  console.log("\n8. No Match Scenario");
  const mismatchedChannel: Channel = {
    ...mockChannel,
    id: "ch-2",
    region: "Europe",
    targetIndustries: ["E-Commerce"],
    minBudget: 200000,
  };
  const mismatchedResult = evaluate({ features, channel: mismatchedChannel, service: null });
  assert(mismatchedResult.overall < result.overall, "Mismatch scores lower than match");

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
