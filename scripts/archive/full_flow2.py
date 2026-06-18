import urllib.request, json, time, sys

base = "https://grointel.vercel.app"

# Check channels
req = urllib.request.Request(base + "/api/admin/growth-channels")
resp = urllib.request.urlopen(req, timeout=10)
channels = json.loads(resp.read().decode()).get("channels", [])
print(f"Found {len(channels)} channels")
for c in channels:
    print(f"  {c['channel_name']} id={c['id']} status={c['status']}")

if not channels:
    # Submit channel
    data = json.dumps({"channelName":"SEA Growth Agency","website":"seagrowth.com","workEmail":"hello@seagrowth.com","category":"agency","region":"SEA","serviceTypes":"market entry, partnerships","growthOutcomes":"Help companies enter SEA"}).encode()
    req = urllib.request.Request(base + "/api/growth-channels", data=data, headers={"Content-Type":"application/json"}, method="POST")
    urllib.request.urlopen(req, timeout=10)
    req = urllib.request.Request(base + "/api/admin/growth-channels")
    resp = urllib.request.urlopen(req, timeout=10)
    channels = json.loads(resp.read().decode()).get("channels", [])
    print(f"Submitted channel, now have {len(channels)}")

cid = channels[0]["id"]
print(f"\nUsing channel: {cid}")

# Add service
print("\n=== Add service ===")
data = json.dumps({"serviceName":"SEA Market Entry Program","serviceType":"market entry","problemSolved":"Companies struggle to enter SEA without local partnerships","growthOutcome":"Established partnerships and first customers"}).encode()
req = urllib.request.Request(base + "/api/admin/channels/" + cid + "/services", data=data, headers={"Content-Type":"application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("Status:", resp.status)
    print(json.loads(resp.read().decode()))
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode()[:300])
    sys.exit(1)

# Get need
req = urllib.request.Request(base + "/api/admin/growth-needs")
resp = urllib.request.urlopen(req, timeout=10)
needs = json.loads(resp.read().decode()).get("needs", [])
need_id = needs[0]["id"]
print(f"\nNeed id: {need_id}")

# Create match
print("\n=== Create match ===")
data = json.dumps({"companyGrowthNeedId":need_id,"channelId":cid,"matchScore":85,"recommendedSolutionType":"APAC Market Entry","matchReason":"SEA agency specializes in market entry","adminNotes":""}).encode()
req = urllib.request.Request(base + "/api/admin/matches", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
match = json.loads(resp.read().decode()).get("match",{})
match_id = match["id"]
print(f"Match id={match_id} status={match['status']}")

# Create quote
print("\n=== Create quote ===")
data = json.dumps({"matchId":match_id,"channelId":cid,"growthNeedId":need_id,"quoteTitle":"SEA B2B Market Entry Sprint","quoteAmount":45000,"currency":"USD","timeline":"90 days","deliverables":"Partner identification, intro meetings, pilot support","expectedGrowthOutcome":"Signed pilot agreements","successMetrics":"Meetings booked, pilots signed","proposalMessage":"Initial proposal draft.","reportId":""}).encode()
req = urllib.request.Request(base + "/api/admin/quotes", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
quote = json.loads(resp.read().decode()).get("quote",{})
quote_id = quote["id"]
print(f"Quote id={quote_id} status={quote['status']}")

# Share With Company
print("\n=== Share With Company ===")
data = json.dumps({"status":"shared_with_company"}).encode()
req = urllib.request.Request(base + "/api/admin/quotes/" + quote_id, data=data, headers={"Content-Type":"application/json"}, method="PATCH")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
print(f"Quote status: {body.get('quote',{}).get('status','?')}")

view_url = f"https://grointel.vercel.app/growth-options/view?needId={need_id}"
print(f"\nCompany View URL: {view_url}")

# Fetch curated options page
print("\n=== Fetch /growth-options/view ===")
req = urllib.request.Request(view_url, headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode()
print(f"Status: {resp.status}")
for t in ["Your Curated Growth Solutions", "SEA B2B Market Entry Sprint", "Request Introduction", "GroIntel shows curated growth"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# Request Introduction
print("\n=== Request Introduction ===")
data = json.dumps({"needId":need_id,"matchId":match_id,"quoteId":quote_id}).encode()
req = urllib.request.Request(base + "/api/growth-options/request-intro", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
print(f"Status: {resp.status}")
print(json.loads(resp.read().decode()))

# Wait for events
time.sleep(2)

# Verify final state
print("\n=== Verification ===")
req = urllib.request.Request(base + "/api/admin/quotes/" + quote_id)
resp = urllib.request.urlopen(req, timeout=10)
q = json.loads(resp.read().decode()).get("quote",{})
print(f"Quote status: {q['status']}")

req = urllib.request.Request(base + "/api/admin/matches/" + match_id)
resp = urllib.request.urlopen(req, timeout=10)
m = json.loads(resp.read().decode()).get("match",{})
print(f"Match status: {m['status']}")

print(f"\nALL PASS - quote=accepted({q['status']=='accepted'}) match=company_interested({m['status']=='company_interested'})")
