// GroIntel Admin AI Matching Recommendation API
// POST /api/admin/matching/recommend
// Uses AI Core to generate channel/service recommendations for a growth need.

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const sbH = () => ({ "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey });

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
    const rawNeed = needRows[0];

    // 2. Fetch all active channels
    const chRes = await fetch(supabaseUrl + "/rest/v1/growth_channels?select=*&status=in.(active,new)", { headers: sbH() });
    const rawChannels = await chRes.json();
    if (!rawChannels || rawChannels.length === 0) return NextResponse.json({ success: false, error: "No channels available" }, { status: 404 });

    // 3. Fetch all services
    const svcRes = await fetch(supabaseUrl + "/rest/v1/channel_services?select=*", { headers: sbH() });
    const rawServices = await svcRes.json();
    const allServices = rawServices || [];

    // 4. Convert to AI Core types
    const growthNeed = {
      id: rawNeed.id,
      companyName: rawNeed.company_name || "",
      website: rawNeed.website || "",
      industry: "",
      region: rawNeed.target_market || "",
      stage: "",
      growthGoal: rawNeed.growth_goal || "",
      targetMarket: rawNeed.target_market || "",
      targetCustomer: rawNeed.target_customer || "",
      currentChallenge: rawNeed.current_challenge || "",
      budgetMin: rawNeed.budget_min || 0,
      budgetMax: rawNeed.budget_max || 0,
      currency: rawNeed.currency || "USD",
      timeline: rawNeed.timeline || "",
      preferredChannels: rawNeed.preferred_channels || [],
    };

    const channels = (rawChannels || []).map((c: { id: string; channel_name?: string; website?: string; category?: string; region?: string; service_types?: string[]; target_industries?: string[]; target_client_stage?: string[]; pricing_model?: string; min_budget?: number; max_budget?: number; currency?: string; growth_outcomes?: string; case_studies?: string }) => ({
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

    const services = (allServices || []).map((s: { id: string; channel_id: string; service_name?: string; service_type?: string; problem_solved?: string; growth_outcome?: string; deliverables?: string; timeline?: string; pricing_model?: string; starting_price?: number; max_price?: number; currency?: string; target_region?: string; target_industry?: string; success_metrics?: string; case_study?: string }) => ({
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

    // 5. Call AI Core
    const { recommend } = await import("@/lib/ai/recommendation/recommendation");
    const recs = recommend({ growthNeed, channels, services });

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
        confidence: r.confidence,
        featureScores: r.featureScores,
        reasons: r.reasons,
        matchReason: r.matchReason,
        recommendedSolutionType: r.recommendedSolutionType,
        channel: ch,
        service: sv,
      };
    });

    return NextResponse.json({ success: true, growthNeed: rawNeed, recommendations: top5 });
  } catch (err) {
    console.error("[AI Matching] Error:", err);
    return NextResponse.json({ success: false, error: "AI recommendation failed" }, { status: 500 });
  }
}
