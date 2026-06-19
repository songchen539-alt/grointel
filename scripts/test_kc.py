import urllib.request, json

base = "https://grointel.vercel.app"

r1 = urllib.request.urlopen(base + "/api/business-intelligence", timeout=10)
d1 = json.loads(r1.read())
profiles = d1.get("profiles", [])
print(f"Profiles: {len(profiles)}")
if not profiles:
    print("No profiles")
    exit()

pid = profiles[0]["id"]
print(f"Using profile: {pid[:12]}...")

body = json.dumps({"profileType": "business_knowledge", "profileId": pid}).encode()
req = urllib.request.Request(base + "/api/knowledge/start", data=body, headers={"Content-Type": "application/json"}, method="POST")
try:
    r2 = urllib.request.urlopen(req, timeout=10)
    d2 = json.loads(r2.read())
    ok = d2.get("success")
    print(f"Success: {ok}")
    if ok:
        q = d2.get("question", {})
        print(f"Question: {q.get('question','')[:80]}")
        print(f"Session: {d2.get('session',{}).get('id','?')[:12]}")
except urllib.error.HTTPError as e:
    body = e.read().decode()[:300]
    print(f"Error: {e.code} - {body}")
