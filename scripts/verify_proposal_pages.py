import urllib.request, json

base = "https://grointel.vercel.app"

pages = [
    ("/api/proposals", "Proposals API"),
    ("/admin/proposals", "Admin Proposals List"),
    ("/proposal?test=1", "Proposal read (need real ID)"),
]

for path, name in pages:
    try:
        r = urllib.request.urlopen(base + path, timeout=10)
        status = r.getcode()
        print(f"  {name} ({path}): HTTP {status}")
    except urllib.error.HTTPError as e:
        print(f"  {name} ({path}): HTTP {e.code}")
    except Exception as e:
        print(f"  {name} ({path}): {str(e)[:60]}")

# Get a real proposal ID and check public page
r = urllib.request.urlopen(base + "/api/proposals", timeout=10)
d = json.loads(r.read())
pid = d["proposals"][0]["id"] if d.get("proposals") else None
if pid:
    r = urllib.request.urlopen(base + f"/proposal/{pid}", timeout=10)
    print(f"  /proposal/[id] (public): HTTP {r.getcode()}")

    # Also admin detail page
    r2 = urllib.request.urlopen(base + f"/admin/proposals/{pid}", timeout=10)
    print(f"  /admin/proposals/[id] (detail): HTTP {r2.getcode()}")
