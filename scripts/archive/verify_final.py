import urllib.request, ssl, json

base = "https://grointel.vercel.app"

# 1. Password gate - should now show Admin Access form (env var is set)
print("=== 1. Password gate (no cookie) ===")
req = urllib.request.Request(base + "/admin/leads", headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode()

checks = {
    "Shows Admin Access": "Admin Access" in html,
    "Shows password prompt": "Enter the admin password" in html,
    "Shows Sign In": "Sign In" in html,
    "No dashboard leak": "Leads Dashboard" not in html,
    "No data leak": "test-verify2@grointel.ai" not in html,
}
for k, v in checks.items(): print(f"  {k}: {'PASS' if v else 'FAIL'}")

# 2. Wrong password
print("\n=== 2. Wrong password ===")
data = json.dumps({"password": "wrong"}).encode()
req = urllib.request.Request(base + "/api/admin/login", data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    urllib.request.urlopen(req, timeout=10)
    print("  FAIL - should return 401")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    ok = e.code == 401 and "Incorrect password" in body
    print(f"  Status {e.code} - {'PASS' if ok else 'FAIL'}")

# 3. Logout
print("\n=== 3. Logout ===")
data = json.dumps({}).encode()
req = urllib.request.Request(base + "/api/admin/logout", data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    ok = resp.status == 200
    print(f"  Status {resp.status} - {'PASS' if ok else 'FAIL'}")
except Exception as e:
    print(f"  FAIL - {e}")
