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

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }

  let body: { businessProfileId?: string; capabilityProfileIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.businessProfileId) {
    return NextResponse.json({ success: false, error: "businessProfileId required" }, { status: 400 });
  }

  try {
    const businessRows = await fetchRows<DbBusinessKnowledgeProfile>(
      `/rest/v1/business_knowledge_profiles?select=*&id=eq.${encodeURIComponent(body.businessProfileId)}`,
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

