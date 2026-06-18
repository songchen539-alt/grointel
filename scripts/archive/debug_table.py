import urllib.request, json

supabase_url = "https://uaqshxwhchseasdogkys.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcXNoeHdoY2hzZWFzZG9na3lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MzQ3NCwiZXhwIjoyMDk3MjY5NDc0fQ.SB4b6kzBK1vahijg2wXEX7AKflbjRqR2Mx_gU-P0V6o"

# Check if channel_services table exists
req = urllib.request.Request(supabase_url + "/rest/v1/channel_services?select=id&limit=1", headers={"apikey": service_key, "Authorization": "Bearer " + service_key})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("Table exists, rows:", json.loads(resp.read().decode()))
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode()[:300])
