import { cookies } from "next/headers";
import { AlertTriangle, Database, Mail, Building2, Globe, Calendar, Clock, Lock, LogOut } from "lucide-react";
import Link from "next/link";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  created_at: string;
  work_email: string;
  company_name: string;
  role: string;
  report_id: string;
  source: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const mins = String(d.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${mins} UTC`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getUTCFullYear() === now.getUTCFullYear()
    && d.getUTCMonth() === now.getUTCMonth()
    && d.getUTCDate() === now.getUTCDate();
}

async function fetchLeads(): Promise<{ leads: Lead[]; error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!serviceKey || !supabaseUrl) {
    return { leads: [], error: "Server configuration error. Database not available." };
  }

  try {
    const url = supabaseUrl + "/rest/v1/report_leads?select=id,created_at,work_email,company_name,role,report_id,source&order=created_at.desc";
    const res = await fetch(url, {
      headers: {
        "apikey": serviceKey,
        "Authorization": "Bearer " + serviceKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { leads: [], error: "Failed to fetch leads (status " + res.status + ")." };
    }

    const leads: Lead[] = await res.json();
    return { leads, error: null };
  } catch {
    return { leads: [], error: "Network error while fetching leads." };
  }
}

export default async function AdminLeadsPage() {
  const store = await cookies();
  const session = store.get("grointel_admin_session");
  const auth = session?.value === "true";
  const adminPasswordConfigured = !!process.env.ADMIN_ACCESS_PASSWORD;

  // Not authenticated
  if (!auth) {
    if (!adminPasswordConfigured) {
      return (
        <div className="mx-auto max-w-sm px-6 py-24 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-lg font-semibold text-white">Not Configured</h1>
          <p className="mt-2 text-xs text-gray-500">Admin access not configured.</p>
          <Link href="/analyze" className="mt-6 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">Back to App</Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <Lock className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Admin Access</h1>
        <p className="mt-1 text-xs text-gray-500">Enter the admin password to continue.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  // Authenticated - fetch leads
  const { leads, error } = await fetchLeads();
  const totalCount = leads.length;
  const todayCount = leads.filter((l) => isToday(l.created_at)).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Leads Dashboard</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Internal lead management</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/analyze" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Back to App</Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors">
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-500">Total Leads</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">{todayCount}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6 text-center mb-8">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-red-300">{error}</p>
        </div>
      )}

      {!error && leads.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Database className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No leads yet.</p>
        </div>
      )}

      {!error && leads.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Date", "Email", "Company", "Role", "Report", "Source"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-500">{formatDate(lead.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white">{lead.work_email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-300">{lead.company_name || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{lead.role || "-"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono text-blue-400">{lead.report_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className="text-xs text-gray-400">{lead.source || "-"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

