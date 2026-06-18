// GroIntel Capability Intelligence Engine - Confidence Calculator
// Evaluates confidence level based on data quality, evidence richness, and recency

import { PassportData, EvidenceItem } from "./types";

export function calculateConfidence(
  passport: PassportData,
  evidence: EvidenceItem[],
): number {
  if (!passport) return 0;

  let score = 0;
  const maxScore = 100;

  // 1. Passport completeness (30 pts)
  score += passportCompletenessScore(passport);

  // 2. Evidence richness (40 pts)
  score += evidenceRichnessScore(evidence);

  // 3. Evidence diversity (20 pts)
  score += evidenceDiversityScore(evidence);

  // 4. Recency factor (10 pts)
  score += evidenceRecencyScore(evidence);

  return Math.round(Math.min(maxScore, Math.max(0, score)));
}

function passportCompletenessScore(p: PassportData): number {
  let score = 0;
  const checks = [
    { field: p.headline, points: 4 },
    { field: p.description, points: 5 },
    { field: p.mission, points: 3 },
    { field: p.primary_industry, points: 4 },
    { field: p.secondary_industries, points: 3 },
    { field: p.primary_region, points: 3 },
    { field: p.service_regions, points: 2 },
    { field: p.company_size, points: 2 },
    { field: p.pricing_level, points: 2 },
    { field: p.availability, points: 2 },
  ];
  for (const c of checks) {
    if (c.field) {
      score += c.points;
    }
  }
  return Math.min(30, score);
}

function evidenceRichnessScore(evidence: EvidenceItem[]): number {
  if (evidence.length === 0) return 5; // base score for being evaluated
  let score = 10;
  const credibilityWeights: Record<string, number> = {
    case_study: 10, review: 8, public_dataset: 8,
    podcast: 6, newsletter: 6, media_mention: 6,
    linkedin: 4, github: 4, website: 3, youtube: 3, x: 2,
  };

  for (const e of evidence) {
    const w = credibilityWeights[e.evidence_type] || 2;
    const cred = (e.credibility_score || 50) / 50;
    score += w * cred;
  }
  return Math.min(40, Math.round(score));
}

function evidenceDiversityScore(evidence: EvidenceItem[]): number {
  if (evidence.length === 0) return 0;
  const types = new Set(evidence.map(e => e.evidence_type));
  const count = types.size;
  // Up to 20 pts: 4 per type, max 5 types
  return Math.min(20, count * 4);
}

function evidenceRecencyScore(evidence: EvidenceItem[]): number {
  if (evidence.length === 0) return 5;
  const now = new Date();
  let recentScore = 5;
  for (const e of evidence) {
    if (!e.source_date) continue;
    const monthsAgo = (now.getTime() - new Date(e.source_date).getTime()) / (30 * 24 * 60 * 60 * 1000);
    if (monthsAgo < 3) recentScore += 3;
    else if (monthsAgo < 12) recentScore += 2;
    else if (monthsAgo < 24) recentScore += 1;
  }
  return Math.min(10, Math.round(recentScore));
}
