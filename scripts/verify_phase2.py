import urllib.request, ssl, json

base = "https://grointel.vercel.app"

def report(label, result):
    print(f"  {label}: {'PASS' if result else 'FAIL'}")

# 1. Generate report via API
print("=== 1. POST /api/reports/generate ===")
d = json.dumps({"website":"stripe.com","lead":{"email":"test@grointel.ai","companyName":"TestCorp","role":"CEO"}}).encode()
r = urllib.request.Request(base + "/api/reports/generate", data=d, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(r, timeout=15)
body = json.loads(resp.read().decode())
report("success", body.get("success"))
report("reportId = stripe-com", body.get("reportId") == "stripe-com")
report("redirectUrl present", "redirectUrl" in body)
report("no warning", "warning" not in body)

# 2. Report page renders
print("\n=== 2. /report/view?id=stripe-com ===")
r = urllib.request.Request(base + "/report/view?id=stripe-com", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
report("Status 200", resp.status == 200)
for t in ["Company MRI", "Stripe", "Overall Company Score", "Book a Growth MRI Review", "Analyze Another Company"]:
    report(f"Contains '{t}'", t in html)

# 3. Report with lead fields (lead should not affect generation)
print("\n=== 3. Report with lead ===")
d = json.dumps({"website":"grointel.ai","lead":{"email":"founder@grointel.ai","role":"Founder"}}).encode()
r = urllib.request.Request(base + "/api/reports/generate", data=d, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(r, timeout=15)
body = json.loads(resp.read().decode())
report("success", body.get("success"))
report("reportId = grointel-ai", body.get("reportId") == "grointel-ai")

# 4. Wrong password still fails
print("\n=== 4. Admin auth still works ===")
d = json.dumps({"password":"wrong"}).encode()
r = urllib.request.Request(base + "/api/admin/login", data=d, headers={"Content-Type":"application/json"}, method="POST")
try:
    urllib.request.urlopen(r, timeout=10)
    report("wrong password rejected", False)
except urllib.error.HTTPError as e:
    report("wrong password rejected (401)", e.code == 401)

# 5. Analyze page loads with lead fields
print("\n=== 5. /analyze ===")
r = urllib.request.Request(base + "/analyze", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
report("Analyze page loads", resp.status == 200)
for t in ["Analyze Any Company", "Work email (optional)", "Company (optional)", "Your role (optional)"]:
    report(f"Contains '{t}'", t in html)

# 6. Contact page with params
print("\n=== 6. /contact?source=report_view&reportId=stripe-com ===")
r = urllib.request.Request(base + "/contact?source=report_view&reportId=stripe-com", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
report("Contact page loads", resp.status == 200)
for t in ["Book a Growth MRI Review", "stripe-com", "Book Review"]:
    report(f"Contains '{t}'", t in html)

print("\n=== ALL DONE ===")
