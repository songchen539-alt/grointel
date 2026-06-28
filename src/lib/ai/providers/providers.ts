// GroIntel AI Gateway - Additional Providers

import { AIProvider } from "../gateway/provider";
import { AIRequest, AIResponse, AIHealthResult, AICapability } from "../gateway/types";
import { GATEWAY_CONFIG } from "../gateway/config";
import { MockAIProvider } from "./mock";

const MOCK = new MockAIProvider();

function flattenMessages(request: AIRequest) {
  const parts: string[] = [];
  if (request.messages) {
    parts.push(...request.messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`));
  }
  if (request.prompt) parts.push(request.prompt);
  return parts.join("\n\n");
}

function extractOpenAIText(data: any): string {
  if (typeof data?.output_text === "string") return data.output_text;
  const chunks: string[] = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") chunks.push(content.text);
      if (typeof content?.content === "string") chunks.push(content.content);
    }
  }
  return chunks.join("\n").trim();
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly capabilities: AICapability[] = ["chat", "json"];
  private readonly apiKey = GATEWAY_CONFIG.OPENAI_API_KEY;
  private readonly model = GATEWAY_CONFIG.OPENAI_MODEL;
  private readonly baseUrl = GATEWAY_CONFIG.OPENAI_BASE_URL.replace(/\/$/, "");

  isConfigured(): boolean {
    return this.apiKey.startsWith("sk-");
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) return this.fallback(request);
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GATEWAY_CONFIG.AI_TIMEOUT_MS);
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          instructions: request.system,
          input: flattenMessages(request),
          temperature: request.temperature ?? 0.4,
          max_output_tokens: request.maxTokens ?? 1200,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return this.fallback(request, start);
      const data = await response.json();
      const content = extractOpenAIText(data);
      if (!content) return this.fallback(request, start);
      return {
        content,
        provider: "openai",
        model: this.model,
        latencyMs: Date.now() - start,
        fallbackUsed: false,
      };
    } catch {
      return this.fallback(request, start);
    }
  }

  async json<T>(request: AIRequest): Promise<T> {
    if (!this.isConfigured()) return MOCK.json(request);
    const response = await this.chat({
      ...request,
      system: `${request.system || ""}\nRespond with valid JSON only. Do not wrap it in Markdown.`,
      temperature: request.temperature ?? 0.2,
    });
    try {
      return JSON.parse(response.content) as T;
    } catch {
      return MOCK.json(request);
    }
  }

  async embedding(texts: string[]): Promise<number[][]> {
    return MOCK.embedding(texts);
  }

  async rerank(query: string, docs: string[]): Promise<string[]> {
    return MOCK.rerank(query, docs);
  }

  async health(): Promise<AIHealthResult> {
    const start = Date.now();
    if (!this.isConfigured()) {
      return { provider: "openai", status: "unavailable", latencyMs: 0, capabilities: this.capabilities, lastCheckedAt: new Date().toISOString() };
    }
    try {
      const response = await fetch(`${this.baseUrl}/models`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
      return {
        provider: "openai",
        status: response.ok ? "healthy" : "unavailable",
        latencyMs: Date.now() - start,
        capabilities: this.capabilities,
        lastCheckedAt: new Date().toISOString(),
      };
    } catch {
      return { provider: "openai", status: "unavailable", latencyMs: Date.now() - start, capabilities: this.capabilities, lastCheckedAt: new Date().toISOString() };
    }
  }

  private async fallback(request: AIRequest, start = Date.now()): Promise<AIResponse> {
    const result = await MOCK.chat(request);
    return { ...result, provider: "mock", latencyMs: Date.now() - start, fallbackUsed: true };
  }
}

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

export class ClaudeProvider extends StubProvider { constructor() { super("claude"); } }
export class GeminiProvider extends StubProvider { constructor() { super("gemini"); } }
export class LocalProvider extends StubProvider { constructor() { super("local"); } }
