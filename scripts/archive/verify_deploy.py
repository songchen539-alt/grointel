import urllib.request, ssl, json

base = "https://grointel.vercel.app"

# 1. API: generate report for stripe.com
print("=== 1. POST /api/reports/generate ===")
data = json.dumps({"website": "https://stripe.com"}).encode()
req = urllib.request.Request(base + "/api/reports/generate", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=15)
    body = json.loads(resp.read().decode())
    print("Status:", resp.status)
    for k in ["success", "reportId", "redirectUrl"]:
        print(f"  {k}: {body.get(k)}")
    ok = body.get("success") == True and body.get("reportId") == "stripe-com"
    print("Result:", "PASS" if ok else "FAIL")
except Exception as e:
    print("Error:", e)

# 2. Report view page
print("\n=== 2. /report/view?id=stripe-com ===")
req = urllib.request.Request(base + "/report/view?id=stripe-com",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    for t in ["Company MRI", "Stripe", "Overall Company Score", "Growth Opportunities", "Key Risks"]:
        found = t in html
        print(f"  '{t}': {'PASS' if found else 'FAIL'}")
except Exception as e:
    print("Error:", e)

# 3. /report/view?id=grointel-demo (local fallback)
print("\n=== 3. /report/view?id=grointel-demo (local fallback) ===")
req = urllib.request.Request(base + "/report/view?id=grointel-demo",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    for t in ["Company MRI", "GroIntel", "Overall Company Score"]:
        found = t in html
        print(f"  '{t}': {'PASS' if found else 'FAIL'}")
except Exception as e:
    print("Error:", e)

# 4. Analyze page
print("\n=== 4. /analyze ===")
req = urllib.request.Request(base + "/analyze",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    for t in ["Analyze Any Company", "stripe.com", "Analyze Company"]:
        found = t in html
        print(f"  '{t}': {'PASS' if found else 'FAIL'}")
except Exception as e:
    print("Error:", e)

# 5. Admin leads still protected
print("\n=== 5. /admin/leads (still protected) ===")
req = urllib.request.Request(base + "/admin/leads",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    print("  Password gate:", "Admin Access" in html)
    print("  No dashboard leak:", "Leads Dashboard" not in html)
except Exception as e:
    print("Error:", e)

# 6. Homepage
print("\n=== 6. Homepage ===")
req = urllib.request.Request(base + "/",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    for t in ["Find Your Next Growth Opportunity", "Analyze Company"]:
        found = t in html
        print(f"  '{t}': {'PASS' if found else 'FAIL'}")
except Exception as e:
    print("Error:", e)

print("\n=== DONE ===")
