import urllib.request, json, sys

base = "https://grointel.vercel.app"
ok_count = 0
fail_count = 0

def check(name, path):
    global ok_count, fail_count
    try:
        req = urllib.request.Request(base + path)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode())
        ok = data.get("success", False)
        count = len(data.get("entities", data.get("passports", data.get("case_studies", data.get("socials", [])))))
        if ok:
            print(f"  OK {name}: success=true count={count}")
            ok_count += 1
        else:
            print(f"  FAIL {name}: success=false error={data.get('error','?')}")
            fail_count += 1
    except Exception as e:
        msg = str(e)[:100]
        if hasattr(e, 'read'):
            try: msg = e.read().decode()[:100]
            except: pass
        print(f"  FAIL {name}: {msg}")
        fail_count += 1

print("=== Passport API Verification ===\n")

# Get a real passport id first
real_pid = None
try:
    req = urllib.request.Request(base + "/api/passports")
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode())
    if data.get("success") and len(data.get("passports", [])) > 0:
        real_pid = data["passports"][0]["id"]
        print(f"  Found real passport ID: {real_pid[:12]}...\n")
except Exception as e:
    print(f"  WARN: could not fetch passport list: {str(e)[:100]}")

# Run checks
check("GET /api/entities", "/api/entities")
check("GET /api/passports", "/api/passports")

if real_pid:
    check("GET /api/passports/[id]", f"/api/passports/{real_pid}")
    check("GET /api/passports/[id]/case-studies", f"/api/passports/{real_pid}/case-studies")
    check("GET /api/passports/[id]/socials", f"/api/passports/{real_pid}/socials")
    
    # Test claim
    try:
        body = json.dumps({"email": "test@example.com", "verification_method": "email"}).encode()
        req = urllib.request.Request(
            base + f"/api/passports/{real_pid}/claim",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST")
        resp = urllib.request.urlopen(req, timeout=10)
        cd = json.loads(resp.read().decode())
        if cd.get("success"):
            print(f"  OK POST /api/passports/[id]/claim: success=true")
            ok_count += 1
        else:
            print(f"  FAIL POST /api/passports/[id]/claim: {cd.get('error','?')}")
            fail_count += 1
    except Exception as e:
        print(f"  FAIL POST /api/passports/[id]/claim: {str(e)[:100]}")
        fail_count += 1

print(f"\n=== Result: {ok_count} ok, {fail_count} failed ===")
sys.exit(fail_count)
