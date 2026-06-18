path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\contact\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

old = '''  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSource(params.get("source") || "");
    setReportId(params.get("reportId") || "");
  }, []);'''

new = '''  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("source") || "";
    const r = params.get("reportId") || "";
    let changed = false;
    if (s !== source) { setSource(s); changed = true; }
    if (r !== reportId) { setReportId(r); changed = true; }
  }, [source, reportId]);'''

c = c.replace(old, new)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
