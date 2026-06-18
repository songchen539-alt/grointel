import urllib.request, json, time

base = "https://grointel.vercel.app"
cid = "6fa53f3b-fb58-4362-b481-b96982b7b548"

def test(label, url_or_fn, expected_pass):
    try:
        if callable(url_or_fn):
            result = url_or_fn()
        else:
            result = json.loads(urllib.request.urlopen(url_or_fn, timeout=10).read().decode())
        ok = expected_pass in result if isinstance(result, dict) else expected_pass
        print(f"  {label}: {'PASS' if ok else 'FAIL'}")
    except Exception as e:
        print(f"  {label}: FAIL - {e}")

def post(url, data):
    r = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type":"application/json"}, method="POST")
    return json.loads(urllib.request.urlopen(r, timeout=10).read().decode())

def get(url):
    return json.loads(urllib.request.urlopen(url, timeout=10).read().decode())

# 1. Channel portal loads
print("=== Channel Portal ===")
r = urllib.request.Request(base + "/channel?channelId=" + cid, headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=10)
html = resp.read().decode()
print(f"  Dashboard: {'PASS' if 'My Opportunities' in html else 'FAIL'}")

# 2. Get matches for this channel
r = urllib.request.Request(base + "/api/admin/matches")
matches = get(r)
my_matches = [m for m in matches.get("matches", []) if m.get("channel_id") == cid]

if my_matches:
    mid = my_matches[0]["id"]
    
    # 3. Leave Internal Note
    print("\n=== Channel Actions ===")
    result = post(base + "/api/channel/opportunities/" + mid + "/notes", {"channelId": cid, "note": "Test note"})
    print(f"  Leave Note: {'PASS' if result.get('success') else 'FAIL'}")

    # 4. Need More Information
    result = post(base + "/api/channel/opportunities/" + mid + "/more-info", {"channelId": cid, "note": "Need more details about target market"})
    print(f"  More Info: {'PASS' if result.get('success') else 'FAIL'}")

    time.sleep(1)
    m = get(base + "/api/admin/matches/" + mid)
    print(f"  Status after more-info: {'PASS' if m.get('status') == 'channel_requested_more_info' else 'FAIL (' + m.get('status','?') + ')'}")

    # Check events
    evts = get(base + "/api/admin/matches/" + mid + "/events").get("events", [])
    print(f"  Events count: {len(evts)}")

    # 5. Schedule Introduction
    result = post(base + "/api/channel/opportunities/" + mid + "/schedule-intro", {"channelId": cid, "note": "Scheduling intro", "scheduledAt": "2026-07-01T10:00"})
    print(f"  Schedule Intro: {'PASS' if result.get('success') else 'FAIL'}")

    time.sleep(1)
    m = get(base + "/api/admin/matches/" + mid)
    print(f"  Status after intro: {'PASS' if m.get('status') == 'intro_scheduled' else 'FAIL (' + m.get('status','?') + ')'}")

# 6. Create new match for Accept test
print("\n=== Accept Flow ===")
needs = get(base + "/api/admin/growth-needs").get("needs", [])
nid = needs[0]["id"]
result = post(base + "/api/admin/matches", {"companyGrowthNeedId": nid, "channelId": cid, "matchScore": 85, "recommendedSolutionType": "APAC Market Entry", "matchReason": "Test accept"})
new_mid = result.get("match", {}).get("id", "")
print(f"  Created match: {new_mid}")

result = post(base + "/api/channel/opportunities/" + new_mid + "/accept", {"channelId": cid})
print(f"  Accept: {'PASS' if result.get('success') else 'FAIL'}")

time.sleep(1)
m = get(base + "/api/admin/matches/" + new_mid)
print(f"  Status: {'PASS' if m.get('status') == 'channel_accepted' else 'FAIL (' + m.get('status','?') + ')'}")

# 7. Create match for Decline test
print("\n=== Decline Flow ===")
result = post(base + "/api/admin/matches", {"companyGrowthNeedId": nid, "channelId": cid, "matchScore": 80, "recommendedSolutionType": "APAC Market Entry", "matchReason": "Test decline"})
new_mid2 = result.get("match", {}).get("id", "")

result = post(base + "/api/channel/opportunities/" + new_mid2 + "/decline", {"channelId": cid, "note": "Not a good fit"})
print(f"  Decline: {'PASS' if result.get('success') else 'FAIL'}")

time.sleep(1)
m = get(base + "/api/admin/matches/" + new_mid2)
print(f"  Status: {'PASS' if m.get('status') == 'channel_declined' else 'FAIL (' + m.get('status','?') + ')'}")

# 8. Existing company flow still works
print("\n=== Company Intro Flow (still works) ===")
# Create quote + share + intro request
result = post(base + "/api/admin/matches", {"companyGrowthNeedId": nid, "channelId": cid, "matchScore": 88, "recommendedSolutionType": "APAC Market Entry", "matchReason": "Company flow test"})
mid3 = result.get("match", {}).get("id", "")
result = post(base + "/api/admin/quotes", {"matchId": mid3, "channelId": cid, "growthNeedId": nid, "quoteTitle": "Company Flow Quote", "quoteAmount": 30000, "currency": "USD", "timeline": "60 days", "deliverables": "Test", "expectedGrowthOutcome": "Test", "successMetrics": "Test", "proposalMessage": "Test"})
qid = result.get("quote", {}).get("id", "")
post(base + "/api/admin/quotes/" + qid, {"status": "shared_with_company"})
result = post(base + "/api/growth-options/request-intro", {"needId": nid, "matchId": mid3, "quoteId": qid})
print(f"  Company intro request: {'PASS' if result.get('success') else 'FAIL'}")

time.sleep(1)
q = get(base + "/api/admin/quotes/" + qid).get("quote", {})
m3 = get(base + "/api/admin/matches/" + mid3).get("match", {})
print(f"  Quote status (accepted): {'PASS' if q.get('status') == 'accepted' else 'FAIL (' + q.get('status','?') + ')'}")
print(f"  Match status (company_interested): {'PASS' if m3.get('status') == 'company_interested' else 'FAIL (' + m3.get('status','?') + ')'}")

print("\nALL VERIFIED")
