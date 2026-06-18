import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\channels\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Find and replace the final closing section
old_end = """          {saving && <p className="text-xs text-gray-500">Saving...</p>}
        </div>
      </div>
    </div>
  );
}"""

new_end = """          {saving && <p className="text-xs text-gray-500">Saving...</p>}
        </div>
      </div>

      <ChannelServicesSection channelId={id} />
      <ChannelMatchesSection channelId={id} />

    </div>
  );
}"""

c = c.replace(old_end, new_end)

# Add new icons to import
c = c.replace(
    'import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";',
    'import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Plus } from "lucide-react";'
)

# Add the two new components before the main component
old_export = "export default function ChannelDetailPage() {"

new_components = """function ChannelServicesSection({ channelId }: { channelId: string }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ serviceName: "", serviceType: "", problemSolved: "", growthOutcome: "", deliverables: "", timeline: "", pricingModel: "", startingPrice: "", maxPrice: "", currency: "USD", targetRegion: "", targetIndustry: "", successMetrics: "", caseStudy: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch("/api/admin/channels/" + channelId + "/services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.services || []); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [channelId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/admin/channels/" + channelId + "/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSubmitting(false);
    setShowForm(false);
    setForm({ serviceName: "", serviceType: "", problemSolved: "", growthOutcome: "", deliverables: "", timeline: "", pricingModel: "", startingPrice: "", maxPrice: "", currency: "USD", targetRegion: "", targetIndustry: "", successMetrics: "", caseStudy: "" });
    load();
  }

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Channel Services / Solutions ({services.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus className="h-3 w-3" /> Add Service</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-3 rounded-lg border border-white/10 p-4">
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Service Name *" value={form.serviceName} onChange={(e) => setForm({...form, serviceName: e.target.value})} required
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
            <input placeholder="Service Type *" value={form.serviceType} onChange={(e) => setForm({...form, serviceType: e.target.value})} required
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          </div>
          <input placeholder="Problem Solved *" value={form.problemSolved} onChange={(e) => setForm({...form, problemSolved: e.target.value})} required
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          <input placeholder="Growth Outcome *" value={form.growthOutcome} onChange={(e) => setForm({...form, growthOutcome: e.target.value})} required
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          <div className="grid md:grid-cols-3 gap-3">
            <input placeholder="Pricing Model" value={form.pricingModel} onChange={(e) => setForm({...form, pricingModel: e.target.value})}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
            <input placeholder="Starting Price" type="number" value={form.startingPrice} onChange={(e) => setForm({...form, startingPrice: e.target.value})}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
            <input placeholder="Max Price" type="number" value={form.maxPrice} onChange={(e) => setForm({...form, maxPrice: e.target.value})}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
            {submitting ? "Saving..." : "Save Service"}
          </button>
        </form>
      )}
      {loading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : services.length === 0 ? (<p className="text-xs text-gray-500">No services added yet.</p>
      ) : (
        <div className="space-y-2">
          {services.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-xs text-white">{s.service_name}</p>
                <p className="text-[10px] text-gray-500">{s.service_type} - {s.currency} {s.starting_price || "?"} - {s.max_price || "?"}</p>
              </div>
              <span className={"text-[10px] px-1.5 py-0.5 rounded " + (s.status === "active" ? "bg-emerald-500/10 text-emerald-300" : "bg-gray-500/10 text-gray-400")}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelMatchesSection({ channelId }: { channelId: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [needs, setNeeds] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/matches").then((r) => r.json()),
      fetch("/api/admin/growth-needs").then((r) => r.json()),
    ]).then(([mr, nr]) => {
      if (mr.success) {
        setMatches((mr.matches || []).filter((m: any) => m.channel_id === channelId));
      }
      if (nr.success) {
        const ndMap: Record<string, any> = {};
        (nr.needs || []).forEach((n: any) => { ndMap[n.id] = n; });
        setNeeds(ndMap);
      }
      setLoading(false);
    });
  }, [channelId]);

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Matched Company Needs ({matches.length})</h2>
        <Link href={"/admin/matches/new?channelId=" + channelId} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
          <Plus className="h-3 w-3" /> Create Match
        </Link>
      </div>
      {loading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : matches.length === 0 ? (<p className="text-xs text-gray-500">No matches yet.</p>
      ) : (
        <div className="space-y-2">
          {matches.map((m: any) => {
            const nd = needs[m.company_growth_need_id];
            return (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <div>
                  <p className="text-xs text-white">{nd?.company_name || m.company_growth_need_id?.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-500">{nd?.growth_goal?.slice(0, 60)}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-500">{m.recommended_solution_type}</span>
                  <span className="text-blue-400">{m.match_score}</span>
                  <Link href={"/admin/matches/" + m.id} className="text-blue-400"><ExternalLink className="h-3 w-3" /></Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChannelDetailPage() {"""

c = c.replace(old_export, new_components)

# Also need to add Link import since we use Link in the component
c = c.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport { useParams } from "next/navigation";'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated channel detail page')
