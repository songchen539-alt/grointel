// GroIntel AI Gateway - Provider Registry

import { AIProvider } from "../gateway/provider";
import { MockAIProvider } from "./mock";
import { DeepSeekProvider } from "./deepseek";
import { OpenAIProvider, ClaudeProvider, GeminiProvider, LocalProvider } from "./providers";

const registry = new Map<string, AIProvider>();

export function registerProvider(name: string, provider: AIProvider): void {
  registry.set(name, provider);
}

export function getProvider(name: string): AIProvider {
  initializeRegistry();
  return registry.get(name) || registry.get("mock")!;
}

export function getAvailableProviders(): string[] {
  initializeRegistry();
  return Array.from(registry.keys());
}

function initializeRegistry(): void {
  registerProvider("mock", new MockAIProvider());
  registerProvider("deepseek", new DeepSeekProvider());
  registerProvider("openai", new OpenAIProvider());
  registerProvider("claude", new ClaudeProvider());
  registerProvider("gemini", new GeminiProvider());
  registerProvider("local", new LocalProvider());
}
