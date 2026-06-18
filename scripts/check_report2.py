import urllib.request, ssl

url = "https://grointel.vercel.app/report/view?id=stripe-demo"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

for attempt in range(2):
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode()
        print(f"Attempt {attempt+1}: Status {resp.status}, Size {len(html)}")
        print("Company MRI:", "Company MRI" in html)
        print("CTA:", "Want the full Company Intelligence report" in html)
        print("Email field:", "Work email" in html)
        print("Submit button:", "Request Full Report" in html)
        print("Analyze link:", "Analyze Another Company" in html)
        print("API endpoint:", "/api/report-leads" in html)
        break
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Attempt {attempt+1}: Status {e.code}")
        # Extract error message from Next.js error page
        if "error" in body[:200]:
            idx = body.find("error")
            print(body[max(0,idx-50):idx+200])
    except Exception as e:
        print(f"Attempt {attempt+1}: {e}")
