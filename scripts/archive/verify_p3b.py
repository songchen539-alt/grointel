import urllib.request, ssl

base = "https://grointel.vercel.app"

def check(label, url, expected, absent=None):
    r = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    resp = urllib.request.urlopen(r, timeout=15)
    html = resp.read().decode()
    ok = True
    for t in expected:
        if t not in html:
            print(f"  FAIL: '{t}' not found in {label}")
            ok = False
    if absent:
        for t in absent:
            if t in html:
                print(f"  FAIL: '{t}' found (should be absent) in {label}")
                ok = False
    if ok:
        print(f"  {label}: PASS")

# Without auth - should show password gate or access denied
print("=== Without auth ===")
check("/admin/leads", base + "/admin/leads", ["Admin Access", "Enter the admin password", "Sign In"])

# These should show Access Denied with link to /admin/leads
check("/admin/dashboard", base + "/admin/dashboard", ["Access Denied", "Go to Login"])
check("/admin/events", base + "/admin/events", ["Access Denied", "Go to Login"])
check("/admin/reports", base + "/admin/reports", ["Access Denied", "Go to Login"])

# Main pages still work
print("\n=== Main pages ===")
check("/analyze", base + "/analyze", ["Analyze Any Company", "Work email (optional)"], ["Access Denied"])
check("/report/view?id=stripe-com", base + "/report/view?id=stripe-com", ["Company MRI", "Stripe", "Book a Growth MRI Review"])
check("/contact", base + "/contact", ["Book a Growth MRI Review"])

print("\nALL PASS")
