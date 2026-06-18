path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\prospects\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace the loadProspects function + useEffect with inline useEffect
old_start = '  async function loadProspects() {'
old_end = '  useEffect(() => { loadProspects(); }, []);'

# Find the block
start = c.find(old_start)
end_section = c.find(old_end, start)
if start >= 0 and end_section >= 0:
    # Find end of the useEffect block
    end = end_section + len(old_end)
    
    new_block = '''  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/prospects");
        const data = await res.json();
        if (data.success) {
          setProspects(data.prospects || []);
        } else {
          setError(data.error || "Failed to load");
        }
      } catch {
        setError("Failed to load prospects. Table may not exist yet.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);'''

    c = c[:start] + new_block + c[end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
