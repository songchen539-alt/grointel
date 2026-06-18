// GroIntel AI Gateway - Provider Stubs
// Interface-only implementations for future providers.

import { AIProvider } from "../gateway/provider";
import { AIRequest, AIResponse, AIHealthResult, AICapability } from "../gateway/types";
import { MockAIProvider } from "./mock";

const MOCK = new MockAIProvider();

class StubProvider implements AIProvider {
  readonly name: string;
  readonly capabilities: AICapability[];

  constructor(name: string, capabilities: AICapability[] = ["chat", "json"]) {
    this.name = name;
    this.capabilities = capabilities;
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return { ...(await MOCK.chat(request)), provider: this.name, fallbackUsed: true };
  }
  async json<T>(request: AIRequest): Promise<T> { return MOCK.json(request); }
  async embedding(texts: string[]): Promise<number[][]> { return MOCK.embedding(texts); }
  async rerank(query: string, docs: string[]): Promise<string[]> { return MOCK.rerank(query, docs); }
  async health(): Promise<AIHealthResult> {
    return { provider: this.name, status: "degraded", latencyMs: 0, capabilities: this.capabilities, lastCheckedAt: new Date().toISOString() };
  }
}

export class OpenAIProvider extends StubProvider { constructor() { super("openai"); } }
export class ClaudeProvider extends StubProvider { constructor() { super("claude"); } }
export class GeminiProvider extends StubProvider { constructor() { super("gemini"); } }
export class LocalProvider extends StubProvider { constructor() { super("local"); } }
