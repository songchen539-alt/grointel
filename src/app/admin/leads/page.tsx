import { cookies } from "next/headers";
import Link from "next/link";
import { AlertTriangle, Users, ExternalLink, Lock } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import AdminLoginForm from "@/components/AdminLoginForm";
import { adminQuery } from "@/lib/admin/supabaseQueries";

export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  name: string;
  email: string;
  company_website: string;
  target_market: string;
  created_at?: string;
}

async function ensureAuthorized() {
  const store = await cookies();
  return store.get("grointel_admin_session")?.value === "true";
}

export default async function AdminLeadsPage() {
  if (!(await ensureAuthorized())) {
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

  const leads = await adminQuery<Lead>("leads", "id,name,email,company_website,target_market,created_at", { order: "created_at.desc", limit: 200 });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Leads</h1>
        <p className="text-xs text-gray-500 mt-1">All captured leads.</p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-sm text-gray-500">No leads yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Name", "Email", "Website", "Target Market", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-xs text-white">{lead.name || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{lead.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{lead.company_website || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{lead.target_market || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={"/admin/leads/" + lead.id}
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </Link>
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
