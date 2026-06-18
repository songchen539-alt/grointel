// GroIntel AI Gateway - Factory

import { AIRouter } from "./router";
import { getProvider } from "../providers/registry";
import { AIProvider } from "./provider";

let routerInstance: AIRouter | null = null;

export function getAIRouter(): AIRouter {
  if (!routerInstance) routerInstance = new AIRouter();
  return routerInstance;
}

export function getAIProvider(name: string): AIProvider {
  return getProvider(name);
}
