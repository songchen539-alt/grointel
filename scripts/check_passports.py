import urllib.request, json

base = "https://grointel.vercel.app"
r = urllib.request.urlopen(base + "/api/passports", timeout=10)
data = json.loads(r.read())
print(f"Total passports: {len(data['passports'])}")
for p in data["passports"][:3]:
    pid = p["id"]
    e = p.get("entity", {})
    t = e.get("entity_type", "?")
    n = e.get("display_name", "?")
    ind = p.get("primary_industry", "?")
    reg = p.get("primary_region", "?")
    print(f"  {n:<20} type={t:<10} industry={ind:<15} region={reg:<12} pid={pid[:12]}")
