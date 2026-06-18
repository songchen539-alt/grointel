import os

# Enhance /admin/matches/[id] with Quotes section
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add quotes section before the final closing
c = c.replace(
    '        </div>\n      </div>\n    </div>\n  );\n}',
    '        </div>\n      </div>\n\n      <MatchQuotesSection matchId={id} />\n\n    </div>\n  );\n}'
)

# Add icon import
c = c.replace(
    'import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";',
    'import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Plus } from "lucide-react";'
)

# Add the MatchQuotesSection component before the main component
c = c.replace(
    'export default function MatchDetailPage() {',
    '''function MatchQuotesSection({ matchId }: { matchId: string }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [qloading, setQloading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then((d) => {
      if (d.success) setQuotes((d.quotes || []).filter((q: any) => q.match_id === matchId));
      setQloading(false);
    });
  }, [matchId]);

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Quotes for This Match ({quotes.length})</h2>
        <Link href={"/admin/quotes/new?matchId=" + matchId} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus className="h-3 w-3" /> Create Quote</Link>
      </div>
      {qloading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : quotes.length === 0 ? (<p className="text-xs text-gray-500">No quotes yet.</p>
      ) : (
        <div className="space-y-2">
          {quotes.map((q: any) => (
            <div key={q.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-xs text-white">{q.quote_title}</p>
                <p className="text-[10px] text-gray-500">{q.currency || "USD"} {q.quote_amount ?? "-"} | {q.timeline || "No timeline"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{q.status}</span>
                <Link href={"/admin/quotes/" + q.id} className="text-[10px] text-blue-400"><ExternalLink className="h-3 w-3" /></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchDetailPage() {'''}
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated match detail with quotes')

# Enhance /admin/growth-needs/[id] curated preview with quote info
gpath = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\growth-needs\[id]\page.tsx'
with open(gpath, encoding='utf-8') as f:
    gc = f.read()

# Add quotes data fetching to MatchesSection
old_fetch = '''  useEffect(() => {
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
  }, [needId]);'''

new_fetch = '''  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/matches").then((r) => r.json()),
      fetch("/api/admin/growth-channels").then((r) => r.json()),
      fetch("/api/admin/quotes").then((r) => r.json()),
    ]).then(([mr, cr, qr]) => {
      if (mr.success) {
        const needMatches = (mr.matches || []).filter((m: any) => m.company_growth_need_id === needId);
        setMatches(needMatches);
      }
      if (cr.success) {
        const chMap: Record<string, any> = {};
        (cr.channels || []).forEach((ch: any) => { chMap[ch.id] = ch; });
        setChannels(chMap);
      }
      if (qr.success) setQuotes(qr.quotes || []);
      setLoading(false);
    });
  }, [needId]);'''

gc = gc.replace(old_fetch, new_fetch)

# Add quote info to curated preview
old_preview = '''                <div key={m.id} className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
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
                </div>'''

new_preview = '''                <div key={m.id} className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
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
                  {quotes.filter((q: any) => q.match_id === m.id).map((q: any) => (
                    <div key={q.id} className="mt-2 border-t border-white/5 pt-2">
                      <p className="text-[10px] text-amber-400">Quote: {q.quote_title}</p>
                      <p className="text-[10px] text-gray-500">Amount: {q.currency || "USD"} {q.quote_amount ?? "-"} | Status: {q.status}</p>
                      {q.deliverables && <p className="text-[10px] text-gray-500">Deliverables: {q.deliverables.slice(0, 80)}</p>}
                      {q.proposal_message && <p className="text-[10px] text-gray-500 mt-1">Proposal: {q.proposal_message.slice(0, 120)}</p>}
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-600 mt-1">Channel: {ch?.channel_name || m.channel_id?.slice(0, 8)} (admin only)</p>
                </div>'''

gc = gc.replace(old_preview, new_preview)

with open(gpath, 'w', encoding='utf-8') as f:
    f.write(gc)
print('Updated growth-needs detail with quotes')

# Enhance /admin/channels/[id] with quotes
cpath = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\channels\[id]\page.tsx'
with open(cpath, encoding='utf-8') as f:
    cc = f.read()

# Add quotes section after ChannelMatchesSection
cc = cc.replace(
    '      <ChannelMatchesSection channelId={id} />',
    '      <ChannelMatchesSection channelId={id} />\n      <ChannelQuotesSection channelId={id} />'
)

# Add the ChannelQuotesSection component
cc = cc.replace(
    'function ChannelMatchesSection({ channelId }: { channelId: string })',
    '''function ChannelQuotesSection({ channelId }: { channelId: string }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [needs, setNeeds] = useState<Record<string, any>>({});
  const [qloading, setQloading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/quotes").then((r) => r.json()),
      fetch("/api/admin/growth-needs").then((r) => r.json()),
    ]).then(([qr, nr]) => {
      if (qr.success) setQuotes((qr.quotes || []).filter((q: any) => q.channel_id === channelId));
      if (nr.success) {
        const ndMap: Record<string, any> = {};
        (nr.needs || []).forEach((n: any) => { ndMap[n.id] = n; });
        setNeeds(ndMap);
      }
      setQloading(false);
    });
  }, [channelId]);

  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <h2 className="text-sm font-bold text-white mb-4">Quotes from This Channel ({quotes.length})</h2>
      {qloading ? (<p className="text-xs text-gray-500">Loading...</p>
      ) : quotes.length === 0 ? (<p className="text-xs text-gray-500">No quotes yet.</p>
      ) : (
        <div className="space-y-2">
          {quotes.map((q: any) => {
            const nd = needs[q.company_growth_need_id];
            return (
              <div key={q.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <div>
                  <p className="text-xs text-white">{nd?.company_name || q.company_growth_need_id?.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-500">{q.quote_title} - {q.currency} {q.quote_amount ?? "?"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{q.status}</span>
                  <Link href={"/admin/quotes/" + q.id} className="text-[10px] text-blue-400"><ExternalLink className="h-3 w-3" /></Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChannelMatchesSection({ channelId }: { channelId: string })'''}
)

with open(cpath, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated channel detail with quotes')

print('\nAll enhancements done')
