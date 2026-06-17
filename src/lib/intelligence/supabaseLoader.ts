// GroIntel Supabase Report Loader
// Loads Company MRI reports from Supabase company_mri_reports table.
// Server-side only. Uses SUPABASE_SERVICE_ROLE_KEY.

import type { CompanyMRI } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isConfigured(): boolean {
  return !!(serviceKey && supabaseUrl);
}

export async function loadReportFromSupabase(reportId: string): Promise<CompanyMRI | null> {
  if (!isConfigured()) return null;

  try {
    const encodedId = encodeURIComponent(reportId);
    const url = supabaseUrl + "/rest/v1/company_mri_reports?report_id=eq." + encodedId + "&select=report_json&limit=1";
    const res = await fetch(url, {
      headers: {
        "apikey": serviceKey,
        "Authorization": "Bearer " + serviceKey,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    return rows[0].report_json as CompanyMRI;
  } catch {
    return null;
  }
}
