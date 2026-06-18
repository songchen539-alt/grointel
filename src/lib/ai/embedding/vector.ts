// GroIntel AI Core v2 - Vector Operations
// Pure functions for vector computation.

import { SimilarityMetric } from "../config";

export function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
}

export function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = dotProduct(a, b);
  const mag = magnitude(a) * magnitude(b);
  if (mag === 0) return 0;
  return dot / mag;
}

export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - (b[i] || 0)) ** 2, 0));
}

export function similarityByMetric(a: number[], b: number[], metric: SimilarityMetric): number {
  switch (metric) {
    case "cosine": return cosineSimilarity(a, b);
    case "dot": return dotProduct(a, b);
    case "euclidean": return 1 / (1 + euclideanDistance(a, b));
  }
}

export function normalize(v: number[]): number[] {
  const mag = magnitude(v);
  if (mag === 0) return v;
  return v.map((x) => x / mag);
}

export function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) sum[i] += v[i];
  }
  return sum.map((s) => s / vectors.length);
}
