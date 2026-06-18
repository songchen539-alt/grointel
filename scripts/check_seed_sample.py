import urllib.request, json

base = "https://grointel.vercel.app"
r = urllib.request.urlopen(base + "/api/passports", timeout=10)
data = json.loads(r.read())
ids = [p["id"] for p in data["passports"]]

# Check 5 random passports
import random
sample = random.sample(ids, min(5, len(ids)))

print("Checking random sample of passports:")
for pid in sample:
    results = {}
    endpoints = {
        "cap-dna": f"/api/passports/{pid}/capability-dna",
        "aud-dna": f"/api/passports/{pid}/audience-dna",
        "evidence": f"/api/passports/{pid}/evidence",
        "history": f"/api/passports/{pid}/history",
        "expl": f"/api/passports/{pid}/explanations",
    }
    for name, url in endpoints.items():
        try:
            r = urllib.request.urlopen(base + url, timeout=5)
            d = json.loads(r.read())
            if name == "evidence":
                results[name] = len(d.get("evidence", []))
            elif name == "history":
                results[name] = len(d.get("history", []))
            elif name == "expl":
                results[name] = len(d.get("explanations", []))
            else:
                results[name] = "OK" if d.get(list(d.keys() - {"success"})[0]) is not None else "empty"
        except:
            results[name] = "ERR"
    print(f"  {pid[:12]}: {results}")
