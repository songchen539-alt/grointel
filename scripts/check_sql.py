import urllib.request, json

base = "https://grointel.vercel.app"

for name, url in [("Entities", "/api/entities"), ("Passports", "/api/passports")]:
    try:
        req = urllib.request.Request(base + url)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode())
        ok = data.get("success", False)
        count = len(data.get("entities", data.get("passports", [])))
        print(f"{name}: success={ok} count={count}")
        if ok:
            print(f"  TABLE EXISTS")
        else:
            print(f"  error: {data.get('error')}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:150]
        print(f"{name}: HTTP {e.code} - {body}")
