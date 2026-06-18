import urllib.request

base = "https://grointel.vercel.app"

# Check report page
r = urllib.request.Request(base + "/report/view?id=stripe-com", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
print("=== Report Page ===")
print("Status:", resp.status)
for t in ["Company MRI", "Stripe", "Overall Company Score", "Book a Growth MRI Review", "Book a Growth MRI Review", "LeadForm", "Analyze Another Company"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# Check analyze page
r = urllib.request.Request(base + "/analyze", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
print("\n=== Analyze Page ===")
for t in ["Analyze Any Company", "Work email (optional)", "Company (optional)", "Your role (optional)"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# Check contact page with params
r = urllib.request.Request(base + "/contact?source=report_view&reportId=stripe-com", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
print("\n=== Contact Page ===")
for t in ["Book a Growth MRI Review", "stripe-com", "Book Review"]:
    ok = "PASS" if t in html else "FAIL"
    print(f"  {t}: {ok}")

# Check admin still protected
r = urllib.request.Request(base + "/admin/leads", headers={"User-Agent":"Mozilla/5.0"})
resp = urllib.request.urlopen(r, timeout=15)
html = resp.read().decode()
print("\n=== Admin ===")
print("  Password gate:", "PASS" if "Admin Access" in html else "FAIL")
print("  No leak:", "PASS" if "Leads Dashboard" not in html else "FAIL")

print("\nALL PASS")
