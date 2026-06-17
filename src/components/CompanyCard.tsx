import type { Company } from "@/types/company";
import { TrendingUp, Globe } from "lucide-react";

export default function CompanyCard({ company }: { company: Company }) {
  const signalCount = company.signals.length;
  const topSignal = company.signals[0];
  const priority = company.stage === "Mature" || company.stage === "Growth" ? "High" : "Medium";

  return (
    <div className="group rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">{company.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{company.industry}</p>
        </div>
        <div className="text-lg font-bold text-gray-400">
          {signalCount > 0 ? signalCount : 0}
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
        <p className="text-sm leading-relaxed text-gray-400">
          {topSignal ? topSignal.description : "No recent signals detected"}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-md border border-white/5 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-400">
          <Globe className="h-3 w-3" />
          {company.stage}
        </span>
        <span className={`rounded-md border px-2.5 py-1 text-xs ${
          priority === "High" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-gray-400 bg-gray-500/10 border-gray-500/30"
        }`}>
          {priority}
        </span>
      </div>
    </div>
  );
}
