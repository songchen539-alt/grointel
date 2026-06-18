// GroIntel AI Gateway - Mock Provider
// Deterministic mock for all AI capabilities. Used as default fallback.

import { AIProvider } from "../gateway/provider";
import { AIRequest, AIResponse, AIHealthResult, AICapability } from "../gateway/types";

export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  readonly capabilities: AICapability[] = ["chat", "json", "embedding", "rerank"];

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const msg = request.messages?.find((m) => m.role === "user")?.content || request.prompt || "";
    const content = `[Mock AI] Received: "${msg.slice(0, 50)}..."`;
    return { content, provider: "mock", latencyMs: Date.now() - start, fallbackUsed: false };
  }

  async json<T>(_request: AIRequest): Promise<T> {
    return {} as T;
  }

  async embedding(texts: string[]): Promise<number[][]> {
    const { MockEmbeddingProvider } = await import("../embedding/mock");
    const mock = new MockEmbeddingProvider();
    return mock.generateEmbeddings(texts);
  }

  async rerank(_query: string, documents: string[]): Promise<string[]> {
    return documents;
  }

  async health(): Promise<AIHealthResult> {
    return {
      provider: "mock",
      status: "healthy",
      latencyMs: 0,
      capabilities: this.capabilities,
      lastCheckedAt: new Date().toISOString(),
    };
  }
}
