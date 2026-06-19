import urllib.request, json

base = "https://grointel.vercel.app"
req = urllib.request.Request(base + "/api/audit-schema")
r = urllib.request.urlopen(req, timeout=30)
d = json.loads(r.read())
res = d.get("results", {})

for tname, tdata in sorted(res.items()):
    print(f"=== {tname} ===")
    if tdata.get("error"):
        print(f"  ERROR: {tdata['error']}")
        continue
    details = tdata.get("details", [])
    if details:
        for col in details:
            n = "NULL" if col["nullable"] else "NOT NULL"
            dflt = col.get("dflt") or ""
            print(f"  {col['col']:<30} {col['type']:<12} {n:<10} {dflt}")
    missing = tdata.get("missing_expected", [])
    if missing:
        print(f"  MISSING ({len(missing)}): {', '.join(missing)}")
    extra = tdata.get("extra_unexpected", [])
    if extra:
        print(f"  EXTRA: {', '.join(extra)}")
    print()
