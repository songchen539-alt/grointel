import os

# Enhance /admin/matches/[id] with Quotes section
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add quotes section before the final closing
c = c.replace(
    '</div>\n    </div>\n  );\n}',
    '</div>\n    </div>\n\n      <MatchQuotesSection matchId={id} />\n\n    </div>\n  );\n}'
)

# Add icon import
c = c.replace(
    'import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";',
    'import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Plus } from "lucide-react";'
)

# Add the MatchQuotesSection component before the main component
old_main = 'export default function MatchDetailPage() {'

new_component = """function MatchQuotesSection({ matchId }: { matchId: string }) {
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
        <h2 className="text-sm font-bold text-white">Quotes for This Match (" + quotes.length + ")</h2>
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

export default function MatchDetailPage() {
"""

c = c.replace(old_main, new_component)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated match detail with quotes')
