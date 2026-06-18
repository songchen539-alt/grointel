path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\contact\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

old = '''    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }'''

new = '''    if (result.success) {
      try {
        fetch("/api/reports/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: reportId || "unknown",
            eventType: "contact_submitted",
            metadata: { source, reportId: reportId || "unknown", email, companyWebsite: website, timestamp: new Date().toISOString() }
          }),
        });
      } catch {}
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }'''

c = c.replace(old, new)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated contact page with event tracking')
