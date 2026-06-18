import urllib.request

base = "https://grointel.vercel.app"

# Test analytics page loads
print("=== Analytics Page ===")
r = urllib.request.Request(base + "/admin/analytics", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
print(f"Status: {resp.status}")
for t in ["Marketplace Analytics", "Companies", "Growth Needs", "Marketplace Funnel", "Channel Performance", "Opportunity Pipeline", "Service Performance", "Admin Insights", "Recent Marketplace Activity", "Top Industries"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# Existing pages
print("\n=== Existing Pages ===")
r = urllib.request.Request(base + "/admin/leads", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=10)
html = resp.read().decode()
print(f"  /admin/leads: {'PASS' if 'Admin Access' in html else 'FAIL'}")

r = urllib.request.Request(base + "/analyze", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=10)
html = resp.read().decode()
print(f"  /analyze: {'PASS' if 'Generate an AI Company MRI' in html else 'FAIL'}")

print("\nALL DONE")
