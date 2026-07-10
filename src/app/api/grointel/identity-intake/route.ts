import { NextRequest, NextResponse } from "next/server";
import { generateMockBusinessScan, createInitialBusinessKnowledge, normalizeWebsite } from "@/lib/intelligence/businessIntelligence";
import { generateMockCapabilityScan, createInitialCapabilityKnowledge, normalizeProfileUrl } from "@/lib/intelligence/capabilityIntelligence";
import { dailySupplyCandidatesToProfiles, decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { buildWeb3CollaborationBrief } from "@/lib/grointel/web3CollaborationBrief";
import { generateWeb3AIGrowthInsight, generateWeb3KOLSupplyInsight } from "@/lib/grointel/aiGrowthInsight";
import { fetchLiveWeb3DiscoveryCandidates } from "@/lib/grointel/liveDiscovery";
import type { DailyIngestionCandidate } from "@/lib/grointel/dailyIngestion";
import { WEB3_GROWTH_EVENTS, WEB3_SUPPLY_PROFILES, WEB3_TARGETS, type Web3SupplyProfile } from "@/lib/grointel/web3World";

export const dynamic = "force-dynamic";

type EntitySide = "company" | "kol";

const capabilityDomains = ["x.com", "twitter.com", "youtube.com", "youtu.be", "linkedin.com", "github.com", "substack.com", "tiktok.com", "instagram.com", "bilibili.com"];
const web3SupplyDomains = ["bankless.com", "decrypt.co", "thedefiant.io", "coindesk.com", "blockworks.co", "messari.io", "delphidigital.io", "unchainedcrypto.com"];
const web3Terms = ["web3", "crypto", "defi", "nft", "dao", "l2", "ethereum", "bitcoin", "wallet", "exchange", "airdrop", "quest", "socialfi", "gamefi"];

function classifyIdentity(input: string, declaredSide?: string): { side: EntitySide; confidence: number; reason: string } {
  const lower = input.toLowerCase();
  if (declaredSide === "company" || declaredSide === "kol") return { side: declaredSide, confidence: 90, reason: "User-selected side." };
  if (web3SupplyDomains.some((domain) => lower.includes(domain))) return { side: "kol", confidence: 84, reason: "The identity matches a Web3 media, research, or audience supply domain." };
  if (capabilityDomains.some((domain) => lower.includes(domain))) return { side: "kol", confidence: 82, reason: "The identity points to a public creator, professional, or capability profile." };
  if (/\b(kol|creator|influencer|agency|newsletter|podcast|community|founder)\b/i.test(input)) return { side: "kol", confidence: 68, reason: "The wording indicates a capability provider or audience owner." };
  return { side: "company", confidence: 64, reason: "The identity looks like a company, product, or website." };
}

function isWeb3Identity(input: string, industry?: string) {
  const lower = `${input} ${industry || ""}`.toLowerCase();
  return web3Terms.some((term) => lower.includes(term))
    || web3SupplyDomains.some((domain) => lower.includes(domain))
    || WEB3_TARGETS.some((target) => lower.includes(target.name.toLowerCase()) || lower.includes(target.identity.toLowerCase()));
}

function companyQuestions(confidence: Record<string, number>) {
  const questions = [
    "What is the single growth outcome you want GroIntel to optimize for in the next 30-90 days?",
    "Who is the highest-value customer or user segment?",
    "Which markets, regions, or communities are off-limits?",
    "What proof would make a collaboration successful: revenue, qualified leads, wallets, retention, or awareness?",
  ];
  if ((confidence.overall || 0) < 60) questions.unshift("What does the company sell, and who pays for it?");
  return questions;
}

function capabilityQuestions(confidence: Record<string, number>) {
  const questions = [
    "Which audience do you own most strongly today?",
    "What collaboration formats have worked before: sponsorships, education, launch campaigns, community activations, or advisory?",
    "What proof can you provide: case studies, conversion data, audience analytics, or testimonials?",
    "Which company categories should GroIntel avoid matching you with?",
  ];
  if ((confidence.overall || 0) < 60) questions.unshift("What exact capability should companies hire you for?");
  return questions;
}

function findSupplyProfile(identity: string, displayName?: string): Web3SupplyProfile | null {
  const lower = `${identity} ${displayName || ""}`.toLowerCase();
  return WEB3_SUPPLY_PROFILES.find((profile) => {
    return lower.includes(profile.identity.toLowerCase())
      || lower.includes(profile.name.toLowerCase())
      || profile.identity.toLowerCase().includes(lower);
  }) || null;
}

function findLiveSupplyProfile(identity: string, profiles: Web3SupplyProfile[]) {
  const normalized = identity.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  return profiles.find((profile) => {
    const profileIdentity = profile.identity.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    return normalized.includes(profileIdentity) || profileIdentity.includes(normalized);
  }) || null;
}

function supplyProfileText(profile: Web3SupplyProfile) {
  return [
    profile.supplyType,
    ...profile.audience,
    ...profile.capabilities,
    ...profile.bestFor,
    ...profile.collaborationFormats,
    ...profile.proofSignals,
  ].join(" ").toLowerCase();
}

function demandCandidateText(candidate: DailyIngestionCandidate) {
  return [candidate.name, candidate.identity, candidate.domain, ...candidate.tags, candidate.ingestionReason].join(" ").toLowerCase();
}

function scoreDemandCandidateForSupply(candidate: DailyIngestionCandidate, profile?: Web3SupplyProfile | null) {
  const candidateText = demandCandidateText(candidate);
  const supplyText = profile ? supplyProfileText(profile) : "";
  let fitScore = Math.round(Math.min(92, 48 + candidate.priority * 0.28));
  if (profile && profile.bestFor.some((item) => candidateText.includes(item.split(" ")[0].toLowerCase()))) fitScore += 10;
  if (profile && profile.capabilities.some((item) => candidateText.includes(item.split(" ")[0].toLowerCase()))) fitScore += 8;
  if (supplyText.includes("media") && candidateText.match(/l2|ethereum|defi|protocol|bridge|staking/)) fitScore += 10;
  if (supplyText.includes("research") && candidateText.match(/defi|protocol|staking|rwa|lending|bridge/)) fitScore += 12;
  if (supplyText.includes("security") && candidateText.match(/bridge|staking|protocol|wallet/)) fitScore += 10;
  if (supplyText.includes("creator") && candidateText.match(/consumer|social|gaming|nft/)) fitScore += 8;
  return Math.max(1, Math.min(100, fitScore));
}

function liveDemandCompanyMatches(profile: Web3SupplyProfile | null | undefined, candidates: DailyIngestionCandidate[]) {
  return candidates
    .filter((candidate) => candidate.side === "demand")
    .map((candidate) => {
      const fitScore = scoreDemandCandidateForSupply(candidate, profile);
      const primaryTag = candidate.tags[0] || "web3";
      return {
        company: candidate.name,
        identity: candidate.identity,
        sector: candidate.domain,
        growthNeed: `Needs ${profile?.supplyType || "Web3 supply"} help to convert ${primaryTag} attention into qualified growth.`,
        usefulWhen: candidate.tags.slice(0, 4).map((tag) => `${tag} campaign`),
        evidence: candidate.ingestionReason,
        fitScore,
        fitReason: profile
          ? `${profile.name} can help ${candidate.name} with ${profile.collaborationFormats[0]} because the company is a live ${candidate.tags.slice(0, 3).join("/")} demand candidate.`
          : `${candidate.name} is a live Web3 demand candidate that may need qualified KOL, media, or partner supply.`,
        suggestedCollaboration: profile?.collaborationFormats[0] || "targeted Web3 growth pilot",
        keyMetric: profile?.proofSignals[0] || "qualified conversion",
        source: candidate.source,
        tags: candidate.tags,
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || a.company.localeCompare(b.company));
}

function web3CompanyMatches(profile?: Web3SupplyProfile | null, liveDemandCandidates: DailyIngestionCandidate[] = []) {
  const supplyText = profile ? supplyProfileText(profile) : "";
  const historicalMatches = WEB3_GROWTH_EVENTS
    .filter((event) => event.outcome === "success" || event.outcome === "mixed")
    .map((event) => {
      const eventText = [
        event.project,
        event.chainOrSector,
        event.partner,
        event.partnerType,
        event.growthGoal,
        event.collaborationFormat,
        event.reusablePattern,
        event.supplyProfile || "",
        ...(event.bestForStages || []),
        ...(event.measurableSignals || []),
      ].join(" ").toLowerCase();
      let fitScore = 55;
      if (profile && event.partner.toLowerCase().includes(profile.name.toLowerCase())) fitScore += 25;
      if (profile && event.partnerType === String(profile.supplyType)) fitScore += 14;
      if (profile && profile.bestFor.some((item) => eventText.includes(item.split(" ")[0].toLowerCase()))) fitScore += 10;
      if (profile && profile.capabilities.some((item) => eventText.includes(item.split(" ")[0].toLowerCase()))) fitScore += 8;
      if (profile && profile.audience.some((item) => eventText.includes(item.split(" ")[0].toLowerCase()))) fitScore += 8;
      if (!profile && event.partnerType === "kol") fitScore += 8;
      if (supplyText.includes("education") && eventText.includes("quest")) fitScore += 8;
      if (supplyText.includes("defi") && eventText.includes("defi")) fitScore += 8;
      if (supplyText.includes("trust") && eventText.includes("trust")) fitScore += 8;

      return {
        company: event.project,
        sector: event.chainOrSector,
        growthNeed: event.growthGoal,
        usefulWhen: event.bestForStages || [],
        evidence: event.reusablePattern,
        fitScore: Math.min(100, fitScore),
        fitReason: profile
          ? `${profile.name} can support ${event.project} when it needs ${event.growthGoal.toLowerCase()}`
          : `This growth event needs a Web3 supply partner for ${event.growthGoal.toLowerCase()}`,
        suggestedCollaboration: profile?.collaborationFormats[0] || event.collaborationFormat,
        keyMetric: profile?.proofSignals[0] || event.measurableSignals?.[0] || "qualified conversion",
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);
  const combined = [...liveDemandCompanyMatches(profile, liveDemandCandidates), ...historicalMatches];
  const seen = new Set<string>();
  return combined.filter((match) => {
    const key = `${match.company}|${"identity" in match ? match.identity : ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identity = String(body.identity || body.input || "").trim();
    if (!identity) return NextResponse.json({ success: false, error: "identity is required" }, { status: 400 });

    const classification = classifyIdentity(identity, body.side);
    if (classification.side === "kol") {
      const profileUrl = normalizeProfileUrl(identity);
      const scan = generateMockCapabilityScan(profileUrl);
      const knowledge = createInitialCapabilityKnowledge(scan);
      const web3 = isWeb3Identity(identity, String(knowledge.audience_dna?.primary_audiences || ""));
      const liveDiscovery = web3
        ? await fetchLiveWeb3DiscoveryCandidates({ demandLimit: 80, supplyLimit: 30, timeoutMs: 5000 })
        : null;
      const liveSupplyProfiles = dailySupplyCandidatesToProfiles(liveDiscovery?.candidates || []);
      const supplyProfile = findSupplyProfile(profileUrl, String(knowledge.capability_identity?.name || ""))
        || findLiveSupplyProfile(profileUrl, liveSupplyProfiles);
      const recommendedCompanyProfiles = web3
        ? web3CompanyMatches(supplyProfile, liveDiscovery?.candidates.filter((candidate) => candidate.side === "demand") || [])
        : [];
      const web3KOLSupplyInsight = web3
        ? await generateWeb3KOLSupplyInsight({
          identity: knowledge.capability_identity,
          summary: scan.public_summary,
          capabilities: knowledge.capability_dna,
          audience: knowledge.audience_dna,
          supplyProfile,
        }, recommendedCompanyProfiles)
        : null;

      return NextResponse.json({
        success: true,
        side: "kol",
        classification,
        normalizedIdentity: profileUrl,
        profile: {
          identity: knowledge.capability_identity,
          summary: scan.public_summary,
          capabilities: knowledge.capability_dna,
          audience: knowledge.audience_dna,
          strengths: knowledge.strengths,
          limitations: knowledge.limitations,
          preferredCollaborations: knowledge.preferred_collaborations,
          confidence: knowledge.knowledge_confidence,
          supplyProfile,
        },
        missingQuestions: capabilityQuestions(knowledge.knowledge_confidence),
        recommendedCompanyProfiles,
        liveMatching: liveDiscovery
          ? {
              attempted: liveDiscovery.attempted,
              success: liveDiscovery.success,
              demandCandidateCount: liveDiscovery.demandCandidateCount,
              supplyCandidateCount: liveDiscovery.supplyCandidateCount,
              liveSupplyProfileMatched: Boolean(supplyProfile && liveSupplyProfiles.some((profile) => profile.identity === supplyProfile.identity)),
              sources: liveDiscovery.sources.map((source) => ({
                source: source.source,
                side: source.side,
                success: source.success,
                candidateCount: source.candidateCount,
                rawCount: source.rawCount,
                error: source.error,
              })),
            }
          : { attempted: false, success: false, demandCandidateCount: 0, supplyCandidateCount: 0, liveSupplyProfileMatched: false, sources: [] },
        web3KOLSupplyInsight,
        nextActions: [
          "Confirm the audience and proof fields that decide matching quality.",
          "Turn strongest capability into a reusable offer companies can buy.",
          "Match against companies with growth needs that your audience can actually move.",
        ],
        routeHint: "/capability-intelligence",
      });
    }

    const website = normalizeWebsite(identity);
    const scan = generateMockBusinessScan(website);
    const knowledge = createInitialBusinessKnowledge(scan);
    const web3 = isWeb3Identity(identity, String(knowledge.business_identity?.industry || ""));
    const web3Decision = web3
      ? decideWeb3Growth({
        projectName: String(knowledge.business_identity?.name || scan.company_name),
        website,
        sector: String(knowledge.business_identity?.industry || "Web3"),
        stage: String(knowledge.business_model?.scale || "Growth stage"),
        growthGoal: "Acquire real users through KOL, community, and partner collaborations",
        targetAudience: "crypto-native users, builders, traders, or collectors",
        riskTolerance: "medium",
      })
      : null;
    const web3CollaborationBrief = web3Decision
      ? buildWeb3CollaborationBrief({
        projectName: String(knowledge.business_identity?.name || scan.company_name),
        website,
        sector: String(knowledge.business_identity?.industry || "Web3"),
        stage: String(knowledge.business_model?.scale || "Growth stage"),
        growthGoal: "Acquire real users through KOL, community, and partner collaborations",
        targetAudience: "crypto-native users, builders, traders, or collectors",
        riskTolerance: "medium",
      }, web3Decision, 3)
      : null;
    const web3AIGrowthInsight = web3Decision
      ? await generateWeb3AIGrowthInsight({
        projectName: String(knowledge.business_identity?.name || scan.company_name),
        website,
        sector: String(knowledge.business_identity?.industry || "Web3"),
        stage: String(knowledge.business_model?.scale || "Growth stage"),
        growthGoal: "Acquire real users through KOL, community, and partner collaborations",
        targetAudience: "crypto-native users, builders, traders, or collectors",
        riskTolerance: "medium",
      }, web3Decision, web3CollaborationBrief || undefined)
      : null;

    return NextResponse.json({
      success: true,
      side: "company",
      classification,
      normalizedIdentity: website,
      profile: {
        identity: knowledge.business_identity,
        summary: scan.public_summary,
        businessModel: knowledge.business_model,
        market: knowledge.market,
        goals: knowledge.goals,
        constraints: knowledge.constraints,
        confidence: knowledge.knowledge_confidence,
      },
      missingQuestions: companyQuestions(knowledge.knowledge_confidence),
      web3Decision,
      web3CollaborationBrief,
      web3AIGrowthInsight,
      nextActions: web3Decision?.nextActions || [
        "Confirm the growth goal and target customer.",
        "Identify which channels already create demand.",
        "Create a partner brief before outreach.",
      ],
      routeHint: "/business-intelligence",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
