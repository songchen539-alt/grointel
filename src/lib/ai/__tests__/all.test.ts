// GroIntel AI Core v2 - Expanded Unit Tests (60+)
// Run: npx tsx src/lib/ai/__tests__/all.test.ts

import { extractFeatures } from "../recommendation/features";
import { evaluate } from "../recommendation/ruleEngine";
import { generateExplanation } from "../recommendation/explain";
import { computeScore } from "../recommendation/scoring";
import { recommend } from "../recommendation/recommendation";
import { MockEmbeddingProvider } from "../embedding/mock";
import { cosineSimilarity, dotProduct, euclideanDistance, similarityByMetric, normalize, averageVectors } from "../embedding/vector";
import { VectorStore } from "../embedding/store";
import { LearningHistory, OutcomeRecord } from "../learning/history";
import { Dataset } from "../learning/dataset";
import { DEFAULT_WEIGHTS, applyWeights, adjustWeights } from "../learning/weights";
import { computeMetrics } from "../learning/metrics";
import { compareEngines } from "../evaluation";
import { FeedbackCollector } from "../learning/feedback";
import { evaluateRecommendations, evaluateRanking } from "../evaluation";
import { predictSuccess } from "../prediction";
import { computeHybridScore, hybridRecommend } from "../scoring/hybrid";
import { AI_CONFIG, getConfig } from "../config";
import { GrowthNeed, Channel, ChannelService, RecommendationRequest } from "../recommendation/types";
import { VectorDocument } from "../embedding/types";
import { EmbeddingProvider } from "../embedding/provider";

// Test fixtures
const mockNeed: GrowthNeed = {
  id: "test-1", companyName: "TestCo", website: "testco.io", industry: "Artificial Intelligence",
  region: "APAC / SEA", stage: "Growth Stage", growthGoal: "Expand into SEA markets",
  targetMarket: "SEA", targetCustomer: "Enterprise",
  currentChallenge: "Market entry and local partnerships",
  budgetMin: 30000, budgetMax: 80000, currency: "USD", timeline: "3 months", preferredChannels: [],
};

const mockChannel: Channel = {
  id: "ch-1", channelName: "SEA Growth Agency", website: "seagrowth.com", category: "agency",
  region: "SEA", serviceTypes: ["market entry"], targetIndustries: ["AI"], targetClientStage: ["growth"],
  pricingModel: "project", minBudget: 25000, maxBudget: 100000, currency: "USD",
  growthOutcomes: "SEA market entry", caseStudies: "5 AI companies",
};

const mockService: ChannelService = {
  id: "svc-1", channelId: "ch-1", serviceName: "SEA Market Entry", serviceType: "market entry",
  problemSolved: "Market entry without partnerships", growthOutcome: "Local partnerships",
  deliverables: "Partner ID", timeline: "90 days", pricingModel: "project",
  startingPrice: 25000, maxPrice: 50000, currency: "USD", targetRegion: "SEA", targetIndustry: "AI",
  successMetrics: "Partnerships", caseStudy: "Results",
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) { passed++; } else { console.log(`  FAIL: ${label}`); failed++; }
}

function assertClose(a: number, b: number, tolerance: number, label: string) {
  assert(Math.abs(a - b) <= tolerance, `${label} (${a} ≈ ${b})`);
}

