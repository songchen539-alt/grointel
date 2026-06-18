// GroIntel AI Gateway - DeepSeek Provider
// Real AI provider using DeepSeek API. Fetch-based, no SDK.

import { AIProvider } from "../gateway/provider";
import { AIRequest, AIResponse, AIHealthResult, AICapability } from "../gateway/types";
import { GATEWAY_CONFIG } from "../gateway/config";
import { MockAIProvider } from "./mock";

const MOCK = new MockAIProvider();

export class DeepSeekProvider implements AIProvider {
  readonly name = "deepseek";
  readonly capabilities: AICapability[] = ["chat", "json"];

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = GATEWAY_CONFIG.DEEPSEEK_API_KEY;
    this.model = GATEWAY_CONFIG.DEEPSEEK_MODEL;
    this.baseUrl = GATEWAY_CONFIG.DEEPSEEK_BASE_URL;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) return this.fallback("chat", request);
    const start = Date.now();
    try {
      const messages: { role: string; content: string }[] = [];
      if (request.system) messages.push({ role: "system", content: request.system });
      if (request.messages) messages.push(...request.messages.map((m) => ({ role: m.role, content: m.content })));
      if (request.prompt) messages.push({ role: "user", content: request.prompt });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GATEWAY_CONFIG.AI_TIMEOUT_MS);

      const res = await fetch(this.baseUrl + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + this.apiKey },
        body: JSON.stringify({ model: this.model, messages, temperature: request.temperature ?? 0.7, max_tokens: request.maxTokens ?? 2048 }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn("[DeepSeek] API error:", res.status);
        return this.fallback("chat", request);
      }

      const data = await res.json();
      return {
        content: data.choices?.[0]?.message?.content || "",
        provider: "deepseek",
        model: this.model,
        latencyMs: Date.now() - start,
        fallbackUsed: false,
      };
    } catch (err) {
      console.warn("[DeepSeek] Request failed:", err);
      return this.fallback("chat", request);
    }
  }

  async json<T>(request: AIRequest): Promise<T> {
    if (!this.isConfigured()) return MOCK.json(request);
    const enhanced: AIRequest = { ...request, system: (request.system || "") + "\nRespond with valid JSON only." };
    const response = await this.chat(enhanced);
    try {
      return JSON.parse(response.content) as T;
    } catch {
      console.warn("[DeepSeek] JSON parse failed, falling back");
      return MOCK.json(request);
    }
  }

  async embedding(_texts: string[]): Promise<number[][]> {
    console.warn("[DeepSeek] Embedding not supported");
    return MOCK.embedding(_texts);
  }

  async rerank(_query: string, _documents: string[]): Promise<string[]> {
    console.warn("[DeepSeek] Rerank not supported");
    return MOCK.rerank(_query, _documents);
  }

  async health(): Promise<AIHealthResult> {
    const start = Date.now();
    try {
      const res = await fetch(this.baseUrl + "/models", { headers: { "Authorization": "Bearer " + this.apiKey } });
      return { provider: "deepseek", status: res.ok ? "healthy" : "unavailable", latencyMs: Date.now() - start, capabilities: this.capabilities, lastCheckedAt: new Date().toISOString() };
    } catch {
      return { provider: "deepseek", status: "unavailable", latencyMs: Date.now() - start, capabilities: this.capabilities, lastCheckedAt: new Date().toISOString() };
    }
  }

  private async fallback(capability: string, request: AIRequest): Promise<AIResponse> {
    const result = await MOCK.chat(request);
    return { ...result, fallbackUsed: true, provider: "mock" };
  }
}
