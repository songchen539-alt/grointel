import urllib.request, json

supabase_url = "https://uaqshxwhchseasdogkys.supabase.co"

# Read migration SQL
with open(r"C:\Users\LENOVO\.openclaw\workspace\grointel\supabase\migrations\006_capability_intelligence.sql", encoding="utf-8") as f:
    sql = f.read()

# Try to use the API's SQL endpoint
url = supabase_url + "/rest/v1/rpc/"
# Supabase allows raw SQL through the management API but not public REST
# Let's check if the tables already exist first

def table_exists(name):
    url = supabase_url + f"/rest/v1/{name}?select=id&limit=1"
    # We need a key - try the anon key
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcXNoeHdoY2hzZWFzZG9na3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTM0NzQsImV4cCI6MjA5NzI2OTQ3NH0._n1NeE3VqRm0dQvHQCy1NS-Z7xz87rqvToUmHxH923M"
    req = urllib.request.Request(url, headers={"apikey": anon_key, "Authorization": "Bearer " + anon_key})
    try:
        urllib.request.urlopen(req, timeout=5)
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return "does not exist" not in body and "relation" not in body

tables = [
    "growth_capability_dna",
    "growth_audience_dna",
    "growth_capability_history",
    "growth_evidence",
    "growth_capability_explanations",
    "growth_relationships",
]

for t in tables:
    exists = table_exists(t)
    print(f"  {t}: {'EXISTS' if exists else 'MISSING'}")

print()
print("SQL needs manual execution in Supabase SQL Editor")
print("Run supabase/migrations/006_capability_intelligence.sql")
