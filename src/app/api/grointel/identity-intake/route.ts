import { NextRequest, NextResponse } from "next/server";
import { generateMockBusinessScan, createInitialBusinessKnowledge, normalizeWebsite } from "@/lib/intelligence/businessIntelligence";
import { generateMockCapabilityScan, createInitialCapabilityKnowledge, normalizeProfileUrl } from "@/lib/intelligence/capabilityIntelligence";
import { decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { buildWeb3CollaborationBrief } from "@/lib/grointel/web3CollaborationBrief";
import { generateWeb3AIGrowthInsight, generateWeb3KOLSupplyInsight } from "@/lib/grointel/aiGrowthInsight";
import { WEB3_GROWTH_EVENTS, WEB3_SUPPLY_PROFILES, WEB3_TARGETS, type Web3SupplyProfile } from "@/lib/grointel/web3World";

export const dynamic = "force-dynamic";

type EntitySide = "company" | "kol";

const capabilityDomains = ["x.com", "twitter.com", "youtube.com", "youtu.be", "linkedin.com", "github.com", "substack.com", "tiktok.com", "instagram.com", "bilibili.com"];
const web3Terms = ["web3", "crypto", "defi", "nft", "dao", "l2", "ethereum", "bitcoin", "wallet", "exchange", "airdrop", "quest", "socialfi", "gamefi"];

function classifyIdentity(input: string, declaredSide?: string): { side: EntitySide; confidence: number; reason: string } {
  const lower = input.toLowerCase();
  if (declaredSide === "company" || declaredSide === "kol") return { side: declaredSide, confidence: 90, reason: "User-selected side." };
  if (capabilityDomains.some((domain) => lower.includes(domain))) return { side: "kol", confidence: 82, reason: "The identity points to a public creator, professional, or capability profile." };
  if (/\b(kol|creator|influencer|agency|newsletter|podcast|community|founder)\b/i.test(input)) return { side: "kol", confidence: 68, reason: "The wording indicates a capability provider or audience owner." };
  return { side: "company", confidence: 64, reason: "The identity looks like a company, product, or website." };
}

function isWeb3Identity(input: string, industry?: string) {
  const lower = `${input} ${industry || ""}`.toLowerCase();
  return web3Terms.some((term) => lower.includes(term)) || WEB3_TARGETS.some((target) => lower.includes(target.name.toLowerCase()) || lower.includes(target.identity.toLowerCase()));
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

function web3CompanyMatches(profile?: Web3SupplyProfile | null) {
  const supplyText = profile ? supplyProfileText(profile) : "";
  return WEB3_GROWTH_EVENTS
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
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5);
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
      const supplyProfile = findSupplyProfile(profileUrl, String(knowledge.capability_identity?.name || ""));
      const recommendedCompanyProfiles = web3 ? web3CompanyMatches(supplyProfile) : [];
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
