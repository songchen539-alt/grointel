import urllib.request, json, time

base = "https://grointel.vercel.app"

# Get passport IDs
r = urllib.request.urlopen(base + "/api/passports", timeout=10)
data = json.loads(r.read())
passports = data["passports"]
ids = [p["id"] for p in passports]
print(f"Total passports: {len(ids)}")

# Check if any data was seeded
pid = ids[0]
r2 = urllib.request.urlopen(base + f"/api/passports/{pid}/capability-dna", timeout=10)
d2 = json.loads(r2.read())
has_cap = d2.get("capabilityDna") is not None
print(f"  capability-dna: {'HAS DATA' if has_cap else 'empty'}")

r3 = urllib.request.urlopen(base + f"/api/passports/{pid}/audience-dna", timeout=10)
d3 = json.loads(r3.read())
has_aud = d3.get("audienceDna") is not None
print(f"  audience-dna: {'HAS DATA' if has_aud else 'empty'}")

r4 = urllib.request.urlopen(base + f"/api/passports/{pid}/evidence", timeout=10)
d4 = json.loads(r4.read())
ev = d4.get("evidence", [])
print(f"  evidence: {len(ev)} items")

r5 = urllib.request.urlopen(base + f"/api/passports/{pid}/history", timeout=10)
d5 = json.loads(r5.read())
hist = d5.get("history", [])
print(f"  history: {len(hist)} items")

r6 = urllib.request.urlopen(base + f"/api/passports/{pid}/explanations", timeout=10)
d6 = json.loads(r6.read())
expl = d6.get("explanations", [])
print(f"  explanations: {len(expl)} items")
