import { NextResponse } from "next/server";
import { dailySupplyCandidatesToProfiles, decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { fetchLiveWeb3DiscoveryCandidates } from "@/lib/grointel/liveDiscovery";
import { WEB3_GROWTH_EVENTS } from "@/lib/grointel/web3World";

export const dynamic = "force-dynamic";

function demandMatchScore(candidate: { priority: number; tags: string[]; liveQualityScore?: number }, supplyTags: string[]) {
  const overlap = candidate.tags.filter((tag) => supplyTags.includes(tag)).length;
  const qualityBonus = typeof candidate.liveQualityScore === "number" ? Math.max(0, Math.round((candidate.liveQualityScore - 70) / 3)) : 0;
  return Math.max(1, Math.min(100, Math.round(50 + candidate.priority * 0.3 + overlap * 8 + qualityBonus)));
}

export async function GET() {
  const liveDiscovery = await fetchLiveWeb3DiscoveryCandidates({ demandLimit: 80, supplyLimit: 40, timeoutMs: 6000 });
  const liveSupplyProfiles = dailySupplyCandidatesToProfiles(liveDiscovery.candidates);

  const companyDemand = {
    projectName: "GroIntel Bidirectional Company Probe",
    sector: "Ethereum L2 / DeFi",
    growthGoal: "Acquire real users through media education, KOL partnerships, and research-led growth",
    targetAudience: "crypto-native builders and DeFi users",
    riskTolerance: "low" as const,
  };
  const companyDecision = decideWeb3Growth(companyDemand, WEB3_GROWTH_EVENTS, liveSupplyProfiles);
  const liveSupplyMatches = companyDecision.recommendedConcretePartners
    .filter((partner) => String(partner.source || "").endsWith("_live"))
    .slice(0, 8)
    .map((partner) => ({
      name: partner.name,
      identity: partner.identity,
      supplyType: partner.supplyType,
      fitScore: partner.fitScore,
      source: partner.source,
      liveQualityScore: partner.liveQualityScore,
      liveSourceCoverage: partner.liveSourceCoverage || [],
    }));

  const probeSupply = liveSupplyProfiles[0];
  const supplyTags = probeSupply?.tags || [];
  const liveDemandMatches = liveDiscovery.candidates
    .filter((candidate) => candidate.side === "demand")
    .map((candidate) => ({
      company: candidate.name,
      identity: candidate.identity,
      sector: candidate.domain,
      fitScore: demandMatchScore(candidate, supplyTags),
      source: candidate.source,
      tags: candidate.tags,
      liveQualityScore: (candidate as any).liveQualityScore,
      liveSourceCoverage: (candidate as any).liveSourceCoverage || [],
      suggestedCollaboration: probeSupply?.collaborationFormats[0] || "targeted Web3 growth pilot",
      keyMetric: probeSupply?.proofSignals[0] || "qualified conversion",
    }))
    .sort((a, b) => b.fitScore - a.fitScore || a.company.localeCompare(b.company))
    .slice(0, 8);

  const companyToSupplyReady = liveSupplyMatches.length > 0;
  const supplyToCompanyReady = liveDemandMatches.some((match) => match.source === "defillama_live");
  const ready = liveDiscovery.success && companyToSupplyReady && supplyToCompanyReady;

  return NextResponse.json({
    success: true,
    ready,
    status: ready ? "ready" : "degraded",
    generatedAt: new Date().toISOString(),
    liveDiscovery: {
      success: liveDiscovery.success,
      demandCandidateCount: liveDiscovery.demandCandidateCount,
      supplyCandidateCount: liveDiscovery.supplyCandidateCount,
      rawCount: liveDiscovery.rawCount,
      sources: liveDiscovery.sources.map((source) => ({
        source: source.source,
        side: source.side,
        success: source.success,
        candidateCount: source.candidateCount,
        rawCount: source.rawCount,
        error: source.error || null,
      })),
    },
    companyToSupply: {
      ready: companyToSupplyReady,
      probe: companyDemand,
      liveSupplyProfiles: liveSupplyProfiles.length,
      liveMatches: liveSupplyMatches,
    },
    supplyToCompany: {
      ready: supplyToCompanyReady,
      probeSupply: probeSupply ? {
        name: probeSupply.name,
        identity: probeSupply.identity,
        supplyType: probeSupply.supplyType,
        source: probeSupply.source,
        tags: probeSupply.tags || [],
      } : null,
      liveDemandMatches,
    },
  });
}
