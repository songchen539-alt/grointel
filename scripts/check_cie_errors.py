import urllib.request, json

base = "https://grointel.vercel.app"

# Get passport ID
r = urllib.request.urlopen(base + "/api/passports", timeout=10)
d = json.loads(r.read())
pid = d["passports"][0]["id"]

endpoints = [
    ("capability-dna", f"/api/passports/{pid}/capability-dna"),
    ("history", f"/api/passports/{pid}/history"),
    ("explanations", f"/api/passports/{pid}/explanations"),
]

for name, url in endpoints:
    try:
        r = urllib.request.urlopen(base + url, timeout=10)
        d = json.loads(r.read())
        print(f"{name}: {d}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"{name}: HTTP {e.code} {body}")
