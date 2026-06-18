// GroIntel AI Core - Vector Operations
// Utility functions for vector computation.

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

export function normalize(v: number[]): number[] {
  const mag = magnitude(v);
  if (mag === 0) return v;
  return v.map((x) => x / mag);
}
