import urllib.request, json

base = "https://grointel.vercel.app"

# Get proposals
r = urllib.request.urlopen(base + "/api/proposals", timeout=10)
d = json.loads(r.read())
props = d.get("proposals", [])
print(f"Total proposals: {len(props)}")

# Check first proposal for versions, status, reasoning
pid = props[0]["id"]
r2 = urllib.request.urlopen(base + f"/api/proposals/{pid}", timeout=10)
d2 = json.loads(r2.read())
p = d2.get("proposal", {})
print(f"\nDetail for: {p.get('title','?')[:40]}")
print(f"  Status: {p.get('status','?')}")
print(f"  Confidence: {p.get('confidence_score','?')}")
print(f"  Reasoning keys: {list(p.get('reasoning',{}).keys()) if p.get('reasoning') else 'NONE'}")

# Versions
r3 = urllib.request.urlopen(base + f"/api/proposals/{pid}/versions", timeout=10)
d3 = json.loads(r3.read())
print(f"  Versions: {len(d3.get('versions',[]))}")

# Comments
r4 = urllib.request.urlopen(base + f"/api/proposals/{pid}/comments", timeout=10)
d4 = json.loads(r4.read())
print(f"  Comments: {len(d4.get('comments',[]))}")

# Test PATCH status
body = json.dumps({"status": "under_review"}).encode()
req = urllib.request.Request(base + f"/api/proposals/{pid}", data=body, headers={"Content-Type":"application/json"}, method="PATCH")
r5 = urllib.request.urlopen(req, timeout=10)
d5 = json.loads(r5.read())
print(f"  PATCH status -> under_review: success={d5.get('success')}")

# Test invalid status
body2 = json.dumps({"status": "invalid"}).encode()
req2 = urllib.request.Request(base + f"/api/proposals/{pid}", data=body2, headers={"Content-Type":"application/json"}, method="PATCH")
try:
    urllib.request.urlopen(req2, timeout=10)
    print(f"  PATCH invalid status: should have failed but passed")
except urllib.error.HTTPError as e:
    print(f"  PATCH invalid status: correctly rejected ({e.code})")

# Test POST version
snap = {"test": True, "title": "Version test"}
body3 = json.dumps({"snapshot": snap, "change_summary": "Test version", "created_by": "test", "version": 2}).encode()
req3 = urllib.request.Request(base + f"/api/proposals/{pid}/versions", data=body3, headers={"Content-Type":"application/json"}, method="POST")
r6 = urllib.request.urlopen(req3, timeout=10)
d6 = json.loads(r6.read())
print(f"  POST version: success={d6.get('success')}")

# Check versions again
r7 = urllib.request.urlopen(base + f"/api/proposals/{pid}/versions", timeout=10)
d7 = json.loads(r7.read())
print(f"  Versions after add: {len(d7.get('versions',[]))}")

print("\nAll API verifications complete.")
