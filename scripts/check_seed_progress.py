import urllib.request, json

base = "https://grointel.vercel.app"

r = urllib.request.urlopen(base + "/api/passports", timeout=10)
data = json.loads(r.read())
ids = [p["id"] for p in data["passports"]]

# Check first 20 passports for capability dna
cap_count = 0
aud_count = 0
for i, pid in enumerate(ids[:25]):
    try:
        r2 = urllib.request.urlopen(base + f"/api/passports/{pid}/capability-dna", timeout=5)
        d2 = json.loads(r2.read())
        has_cap = d2.get("capabilityDna") is not None
        if has_cap: cap_count += 1
        
        r3 = urllib.request.urlopen(base + f"/api/passports/{pid}/audience-dna", timeout=5)
        d3 = json.loads(r3.read())
        has_aud = d3.get("audienceDna") is not None
        if has_aud: aud_count += 1
    except:
        pass

print(f"Passports checked: 25")
print(f"  With capability-dna: {cap_count}")
print(f"  With audience-dna: {aud_count}")
print(f"  (Timeout happened during processing. Run seed again to continue.)")
