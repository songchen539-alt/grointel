// GroIntel Reports API - Generate
// POST /api/reports/generate
// Generates Company MRI report, persists to Supabase, returns reportId.

import { NextRequest, NextResponse } from "next/server";
import { normalizeDomain } from "@/lib/intelligence/normalizeDomain";
import { generateReport } from "@/lib/intelligence/reportGenerator";
import { convertToSupabaseRow } from "@/lib/intelligence/supabaseAdapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function missingConfig(): boolean {
  return !serviceKey || !supabaseUrl;
}

async function upsertReport(mri: ReturnType<typeof generateReport>): Promise<string | null> {
  try {
    const row = convertToSupabaseRow(mri);
    const res = await fetch(supabaseUrl + "/rest/v1/company_mri_reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": "Bearer " + serviceKey,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify([row]),
    });
    if (!res.ok && res.status !== 409) {
      return null;
    }
    return mri.reportId;
  } catch {
    return null;
  }
}

async function insertEvent(reportId: string, domain: string): Promise<boolean> {
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/report_events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": "Bearer " + serviceKey,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify([{
        report_id: reportId,
        event_type: "generated",
        metadata: { domain, source: "analyze_page", timestamp: new Date().toISOString() },
      }]),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Parse body
  let body: { website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate website
  if (!body.website || typeof body.website !== "string" || !body.website.trim()) {
    return NextResponse.json({ success: false, error: "Website is required." }, { status: 400 });
  }

  // Normalize domain
  let normalized;
  try {
    normalized = normalizeDomain(body.website);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid website URL." }, { status: 400 });
  }

  if (!normalized.domain || normalized.domain.length < 3) {
    return NextResponse.json({ success: false, error: "Invalid domain." }, { status: 400 });
  }

  // Generate report via engine
  const mri = generateReport(normalized.url);

  // Persist to Supabase if configured
  if (!missingConfig()) {
    const result = await upsertReport(mri);
    if (!result) {
      // Table might not exist yet
      return NextResponse.json({
        success: true,
        reportId: mri.reportId,
        redirectUrl: "/report/view?id=" + mri.reportId,
        warning: "Report generated but could not be saved to database.",
      });
    }
    await insertEvent(mri.reportId, normalized.domain);
  }

  return NextResponse.json({
    success: true,
    reportId: mri.reportId,
    redirectUrl: "/report/view?id=" + mri.reportId,
  });
}
