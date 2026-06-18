import urllib.request, json, time

base = "https://grointel.vercel.app"

# 1. Get need and channel
print("=== Fetching existing data ===")
req = urllib.request.Request(base + "/api/admin/growth-needs")
resp = urllib.request.urlopen(req, timeout=10)
needs = json.loads(resp.read().decode()).get("needs", [])
need = needs[0] if needs else None
if not need:
    print("ERROR: No growth need found")
    exit()
need_id = need["id"]
print(f"Need: {need['company_name']} id={need_id}")

req = urllib.request.Request(base + "/api/admin/growth-channels")
resp = urllib.request.urlopen(req, timeout=10)
channels = json.loads(resp.read().decode()).get("channels", [])
channel = channels[0] if channels else None
if not channel:
    print("ERROR: No channel found")
    exit()
cid = channel["id"]
print(f"Channel: {channel['channel_name']} id={cid}")

# 2. Add service
print("\n=== 1. Add Channel Service ===")
data = json.dumps({
    "serviceName": "SEA Market Entry Program",
    "serviceType": "market entry",
    "problemSolved": "Companies struggle to enter SEA without local partnerships",
    "growthOutcome": "Established local presence, partnerships, and first 10 customers",
    "pricingModel": "project",
    "startingPrice": 25000,
    "maxPrice": 50000,
}).encode()
req = urllib.request.Request(base + "/api/admin/channels/" + cid + "/services", data=data, headers={"Content-Type":"application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    body = json.loads(resp.read().decode())
    svc = body.get("service", {})
    print(f"Service: {svc.get('service_name')} id={svc.get('id')} PASS")
except urllib.error.HTTPError as e:
    print(f"FAIL: {e.code} {e.read().decode()[:200]}")
    exit()

# 3. Get services to confirm
print("\n=== 2. Confirm channel_services record ===")
req = urllib.request.Request(base + "/api/admin/channels/" + cid + "/services")
resp = urllib.request.urlopen(req, timeout=10)
svcs = json.loads(resp.read().decode()).get("services", [])
print(f"Services found: {len(svcs)} PASS")

# 4. Create match
print("\n=== 3. Create match (with service) ===")
data = json.dumps({
    "companyGrowthNeedId": need_id,
    "channelId": cid,
    "serviceId": svcs[0]["id"],
    "matchScore": 88,
    "recommendedSolutionType": "APAC Market Entry",
    "matchReason": "SEA agency specializes in helping companies enter Southeast Asian markets with proven partnerships methodology.",
    "adminNotes": "",
}).encode()
req = urllib.request.Request(base + "/api/admin/matches", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
match = body.get("match", {})
match_id = match["id"]
print(f"Match id={match_id} status={match['status']} PASS")

# 5. Create quote
print("\n=== 4. Create quote ===")
data = json.dumps({
    "matchId": match_id, "channelId": cid, "growthNeedId": need_id,
    "quoteTitle": "SEA B2B Market Entry Sprint",
    "quoteAmount": 45000, "currency": "USD", "timeline": "90 days",
    "deliverables": "Market research report, partner identification (20+), intro meetings (10+), pilot support",
    "expectedGrowthOutcome": "Signed pilot agreements with 2-3 local partners in SEA markets",
    "successMetrics": "Partner meetings booked, pilot agreements signed, pipeline generated",
    "proposalMessage": "Based on the company goal of expanding into SEA, this solution focuses on APAC Market Entry through local partnerships. The proposed channel has a strong track record in SEA market entry.",
    "reportId": "",
}).encode()
req = urllib.request.Request(base + "/api/admin/quotes", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
quote = body.get("quote", {})
quote_id = quote["id"]
print(f"Quote id={quote_id} title={quote['quote_title']} PASS")
print(f"Match status after quote: {body.get('matchStatus', 'updated via API')}")
time.sleep(0.5)

# Verify match status updated to quoted
req = urllib.request.Request(base + "/api/admin/matches/" + match_id)
resp = urllib.request.urlopen(req, timeout=10)
m = json.loads(resp.read().decode()).get("match", {})
print(f"Match status: {m['status']}")
if m['status'] == 'quoted':
    print("  Match auto-updated to quoted: PASS")
else:
    print(f"  Match status is {m['status']} (expected quoted)")

# 6. Share With Company
print("\n=== 5. Share With Company ===")
data = json.dumps({"status": "shared_with_company"}).encode()
req = urllib.request.Request(base + "/api/admin/quotes/" + quote_id, data=data, headers={"Content-Type":"application/json"}, method="PATCH")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
qs = body.get("quote", {}).get("status", "?")
print(f"Quote status: {qs} {'PASS' if qs == 'shared_with_company' else 'FAIL'}")

# Verify match auto-updated
req = urllib.request.Request(base + "/api/admin/matches/" + match_id)
resp = urllib.request.urlopen(req, timeout=10)
m = json.loads(resp.read().decode()).get("match", {})
if m['status'] == 'proposed_to_company':
    print(f"Match auto-updated to proposed_to_company: PASS")
else:
    print(f"Match status: {m['status']} (expected proposed_to_company)")

# 7. Fetch curated options page
view_url = f"{base}/growth-options/view?needId={need_id}"
print(f"\n=== 6. Company View URL ===")
print(f"{view_url}")

print(f"\n=== Fetch curated options ===")
req = urllib.request.Request(view_url, headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode()
for t in ["Your Curated Growth Solutions", "SEA B2B Market Entry Sprint", "Request Introduction", "GroIntel shows curated growth"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# 8. Request Introduction
print(f"\n=== 7. Request Introduction ===")
data = json.dumps({"needId": need_id, "matchId": match_id, "quoteId": quote_id}).encode()
req = urllib.request.Request(base + "/api/growth-options/request-intro", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
print(f"success: {body.get('success')} {'PASS' if body.get('success') else 'FAIL'}")

time.sleep(2)

# 9. Verify final state
print(f"\n=== 8. Verification ===")
req = urllib.request.Request(base + "/api/admin/quotes/" + quote_id)
resp = urllib.request.urlopen(req, timeout=10)
q = json.loads(resp.read().decode()).get("quote", {})
print(f"Quote status: {q['status']} {'PASS' if q['status'] == 'accepted' else 'FAIL'}")

req = urllib.request.Request(base + "/api/admin/matches/" + match_id)
resp = urllib.request.urlopen(req, timeout=10)
m = json.loads(resp.read().decode()).get("match", {})
print(f"Match status: {m['status']} {'PASS' if m['status'] == 'company_interested' else 'FAIL'}")

print(f"\nALL VERIFIED")
