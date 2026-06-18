import urllib.request, json

base = "https://grointel.vercel.app"
cid = "6fa53f3b-fb58-4362-b481-b96982b7b548"

# Check channel
req = urllib.request.Request(base + "/api/admin/growth-channels/" + cid)
resp = urllib.request.urlopen(req, timeout=10)
channel = json.loads(resp.read().decode()).get("channel", {})
print(f"Channel: {channel.get('channel_name')}")
print(f"Category: {channel.get('category')}")

# Try with different data format
data = json.dumps({
    "serviceName": "SEA Market Entry",
    "serviceType": "market entry",
    "problemSolved": "No local presence",
    "growthOutcome": "SEA market entry",
}).encode()
req = urllib.request.Request(base + "/api/admin/channels/" + cid + "/services", data=data, headers={"Content-Type":"application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("Status:", resp.status)
    print(json.loads(resp.read().decode()))
except urllib.error.HTTPError as e:
    print("Error:", e.code)
    print(e.read().decode()[:500])
