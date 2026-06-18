import urllib.request, json

supabase_url = "https://uaqshxwhchseasdogkys.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcXNoeHdoY2hzZWFzZG9na3lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MzQ3NCwiZXhwIjoyMDk3MjY5NDc0fQ.SB4b6kzBK1vahijg2wXEX7AKflbjRqR2Mx_gU-P0V6o"

def try_query(table):
    url = supabase_url + "/rest/v1/" + table + "?select=id&limit=1"
    req = urllib.request.Request(url, headers={"apikey": service_key, "Authorization": "Bearer " + service_key})
    try:
        urllib.request.urlopen(req, timeout=5)
        return "EXISTS"
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "relation" in body and "does not exist" in body:
            return "MISSING"
        return f"ERROR({e.code})"

tables = [
    "growth_entities",
    "growth_passports",
    "growth_capabilities",
    "growth_audiences",
    "growth_channels_supported",
    "growth_case_studies",
    "growth_social_accounts",
    "growth_metrics",
    "growth_claim_requests",
]

print("=== Verifying Growth Passport tables ===")
all_exist = True
for t in tables:
    status = try_query(t)
    print(f"  {t}: {status}")
    if status != "EXISTS":
        all_exist = False

print()
if all_exist:
    print("ALL TABLES EXIST")
else:
    print("SOME TABLES MISSING - run the SQL migration")
