// GroIntel Admin - Supabase Query Helpers
// Shared server-side Supabase queries for admin pages.
// Uses SUPABASE_SERVICE_ROLE_KEY. Server-only.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function headers(): Record<string, string> {
  return {
    "apikey": serviceKey,
    "Authorization": "Bearer " + serviceKey,
  };
}

function isConfigured(): boolean {
  return !!(serviceKey && supabaseUrl);
}

export async function adminQueryCount(
  table: string,
  filter?: string
): Promise<number | null> {
  if (!isConfigured()) return null;
  try {
    let url = supabaseUrl + "/rest/v1/" + table + "?select=id&limit=0";
    if (filter) url += filter;
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;
    const count = res.headers.get("content-range");
    if (count) {
      // content-range: 0-0/42
      const parts = count.split("/");
      return parseInt(parts[1], 10);
    }
    return null;
  } catch {
    return null;
  }
}

export async function adminQuery<T>(
  table: string,
  select: string,
  options?: { order?: string; limit?: number; filter?: string }
): Promise<T[] | null> {
  if (!isConfigured()) return null;
  try {
    let url = supabaseUrl + "/rest/v1/" + table + "?select=" + encodeURIComponent(select);
    if (options?.order) url += "&order=" + encodeURIComponent(options.order);
    if (options?.limit) url += "&limit=" + options.limit;
    if (options?.filter) url += options.filter;
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function adminQueryById<T>(
  table: string,
  select: string,
  id: string
): Promise<T | null> {
  if (!isConfigured()) return null;
  try {
    const url = supabaseUrl + "/rest/v1/" + table + "?select=" + encodeURIComponent(select) + "&id=eq." + encodeURIComponent(id);
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}

export async function adminQueryByDomain<T>(
  table: string,
  select: string,
  domain: string
): Promise<T | null> {
  if (!isConfigured()) return null;
  try {
    const url = supabaseUrl + "/rest/v1/" + table + "?select=" + encodeURIComponent(select) + "&domain=eq." + encodeURIComponent(domain) + "&limit=1";
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}
