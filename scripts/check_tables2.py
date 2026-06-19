import urllib.request, json

base = "https://grointel.vercel.app"
r = urllib.request.urlopen(base + "/api/check-tables", timeout=10)
d = json.loads(r.read())

for t in sorted(d.keys()):
    info = d[t]
    exists = info.get("exists", "?")
    err = str(info.get("error", ""))[:80]
    print(f"  {t:<45} exists={exists}")
    if not exists and err:
        print(f"  {'':<45} err={err}")
