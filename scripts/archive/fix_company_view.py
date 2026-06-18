import os

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'

# 1. growth-needs detail with Share section
path = root + r'\src\app\admin\growth-needs\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '      <MatchesSection needId={id} />',
    '      <MatchesSection needId={id} />\n      <ShareSection needId={id} />'
)

share_code = """
function ShareSection({ needId }) {
  const [sharedCount, setSharedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const url = "https://grointel.vercel.app/growth-options/view?needId=" + needId;

  useEffect(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then((d) => {
      if (d.success) {
        const shared = (d.quotes || []).filter((q) => q.company_growth_need_id === needId && ["shared_with_company", "accepted"].includes(q.status));
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

function MatchesSection({ needId }) {"""

c = c.replace('function MatchesSection({ needId }: { needId: string }) {', share_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('1. growth-needs detail')

# 2. quotes detail - Share With Company button
path = root + r'\src\app\admin\quotes\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'Update Status:</p>',
    """Update Status:</p>
            {quote.status !== "shared_with_company" && quote.status !== "accepted" && (
              <button onClick={async () => { setSaving("share"); await fetch("/api/admin/quotes/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "shared_with_company" }) }); await load(); setSaving(""); }} disabled={saving === "share"}
                className="mt-2 inline-flex items-center gap-1 text-xs bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-1.5 rounded-lg text-white disabled:opacity-50">
                {saving === "share" ? "Sharing..." : "Share With Company"}
              </button>
            )}
            {quote.status === "shared_with_company" || quote.status === "accepted" ? (
              <p className="mt-2 text-xs text-emerald-400">This quote is visible in the company curated options view.</p>
            ) : null}"""
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('2. quotes detail')

# 3. quotes list - Company View link
path = root + r'\src\app\admin\quotes\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '<Link href={"/admin/quotes/" + q.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link>',
    """<div className="flex items-center gap-2">
                      <Link href={"/admin/quotes/" + q.id} className="text-xs text-blue-400 hover:text-blue-300">View <ExternalLink className="h-3 w-3 inline" /></Link>
                      {(q.status === "shared_with_company" || q.status === "accepted") && q.company_growth_need_id && (
                        <Link href={"/growth-options/view?needId=" + q.company_growth_need_id} className="text-[10px] text-emerald-400 hover:text-emerald-300">Company View</Link>
                      )}
                    </div>"""
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('3. quotes list')

print('\nAll done')
