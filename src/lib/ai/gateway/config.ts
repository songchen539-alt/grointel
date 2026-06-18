// GroIntel AI Gateway - Configuration

export const GATEWAY_CONFIG = {
  AI_CHAT_PROVIDER: process.env.AI_CHAT_PROVIDER || "mock",
  AI_JSON_PROVIDER: process.env.AI_JSON_PROVIDER || "mock",
  AI_EMBEDDING_PROVIDER: process.env.AI_EMBEDDING_PROVIDER || "mock",
  AI_RERANK_PROVIDER: process.env.AI_RERANK_PROVIDER || "mock",
  AI_TIMEOUT_MS: 8000,
  AI_FALLBACK_PROVIDER: "mock",
  AI_CACHE_ENABLED: false,
  AI_METRICS_ENABLED: true,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
};

export function getGatewayConfig(overrides?: Partial<typeof GATEWAY_CONFIG>): typeof GATEWAY_CONFIG {
  return { ...GATEWAY_CONFIG, ...overrides };
}
