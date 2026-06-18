import urllib.request, ssl

base = "https://grointel.vercel.app"

# Test: Admin leads page
print("=== Admin Leads Page ===")
req = urllib.request.Request(base + "/admin/leads",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    print("Size:", len(html))
    for term in ["Leads Dashboard", "Total Leads", "Today", "verify@grointel.ai", "test-verify2@grointel.ai", "stripe-demo", "report_page", "Auth coming soon"]:
        found = term in html
        print(f"  '{term}': {'PASS' if found else 'FAIL'}")
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    body = e.read().decode()[:300]
    print("Body:", body)
