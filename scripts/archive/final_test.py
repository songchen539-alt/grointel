import urllib.request, ssl

base = "https://grointel.vercel.app"

# Test 1: Report page
print("=== Test 1: Report page ===")
req = urllib.request.Request(base + "/report/view?id=stripe-demo",
    headers={"User-Agent": "Mozilla/5.0"})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode()
    print("Status:", resp.status)
    print("Company MRI:", "Company MRI" in html)
    print("CTA:", "Want the full Company Intelligence report" in html)
    print("Email field:", "Work email" in html)
    print("Submit button:", "Request Full Report" in html)
    print("Analyze link:", "Analyze Another Company" in html)
    print("API endpoint:", "/api/report-leads" in html)
except Exception as e:
    print("Error:", e)

# Test 2: API - valid submission
print("\n=== Test 2: API valid ===")
import json
data = json.dumps({"reportId": "stripe-demo", "companyName": "Test Corp", "workEmail": "verify@grointel.ai", "role": "CEO"}).encode()
req = urllib.request.Request(base + "/api/report-leads", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("Status:", resp.status)
    print("Body:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode()[:200])

# Test 3: API - duplicate
print("\n=== Test 3: API duplicate ===")
data = json.dumps({"reportId": "stripe-demo", "companyName": "Test Corp", "workEmail": "verify@grointel.ai", "role": "CEO"}).encode()
req = urllib.request.Request(base + "/api/report-leads", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("Status:", resp.status)
    print("Body:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode()[:200])

# Test 4: API - invalid email
print("\n=== Test 4: API invalid email ===")
data = json.dumps({"reportId": "stripe-demo", "workEmail": "bad"}).encode()
req = urllib.request.Request(base + "/api/report-leads", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("Status:", resp.status)
    print("Body:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode()[:200])
