// GroIntel AI Gateway - Health Check

import { AIHealthResult } from "./types";
import { getAvailableProviders, getProvider } from "../providers/registry";

export async function checkAllProviders(): Promise<AIHealthResult[]> {
  const providers = getAvailableProviders();
  return Promise.all(providers.map(async (name) => {
    try {
      return await getProvider(name).health();
    } catch {
      return { provider: name, status: "unavailable" as const, latencyMs: 0, capabilities: [], lastCheckedAt: new Date().toISOString() };
    }
  }));
}

export async function checkProvider(name: string): Promise<AIHealthResult> {
  return getProvider(name).health();
}
