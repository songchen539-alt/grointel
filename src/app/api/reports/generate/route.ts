import { NextRequest, NextResponse } from "next/server";
import { normalizeDomain } from "@/lib/intelligence/normalizeDomain";
import { generateReport } from "@/lib/intelligence/reportGenerator";
import { convertToSupabaseRow } from "@/lib/intelligence/supabaseAdapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function missingConfig(): boolean {
  return !serviceKey || !supabaseUrl;
}

function sbHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": "Bearer " + serviceKey,
  };
}

async function upsertReport(mri: ReturnType<typeof generateReport>): Promise<boolean> {
  try {
    const row = convertToSupabaseRow(mri);
    const res = await fetch(supabaseUrl + "/rest/v1/company_mri_reports", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify([row]),
    });
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

async function insertEvent(reportId: string, domain: string): Promise<void> {
  try {
    await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify([{
        report_id: reportId,
        event_type: "generated",
        metadata: { domain, source: "analyze_page", timestamp: new Date().toISOString() },
      }]),
    });
  } catch {
    // fail silently
  }
}

async function saveLead(lead: { email?: string; companyName?: string; role?: string }, website: string): Promise<void> {
  if (!lead.email) return;
  try {
    const name = lead.role || lead.companyName || "Website Analyzer Lead";
    await fetch(supabaseUrl + "/rest/v1/leads", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify([{
        name,
        email: lead.email,
        company_website: website,
        target_market: "GroIntel Analyze",
        created_at: new Date().toISOString(),
      }]),
    });
  } catch {
    console.warn("[reports/generate] Failed to save lead");
  }
}

export async function POST(request: NextRequest) {
  let body: { website?: string; lead?: { email?: string; companyName?: string; role?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.website || typeof body.website !== "string" || !body.website.trim()) {
    return NextResponse.json({ success: false, error: "Website is required." }, { status: 400 });
  }

  let normalized;
  try {
    normalized = normalizeDomain(body.website);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid website URL." }, { status: 400 });
  }

  if (!normalized.domain || normalized.domain.length < 3) {
    return NextResponse.json({ success: false, error: "Invalid domain." }, { status: 400 });
  }

  const mri = generateReport(normalized.url);

  if (!missingConfig()) {
    const saved = await upsertReport(mri);
    if (!saved) {
      return NextResponse.json({
        success: true,
        reportId: mri.reportId,
        redirectUrl: "/report/view?id=" + mri.reportId,
        warning: "Report generated but could not be saved to database.",
      });
    }
    await insertEvent(mri.reportId, normalized.domain);

    // Save lead if provided
    if (body.lead && body.lead.email) {
      await saveLead(body.lead, normalized.url);
    }
  }

  return NextResponse.json({
    success: true,
    reportId: mri.reportId,
    redirectUrl: "/report/view?id=" + mri.reportId,
  });
}
