import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, User, Mail, Globe, Target, Calendar } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { adminQueryById, adminQueryByDomain } from "@/lib/admin/supabaseQueries";

export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  name: string;
  email: string;
  company_website: string;
  target_market: string;
  growth_goal?: string;
  budget_range?: string;
  message?: string;
  created_at?: string;
}

interface Report {
  report_id: string;
  company_name: string;
  overall_score: number;
  top_opportunity: string;
  top_risk: string;
  recommended_next_action: string;
}

function extractDomain(website: string): string {
  return website
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

async function ensureAuthorized() {
  const store = await cookies();
  return store.get("grointel_admin_session")?.value === "true";
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAuthorized())) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-xs text-gray-500">Please sign in.</p>
        <Link href="/admin/leads" className="mt-6 text-xs text-blue-400 hover:text-blue-300">Go to Login</Link>
      </div>
    );
  }

  const { id } = await params;
  const lead = await adminQueryById<Lead>("leads", "id,name,email,company_website,target_market,growth_goal,budget_range,message,created_at", id);

  if (!lead) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-gray-600" />
        <h1 className="mt-4 text-lg font-semibold text-white">Lead Not Found</h1>
        <p className="mt-2 text-xs text-gray-500">The lead does not exist.</p>
        <Link href="/admin/leads" className="mt-6 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><ArrowLeft className="h-3 w-3" /> Back to Leads</Link>
      </div>
    );
  }

  // Try to find associated report
  let report: Report | null = null;
  if (lead.company_website) {
    const domain = extractDomain(lead.company_website);
    report = await adminQueryByDomain<Report>(
      "company_mri_reports",
      "report_id,company_name,overall_score,top_opportunity,top_risk,recommended_next_action",
      domain
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />

      <Link href="/admin/leads" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to Leads
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lead Details */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h1 className="text-lg font-bold text-white mb-4">Lead Details</h1>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Name</p>
                <p className="text-sm text-white">{lead.name || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Email</p>
                <p className="text-sm text-white">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Company Website</p>
                <p className="text-sm text-white">{lead.company_website || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Target Market</p>
                <p className="text-sm text-white">{lead.target_market || "-"}</p>
              </div>
            </div>
            {lead.created_at && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Created</p>
                  <p className="text-sm text-white">{new Date(lead.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Associated Report */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-sm font-bold text-white mb-4">Associated Report</h2>
          {report ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Report ID: <span className="font-mono text-blue-400">{report.report_id}</span></p>
              <p className="text-xs text-gray-500">Company: <span className="text-white">{report.company_name}</span></p>
              <p className="text-xs text-gray-500">Score: <span className="font-bold text-blue-400">{report.overall_score}</span></p>
              <p className="text-xs text-gray-500">Top Opportunity: <span className="text-emerald-300">{report.top_opportunity}</span></p>
              <p className="text-xs text-gray-500">Top Risk: <span className="text-rose-300">{report.top_risk}</span></p>
              <p className="text-xs text-gray-500">Next Action: <span className="text-gray-300">{report.recommended_next_action}</span></p>
              <Link
                href={"/report/view?id=" + report.report_id}
                className="mt-4 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                View Report
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <Globe className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-2 text-xs text-gray-500">No related report found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
