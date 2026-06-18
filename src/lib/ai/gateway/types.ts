// GroIntel AI Gateway - Type Definitions

export type AICapability = "chat" | "json" | "embedding" | "rerank";

export type AIProviderStatus = "healthy" | "degraded" | "unavailable";

export interface AIProviderMetadata {
  name: string;
  capabilities: AICapability[];
  status: AIProviderStatus;
  latencyMs?: number;
  lastCheckedAt?: string;
}

export interface AIRequest {
  prompt?: string;
  messages?: AIMessage[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model?: string;
  latencyMs: number;
  fallbackUsed: boolean;
}

export interface AIHealthResult {
  provider: string;
  status: AIProviderStatus;
  latencyMs: number;
  capabilities: AICapability[];
  lastCheckedAt: string;
}
