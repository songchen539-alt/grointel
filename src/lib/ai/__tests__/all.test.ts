// GroIntel AI Core v3 - Expanded Tests (85+)
// Run: npx tsx src/lib/ai/__tests__/all.test.ts

import { extractFeatures } from "../recommendation/features";
import { evaluate } from "../recommendation/ruleEngine";
import { generateExplanation } from "../recommendation/explain";
import { computeScore } from "../recommendation/scoring";
import { recommend } from "../recommendation/recommendation";
import { recommendHybrid, buildNeedText, buildServiceText, HybridRecommendation } from "../recommendation/hybrid";
import { MockEmbeddingProvider } from "../embedding/mock";
import { cosineSimilarity, dotProduct, euclideanDistance, similarityByMetric, normalize, averageVectors } from "../embedding/vector";
import { VectorStore } from "../embedding/store";
import { LearningHistory } from "../learning/history";
import { Dataset } from "../learning/dataset";
import { DEFAULT_WEIGHTS, applyWeights, adjustWeights } from "../learning/weights";
import { computeMetrics } from "../learning/metrics";
import { FeedbackCollector } from "../learning/feedback";
import { evaluateRecommendations, evaluateRanking, compareEngines } from "../evaluation";
import { predictSuccess } from "../prediction";
import { computeHybridScore } from "../scoring/hybrid";
import { AI_CONFIG, getConfig } from "../config";
import { GrowthNeed, Channel, ChannelService, RecommendationRequest } from "../recommendation/types";
import { VectorDocument } from "../embedding/types";

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
  console.log("=== GroIntel AI Core v3 Tests ===\n");

  // 1-5: Feature Extraction
  console.log("1. Feature Extraction (5)");
  const features = extractFeatures(mockNeed);
  assert(features.industry === "Artificial Intelligence", "Industry");
  assert(features.region === "APAC / SEA", "Region");
  assert(features.budgetMax === 80000, "Budget");
  assert(features.companySize === "Mid-Market", "Size");
  assert(features.problems.length > 0, "Problems");

  // 6-12: Rule Engine
  console.log("\n2. Rule Engine (7)");
  const result = evaluate({ features, channel: mockChannel, service: mockService });
  assert(result.overall > 0, "Score >0");
  assert(result.overall <= 100, "Score <=100");
  assert(result.scores.industry >= 0, "Industry");
  assert(result.scores.problem >= 0, "Problem");
  assert(result.scores.budget >= 0, "Budget");
  assert(result.reasons.length > 0, "Reasons");
  assert(["High", "Medium", "Low"].includes(result.confidence), "Confidence");

  // 13-15: Explanation
  console.log("\n3. Explanation (3)");
  const exp = generateExplanation(result.overall, result.scores, result.reasons, result.confidence);
  assert(exp.summary.length > 0, "Summary");
  assert(exp.details.length > 0, "Details");
  assert(exp.score === result.overall, "Score");

  // 16-17: Scoring
  console.log("\n4. Scoring (2)");
  assert(computeScore(result.scores) >= 0, "Score");
  assert(typeof computeScore(result.scores) === "number", "Number");

  // 18-20: Pipeline
  console.log("\n5. Pipeline (3)");
  const request: RecommendationRequest = { growthNeed: mockNeed, channels: [mockChannel], services: [mockService] };
  const recs = recommend(request);
  assert(recs.length > 0, "Recs");
  assert(recs[0].overallScore > 0, "Score");
  assert(recs[0].reasons.length > 0, "Reasons");

  // 21-27: Embedding Provider
  console.log("\n6. Embedding (7)");
  const prov = new MockEmbeddingProvider();
  assert(prov.name === "mock", "Name");
  const v1 = await prov.generateEmbedding("AI startup in SEA");
  const v2 = await prov.generateEmbedding("E-commerce in Europe");
  assert(v1.length === 8, "Dim");
  assert(v2.length === 8, "Dim2");
  assert(typeof prov.similarity(v1, v2) === "number", "Sim");
  const batch = await prov.generateEmbeddings(["A", "B"]);
  assert(batch.length === 2, "Batch");
  assert(batch[0].length === 8, "BatchDim");

  // 28-35: Vector Ops
  console.log("\n7. Vector Ops (8)");
  const a = [1, 0, 0]; const b = [0, 1, 0]; const c = [1, 0, 0];
  assert(cosineSimilarity(a, a) === 1, "Cos same");
  assert(cosineSimilarity(a, b) === 0, "Cos orth");
  assert(cosineSimilarity(a, c) === 1, "Cos eq");
  assert(dotProduct(a, b) === 0, "Dot orth");
  assert(dotProduct(a, a) === 1, "Dot same");
  assert(euclideanDistance(a, b) > 0, "Euc >0");
  assert(euclideanDistance(a, a) === 0, "Euc 0");
  assert(similarityByMetric(a, a, "cosine") === 1, "Metric");

  // 36-39: Vector Store
  console.log("\n8. Vector Store (4)");
  const store = new VectorStore();
  store.add({ id: "1", type: "growth_need", text: "AI", embedding: [0.9, 0.1, 0], metadata: {}, source: "test" });
  store.add({ id: "2", type: "channel", text: "Tech", embedding: [0.1, 0.9, 0], metadata: {}, source: "test" });
  assert(store.size === 2, "Size");
  const sr = store.search([0.8, 0.2, 0], 1);
  assert(sr.length === 1, "Srch");
  assert(sr[0].document.id === "1", "Rel");
  assert(store.findByType("channel").length === 1, "Filter");

  // 40-45: Learning History
  console.log("\n9. Learning (6)");
  const hist = new LearningHistory();
  hist.add({ channelId: "ch-1", serviceId: null, growthNeedId: "n-1", ruleScore: 80, embeddingScore: null, hybridScore: 80, outcome: "won", timestamp: "2026-01-01" });
  hist.add({ channelId: "ch-1", serviceId: null, growthNeedId: "n-2", ruleScore: 70, embeddingScore: null, hybridScore: 70, outcome: "lost", timestamp: "2026-01-02" });
  assert(hist.size === 2, "Size");
  assert(hist.getByChannel("ch-1").length === 2, "Chan");
  assert(hist.getAccepted().length === 1, "Acc");
  assert(hist.getRejected().length === 1, "Rej");

  // 46-49: Dataset
  console.log("\n10. Dataset (4)");
  const ds = new Dataset();
  ds.fromOutcomes(hist.getAll());
  assert(ds.size === 2, "Size");
  assert(ds.getExamples().length === 2, "Ex");
  assert(ds.getExamples()[0].features.length === 3, "Feat");
  const sp = ds.split(0.5);
  assert(sp.train.length + sp.test.length === 2, "Split");

  // 50-53: Weights
  console.log("\n11. Weights (4)");
  assert(DEFAULT_WEIGHTS.industry === 0.30, "Default");
  assert(applyWeights({ industry: 80, problem: 70, region: 60, budget: 50, timeline: 40, history: 30 }, DEFAULT_WEIGHTS) > 0, "Apply");
  const adj = adjustWeights(DEFAULT_WEIGHTS, 0.1, 0.01);
  assert(adj.industry !== DEFAULT_WEIGHTS.industry, "Adj");
  assertClose(Object.values(adj).reduce((a, b) => a + b, 0), 1.0, 0.01, "Sum");

  // 54-57: Feedback
  console.log("\n12. Feedback (4)");
  const fb = new FeedbackCollector();
  fb.record({ recommendationId: "r1", channelId: "ch-1", serviceId: null, type: "accepted", timestamp: "" });
  fb.record({ recommendationId: "r2", channelId: "ch-1", serviceId: null, type: "rejected", timestamp: "" });
  assert(fb.size === 2, "Size");
  assert(fb.getAccepted().length === 1, "Acc");
  assert(fb.getRejected().length === 1, "Rej");

  // 58-60: Metrics
  console.log("\n13. Metrics (3)");
  const m = computeMetrics(hist.getAll());
  assert(typeof m.precision === "number", "Prec");
  assert(m.totalRecommendations === 2, "Total");

  // 61-64: Evaluation
  console.log("\n14. Evaluation (4)");
  const ev = evaluateRecommendations(recs, hist.getAll());
  assert(typeof ev.precision === "number", "Prec");
  assert(ev.totalRecommendations > 0, "Total");
  assert(evaluateRanking(recs, ["ch-1"]) >= 0, "MRR");

  // 65-67: Prediction
  console.log("\n15. Prediction (3)");
  const pred = predictSuccess(recs[0], hist.getAll());
  assert(pred.probability >= 0, "Prob min");
  assert(pred.probability <= 1, "Prob max");
  assert(pred.factors.length > 0, "Factors");

  // 68-71: Hybrid Scoring
  console.log("\n16. Hybrid Scoring (4)");
  const h = await computeHybridScore({ ruleScore: 80, needText: "AI SEA", channelText: "SEA Agency" });
  assert(h.hybridScore > 0, "Hybrid");
  assert(h.ruleScore === 80, "Rule");
  assert(h.embeddingScore >= 0, "Emb");

  // 72-74: Config
  console.log("\n17. Config (3)");
  assert(AI_CONFIG.RULE_WEIGHT === 0.80, "Rule");
  assert(AI_CONFIG.EMBEDDING_WEIGHT === 0.20, "EmbW");
  assert(getConfig({ RULE_WEIGHT: 0.90 }).RULE_WEIGHT === 0.90, "Custom");

  // 75-76: Compare
  console.log("\n18. Compare (2)");
  const rm = computeMetrics(hist.getAll());
  const hm = { ...rm, avgScore: rm.avgScore + 5 };
  const cmp = compareEngines(rm, hm);
  assert(Object.keys(cmp).length > 0, "Cmp");

  // 77-79: Transforms
  console.log("\n19. Transforms (3)");
  const n = normalize([3, 4, 0]);
  assertClose(n[0], 0.6, 0.01, "NormX");
  assertClose(n[1], 0.8, 0.01, "NormY");
  assert(averageVectors([[1, 2], [3, 4]])[0] === 2, "Avg");

  // === NEW HYBRID TESTS ===

  // 80-82: buildNeedText
  console.log("\n20. buildNeedText (3)");
  const ntxt = buildNeedText(mockNeed);
  assert(ntxt.includes("TestCo"), "Company");
  assert(ntxt.includes("SEA"), "Region");
  assert(ntxt.includes("30000"), "Budget");

  // 83-85: buildServiceText
  console.log("\n21. buildServiceText (3)");
  const stxt = buildServiceText(mockChannel, mockService);
  assert(stxt.includes("SEA Market Entry"), "Name");
  assert(stxt.includes("market entry"), "Type");
  const ctxt = buildServiceText(mockChannel, null);
  assert(ctxt.includes("SEA Growth Agency"), "Channel");

  // 86-89: recommendHybrid
  console.log("\n22. recommendHybrid (4)");
  const hybridRecs = await recommendHybrid(mockNeed, [mockChannel], [mockService]);
  assert(hybridRecs.length > 0, "Recs");
  assert(hybridRecs[0].scoringMode === "hybrid" || hybridRecs[0].scoringMode === "rule_fallback", "Mode");
  assert(hybridRecs[0].ruleScore > 0, "RuleScore");
  assert(hybridRecs[0].hybridScore > 0, "HybridScore");

  // 90-92: Hybrid score components
  console.log("\n23. Hybrid Components (3)");
  const hr = hybridRecs[0];
  assert(hr.hybridScore >= 0, "Hybrid");
  assert(hr.hybridScore <= 100, "Hybrid100");
  assert(typeof hr.embeddingScore === "number", "EmbNum");

  // 93-94: Hybrid ordering
  console.log("\n24. Hybrid Ordering (2)");
  const multiRecs = await recommendHybrid(mockNeed, [mockChannel, { ...mockChannel, id: "ch-2", channelName: "Other Agency" }], [mockService]);
  assert(multiRecs.length <= 4, "Max4");
  assert(multiRecs[0].hybridScore >= multiRecs[multiRecs.length - 1].hybridScore, "Sorted");

  // 95-96: Hybrid ranking
  console.log("\n25. Hybrid Ranking (2)");
  assert(multiRecs[0].hybridScore >= 0, "TopScore");
  assert(multiRecs[multiRecs.length - 1].hybridScore >= 0, "LastScore");

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
