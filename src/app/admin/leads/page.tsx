import { AlertTriangle, Database, Mail, Building2, Globe, Calendar, Clock } from "lucide-react";
import Link from "next/link";

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
  } catch (err) {
    return { leads: [], error: "Network error while fetching leads." };
  }
}

export default async function AdminLeadsPage() {
  const { leads, error } = await fetchLeads();

  const totalCount = leads.length;
  const todayCount = leads.filter((l) => isToday(l.created_at)).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Leads Dashboard</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Internal lead management</p>
        </div>
        <Link href="/analyze" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Back to App
        </Link>
      </div>

      {/* Stats */}
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

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6 text-center mb-8">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Table */}
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
                <Th sort="created_at">Date</Th>
                <Th sort="email">Email</Th>
                <Th sort="company">Company</Th>
                <Th sort="role">Role</Th>
                <Th sort="report">Report</Th>
                <Th sort="source">Source</Th>
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

      {/* Auth placeholder */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-gray-600">
          Auth coming soon.
        </p>
      </div>
    </div>
  );
}

function Th({ sort, children }: { sort: string; children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}
