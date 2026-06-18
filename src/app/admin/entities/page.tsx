"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ExternalLink } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminEntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/entities").then((r) => r.json()).then((d) => { if (d.success) setEntities(d.entities || []); }).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="mx-auto max-w-6xl px-6 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 text-gray-500 animate-spin" /></div>;
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <h1 className="text-xl font-bold text-white mb-4">Growth Entities</h1>
      {entities.length === 0 ? <p className="text-sm text-gray-500">No entities yet.</p> : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-white/5">{["Name", "Type", "Slug", "Country", "Verified", "Status", ""].map((h) => (<th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-gray-500">{h}</th>))}</tr></thead>
            <tbody>
              {entities.map((e: any) => (
                <tr key={e.id} className="border-b border-white/[0.02]">
                  <td className="px-4 py-3 text-white">{e.display_name}</td>
                  <td className="px-4 py-3"><span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{e.entity_type}</span></td>
                  <td className="px-4 py-3 text-gray-400">{e.slug || "-"}</td>
                  <td className="px-4 py-3 text-gray-400">{e.country || "-"}</td>
                  <td className="px-4 py-3 text-gray-400">{e.verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-gray-400">{e.status}</td>
                  <td className="px-4 py-3"><Link href={"/admin/entities/" + e.id} className="text-blue-400"><ExternalLink className="h-3 w-3 inline" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
