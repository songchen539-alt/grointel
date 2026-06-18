import urllib.request, ssl, json

base = "https://grointel.vercel.app"

# Verify the analyze page still works with old deploy
print("=== Test: /analyze ===")
req = urllib.request.Request(base + "/analyze", headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode()
for t in ["Analyze Any Company", "stripe.com", "Analyze Company"]:
    print(f"  '{t}': {'PASS' if t in html else 'FAIL'}")

# Verify admin leads still works (old deploy)
print("\n=== Test: /admin/leads ===")
req = urllib.request.Request(base + "/admin/leads", headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode()
for t in ["Admin Access", "Enter the admin password"]:
    print(f"  '{t}': {'PASS' if t in html else 'FAIL'}")

print("\n=== Built module structure ===")
modules = [
    "src/lib/intelligence/types.ts",
    "src/lib/intelligence/normalizeDomain.ts",
    "src/lib/intelligence/companyProfiles.ts",
    "src/lib/intelligence/scoringEngine.ts",
    "src/lib/intelligence/recommendationEngine.ts",
    "src/lib/intelligence/reportGenerator.ts",
    "src/lib/reportStore.ts",
    "src/app/analyze/page.tsx",
    "src/app/report/view/page.tsx",
]

import os
for m in modules:
    path = os.path.join(r"C:\Users\LENOVO\.openclaw\workspace\grointel", m)
    exists = os.path.exists(path)
    print(f"  {m}: {'EXISTS' if exists else 'MISSING'}")
