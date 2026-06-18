import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\growth-needs\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add matches and curated preview before the final JSX closing
old = '''        </div>
      </div>
    </div>
  );
}'''

new = '''        </div>
      </div>

      {/* Matched Growth Options */}
      <MatchesSection needId={id} />

    </div>
  );
}'''

c = c.replace(old, new)

# Add the MatchesSection import and component
c = c.replace(
    'import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";',
    'import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Plus, TrendingUp } from "lucide-react";'
)

# Add the MatchesSection component before the closing
c = c.replace(
    'export default function GrowthNeedDetailPage() {',
    '''function MatchesSection({ needId }: { needId: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [channels, setChannels] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/matches").then((r) => r.json()),
      fetch("/api/admin/growth-channels").then((r) => r.json()),
    ]).then(([mr, cr]) => {
      if (mr.success) {
        const needMatches = (mr.matches || []).filter((m: any) => m.company_growth_need_id === needId);
        setMatches(needMatches);
      }
      if (cr.success) {
        const chMap: Record<string, any> = {};
        (cr.channels || []).forEach((ch: any) => { chMap[ch.id] = ch; });
        setChannels(chMap);
      }
      setLoading(false);
    });
  }, [needId]);

  if (loading) return <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center"><Loader2 className="mx-auto h-6 w-6 text-gray-500 animate-spin" /></div>;

  const hasMatches = matches.length > 0;

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Matched Growth Options ({matches.length})</h2>
          <Link href={"/admin/matches/new?growthNeedId=" + needId} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="h-3 w-3" /> Create Match
          </Link>
        </div>
        {!hasMatches ? (
          <p className="text-xs text-gray-500">No matches yet. Create a match to connect this need with a growth channel.</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m: any) => {
              const ch = channels[m.channel_id];
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                  <div>
                    <p className="text-xs text-white">{ch?.channel_name || m.channel_id?.slice(0, 8)}</p>
                    <p className="text-[10px] text-gray-500">{m.recommended_solution_type} - Score: {m.match_score}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      m.status === "draft" ? "bg-gray-500/10 text-gray-400" :
                      m.status === "won" ? "bg-green-500/10 text-green-300" :
                      "bg-blue-500/10 text-blue-300"
                    }`}>{m.status}</span>
                    <Link href={"/admin/matches/" + m.id} className="text-[10px] text-blue-400"><ExternalLink className="h-3 w-3" /></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Curated Options Preview */}
      {hasMatches && (
        <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-400" /> Curated Options Preview (Admin Only)</h2>
          <div className="space-y-4">
            {matches.map((m: any, idx: number) => {
              const ch = channels[m.channel_id];
              return (
                <div key={m.id} className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold text-amber-300">Growth Option {idx + 1}</p>
                  <p className="text-xs text-gray-500 mt-1">Solution Type: <span className="text-white">{m.recommended_solution_type}</span></p>
                  <p className="text-xs text-gray-500">Best For: <span className="text-gray-300">{m.match_reason?.slice(0, 120)}</span></p>
                  {ch && (
                    <>
                      <p className="text-xs text-gray-500">Estimated Budget: <span className="text-gray-300">{ch.currency || "USD"} {ch.min_budget || "?"} - {ch.max_budget || "?"}</span></p>
                      <p className="text-xs text-gray-500">Expected Outcome: <span className="text-gray-300">{ch.growth_outcomes?.slice(0, 100)}</span></p>
                    </>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Why GroIntel matched this: <span className="text-gray-400">{m.match_reason?.slice(0, 200)}</span></p>
                  <p className="text-[10px] text-gray-600 mt-1">Channel: {ch?.channel_name || m.channel_id?.slice(0, 8)} (admin only)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrowthNeedDetailPage() {'''}

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated growth-needs detail page')
