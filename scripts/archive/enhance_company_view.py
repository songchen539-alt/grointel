import os

# 1. Enhance /admin/growth-needs/[id] with Share Curated Options
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\growth-needs\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add Share Curated Options section after the MatchesSection
c = c.replace(
    '      <MatchesSection needId={id} />',
    '      <MatchesSection needId={id} />\n      <ShareSection needId={id} />'
)

# Add the ShareSection component
# Find the 'function MatchesSection' and add ShareSection before it
c = c.replace(
    'function MatchesSection({ needId }: { needId: string }) {',
    '''function ShareSection({ needId }: { needId: string }) {
  const [sharedCount, setSharedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const url = "https://grointel.vercel.app/growth-options/view?needId=" + needId;

  useEffect(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then((d) => {
      if (d.success) {
        const shared = (d.quotes || []).filter((q: any) => q.company_growth_need_id === needId && ["shared_with_company", "accepted"].includes(q.status));
        setSharedCount(shared.length);
      }
    });
  }, [needId]);

  async function copyUrl() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-5">
      <h2 className="text-sm font-bold text-white mb-3">Share Curated Options</h2>
      {sharedCount > 0 ? (
        <>
          <p className="text-xs text-gray-400 mb-2">Shared Quotes: <span className="text-amber-300 font-medium">{sharedCount}</span></p>
          <div className="flex items-center gap-2">
            <input type="text" value={url} readOnly className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-400" />
            <button onClick={copyUrl} className="text-xs text-blue-400 hover:text-blue-300 px-3 py-2">{copied ? "Copied!" : "Copy URL"}</button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-500">No quotes are currently shared with the company.</p>
          <p className="text-xs text-gray-600 mt-1">Set a quote status to <span className="text-amber-300">shared_with_company</span> first.</p>
        </>
      )}
    </div>
  );
}

function MatchesSection({ needId }: { needId: string }) {'''}
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated growth-needs detail with Share section')

# 2. Enhance /admin/quotes/[id] with Share With Company button
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\quotes\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add Share With Company button in the status section
c = c.replace(
    '              {saving === "status" && <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />}',
    '              {saving === "status" && <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />}\n          </div>\n          <div className="mt-3">\n            {quote.status === "shared_with_company" || quote.status === "accepted" ? (\n              <p className="text-xs text-emerald-400">This quote is visible in the company curated options view.</p>\n            ) : (\n              <button onClick={async () => { setSaving("share"); await fetch("/api/admin/quotes/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "shared_with_company" }) }); await load(); setSaving(""); }} disabled={saving === "share"}\n                className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-1.5 rounded-lg text-white hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-50">\n                {saving === "share" ? "Sharing..." : "Share With Company"}\n              </button>\n            )}'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated quotes detail with Share button')

# 3. Enhance /admin/quotes list with Company View link
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\quotes\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add Company View link after the View link
c = c.replace(
    '<Link href={"/admin/quotes/" + q.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link>',
    '<div className="flex items-center gap-2">\n                    <Link href={"/admin/quotes/" + q.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link>\n                    {(q.status === "shared_with_company" || q.status === "accepted") && q.company_growth_need_id && (\n                      <Link href={"/growth-options/view?needId=" + q.company_growth_need_id} className="text-[10px] text-emerald-400 hover:text-emerald-300">Company View</Link>\n                    )}\n                  </div>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated quotes list with Company View link')

# 4. Enhance /admin/dashboard with Company View KPI
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\dashboard\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add company view KPI query
c = c.replace(
    'safeCount("growth_quotes"),',
    'safeCount("growth_quotes"),\n    safeQuery<ReportEvent>("report_events", "event_type", { filter: "&event_type=eq.growth_intro_requested", limit: 10000 }),'
)

# Add shared quotes + intro request counts
c = c.replace(
    '  const totalQuotes = quotesCount ?? 0;',
    '  const totalQuotes = quotesCount ?? 0;\n  const sharedQuotes = 0;\n  const introRequests = eventsIntro?.length || 0;\n  const companyInterestedMatches = prospects?.filter((p: any) => p.status === "company_interested").length || 0;'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

# Need to fix the destructuring for the new variable
# Replace the whole section
c2 = open(path, encoding='utf-8').read()
c2 = c2.replace(
    'matchesCount, quotesCount]',
    'matchesCount, quotesCount, eventsIntro]'
)
c2 = c2.replace(
    'const totalQuotes = quotesCount ?? 0;\n  const sharedQuotes = 0;\n  const introRequests = eventsIntro?.length || 0;\n  const companyInterestedMatches = prospects?.filter((p: any) => p.status === "company_interested").length || 0;',
    'const totalQuotes = quotesCount ?? 0;\n  const introRequestsCount = eventsIntro?.length || 0;\n  const companyInterestedMatches = (prospects || []).filter((p: any) => p.status === "company_interested").length || 0;'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Updated dashboard KPIs')

print('\nAll enhancements done')
