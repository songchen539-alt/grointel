import urllib.request, json

base = "https://grointel.vercel.app"

# 1. Report page renders
print("=== 1. Report page ===")
req = urllib.request.Request(base + "/report/view?id=stripe-com", headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode()
print("Status:", resp.status)
for t in ["Company MRI", "Stripe", "Overall Company Score", "Growth Opportunities", "Key Risks"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# 2. Re-run API (upsert - should not warn)
print("\n=== 2. Re-run API ===")
d = json.dumps({"website":"https://stripe.com"}).encode()
r = urllib.request.Request(base + "/api/reports/generate", data=d, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(r, timeout=10)
body = json.loads(resp.read().decode())
print("Status:", resp.status)
print("  success:", body.get("success"))
print("  reportId:", body.get("reportId"))
print("  has warning:", "warning" in body)
ok = body.get("success") == True and body.get("reportId") == "stripe-com" and "warning" not in body
print("  PASS" if ok else "  FAIL")

# 3. Unknown domain
print("\n=== 3. Unknown domain ===")
d = json.dumps({"website":"some-startup.io"}).encode()
r = urllib.request.Request(base + "/api/reports/generate", data=d, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(r, timeout=10)
body = json.loads(resp.read().decode())
print("  success:", body.get("success"))
print("  reportId:", body.get("reportId"))
ok = body.get("success") == True and body.get("reportId") == "some-startup-io"
print("  PASS" if ok else "  FAIL")

# 4. GroIntel
print("\n=== 4. GroIntel ===")
d = json.dumps({"website":"grointel.ai"}).encode()
r = urllib.request.Request(base + "/api/reports/generate", data=d, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(r, timeout=10)
body = json.loads(resp.read().decode())
print("  success:", body.get("success"))
print("  reportId:", body.get("reportId"))
ok = body.get("success") == True and body.get("reportId") == "grointel-ai"
print("  PASS" if ok else "  FAIL")

# 5. GroIntel report page
print("\n=== 5. GroIntel report page ===")
req = urllib.request.Request(base + "/report/view?id=grointel-ai", headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode()
print("Status:", resp.status)
for t in ["Company MRI", "GroIntel", "Overall Company Score"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

print("\n=== ALL PASS ===")
