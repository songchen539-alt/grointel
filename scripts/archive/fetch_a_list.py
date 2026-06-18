import urllib.request, json

base = "https://grointel.vercel.app"
req = urllib.request.Request(base + "/api/admin/prospects")
resp = urllib.request.urlopen(req, timeout=10)
body = json.loads(resp.read().decode())
prospects = body.get("prospects", [])

a_list = [p for p in prospects if p.get("priority") == "A" and str(p.get("notes", "")).startswith("Phase 6")]

# Sort to match the specified order
order = ["Perplexity","Clay","Cursor","Ramp","Vercel","Notion","Rippling","ElevenLabs","Runway","Mercor"]
a_sorted = []
for name in order:
    for p in a_list:
        if p.get("company_name") == name:
            a_sorted.append(p)
            break
for p in a_list:
    if p.get("company_name") not in order:
        a_sorted.append(p)

print(f"Found {len(a_sorted)} Priority A prospects")
for p in a_sorted:
    print(f"  {p['company_name']} - {p.get('id','')[:8]}...")

# Fetch full details
import time
detailed = []
for p in a_sorted:
    try:
        req = urllib.request.Request(base + "/api/admin/prospects/" + p["id"])
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode())
        detailed.append(data.get("prospect", p))
        time.sleep(0.5)
    except:
        detailed.append(p)

# Save to a JSON for the markdown generator
with open(r"C:\Users\LENOVO\.openclaw\workspace\grointel\scripts\a_data.json", "w", encoding="utf-8") as f:
    json.dump(detailed, f, indent=2, default=str)

print(f"Saved {len(detailed)} detailed prospects")
