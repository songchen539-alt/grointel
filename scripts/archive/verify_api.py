import urllib.request, ssl, json

supabaseUrl = "https://uaqshxwhchseasdogkys.supabase.co"

# We can't access Supabase directly from here with service role.
# Instead, let's verify the API returned success and the report page renders properly.
# The user can verify Supabase manually.

# Let's also test generating for another domain
base = "https://grointel.vercel.app"

print("=== Additional API tests ===")

# Test 2: Unknown domain
data = json.dumps({"website": "some-unknown-startup.io"}).encode()
req = urllib.request.Request(base + "/api/reports/generate", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=15)
body = json.loads(resp.read().decode())
print("unknown domain:")
print("  success:", body.get("success"))
print("  reportId:", body.get("reportId"))
print("  has redirectUrl:", "redirectUrl" in body)
ok = body.get("success") == True and body.get("reportId") == "some-unknown-startup-io"
print("  PASS" if ok else "  FAIL")

# Test 3: GroIntel
data = json.dumps({"website": "grointel.ai"}).encode()
req = urllib.request.Request(base + "/api/reports/generate", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=15)
body = json.loads(resp.read().decode())
print("\ngrointel.ai:")
print("  success:", body.get("success"))
print("  reportId:", body.get("reportId"))
ok = body.get("success") == True and body.get("reportId") == "grointel-ai"
print("  PASS" if ok else "  FAIL")

# Test 4: Empty/missing website
data = json.dumps({"website": ""}).encode()
req = urllib.request.Request(base + "/api/reports/generate", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=15)
    print("\nempty website (should fail): FAIL - got 200")
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    print("\nempty website:")
    print("  status:", e.code)
    print("  error:", body.get("error"))
    print("  PASS" if e.code == 400 and body.get("error") else "  FAIL")

print("\n=== ALL DONE ===")
