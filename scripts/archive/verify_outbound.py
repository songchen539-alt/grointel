import urllib.request, json, time, sys

base = "https://grointel.vercel.app"

# 1. Create prospect
print("=== 1. Create prospect ===")
data = json.dumps({
    "companyName": "OutboundTest",
    "website": "outboundtest.io",
    "category": "AI",
    "targetPersonName": "Jane Smith",
}).encode()
req = urllib.request.Request(base + "/api/admin/prospects", data=data,
    headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
prospect_id = body["prospect"]["id"]
print(f"prospect_id: {prospect_id} status: {body['prospect']['status']}")

# 2. Generate MRI
print("\n=== 2. Generate MRI ===")
req = urllib.request.Request(base + "/api/admin/prospects/" + prospect_id + "/generate-report", data=b"", method="POST")
resp = urllib.request.urlopen(req, timeout=15)
body = json.loads(resp.read().decode())
report_id = body["reportId"]
print(f"report_id: {report_id}")

# 3. Verify
print("\n=== 3. Verify prospect updated ===")
req = urllib.request.Request(base + "/api/admin/prospects/" + prospect_id)
resp = urllib.request.urlopen(req, timeout=10)
p = json.loads(resp.read().decode())["prospect"]
print(f"report_id: {p['report_id']} status: {p['status']}")
ok = p["report_id"] == report_id and p["status"] == "report_generated"
print("PASS" if ok else "FAIL")
if not ok: sys.exit(1)

# 4. Generate message
print("\n=== 4. Generate message ===")
req = urllib.request.Request(base + "/api/admin/prospects/" + prospect_id + "/generate-message", data=b"", method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
print(f"has message: {bool(body.get('fullMessage'))}")

# 5. Verify outbound_message
print("\n=== 5. Verify outbound_message ===")
req = urllib.request.Request(base + "/api/admin/prospects/" + prospect_id)
resp = urllib.request.urlopen(req, timeout=10)
p = json.loads(resp.read().decode())["prospect"]
ok = bool(p.get("outbound_message"))
print(f"has outbound_message: {ok}")
print("PASS" if ok else "FAIL")
if not ok: sys.exit(1)

# 6. Visit report with prospectId
print("\n=== 6. Visit report with prospectId ===")
url = base + "/report/view?id=" + report_id + "&prospectId=" + prospect_id
req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode()
print(f"Status: {resp.status} Has MRI: {'Company MRI' in html}")

# Wait for async events
print("Waiting 5s for async events...")
time.sleep(5)

# 7. Check status opened
print("\n=== 7. Check status=opened ===")
req = urllib.request.Request(base + "/api/admin/prospects/" + prospect_id)
resp = urllib.request.urlopen(req, timeout=10)
p = json.loads(resp.read().decode())["prospect"]
print(f"status: {p['status']}")
ok = p["status"] == "opened"
print("PASS" if ok else f"FAIL (got {p['status']})")

print("\nALL DONE")
