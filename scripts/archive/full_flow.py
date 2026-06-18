import urllib.request, json, time

base = "https://grointel.vercel.app"

# 1-2. Get need and channel IDs
req = urllib.request.Request(base + "/api/admin/growth-needs")
resp = urllib.request.urlopen(req, timeout=10)
needs = json.loads(resp.read().decode()).get("needs", [])
if not needs:
    print("No needs found, submitting one...")
    data = json.dumps({"companyName":"DemoCorp","website":"democorp.io","workEmail":"founder@democorp.io","contactName":"Jane Founder","growthGoal":"Expand into SEA markets","targetMarket":"SEA","currentChallenge":"No local presence or partnerships","budgetMin":30000,"budgetMax":80000}).encode()
    req = urllib.request.Request(base + "/api/growth-needs", data=data, headers={"Content-Type":"application/json"}, method="POST")
    urllib.request.urlopen(req, timeout=10)
    req = urllib.request.Request(base + "/api/admin/growth-needs")
    resp = urllib.request.urlopen(req, timeout=10)
    needs = json.loads(resp.read().decode()).get("needs", [])
need_id = needs[0]["id"]
need_name = needs[0]["company_name"]
print(f"Need: {need_name} id={need_id}")

req = urllib.request.Request(base + "/api/admin/growth-channels")
resp = urllib.request.urlopen(req, timeout=10)
channels = json.loads(resp.read().decode()).get("channels", [])
if not channels:
    print("No channels found, submitting one...")
    data = json.dumps({"channelName":"SEA Growth Agency","website":"seagrowth.com","workEmail":"hello@seagrowth.com","category":"agency","region":"SEA","serviceTypes":"market entry, partnerships","growthOutcomes":"Help companies enter and grow in SEA"}).encode()
    req = urllib.request.Request(base + "/api/growth-channels", data=data, headers={"Content-Type":"application/json"}, method="POST")
    urllib.request.urlopen(req, timeout=10)
    req = urllib.request.Request(base + "/api/admin/growth-channels")
    resp = urllib.request.urlopen(req, timeout=10)
    channels = json.loads(resp.read().decode()).get("channels", [])
channel_id = channels[0]["id"]
channel_name = channels[0]["channel_name"]
print(f"Channel: {channel_name} id={channel_id}")

# 3. Add service
print(f"\n=== 3. Add service to channel ===")
data = json.dumps({"serviceName":"SEA Market Entry Program","serviceType":"market entry","problemSolved":"Companies struggle to enter SEA without local partnerships","growthOutcome":"Established local presence, partnerships, and first 10 customers","pricingModel":"project","startingPrice":25000,"maxPrice":50000}).encode()
req = urllib.request.Request(base + "/api/admin/channels/" + channel_id + "/services", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
print(f"Service: {body.get('service',{}).get('service_name','?')} id={body.get('service',{}).get('id','?')}")

# Wait a moment
time.sleep(0.5)

# 4. Create match
print(f"\n=== 4. Create match ===")
data = json.dumps({"companyGrowthNeedId":need_id,"channelId":channel_id,"matchScore":85,"recommendedSolutionType":"APAC Market Entry","matchReason":"This agency specializes in SEA market entry with a proven track record, matching the company need for local partnerships and presence.","adminNotes":""}).encode()
req = urllib.request.Request(base + "/api/admin/matches", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
match_id = body.get("match",{}).get("id","")
print(f"Match id={match_id} status={body.get('match',{}).get('status','?')}")

# 5. Create quote
print(f"\n=== 5. Create quote ===")
data = json.dumps({"matchId":match_id,"channelId":channel_id,"growthNeedId":need_id,"quoteTitle":"SEA B2B Market Entry Sprint","quoteAmount":45000,"currency":"USD","timeline":"90 days","deliverables":"Market research report, partner identification (20+), intro meetings (10+), pilot support","expectedGrowthOutcome":"Signed pilot agreements with 2-3 local partners","successMetrics":"Partner meetings booked, pilot agreements signed","proposalMessage":"Initial proposal based on the company growth need for SEA market entry.","reportId":""}).encode()
req = urllib.request.Request(base + "/api/admin/quotes", data=data, headers={"Content-Type":"application/json"}, method="POST")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
quote_id = body.get("quote",{}).get("id","")
print(f"Quote id={quote_id} title={body.get('quote',{}).get('quote_title','?')}")

# 6. Share With Company
print(f"\n=== 6. Share With Company ===")
data = json.dumps({"status":"shared_with_company"}).encode()
req = urllib.request.Request(base + "/api/admin/quotes/" + quote_id, data=data, headers={"Content-Type":"application/json"}, method="PATCH")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
print(f"Quote status: {body.get('quote',{}).get('status','?')}")

print(f"\n=== Company View URL ===")
print(f"https://grointel.vercel.app/growth-options/view?needId={need_id}")
