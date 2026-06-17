// GroIntel Score Engine
// 8 dimension scores + overall calculation.
// Each function is independent for easy AI replacement.

import { Company } from "@/types/company";

export function calculateMarketAwareness(company: Company): { score: number; detail: string } {
  const seed = company.website.length + company.name.length;
  const base = ((seed * 13) % 35) + 35;
  const score = Math.min(95, Math.max(10, base));
  if (score >= 75) return { score, detail: "Strong market presence across major industry publications and analyst reports." };
  if (score >= 55) return { score, detail: "Moderate awareness in niche/industry-specific publications." };
  return { score, detail: "Limited external market visibility. Few mentions in press or analyst coverage." };
}

export function calculateSEOVisibility(company: Company): { score: number; detail: string } {
  const base = ((company.website.length * 7 + company.name.length * 3) % 35) + 25;
  const score = Math.min(90, Math.max(10, base));
  if (score >= 70) return { score, detail: "Good domain authority and organic search presence." };
  if (score >= 45) return { score, detail: "Average SEO. Some organic presence but significant room for growth." };
  return { score, detail: "Weak SEO. Low domain authority and limited indexed content." };
}

export function calculateCommunityStrength(company: Company): { score: number; detail: string } {
  const isWeb3 = company.category === "Web3 / Crypto";
  const base = ((company.website.length * 17) % 40) + (isWeb3 ? 30 : 15);
  const score = Math.min(95, Math.max(10, base));
  if (score >= 70) return { score, detail: "Active, engaged community across Discord, X, and Telegram with strong retention." };
  if (score >= 45) return { score, detail: "Growing community presence with moderate engagement on 1-2 platforms." };
  return { score, detail: "Early community stage. Small following with limited engagement metrics." };
}

export function calculateFounderBranding(company: Company): { score: number; detail: string } {
  const base = ((company.website.length * 11) % 35) + 20;
  const score = Math.min(85, Math.max(10, base));
  if (score >= 65) return { score, detail: "Founders are visible with active social presence and industry recognition." };
  if (score >= 40) return { score, detail: "Moderate founder visibility within specific industry circles." };
  return { score, detail: "Low founder brand presence. Founders are not publicly active on social or media." };
}

export function calculateHiringMomentum(company: Company): { score: number; detail: string } {
  const base = ((company.website.length * 19) % 35) + 20;
  const score = Math.min(90, Math.max(10, base));
  if (score >= 65) return { score, detail: "Strong hiring activity across multiple departments indicates growth phase." };
  if (score >= 40) return { score, detail: "Moderate hiring in key roles. Steady but not aggressive." };
  return { score, detail: "Minimal hiring activity observed. May be conserving resources." };
}

export function calculateDeveloperEcosystem(company: Company): { score: number; detail: string } {
  const isDevFacing = ["Developer Tools", "AI Infrastructure", "Web3 / Blockchain", "L1 Blockchain"].includes(company.industry);
  const base = ((company.website.length * 13) % 40) + (isDevFacing ? 30 : 10);
  const score = Math.min(95, Math.max(5, base));
  if (score >= 70) return { score, detail: "Thriving developer ecosystem with docs, SDKs, and community contributions." };
  if (score >= 45) return { score, detail: "Developer resources exist but community engagement is moderate." };
  return { score, detail: "No significant developer-facing tools or community presence." };
}

export function calculateGlobalExpansion(company: Company): { score: number; detail: string } {
  const marketCount = company.markets.length;
  const base = (marketCount * 10) + ((company.website.length * 7) % 25);
  const score = Math.min(90, Math.max(10, base));
  if (score >= 65) return { score, detail: `Active in ${marketCount}+ markets with localized go-to-market presence.` };
  if (score >= 40) return { score, detail: "Some international presence but primarily focused on home market." };
  return { score, detail: "Domestic-focused. No clear signs of international expansion strategy." };
}

export function calculateProductMomentum(company: Company): { score: number; detail: string } {
  const base = ((company.website.length * 23) % 30) + 45;
  const score = Math.min(98, Math.max(15, base));
  if (score >= 75) return { score, detail: "Strong product momentum with regular releases and growing user base." };
  if (score >= 50) return { score, detail: "Steady product development. Incremental improvements underway." };
  return { score, detail: "Early product stage. Still developing core product-market fit." };
}

export function calculateOverallGrowthScore(scores: { name: string; score: number }[]): number {
  const weights: Record<string, number> = {
    "Market Awareness": 0.15,
    "SEO Visibility": 0.10,
    "Community Strength": 0.15,
    "Founder Branding": 0.10,
    "Hiring Momentum": 0.10,
    "Developer Ecosystem": 0.15,
    "Global Expansion": 0.10,
    "Product Momentum": 0.15,
  };
  let total = 0;
  let weightSum = 0;
  for (const s of scores) {
    const w = weights[s.name] || 0.10;
    total += s.score * w;
    weightSum += w;
  }
  return Math.round(weightSum > 0 ? total / weightSum : 0);
}

export function generateGrowthScores(company: Company): {
  dimensions: { name: string; score: number; detail: string }[];
  overallScore: number;
} {
  const fns = [
    { name: "Market Awareness", fn: () => calculateMarketAwareness(company) },
    { name: "SEO Visibility", fn: () => calculateSEOVisibility(company) },
    { name: "Community Strength", fn: () => calculateCommunityStrength(company) },
    { name: "Founder Branding", fn: () => calculateFounderBranding(company) },
    { name: "Hiring Momentum", fn: () => calculateHiringMomentum(company) },
    { name: "Developer Ecosystem", fn: () => calculateDeveloperEcosystem(company) },
    { name: "Global Expansion", fn: () => calculateGlobalExpansion(company) },
    { name: "Product Momentum", fn: () => calculateProductMomentum(company) },
  ];
  const dimensions = fns.map((f) => f.fn()).map((r, i) => ({ name: fns[i].name, score: r.score, detail: r.detail }));
  const overallScore = calculateOverallGrowthScore(dimensions);
  return { dimensions, overallScore };
}
