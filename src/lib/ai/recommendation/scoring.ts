// GroIntel AI Core - Scoring Engine
// Weighted scoring for growth need to channel/service matching.

import { ScoreBreakdown } from "./types";

const DEFAULT_WEIGHTS = {
  industry: 0.30,
  problem: 0.25,
  region: 0.15,
  budget: 0.15,
  timeline: 0.10,
  history: 0.05,
};

export type Weights = typeof DEFAULT_WEIGHTS;

export function computeScore(scores: ScoreBreakdown, weights?: Partial<Weights>): number {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const total = Math.round(
    scores.industry * w.industry +
    scores.problem * w.problem +
    scores.region * w.region +
    scores.budget * w.budget +
    scores.timeline * w.timeline +
    scores.history * w.history
  );
  return Math.min(100, Math.max(0, total));
}

export function normalizeScore(raw: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.round(((raw - min) / (max - min)) * 100);
}

export function aggregateScores(scores: ScoreBreakdown[]): ScoreBreakdown {
  if (scores.length === 0) return { industry: 0, problem: 0, region: 0, budget: 0, timeline: 0, history: 0 };
  const sum = (key: keyof ScoreBreakdown) => scores.reduce((acc, s) => acc + s[key], 0) / scores.length;
  return {
    industry: sum("industry"),
    problem: sum("problem"),
    region: sum("region"),
    budget: sum("budget"),
    timeline: sum("timeline"),
    history: sum("history"),
  };
}
