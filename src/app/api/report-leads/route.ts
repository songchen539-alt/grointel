import { NextRequest, NextResponse } from "next/server";
import { validateReportLead } from "@/lib/validation/reportLead";
import { checkRateLimit } from "@/lib/middleware/rateLimit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

function getAuthHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    "apikey": key,
    "Authorization": "Bearer " + key,
  };
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const clientIp = getClientIp(request);

  // Rate limit
  const rateLimit = checkRateLimit("report-leads:" + clientIp, 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Parse
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

  // Validate
  const validation = validateReportLead({ reportId, companyName, workEmail, role });
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.errors[0], details: validation.errors }, { status: 400 });
  }

  // Check service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { success: false, error: "Server configuration error. Please contact support." },
      { status: 500 }
    );
  }

  const headers = getAuthHeaders();
  const baseUrl = supabaseUrl + "/rest/v1/report_leads";

  // Duplicate detection: same email + same report within 24 hours
  try {
    const cutoff = new Date(Date.now() - 86400000).toISOString();
    const emailEnc = encodeURIComponent(workEmail.trim().toLowerCase());
    const idEnc = encodeURIComponent(reportId);
    const dupRes = await fetch(baseUrl + "?select=id&work_email=eq." + emailEnc + "&report_id=eq." + idEnc + "&created_at=gte." + cutoff, { headers });
    if (dupRes.ok) {
      const existing = await dupRes.json();
      if (existing && existing.length > 0) {
        return NextResponse.json({ success: false, error: "Already submitted. Our team will review your request." }, { status: 409 });
      }
    }
  } catch {
    // fail open
  }

  // Insert
  try {
    const payload = [{
      report_id: reportId,
      company_name: companyName.trim(),
      work_email: workEmail.trim().toLowerCase(),
      role: role.trim(),
      source: "report_page",
      created_at: timestamp,
    }];
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Failed to save. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
