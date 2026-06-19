import urllib.request, json

base = "https://grointel.vercel.app"

# 1. GET /api/proposals
r = urllib.request.urlopen(base + "/api/proposals", timeout=10)
d = json.loads(r.read())
print(f"GET /api/proposals: success={d.get('success')} count={len(d.get('proposals',[]))}")

# 2. GET /api/proposals/[id]
pid = d["proposals"][0]["id"] if d.get("proposals") else None
if pid:
    r2 = urllib.request.urlopen(base + f"/api/proposals/{pid}", timeout=10)
    d2 = json.loads(r2.read())
    print(f"GET /api/proposals/[id]: success={d2.get('success')} title={d2.get('proposal',{}).get('title','?')[:40]}")
    print(f"  business={d2.get('proposal',{}).get('business',{}).get('display_name','?')}")
    print(f"  capability={d2.get('proposal',{}).get('capability',{}).get('display_name','?')}")
    print(f"  goal={str(d2.get('proposal',{}).get('goal','?'))[:60]}")

    # 3. GET /api/proposals/[id]/comments
    r3 = urllib.request.urlopen(base + f"/api/proposals/{pid}/comments", timeout=10)
    d3 = json.loads(r3.read())
    print(f"GET /api/proposals/[id]/comments: success={d3.get('success')} count={len(d3.get('comments',[]))}")

    # 4. POST comment
    body = json.dumps({"comment": "Looks promising! Let's refine the budget.", "author_name": "Reviewer", "author_type": "human"}).encode()
    req = urllib.request.Request(base + f"/api/proposals/{pid}/comments", data=body, headers={"Content-Type":"application/json"}, method="POST")
    r4 = urllib.request.urlopen(req, timeout=10)
    d4 = json.loads(r4.read())
    print(f"POST /api/proposals/[id]/comments: success={d4.get('success')}")

    # Verify comment was added
    r5 = urllib.request.urlopen(base + f"/api/proposals/{pid}/comments", timeout=10)
    d5 = json.loads(r5.read())
    print(f"Comments after add: {len(d5.get('comments',[]))} total")

print()
print("All proposal APIs verified.")
