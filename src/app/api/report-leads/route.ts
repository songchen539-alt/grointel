import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { validateReportLead } from "@/lib/validation/reportLead";
import { checkRateLimit } from "@/lib/middleware/rateLimit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const clientIp = getClientIp(request);

  const rateLimit = checkRateLimit("report-leads:" + clientIp, 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const reportId = (body.reportId as string) || "";
  const companyName = (body.companyName as string) || "";
  const workEmail = (body.workEmail as string) || "";
  const role = (body.role as string) || "";

  const validation = validateReportLead({ reportId, companyName, workEmail, role });
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.errors[0], details: validation.errors }, { status: 400 });
  }

  const supabase = getServerClient();
  if (!supabase) {
    return NextResponse.json({ success: true });
  }

  // Duplicate detection
  try {
    const cutoff = new Date(Date.now() - 86400000).toISOString();
    const { data: existing } = await supabase
      .from("report_leads")
      .select("id")
      .eq("work_email", workEmail.trim().toLowerCase())
      .eq("report_id", reportId)
      .gte("created_at", cutoff)
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: "Already submitted. Our team will review your request." }, { status: 409 });
    }
  } catch {
    // fail open
  }

  // Insert via raw query to avoid Supabase type issues
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const payload = {
      report_id: reportId,
      company_name: companyName.trim(),
      work_email: workEmail.trim().toLowerCase(),
      role: role.trim(),
      source: "report_page",
      created_at: timestamp,
    };
    const res = await fetch(supabaseUrl + "/rest/v1/report_leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": "Bearer " + serviceKey,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify([payload]),
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Failed to save. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
