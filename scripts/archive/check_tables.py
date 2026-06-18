import urllib.request, json

base = "https://grointel.vercel.app"

# Check all marketplace tables
endpoints = [
    ("matches", "/api/admin/matches"),
    ("quotes", "/api/admin/quotes"),
    ("services", "/api/admin/channels/test/services"),
    ("growth-needs", "/api/admin/growth-needs"),
    ("channels", "/api/admin/growth-channels"),
]

for name, url in endpoints:
    try:
        req = urllib.request.Request(base + url)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode())
        items = data.get("matches") or data.get("quotes") or data.get("services") or data.get("needs") or data.get("channels") or []
        print(f"{name}: OK ({len(items)} items)")
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:100]
        print(f"{name}: FAIL ({e.code}) {body}")
