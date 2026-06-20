import { NextRequest, NextResponse } from "next/server";
import type {
  DbBusinessKnowledgeProfile,
  DbCapabilityKnowledgeProfile,
} from "@/lib/db/types";
import {
  businessKnowledgeToGrowthNeed,
  capabilityKnowledgeToChannel,
} from "@/lib/intelligence/profileAdapters";
import { recommendHybrid } from "@/lib/ai/recommendation/hybrid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function headers() {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

async function fetchRows<T>(path: string): Promise<T[]> {
  const response = await fetch(`${supabaseUrl}${path}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase query failed: ${response.status} ${body.slice(0, 200)}`);
  }
  return response.json() as Promise<T[]>;
}

function buildCapabilityPath(ids: string[] | undefined): string {
  const select = "/rest/v1/capability_knowledge_profiles?select=*";
  if (!ids || ids.length === 0) {
    return `${select}&order=updated_at.desc&limit=25`;
  }
  const escaped = ids.map((id) => `"${id.replace(/"/g, "")}"`).join(",");
  return `${select}&id=in.(${escaped})`;
}

function buildBusinessPath(ids: string[] | undefined): string {
  const select = "/rest/v1/business_knowledge_profiles?select=*";
  if (!ids || ids.length === 0) {
    return `${select}&order=updated_at.desc&limit=25`;
  }
  const escaped = ids.map((id) => `"${id.replace(/"/g, "")}"`).join(",");
  return `${select}&id=in.(${escaped})`;
}

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }

  let body: {
    businessProfileId?: string;
    businessProfileIds?: string[];
    capabilityProfileId?: string;
    capabilityProfileIds?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.businessProfileId && !body.capabilityProfileId) {
    return NextResponse.json({ success: false, error: "businessProfileId or capabilityProfileId required" }, { status: 400 });
  }

  try {
    if (body.capabilityProfileId) {
      const capabilityRows = await fetchRows<DbCapabilityKnowledgeProfile>(
        `/rest/v1/capability_knowledge_profiles?select=*&id=eq.${encodeURIComponent(body.capabilityProfileId)}`,
      );
      const capabilityProfile = capabilityRows[0];
      if (!capabilityProfile) {
        return NextResponse.json({ success: false, error: "Capability profile not found" }, { status: 404 });
      }

      const businessRows = await fetchRows<DbBusinessKnowledgeProfile>(
        buildBusinessPath(body.businessProfileIds),
      );
      if (businessRows.length === 0) {
        return NextResponse.json({ success: false, error: "No business profiles available" }, { status: 404 });
      }

      const capability = capabilityKnowledgeToChannel(capabilityProfile);
      const candidates = [];

      for (const businessProfile of businessRows) {
        const growthNeed = businessKnowledgeToGrowthNeed(businessProfile);
        const [recommendation] = await recommendHybrid(growthNeed, [capability.channel], [capability.service]);
        if (!recommendation) continue;
        candidates.push({
          businessProfileId: businessProfile.id,
          companyName: growthNeed.companyName,
          website: growthNeed.website,
          industry: growthNeed.industry,
          growthGoal: growthNeed.growthGoal,
          targetMarket: growthNeed.targetMarket,
          overallScore: recommendation.overallScore,
          ruleScore: recommendation.ruleScore,
          embeddingScore: recommendation.embeddingScore,
          confidence: recommendation.confidence,
          recommendedSolutionType: recommendation.recommendedSolutionType,
          matchReason: recommendation.matchReason,
          reasons: recommendation.reasons,
        });
      }

      candidates.sort((a, b) => b.overallScore - a.overallScore);
      return NextResponse.json({
        success: true,
        capabilityProfileId: capabilityProfile.id,
        capability: capability.channel,
        totalCandidates: candidates.length,
        candidates: candidates.slice(0, 10),
      });
    }

    const businessProfileId = body.businessProfileId;
    if (!businessProfileId) {
      return NextResponse.json({ success: false, error: "businessProfileId required" }, { status: 400 });
    }

    const businessRows = await fetchRows<DbBusinessKnowledgeProfile>(
      `/rest/v1/business_knowledge_profiles?select=*&id=eq.${encodeURIComponent(businessProfileId)}`,
    );
    const businessProfile = businessRows[0];
    if (!businessProfile) {
      return NextResponse.json({ success: false, error: "Business profile not found" }, { status: 404 });
    }

    const capabilityRows = await fetchRows<DbCapabilityKnowledgeProfile>(
      buildCapabilityPath(body.capabilityProfileIds),
    );
    if (capabilityRows.length === 0) {
      return NextResponse.json({ success: false, error: "No capability profiles available" }, { status: 404 });
    }

    const growthNeed = businessKnowledgeToGrowthNeed(businessProfile);
    const adapted = capabilityRows.map(capabilityKnowledgeToChannel);
    const recommendations = await recommendHybrid(
      growthNeed,
      adapted.map((item) => item.channel),
      adapted.map((item) => item.service),
    );

    const candidates = recommendations.slice(0, 10).map((recommendation) => {
      const capability = adapted.find((item) => item.channel.id === recommendation.channelId);
      return {
        capabilityProfileId: recommendation.channelId,
        serviceId: recommendation.serviceId,
        displayName: capability?.channel.channelName || "Unknown Capability",
        profileUrl: capability?.channel.website || "",
        overallScore: recommendation.overallScore,
        ruleScore: recommendation.ruleScore,
        embeddingScore: recommendation.embeddingScore,
        confidence: recommendation.confidence,
        capabilityConfidence: capability?.confidence || 0,
        missingCapabilityFields: capability?.missingFields || [],
        recommendedSolutionType: recommendation.recommendedSolutionType,
        matchReason: recommendation.matchReason,
        reasons: recommendation.reasons,
      };
    });

    return NextResponse.json({
      success: true,
      businessProfileId: businessProfile.id,
      growthNeed,
      totalCandidates: candidates.length,
      candidates,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile matching failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
