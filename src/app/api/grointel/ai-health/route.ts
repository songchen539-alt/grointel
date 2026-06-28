import { NextResponse } from "next/server";
import { checkAllProviders } from "@/lib/ai/gateway/health";
import { GATEWAY_CONFIG } from "@/lib/ai/gateway/config";

export const dynamic = "force-dynamic";

function providerConfigured(provider: string) {
  if (provider === "openai") return Boolean(GATEWAY_CONFIG.OPENAI_API_KEY);
  if (provider === "deepseek") return Boolean(GATEWAY_CONFIG.DEEPSEEK_API_KEY);
  if (provider === "mock") return true;
  return false;
}

export async function GET() {
  const providers = await checkAllProviders();
  const active = {
    chat: GATEWAY_CONFIG.AI_CHAT_PROVIDER,
    json: GATEWAY_CONFIG.AI_JSON_PROVIDER,
    embedding: GATEWAY_CONFIG.AI_EMBEDDING_PROVIDER,
    rerank: GATEWAY_CONFIG.AI_RERANK_PROVIDER,
    fallback: GATEWAY_CONFIG.AI_FALLBACK_PROVIDER,
  };
  const activeProviderHealth = providers.filter((provider) => {
    return provider.provider === active.chat || provider.provider === active.json || provider.provider === active.embedding || provider.provider === active.rerank;
  });
  const realGenerativeHealthy = activeProviderHealth.some((provider) => {
    return provider.provider !== "mock" && provider.status === "healthy";
  });

  return NextResponse.json({
    success: true,
    active,
    configured: {
      openai: providerConfigured("openai"),
      deepseek: providerConfigured("deepseek"),
      mock: true,
    },
    mode: realGenerativeHealthy ? "real_ai_active" : active.chat === "mock" && active.json === "mock" ? "mock_only" : "fallback_ready",
    providers,
    guidance: realGenerativeHealthy
      ? "A real generative provider is healthy."
      : "Set OPENAI_API_KEY or DEEPSEEK_API_KEY, and optionally AI_CHAT_PROVIDER / AI_JSON_PROVIDER, to enable real model understanding.",
  });
}
