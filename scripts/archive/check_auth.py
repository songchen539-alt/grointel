import urllib.request, ssl

base = "https://grointel.vercel.app"

# Test: Admin leads page without auth
print("=== Test: Without auth cookie ===")
req = urllib.request.Request(base + "/admin/leads",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    print("Size:", len(html))
    for term in ["Admin Access", "Enter the admin password", "Sign In", "AdminLoginForm"]:
        found = term in html
        print(f"  '{term}': {'PASS' if found else 'FAIL'}")
    # Should NOT contain leads data
    for term in ["Leads Dashboard", "Total Leads", "verify@grointel.ai"]:
        found = term in html
        print(f"  '{term}' (should be absent): {'FAIL - LEAKED' if found else 'PASS - not found'}")
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode()[:300])
