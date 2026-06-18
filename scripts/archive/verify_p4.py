import urllib.request, ssl

base = "https://grointel.vercel.app"

def test(label, url, expected, absent=None):
    r = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    resp = urllib.request.urlopen(r, timeout=15)
    html = resp.read().decode()
    ok = True
    for t in expected:
        if t not in html:
            print(f"  FAIL: '{t}' not found in {label}")
            ok = False
    if absent:
        for t in absent:
            if t in html:
                print(f"  FAIL: '{t}' found (should be absent) in {label}")
                ok = False
    if ok:
        print(f"  {label}: PASS")

print("=== Homepage ===")
test("Hero headline", base + "/", [
    "AI Growth Intelligence for Companies Moving Fast",
    "Analyze Your Company",
    "View Sample Reports",
    "Growth teams move fast. Signals are scattered.",
    "GroIntel turns company signals into an AI Company MRI",
    "From website to Company MRI in seconds",
    "Built for growth decisions",
    "Explore sample Company MRI reports",
    "Stripe",
    "OpenAI",
    "Understand your company",
])

print("\n=== /samples ===")
test("Samples page", base + "/samples", [
    "Sample Company MRI Reports",
    "Stripe",
    "OpenAI",
    "Anthropic",
    "Perplexity",
    "Cursor",
    "Clay",
    "Ramp",
    "Rippling",
    "Notion",
    "Vercel",
    "View MRI Report",
    "Generate / Refresh",
])

print("\n=== /analyze ===")
test("Analyze page", base + "/analyze", [
    "Generate an AI Company MRI",
    "Enter a company website and GroIntel will analyze",
    "https://example.com",
    "you@company.com",
    "Generate Company MRI",
])

print("\n=== /contact ===")
test("Contact page", base + "/contact", [
    "Book a Growth MRI Review",
    "growth readiness, market expansion",
])

print("\n=== Legacy pages ===")
test("Report view", base + "/report/view?id=stripe-com", [
    "Company MRI",
    "Stripe",
    "Overall Company Score",
])
test("Admin leads (protected)", base + "/admin/leads", [
    "Admin Access",
    "Enter the admin password",
])

print("\nALL PASS")
