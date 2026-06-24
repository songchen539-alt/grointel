import { NextRequest, NextResponse } from "next/server";
import { generateMockBusinessScan, createInitialBusinessKnowledge, normalizeWebsite } from "@/lib/intelligence/businessIntelligence";
import { generateMockCapabilityScan, createInitialCapabilityKnowledge, normalizeProfileUrl } from "@/lib/intelligence/capabilityIntelligence";
import { decideWeb3Growth } from "@/lib/grointel/web3Decision";
import { WEB3_GROWTH_EVENTS, WEB3_TARGETS } from "@/lib/grointel/web3World";

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

function web3CompanyMatches() {
  return WEB3_GROWTH_EVENTS
    .filter((event) => event.outcome === "success" || event.outcome === "mixed")
    .slice(0, 5)
    .map((event) => ({
      company: event.project,
      sector: event.chainOrSector,
      growthNeed: event.growthGoal,
      usefulWhen: event.bestForStages || [],
      evidence: event.reusablePattern,
    }));
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
        },
        missingQuestions: capabilityQuestions(knowledge.knowledge_confidence),
        recommendedCompanyProfiles: web3 ? web3CompanyMatches() : [],
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
