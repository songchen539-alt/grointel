// GroIntel Admin Prospects API
// GET/POST /api/admin/prospects
// Server-side only. Uses SUPABASE_SERVICE_ROLE_KEY.

import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": "Bearer " + serviceKey,
  };
}

function normalizeWebsite(url: string): { website: string; domain: string } {
  let w = url.trim();
  if (!w.startsWith("http://") && !w.startsWith("https://")) {
    w = "https://" + w;
  }
  const domain = w.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase();
  return { website: w, domain };
}

export async function GET() {
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }
  try {
    const res = await fetch(supabaseUrl + "/rest/v1/prospects?select=*&order=created_at.desc", {
      headers: sbHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Table may not exist" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, prospects: data });
  } catch {
    return NextResponse.json({ success: false, error: "Query failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.companyName || !body.website) {
    return NextResponse.json({ success: false, error: "Company name and website are required" }, { status: 400 });
  }

  const { website, domain } = normalizeWebsite(body.website);

  const payload = {
    company_name: body.companyName,
    website,
    domain,
    category: body.category || "",
    target_person_name: body.targetPersonName || "",
    target_person_title: body.targetPersonTitle || "",
    target_person_email: body.targetPersonEmail || "",
    target_person_linkedin: body.targetPersonLinkedin || "",
    priority: body.priority || "B",
    status: "new",
    source: "manual",
    notes: body.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(supabaseUrl + "/rest/v1/prospects", {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "return=representation" },
      body: JSON.stringify([payload]),
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, prospect: data[0] || data });
  } catch {
    return NextResponse.json({ success: false, error: "Insert error" }, { status: 500 });
  }
}
