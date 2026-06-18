import urllib.request, json

base = "https://grointel.vercel.app"
pid = "991704ac-2711-47be-b79f-4b251dbbbd04"

# Try to get capability-dna to see actual columns
r = urllib.request.urlopen(base + f"/api/passports/{pid}/capability-dna", timeout=10)
d = json.loads(r.read())
print("capability-dna response:", json.dumps(d)[:500])
print()

# Try a minimal insert via the seed endpoint but check what POSTGREST expects
# Actually let me check by doing a raw Supabase query with a different endpoint
# Check evidence for actual column names
r2 = urllib.request.urlopen(base + f"/api/passports/{pid}/evidence", timeout=10)
d2 = json.loads(r2.read())
if d2.get("success") and len(d2.get("evidence", [])) > 0:
    print("Evidence columns:", list(d2["evidence"][0].keys()))
else:
    print("No evidence data yet")
