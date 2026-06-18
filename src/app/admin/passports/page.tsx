"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ExternalLink } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminPassportsPage() {
  const [passports, setPassports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/passports").then((r) => r.json()).then((d) => { if (d.success) setPassports(d.passports || []); }).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="mx-auto max-w-6xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <h1 className="text-xl font-bold text-white mb-4">Growth Passports</h1>
      {passports.length === 0 ? <p className="text-sm text-gray-500">No passports yet.</p> : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-white/5">{["Entity", "Type", "Industry", "Headline", "Created", ""].map((h) => (<th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-gray-500">{h}</th>))}</tr></thead>
            <tbody>
              {passports.map((p: any) => (
                <tr key={p.id} className="border-b border-white/[0.02]">
                  <td className="px-4 py-3 text-white">{p.entity?.display_name || p.entity_id?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-400">{p.entity?.entity_type || "-"}</td>
                  <td className="px-4 py-3 text-gray-400">{p.primary_industry || "-"}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{p.headline || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3"><Link href={"/admin/passports/" + p.id} className="text-blue-400"><ExternalLink className="h-3 w-3 inline" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
