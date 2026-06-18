// GroIntel AI Core v2 - Vector Store
// Simple in-memory vector store for similarity search.

import { VectorDocument, VectorSearchResult } from "./types";
import { cosineSimilarity } from "./vector";

export class VectorStore {
  private documents: VectorDocument[] = [];

  add(doc: VectorDocument): void {
    this.documents.push(doc);
  }

  addMany(docs: VectorDocument[]): void {
    this.documents.push(...docs);
  }

  search(query: number[], topK: number = 5): VectorSearchResult[] {
    const results: VectorSearchResult[] = [];

    for (const doc of this.documents) {
      if (!doc.embedding) continue;
      const score = cosineSimilarity(query, doc.embedding);
      results.push({ document: doc, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  findByType(type: string): VectorDocument[] {
    return this.documents.filter((d) => d.type === type);
  }

  clear(): void {
    this.documents = [];
  }

  get size(): number {
    return this.documents.length;
  }
}
