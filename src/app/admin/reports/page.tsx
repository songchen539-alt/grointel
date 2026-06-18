import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, Database, ExternalLink, Eye, Calendar } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { adminQuery } from "@/lib/admin/supabaseQueries";

export const dynamic = "force-dynamic";

interface Report {
  report_id: string;
  company_name: string;
  website: string;
  domain: string;
  overall_score: number;
  growth_score: number;
  market_readiness: number;
  created_at: string;
}

async function ensureAuthorized() {
  const store = await cookies();
  return store.get("grointel_admin_session")?.value === "true";
}

export default async function AdminReportsPage() {
  if (!(await ensureAuthorized())) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-xs text-gray-500">Please sign in.</p>
        <Link href="/admin/leads" className="mt-6 text-xs text-blue-400 hover:text-blue-300">Go to Login</Link>
      </div>
    );
  }

  const reports = await adminQuery<Report>(
    "company_mri_reports",
    "report_id,company_name,website,domain,overall_score,growth_score,market_readiness,created_at",
    { order: "created_at.desc", limit: 200 }
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Reports</h1>
        <p className="text-xs text-gray-500 mt-1">All generated Company MRI reports.</p>
      </div>

      {!reports || reports.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Database className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No reports yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Company", "Domain", "Score", "Growth", "Market", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.report_id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-white">{r.company_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{r.domain}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${(r.overall_score || 0) >= 75 ? "text-emerald-400" : (r.overall_score || 0) >= 55 ? "text-amber-400" : "text-rose-400"}`}>
                      {r.overall_score ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.growth_score ?? "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.market_readiness ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className="text-[10px] text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={"/report/view?id=" + r.report_id} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                        <ExternalLink className="h-3 w-3" /> View
                      </Link>
                      <Link href={"/admin/events?reportId=" + r.report_id} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
                        <Eye className="h-3 w-3" /> Events
                      </Link>
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
