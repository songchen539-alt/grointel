// GroIntel AI Gateway - Configuration

const defaultGenerativeProvider = process.env.AI_CHAT_PROVIDER
  || (process.env.OPENAI_API_KEY ? "openai" : process.env.DEEPSEEK_API_KEY ? "deepseek" : "mock");

export const GATEWAY_CONFIG = {
  AI_CHAT_PROVIDER: defaultGenerativeProvider,
  AI_JSON_PROVIDER: process.env.AI_JSON_PROVIDER || defaultGenerativeProvider,
  AI_EMBEDDING_PROVIDER: process.env.AI_EMBEDDING_PROVIDER || "mock",
  AI_RERANK_PROVIDER: process.env.AI_RERANK_PROVIDER || "mock",
  AI_TIMEOUT_MS: 8000,
  AI_FALLBACK_PROVIDER: "mock",
  AI_CACHE_ENABLED: false,
  AI_METRICS_ENABLED: true,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4.1",
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
};

export function getGatewayConfig(overrides?: Partial<typeof GATEWAY_CONFIG>): typeof GATEWAY_CONFIG {
  return { ...GATEWAY_CONFIG, ...overrides };
}
