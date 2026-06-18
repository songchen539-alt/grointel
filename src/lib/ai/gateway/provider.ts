// GroIntel AI Gateway - Provider Interface

import { AIRequest, AIResponse, AIHealthResult, AICapability } from "./types";

export interface AIProvider {
  readonly name: string;
  readonly capabilities: AICapability[];

  chat(request: AIRequest): Promise<AIResponse>;
  json<T>(request: AIRequest): Promise<T>;
  embedding(texts: string[]): Promise<number[][]>;
  rerank(query: string, documents: string[]): Promise<string[]>;
  health(): Promise<AIHealthResult>;
}
