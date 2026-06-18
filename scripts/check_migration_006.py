import urllib.request, json

base = "https://grointel.vercel.app"
pid = None

# Get a passport ID first
try:
    r = urllib.request.urlopen(base + "/api/passports", timeout=10)
    d = json.loads(r.read())
    if d.get("success") and d.get("passports"):
        pid = d["passports"][0]["id"]
        print(f"Got passport ID: {pid[:12]}...")
except Exception as e:
    print(f"Could not get passport: {e}")
    exit(1)

# Check CIE endpoints
cie_endpoints = [
    "/api/passports/" + pid + "/capability-dna",
    "/api/passports/" + pid + "/audience-dna",
    "/api/passports/" + pid + "/evidence",
    "/api/passports/" + pid + "/history",
    "/api/passports/" + pid + "/explanations",
]

print("\n=== CIE API Check (migration 006 status) ===")
for ep in cie_endpoints:
    try:
        r = urllib.request.urlopen(base + ep, timeout=10)
        d = json.loads(r.read())
        ok = d.get("success", False)
        data_keys = [k for k in d.keys() if k != "success"]
        print(f"  {ep.split('/')[-1]}: success={ok} keys={data_keys}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:100]
        print(f"  {ep.split('/')[-1]}: HTTP {e.code} - {body}")
    except Exception as e:
        print(f"  {ep.split('/')[-1]}: Error {str(e)[:60]}")
