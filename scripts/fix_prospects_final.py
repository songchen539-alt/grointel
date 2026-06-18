import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\prospects\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace the useEffect-only approach with a function + useEffect
old = '''  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/prospects")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setProspects(data.prospects || []);
        } else {
          setError(data.error || "Failed to load");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load prospects. Table may not exist yet.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);'''

new_block = '''  const loadProspects = () => {
    fetch("/api/admin/prospects")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProspects(data.prospects || []);
        } else {
          setError(data.error || "Failed to load");
        }
      })
      .catch(() => {
        setError("Failed to load prospects. Table may not exist yet.");
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => { loadProspects(); }, []);'''

c = c.replace(old, new_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