async function run() {
  console.log("=== GroIntel AI Core v2 Tests ===\n");

  // 1-5: Feature Extraction (5)
  console.log("1. Feature Extraction (5)");
  const features = extractFeatures(mockNeed);
  assert(features.industry === "Artificial Intelligence", "Industry extraction");
  assert(features.region === "APAC / SEA", "Region extraction");
  assert(features.budgetMax === 80000, "Budget extraction");
  assert(features.companySize === "Mid-Market", "Company size");
  assert(features.problems.length > 0, "Problem extraction");

  // 6-12: Rule Engine (7)
  console.log("\n2. Rule Engine (7)");
  const result = evaluate({ features, channel: mockChannel, service: mockService });
  assert(result.overall > 0, "Overall score");
  assert(result.overall <= 100, "Score within range");
  assert(result.scores.industry >= 0, "Industry score");
  assert(result.scores.problem >= 0, "Problem score");
  assert(result.scores.budget >= 0, "Budget score");
  assert(result.reasons.length > 0, "Reasons");
  assert(["High", "Medium", "Low"].includes(result.confidence), "Confidence");

  // 13-15: Explanation (3)
  console.log("\n3. Explanation (3)");
  const exp = generateExplanation(result.overall, result.scores, result.reasons, result.confidence);
  assert(exp.summary.length > 0, "Summary");
  assert(exp.details.length > 0, "Details");
  assert(exp.score === result.overall, "Score match");

  // 16-17: Scoring (2)
  console.log("\n4. Scoring (2)");
  assert(computeScore(result.scores) >= 0, "Compute score");
  assert(typeof computeScore(result.scores) === "number", "Is number");

  // 18-20: Recommendation Pipeline (3)
  console.log("\n5. Pipeline (3)");
  const request: RecommendationRequest = { growthNeed: mockNeed, channels: [mockChannel], services: [mockService] };
  const recs = recommend(request);
  assert(recs.length > 0, "Recommendations");
  assert(recs[0].overallScore > 0, "Has score");
  assert(recs[0].reasons.length > 0, "Has reasons");

  // 21-27: Mock Embedding (7)
  console.log("\n6. Embedding Provider (7)");
  const prov = new MockEmbeddingProvider();
  assert(prov.name === "mock", "Provider name");
  const v1 = await prov.generateEmbedding("AI startup in Southeast Asia");
  const v2 = await prov.generateEmbedding("E-commerce platform in Europe");
  assert(v1.length === 8, "Vector dimension");
  assert(v2.length === 8, "Vector dimension2");
  assert(typeof prov.similarity(v1, v2) === "number", "Similarity number");
  const batch = await prov.generateEmbeddings(["text A", "text B"]);
  assert(batch.length === 2, "Batch generation");
  assert(batch[0].length === 8, "Batch vector dim");

  // 28-35: Vector Operations (8)
  console.log("\n7. Vector Operations (8)");
  const a = [1, 0, 0]; const b = [0, 1, 0]; const c = [1, 0, 0];
  assert(cosineSimilarity(a, a) === 1, "Cosine same");
  assert(cosineSimilarity(a, b) === 0, "Cosine orthogonal");
  assert(cosineSimilarity(a, c) === 1, "Cosine equal");
  assert(dotProduct(a, b) === 0, "Dot orthogonal");
  assert(dotProduct(a, a) === 1, "Dot same");
  assert(euclideanDistance(a, b) > 0, "Euclidean > 0");
  assert(euclideanDistance(a, a) === 0, "Euclidean 0");
  assert(similarityByMetric(a, a, "cosine") === 1, "Metric cosine");

  // 36-39: Vector Store (4)
  console.log("\n8. Vector Store (4)");
  const store = new VectorStore();
  const doc1: VectorDocument = { id: "1", type: "growth_need", text: "AI", embedding: [0.9, 0.1, 0], metadata: {}, source: "test" };
  const doc2: VectorDocument = { id: "2", type: "channel", text: "Tech", embedding: [0.1, 0.9, 0], metadata: {}, source: "test" };
  store.add(doc1); store.add(doc2);
  assert(store.size === 2, "Store size");
  const results = store.search([0.8, 0.2, 0], 1);
  assert(results.length === 1, "Search top1");
  assert(results[0].document.id === "1", "Search relevance");
  assert(store.findByType("channel").length === 1, "Find by type");

  // 40-45: Learning History (6)
  console.log("\n9. Learning History (6)");
  const hist = new LearningHistory();
  hist.add({ channelId: "ch-1", serviceId: null, growthNeedId: "n-1", ruleScore: 80, embeddingScore: null, hybridScore: 80, outcome: "won", timestamp: "2026-01-01" });
  hist.add({ channelId: "ch-1", serviceId: null, growthNeedId: "n-2", ruleScore: 70, embeddingScore: null, hybridScore: 70, outcome: "lost", timestamp: "2026-01-02" });
  hist.add({ channelId: "ch-2", serviceId: null, growthNeedId: "n-3", ruleScore: 60, embeddingScore: null, hybridScore: 60, outcome: "won", timestamp: "2026-01-03" });
  assert(hist.size === 3, "History size");
  assert(hist.getByChannel("ch-1").length === 2, "Filter by channel");
  assert(hist.getAccepted().length === 2, "Accepted count");
  assert(hist.getRejected().length === 1, "Rejected count");

  // 46-49: Dataset (4)
  console.log("\n10. Dataset (4)");
  const ds = new Dataset();
  ds.fromOutcomes(hist.getAll());
  assert(ds.size === 3, "Dataset size");
  const ex = ds.getExamples();
  assert(ex.length === 3, "Examples count");
  assert(ex[0].features.length === 3, "Feature dim");
  const split = ds.split(0.67);
  assert(split.train.length + split.test.length === 3, "Split total");

  // 50-53: Weights (4)
  console.log("\n11. Weights (4)");
  assert(DEFAULT_WEIGHTS.industry === 0.30, "Default industry weight");
  const scores = { industry: 80, problem: 70, region: 60, budget: 50, timeline: 40, history: 30 };
  assert(applyWeights(scores, DEFAULT_WEIGHTS) > 0, "Apply weights");
  const adjusted = adjustWeights(DEFAULT_WEIGHTS, 0.1, 0.01);
  assert(adjusted.industry !== DEFAULT_WEIGHTS.industry, "Weight adjusted");
  const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
  assertClose(sum, 1.0, 0.01, "Weights sum to 1");

  // 54-57: Feedback (4)
  console.log("\n12. Feedback (4)");
  const fb = new FeedbackCollector();
  fb.record({ recommendationId: "r1", channelId: "ch-1", serviceId: null, type: "accepted", timestamp: "2026-01-01" });
  fb.record({ recommendationId: "r2", channelId: "ch-1", serviceId: null, type: "rejected", timestamp: "2026-01-02" });
  assert(fb.size === 2, "Feedback size");
  assert(fb.getAccepted().length === 1, "Accepted count");
  assert(fb.getRejected().length === 1, "Rejected count");

  // 58-61: Metrics (4)
  console.log("\n13. Metrics (4)");
  const metrics = computeMetrics(hist.getAll());
  assert(typeof metrics.precision === "number", "Precision");
  assert(metrics.totalRecommendations === 3, "Total recs");
  assert(metrics.totalAccepted === 2, "Accepted");
  assert(metrics.totalRejected === 1, "Rejected");

  // 62-65: Evaluation (4)
  console.log("\n14. Evaluation (4)");
  const evalResult = evaluateRecommendations(recs, hist.getAll());
  assert(typeof evalResult.precision === "number", "Eval precision");
  assert(evalResult.totalRecommendations > 0, "Eval total");
  const mrr = evaluateRanking(recs, ["ch-1"]);
  assert(mrr >= 0, "MRR computed");
  assert(mrr <= 1, "MRR max 1");

  // 66-68: Prediction (3)
  console.log("\n15. Prediction (3)");
  const pred = predictSuccess(recs[0], hist.getAll());
  assert(pred.probability >= 0, "Probability min");
  assert(pred.probability <= 1, "Probability max");
  assert(pred.factors.length > 0, "Factors");

  // 69-72: Hybrid Scoring (4)
  console.log("\n16. Hybrid Scoring (4)");
  const hybrid = await computeHybridScore({ ruleScore: 80, needText: "AI SEA entry", channelText: "SEA market agency" });
  assert(hybrid.hybridScore > 0, "Hybrid score");
  assert(hybrid.ruleScore === 80, "Rule preserved");
  assert(hybrid.embeddingScore >= 0, "Embedding score");

  // 73-75: Configuration (3)
  console.log("\n17. Configuration (3)");
  assert(AI_CONFIG.RULE_WEIGHT === 0.80, "Default rule weight");
  assert(AI_CONFIG.EMBEDDING_WEIGHT === 0.20, "Default embedding weight");
  const custom = getConfig({ RULE_WEIGHT: 0.90 });
  assert(custom.RULE_WEIGHT === 0.90, "Custom weight");

  // 76-77: compareEngines (2)
  console.log("\n18. Compare Engines (2)");
  const ruleMetrics = computeMetrics(hist.getAll());
  const hybridMetrics = { ...ruleMetrics, avgScore: ruleMetrics.avgScore + 5 };
  const comparison = compareEngines(ruleMetrics, hybridMetrics);
  assert(Object.keys(comparison).length > 0, "Comparison results");

  // 78-80: Vector transformations (3)
  console.log("\n19. Vector Transforms (3)");
  const norm = normalize([3, 4, 0]);
  assertClose(norm[0], 0.6, 0.01, "Normalize X");
  assertClose(norm[1], 0.8, 0.01, "Normalize Y");
  const avg = averageVectors([[1, 2], [3, 4]]);
  assert(avg[0] === 2, "Average X");
  assert(avg[1] === 3, "Average Y");

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
