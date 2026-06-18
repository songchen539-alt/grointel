import urllib.request, ssl

url = "https://grointel.vercel.app/report/view?id=stripe-demo"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    resp = urllib.request.urlopen(req, timeout=10)
    html = resp.read().decode()
    print("Status:", resp.status)
    print("Has Company MRI:", "Company MRI" in html)
    print("Size:", len(html))
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    body = e.read().decode()
    print("Body:", body[:500])
