import urllib.request, ssl

base = "https://grointel.vercel.app"

req = urllib.request.Request(base + "/admin/leads",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    print("Size:", len(html))
    for term in ["Not Configured", "Admin access not configured", "Admin Access", "Enter the admin password", "Sign In", "Leads Dashboard", "verify@grointel.ai"]:
        found = term in html
        icon = "PASS" if found else "  "
        if "Not Configured" in term or "Admin access" in term:
            icon = "PASS (expected)" if found else "FAIL (expected)"
        if "Leads Dashboard" in term or "verify" in term:
            icon = "PASS (secure)" if not found else "FAIL (LEAKED)"
        print(f"  '{term}': {icon}")
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode()[:300])
