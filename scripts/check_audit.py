import urllib.request, json

base = "https://grointel.vercel.app"
req = urllib.request.Request(base + "/api/audit-schema")
try:
    r = urllib.request.urlopen(req, timeout=30)
    d = json.loads(r.read())
    print(json.dumps(d, indent=2)[:5000])
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode()[:500])
