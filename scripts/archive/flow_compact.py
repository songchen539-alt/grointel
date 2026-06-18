import urllib.request, json, time

base = "https://grointel.vercel.app"
cid = "6fa53f3b-fb58-4362-b481-b96982b7b548"

# Get need
r = urllib.request.Request(base + "/api/admin/growth-needs")
need = json.loads(urllib.request.urlopen(r).read().decode())["needs"][0]
need_id = need["id"]
print(f"Need: {need_id}")

# Get service
r = urllib.request.Request(base + "/api/admin/channels/" + cid + "/services")
svc = json.loads(urllib.request.urlopen(r).read().decode())["services"][0]
sid = svc["id"]
print(f"Service: {sid}")

# Create match
data = json.dumps({"companyGrowthNeedId": need_id, "channelId": cid, "serviceId": sid, "matchScore": 88, "recommendedSolutionType": "APAC Market Entry", "matchReason": "SEA agency for market entry"}).encode()
r = urllib.request.Request(base + "/api/admin/matches", data=data, headers={"Content-Type":"application/json"}, method="POST")
match = json.loads(urllib.request.urlopen(r).read().decode())["match"]
match_id = match["id"]
print(f"Match: {match_id} status={match['status']}")

# Create quote
data = json.dumps({"matchId":match_id,"channelId":cid,"growthNeedId":need_id,"quoteTitle":"SEA B2B Market Entry Sprint","quoteAmount":45000,"currency":"USD","timeline":"90 days","deliverables":"Partner identification, intro meetings","expectedGrowthOutcome":"Signed pilot agreements","successMetrics":"Meetings booked","proposalMessage":"Draft proposal.","reportId":""}).encode()
r = urllib.request.Request(base + "/api/admin/quotes", data=data, headers={"Content-Type":"application/json"}, method="POST")
quote = json.loads(urllib.request.urlopen(r).read().decode())["quote"]
quote_id = quote["id"]
print(f"Quote: {quote_id} status={quote['status']}")

# Share With Company
data = json.dumps({"status":"shared_with_company"}).encode()
r = urllib.request.Request(base + "/api/admin/quotes/" + quote_id, data=data, headers={"Content-Type":"application/json"}, method="PATCH")
urllib.request.urlopen(r)
print(f"Quote shared_with_company")

# Check match auto-update
r = urllib.request.Request(base + "/api/admin/matches/" + match_id)
m = json.loads(urllib.request.urlopen(r).read().decode())["match"]
print(f"Match status after share: {m['status']}")

# Fetch curated page
view_url = base + "/growth-options/view?needId=" + need_id
r = urllib.request.Request(view_url, headers={"User-Agent":"Mozilla/5.0"})
html = urllib.request.urlopen(r).read().decode()
for t in ["Your Curated Growth Solutions", "SEA B2B Market Entry Sprint", "Request Introduction", "GroIntel shows curated growth"]:
    print(f"  {t}: {'PASS' if t in html else 'FAIL'}")

# Request Introduction
data = json.dumps({"needId":need_id,"matchId":match_id,"quoteId":quote_id}).encode()
r = urllib.request.Request(base + "/api/growth-options/request-intro", data=data, headers={"Content-Type":"application/json"}, method="POST")
result = json.loads(urllib.request.urlopen(r).read().decode())
print(f"Intro request: {result['success']}")

time.sleep(2)

# Final verification
r = urllib.request.Request(base + "/api/admin/quotes/" + quote_id)
q = json.loads(urllib.request.urlopen(r).read().decode())["quote"]
r = urllib.request.Request(base + "/api/admin/matches/" + match_id)
m = json.loads(urllib.request.urlopen(r).read().decode())["match"]
print(f"\nQuote status: {q['status']} (expected: accepted)")
print(f"Match status: {m['status']} (expected: company_interested)")
all_ok = q["status"] == "accepted" and m["status"] == "company_interested"
print(f"\n{'ALL PASS' if all_ok else 'SOME FAILED'}")
