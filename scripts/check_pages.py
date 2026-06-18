import urllib.request, json

base = "https://grointel.vercel.app"

pages = ["/admin/entities", "/admin/passports", "/analyze", "/growth-options", "/admin/analytics", "/channel"]

for page in pages:
    try:
        r = urllib.request.urlopen(base + page, timeout=10)
        html = r.read().decode()[:300]
        title_start = html.find("<title>")
        title_end = html.find("</title>")
        title = html[title_start+7:title_end] if title_start >= 0 and title_end > 0 else "(no title)"
        status = r.getcode()
        print(f"  {page}: HTTP {status} title=\"{title}\"")
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode()[:100]
        except:
            body = ""
        print(f"  {page}: HTTP {e.code} {body}")
    except Exception as e:
        print(f"  {page}: {str(e)[:60]}")
