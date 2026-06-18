// GroIntel AI Core - Explain Engine
// Generates human-readable explanations for recommendation scores.

import { ScoreBreakdown, Reason, Confidence } from "./types";

export interface Explanation {
  summary: string;
  score: number;
  confidence: Confidence;
  reasons: Reason[];
  details: ExplanationDetail[];
}

export interface ExplanationDetail {
  dimension: string;
  score: number;
  weight: number;
  label: string;
  description: string;
}

const DIMENSION_LABELS: Record<keyof ScoreBreakdown, string> = {
  industry: "Industry Match",
  problem: "Problem Fit",
  region: "Regional Expertise",
  budget: "Budget Compatibility",
  timeline: "Timeline Alignment",
  history: "Historical Success",
};

export function generateExplanation(
  overallScore: number,
  scores: ScoreBreakdown,
  reasons: Reason[],
  confidence: Confidence
): Explanation {
  const details: ExplanationDetail[] = (Object.keys(scores) as (keyof ScoreBreakdown)[]).map((key) => ({
    dimension: key,
    score: scores[key],
    weight: getWeight(key),
    label: DIMENSION_LABELS[key],
    description: describeScore(key, scores[key]),
  }));

  const summary = buildSummary(overallScore, confidence, reasons);

  return { summary, score: overallScore, confidence, reasons, details };
}

function describeScore(dimension: keyof ScoreBreakdown, score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Weak";
  return "Poor";
}

function buildSummary(score: number, confidence: Confidence, reasons: Reason[]): string {
  const scoreLevel = score >= 80 ? "strong" : score >= 60 ? "moderate" : "weak";
  const confidenceNote = confidence === "High" ? "with high confidence" : confidence === "Medium" ? "with medium confidence" : "with low confidence";
  const topReasons = reasons.slice(0, 2).map((r) => r.message).join(". ");
  return `This is a ${scoreLevel} match ${confidenceNote}. ${topReasons}`;
}

function getWeight(key: keyof ScoreBreakdown): number {
  const weights: Record<keyof ScoreBreakdown, number> = {
    industry: 0.30,
    problem: 0.25,
    region: 0.15,
    budget: 0.15,
    timeline: 0.10,
    history: 0.05,
  };
  return weights[key];
}
