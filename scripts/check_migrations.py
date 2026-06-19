import urllib.request, json

base = "https://grointel.vercel.app"

# Check GIE tables (goals is in-memory, but constraints and strategies need DB)
# Check KC tables (sessions, questions, updates)
checks = {
    "growth_goals (GIE)": "/api/goals",
    "knowledge sessions (KC)": "/api/knowledge/session/nonexistent",
}

for name, url in checks.items():
    try:
        r = urllib.request.urlopen(base + url, timeout=10)
        d = json.loads(r.read())
        print(f"  {name}: accessible")
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:100]
        # 400 for session (invalid id) is OK — means table exists
        # 500 for table not found means migration not run
        if "does not exist" in body or "Could not find the table" in body:
            print(f"  {name}: TABLE MISSING - {body}")
        else:
            print(f"  {name}: accessible (expected error: {e.code})")
    except Exception as e:
        print(f"  {name}: {str(e)[:60]}")
