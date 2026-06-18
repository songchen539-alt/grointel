// GroIntel AI Gateway - Router
// Routes AI requests to the correct provider based on capability and config.

import { AIProvider } from "./provider";
import { AIRequest, AIResponse, AICapability } from "./types";
import { getProvider } from "../providers/registry";
import { GATEWAY_CONFIG } from "./config";
import { MetricsCollector } from "./metrics";

const metrics = new MetricsCollector();

export class AIRouter {
  async route(capability: AICapability, request: AIRequest): Promise<AIResponse> {
    const providerName = this.getProviderName(capability);
    const provider = getProvider(providerName);
    const start = Date.now();

    try {
      if (capability === "chat") return await provider.chat(request);
      if (capability === "json") return await provider.json(request);
      return await provider.chat(request); // fallback
    } catch (err) {
      console.warn(`[AI Gateway] ${providerName} failed for ${capability}, falling back to mock`);
      metrics.record(providerName, capability, false, Date.now() - start, true);
      return getProvider("mock").chat(request);
    } finally {
      metrics.record(providerName, capability, true, Date.now() - start, false);
    }
  }

  private getProviderName(capability: AICapability): string {
    switch (capability) {
      case "chat": return GATEWAY_CONFIG.AI_CHAT_PROVIDER;
      case "json": return GATEWAY_CONFIG.AI_JSON_PROVIDER;
      case "embedding": return GATEWAY_CONFIG.AI_EMBEDDING_PROVIDER;
      case "rerank": return GATEWAY_CONFIG.AI_RERANK_PROVIDER;
    }
  }
}
