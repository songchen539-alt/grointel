import urllib.request, ssl

base = "https://grointel.vercel.app"

def test(label, url, expected_terms, absent_terms=None):
    r = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(r, timeout=15)
        html = resp.read().decode()
        for t in expected_terms:
            ok = "PASS" if t in html else "FAIL"
            print(f"  '{t}': {ok}")
        if absent_terms:
            for t in absent_terms:
                ok = "PASS" if t not in html else "FAIL"
                print(f"  '{t}' (absent): {ok}")
    except urllib.error.HTTPError as e:
        print(f"  Status {e.code}")

# Admin pages should show password gate (no auth cookie)
print("=== /admin/dashboard (no auth -> password gate) ===")
test("dashboard", base + "/admin/dashboard", ["Admin Access", "Enter the admin password"], ["Total Reports", "Total Leads"])

print("\n=== /admin/leads (no auth -> password gate) ===")
test("leads", base + "/admin/leads", ["Admin Access", "Enter the admin password"], ["Leads"])

print("\n=== /admin/events (no auth -> password gate) ===")
test("events", base + "/admin/events", ["Admin Access", "Enter the admin password"], ["Events"])

print("\n=== /admin/reports (no auth -> password gate) ===")
test("reports", base + "/admin/reports", ["Admin Access", "Enter the admin password"], ["Reports"])

# Check main pages still work
print("\n=== /analyze still works ===")
test("analyze", base + "/analyze", ["Analyze Any Company", "Work email (optional)"])

print("\n=== /report/view?id=stripe-com still works ===")
test("report", base + "/report/view?id=stripe-com", ["Company MRI", "Stripe", "Overall Company Score", "Book a Growth MRI Review"])

print("\n=== /contact still works ===")
test("contact", base + "/contact", ["Book a Growth MRI Review"])
