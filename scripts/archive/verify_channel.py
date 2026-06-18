import urllib.request, json

base = "https://grointel.vercel.app"
channel_id = "6fa53f3b-fb58-4362-b481-b96982b7b548"

def check(label, url, expected_terms):
    r = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(r, timeout=10)
        html = resp.read().decode()
        for t in expected_terms:
            found = t in html
            print(f"  '{t}': {'PASS' if found else 'FAIL'}")
    except urllib.error.HTTPError as e:
        print(f"  Status {e.code}: {e.read().decode()[:100]}")

# 1. Channel dashboard (no channelId -> error)
print("=== 1. /channel (no ID) ===")
check("/channel", base + "/channel", ["Channel Access", "No channel ID provided"])

# 2. Channel dashboard (with channelId)
print("\n=== 2. /channel?channelId=xxx ===")
url = base + "/channel?channelId=" + channel_id
check("dashboard", url, ["SEA Growth Agency", "Growth Partner Dashboard", "Open Opportunities", "Waiting Intro", "Working", "Won", "Lost", "My Opportunities"])

# 3. Get an opportunity match ID
print("\n=== 3. Fetch match ID ===")
r = urllib.request.Request(base + "/api/admin/matches")
res = json.loads(urllib.request.urlopen(r).read().decode())
matches = res.get("matches", [])
channel_matches = [m for m in matches if m.get("channel_id") == channel_id]
if channel_matches:
    mid = channel_matches[0]["id"]
    print(f"Match ID: {mid}")
    url = base + "/channel/opportunity/" + mid + "?channelId=" + channel_id
    print(f"\n=== 4. /channel/opportunity/{mid} ===")
    check("opportunity", url, ["Company Profile", "Quote & Budget", "Selected Service", "Match Details", "Timeline", "Actions", "Accept Opportunity", "Decline", "Back to Dashboard"])
else:
    print("No matches for this channel, creating one...")
    # Get need
    r = urllib.request.Request(base + "/api/admin/growth-needs")
    need = json.loads(urllib.request.urlopen(r).read().decode())["needs"][0]
    nid = need["id"]
    # Create match
    data = json.dumps({"companyGrowthNeedId":nid,"channelId":channel_id,"matchScore":85,"recommendedSolutionType":"APAC Market Entry","matchReason":"Test match for channel portal"}).encode()
    r = urllib.request.Request(base + "/api/admin/matches", data=data, headers={"Content-Type":"application/json"}, method="POST")
    match = json.loads(urllib.request.urlopen(r).read().decode())["match"]
    mid = match["id"]
    print(f"Created match: {mid}")
    url = base + "/channel/opportunity/" + mid + "?channelId=" + channel_id
    print(f"\n=== 4. /channel/opportunity/{mid} ===")
    check("opportunity", url, ["Company Profile", "Quote & Budget", "Timeline", "Actions", "Back to Dashboard"])

# 5. Existing pages still work
print("\n=== 5. Existing pages ===")
r = urllib.request.Request(base + "/analyze", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=10)
html = resp.read().decode()
print(f"  /analyze: {'PASS' if 'Generate an AI Company MRI' in html else 'FAIL'}")

r = urllib.request.Request(base + "/admin/leads", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=10)
html = resp.read().decode()
print(f"  /admin/leads: {'PASS' if 'Admin Access' in html else 'FAIL'}")

print("\nALL TESTS COMPLETE")
