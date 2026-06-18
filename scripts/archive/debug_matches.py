import urllib.request, json

base = "https://grointel.vercel.app"

r = urllib.request.Request(base + "/api/admin/matches")
resp = urllib.request.urlopen(r, timeout=10)
matches = json.loads(resp.read().decode()).get("matches", [])
print(f"Total matches: {len(matches)}")
for m in matches:
    sid = m.get("id","")[:10]
    status = m.get("status","?")
    ch = m.get("channel_id","")[:10]
    print(f"  {sid} status={status} channel={ch}")
