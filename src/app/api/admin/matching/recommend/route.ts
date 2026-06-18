// GroIntel Admin AI Matching Recommendation API v3 - Hybrid Scoring
// POST /api/admin/matching/recommend
// Uses AI Core v3 hybrid scoring (Rule 80% + Embedding 20%)

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const sbH = () => ({ "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey });

interface RawNeed {
  id: string; company_name?: string; website?: string; growth_goal?: string;
  target_market?: string; target_customer?: string; current_challenge?: string;
  budget_min?: number; budget_max?: number; currency?: string; timeline?: string;
  preferred_channels?: string[];
}

interface RawChannel {
  id: string; channel_name?: string; website?: string; category?: string; region?: string;
  service_types?: string[]; target_industries?: string[]; target_client_stage?: string[];
  pricing_model?: string; min_budget?: number; max_budget?: number; currency?: string;
  growth_outcomes?: string; case_studies?: string;
}

interface RawService {
  id: string; channel_id: string; service_name?: string; service_type?: string;
  problem_solved?: string; growth_outcome?: string; deliverables?: string; timeline?: string;
  pricing_model?: string; starting_price?: number; max_price?: number; currency?: string;
  target_region?: string; target_industry?: string; success_metrics?: string; case_study?: string;
}

export async function POST(request: NextRequest) {
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body.growthNeedId) return NextResponse.json({ success: false, error: "growthNeedId required" }, { status: 400 });

  try {
    // 1. Fetch growth need
    const needRes = await fetch(supabaseUrl + "/rest/v1/company_growth_needs?select=*&id=eq." + encodeURIComponent(body.growthNeedId), { headers: sbH() });
    const needRows = await needRes.json();
    if (!needRows || needRows.length === 0) return NextResponse.json({ success: false, error: "Growth need not found" }, { status: 404 });
    const rn: RawNeed = needRows[0];

    // 2. Fetch channels
    const chRes = await fetch(supabaseUrl + "/rest/v1/growth_channels?select=*&status=in.(active,new)", { headers: sbH() });
    const rawChannels: RawChannel[] = await chRes.json();
    if (!rawChannels || rawChannels.length === 0) return NextResponse.json({ success: false, error: "No channels available" }, { status: 404 });

    // 3. Fetch services
    const svcRes = await fetch(supabaseUrl + "/rest/v1/channel_services?select=*", { headers: sbH() });
    const rawServices: RawService[] = (await svcRes.json()) || [];

    // 4. Convert to AI Core types
    const growthNeed = {
      id: rn.id,
      companyName: rn.company_name || "",
      website: rn.website || "",
      industry: "",
      region: rn.target_market || "",
      stage: "",
      growthGoal: rn.growth_goal || "",
      targetMarket: rn.target_market || "",
      targetCustomer: rn.target_customer || "",
      currentChallenge: rn.current_challenge || "",
      budgetMin: rn.budget_min || 0,
      budgetMax: rn.budget_max || 0,
      currency: rn.currency || "USD",
      timeline: rn.timeline || "",
      preferredChannels: rn.preferred_channels || [],
    };

    const channels = rawChannels.map((c: RawChannel) => ({
      id: c.id,
      channelName: c.channel_name || "",
      website: c.website || "",
      category: c.category || "",
      region: c.region || "",
      serviceTypes: c.service_types || [],
      targetIndustries: c.target_industries || [],
      targetClientStage: c.target_client_stage || [],
      pricingModel: c.pricing_model || "",
      minBudget: c.min_budget || 0,
      maxBudget: c.max_budget || 0,
      currency: c.currency || "USD",
      growthOutcomes: c.growth_outcomes || "",
      caseStudies: c.case_studies || "",
    }));

    const services = (rawServices || []).map((s: RawService) => ({
      id: s.id,
      channelId: s.channel_id,
      serviceName: s.service_name || "",
      serviceType: s.service_type || "",
      problemSolved: s.problem_solved || "",
      growthOutcome: s.growth_outcome || "",
      deliverables: s.deliverables || "",
      timeline: s.timeline || "",
      pricingModel: s.pricing_model || "",
      startingPrice: s.starting_price || 0,
      maxPrice: s.max_price || 0,
      currency: s.currency || "USD",
      targetRegion: s.target_region || "",
      targetIndustry: s.target_industry || "",
      successMetrics: s.success_metrics || "",
      caseStudy: s.case_study || "",
    }));

    // 5. Call AI Core v3 hybrid pipeline
    const { recommendHybrid } = await import("@/lib/ai/recommendation/hybrid");
    const recs = await recommendHybrid(growthNeed, channels, services);

    // 6. Format top 5
    const top5 = recs.slice(0, 5).map((r) => {
      const ch = channels.find((c: { id: string }) => c.id === r.channelId);
      const sv = r.serviceId ? services.find((s: { id: string }) => s.id === r.serviceId) : null;
      return {
        channelId: r.channelId,
        channelName: ch?.channelName || "",
        serviceId: r.serviceId,
        serviceName: sv?.serviceName || "",
        overallScore: r.overallScore,
        ruleScore: r.ruleScore,
        embeddingScore: r.embeddingScore,
        hybridScore: r.hybridScore,
        scoringMode: r.scoringMode,
        confidence: r.confidence,
        featureScores: r.featureScores,
        reasons: r.reasons,
        matchReason: r.matchReason,
        recommendedSolutionType: r.recommendedSolutionType,
        embeddingProvider: r.embeddingProvider,
        embeddingModel: r.embeddingModel,
        fallbackUsed: r.fallbackUsed,
      };
    });

    const { getProviderMetadata } = await import("@/lib/ai/embedding/factory");
  const pm = getProviderMetadata();
  return NextResponse.json({ success: true, growthNeed: rn, recommendations: top5, scoringMode: "hybrid", embeddingProvider: pm.provider, embeddingModel: pm.model, fallbackUsed: pm.fallbackUsed });
  } catch (err) {
    console.error("[AI Matching v3] Error:", err);
    return NextResponse.json({ success: false, error: "AI recommendation failed" }, { status: 500 });
  }
}
