import type { Company } from "@/types/company";
import { TrendingUp, ArrowUpRight, MapPin, Globe } from "lucide-react";

export default function SignalCard({ company }: { company: Company }) {
  const topSignal = company.signals[0];
  const priority = company.stage === "Mature" || company.stage === "Growth" ? "High" : "Medium";

  return (
    <div className="group rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">{company.name}</h3>
          <span className="mt-0.5 inline-block rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-gray-500">{company.industry}</span>
        </div>
        <div className="text-lg font-bold text-gray-400">{company.signals.length}</div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <p className="text-sm text-gray-400">{topSignal ? topSignal.description : "No recent signals"}</p>
        </div>
        <div className="flex items-start gap-2">
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="text-sm text-gray-400">Stage: {company.stage} | Market: {company.markets[0]}</p>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
          <p className="text-sm text-gray-400">HQ: {company.headquarters}</p>
        </div>
        <div className="flex items-start gap-2">
          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
          <div className="flex flex-wrap gap-1.5">
            {company.growthChannels.slice(0, 3).map((ch) => (
              <span key={ch.name} className="rounded-md border border-white/5 bg-white/[0.04] px-2 py-0.5 text-xs text-gray-500">{ch.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
        <span className={`rounded-md border px-2.5 py-1 text-xs ${
          priority === "High" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-gray-400 bg-gray-500/10 border-gray-500/30"
        }`}>
          {priority} Priority
        </span>
        <span className="text-xs text-gray-600 leading-7">{company.businessModel}</span>
      </div>
    </div>
  );
}
