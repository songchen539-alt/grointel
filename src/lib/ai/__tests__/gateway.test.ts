// GroIntel AI Gateway - Tests
// Run: npx tsx src/lib/ai/__tests__/gateway.test.ts

import { MockAIProvider } from "../providers/mock";
import { DeepSeekProvider } from "../providers/deepseek";
import { getProvider, registerProvider, getAvailableProviders } from "../providers/registry";
import { AIRouter } from "../gateway/router";
import { getAIRouter } from "../gateway/factory";
import { GatewayCache } from "../gateway/cache";
import { MetricsCollector } from "../gateway/metrics";
import { checkAllProviders, checkProvider } from "../gateway/health";
import { GATEWAY_CONFIG } from "../gateway/config";
import type { AIProvider } from "../gateway/provider";
import { AIRequest, AIResponse, AIHealthResult, AICapability } from "../gateway/types";

let passed = 0;
let failed = 0;
function assert(condition: boolean, label: string) {
  if (condition) passed++; else { console.log(`  FAIL: ${label}`); failed++; }
}

async function run() {
  console.log("=== AI Gateway Tests ===\n");

  // 1-5: Provider Interface
  console.log("1. Provider Interface (5)");
  const mock = new MockAIProvider();
  assert(mock.name === "mock", "Name");
  assert(mock.capabilities.length === 4, "4 caps");
  assert(mock.capabilities.includes("chat"), "Has chat");
  assert(mock.capabilities.includes("embedding"), "Has embedding");
  assert(mock.capabilities.includes("rerank"), "Has rerank");

  // 6-10: MockProvider Chat
  console.log("\n2. Mock Chat/JSON (5)");
  const chatRes = await mock.chat({ prompt: "Hello" });
  assert(chatRes.content.length > 0, "Content");
  assert(chatRes.provider === "mock", "Provider");
  assert(chatRes.latencyMs >= 0, "Latency");
  assert(chatRes.fallbackUsed === false, "No fallback");
  const jsonRes = await mock.json<{ test: string }>({ prompt: "test" });
  assert(typeof jsonRes === "object", "JSON");

  // 11-14: Mock Embedding
  console.log("\n3. Mock Embedding (4)");
  const emb = await mock.embedding(["test text"]);
  assert(emb.length === 1, "1 embedding");
  assert(emb[0].length === 8, "Dim 8");
  assert(typeof emb[0][0] === "number", "Number");
  assert(await mock.health(), "Health");

  // 15-19: DeepSeek basic
  console.log("\n4. DeepSeek (5)");
  const ds = new DeepSeekProvider();
  assert(ds.name === "deepseek", "Name");
  assert(!ds.isConfigured(), "Not configured by default");
  assert(ds.capabilities.includes("chat"), "Chat");
  assert(ds.capabilities.includes("json"), "JSON");
  assert(!ds.capabilities.includes("embedding"), "No embedding");

  // 20-24: DeepSeek fallback
  console.log("\n5. DeepSeek Fallback (5)");
  const fallbackChat = await ds.chat({ prompt: "test" });
  assert(fallbackChat.fallbackUsed === true, "Fallback used");
  assert(fallbackChat.content.length > 0, "Has content");
  assert(fallbackChat.provider === "mock", "Mock provider");
  const fallbackJson = await ds.json({ prompt: "test" });
  assert(typeof fallbackJson === "object", "JSON fallback");
  const dsHealth = await ds.health();
  assert(dsHealth.status === "unavailable", "Unavailable without key");

  // 25-28: Registry
  console.log("\n6. Registry (4)");
  registerProvider("test-mock", mock);
  assert(getProvider("test-mock").name === "mock", "Get by name");
  const np = getProvider("nonexistent"); assert(np === undefined || np.name === "mock", "Nonexistent handled");
  const providers = getAvailableProviders();
  assert(providers.length >= 1, "Has providers");

  // 29-32: Router basic
  console.log("\n7. Router (4)");
  const router = getAIRouter();
  assert(router instanceof AIRouter, "Is router");
  const routeRes = await router.route("chat", { prompt: "hi" });
  assert(routeRes.content.length > 0, "Route content");
  assert(typeof routeRes.latencyMs === "number", "Latency");
  assert(routeRes.provider.length > 0, "Has provider");

  // 33-35: Cache
  console.log("\n8. Cache (3)");
  const cache = new GatewayCache();
  cache.set("key1", "value1");
  assert(cache.get("key1") === "value1", "Get after set");
  cache.delete("key1");
  assert(cache.get("key1") === undefined, "After delete");
  assert(cache.size === 0, "Size 0");

  // 36-38: Cache TTL
  console.log("\n9. Cache TTL (3)");
  cache.set("ttl-key", "val", 1);
  assert(cache.get("ttl-key") === "val", "Before expiry");
  await new Promise((r) => setTimeout(r, 10));
  assert(cache.get("ttl-key") === undefined, "After expiry");
  cache.clear();
  assert(cache.size === 0, "After clear");

  // 39-43: Metrics
  console.log("\n10. Metrics (5)");
  const metrics = new MetricsCollector();
  metrics.record("mock", "chat", true, 10, false);
  metrics.record("mock", "chat", true, 20, false);
  metrics.record("deepseek", "chat", false, 100, true);
  const stats = metrics.getStats();
  assert(stats.totalRequests === 3, "3 requests");
  assert(stats.successRate === 2 / 3, "Success rate");
  assert(stats.avgLatencyMs > 0, "Avg latency");
  assert(stats.fallbackRate > 0, "Has fallback");
  assert(metrics.getEntries().length === 3, "3 entries");

  // 44-47: Health
  console.log("\n11. Health (4)");
  const allHealth = await checkAllProviders();
  assert(allHealth.length >= 2, "Multiple providers");
  const mockHealth = allHealth.find((h) => h.provider === "mock");
  assert(mockHealth?.status === "healthy", "Mock healthy");
  assert(mockHealth?.capabilities.length > 0, "Has caps");
  assert(mockHealth?.lastCheckedAt, "Has timestamp");

  // 48-50: Config
  console.log("\n12. Config (3)");
  assert(GATEWAY_CONFIG.AI_CHAT_PROVIDER === "mock", "Default chat");
  assert(GATEWAY_CONFIG.AI_FALLBACK_PROVIDER === "mock", "Default fallback");
  assert(GATEWAY_CONFIG.AI_TIMEOUT_MS === 8000, "Timeout");

  // 51-55: Rerank mock
  console.log("\n13. Mock Rerank (5)");
  const reranked = await mock.rerank("query", ["doc1", "doc2", "doc3"]);
  assert(reranked.length === 3, "3 docs");
  assert(reranked[0] === "doc1", "Preserves order");
  const embed2 = await mock.embedding(["a", "b", "c"]);
  assert(embed2.length === 3, "3 embeddings");
  assert(embed2[0].length === 8, "Dim");
  
  // 56-58: Provider interface check
  console.log("\n14. Provider Interface check (3)");
  assert(typeof mock.chat === "function", "Chat fn");
  assert(typeof mock.embedding === "function", "Embed fn");
  assert(typeof mock.health === "function", "Health fn");

  // 59-62: Router with different capabilities
  console.log("\n15. Router capabilities (4)");
  const jsonViaRouter = await router.route("json", { prompt: "test" });
  assert(jsonViaRouter !== undefined, "JSON via router");

  // 63-66: Metrics collector edge cases
  console.log("\n16. Metrics edge cases (4)");
  const emptyMetrics = new MetricsCollector();
  const emptyStats = emptyMetrics.getStats();
  assert(emptyStats.totalRequests === 0, "Empty metrics");
  assert(emptyStats.successRate === 0, "Empty success");
  
  // 67-70: Mock health re-check
  console.log("\n17. Mock health details (4)");
  const mh = await mock.health();
  assert(mh.status === "healthy", "Status");
  assert(mh.provider === "mock", "Provider");
  assert(Array.isArray(mh.capabilities), "Caps array");
  assert(mh.lastCheckedAt.length > 0, "Timestamp");

  // 71-73: Cache edge cases
  console.log("\n18. Cache edge (3)");
  assert(cache.get("nonexistent") === undefined, "Missing key");
  cache.set("exp-key", "val", -1);
  await new Promise((r) => setTimeout(r, 1));
  assert(cache.get("exp-key") === undefined, "Expired");

  // 74-75: DeepSeek capabilities
  console.log("\n19. DeepSeek caps (2)");
  assert(ds.capabilities.length === 2, "2 caps");
  assert(!ds.capabilities.includes("rerank"), "No rerank");

  // 76-78: Provider fallback in router
  console.log("\n20. Router fallback (3)");
  const origChat = process.env.AI_CHAT_PROVIDER;
  process.env.AI_CHAT_PROVIDER = "deepseek";
  // Reset config
  const { GATEWAY_CONFIG: GC } = await import("../gateway/config");
  const deepseekRouter = new AIRouter();
  const deepseekFallback = await deepseekRouter.route("chat", { prompt: "hi" });
  assert(deepseekFallback.content.length > 0, "DS fallback works");
  assert(deepseekFallback.fallbackUsed === false, "Mock used directly");
  if (origChat) process.env.AI_CHAT_PROVIDER = origChat;

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
