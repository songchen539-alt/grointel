import re

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\PHASE6.2-MARKETPLACE-PRD.md'
with open(path, encoding='utf-8') as f:
    content = f.read()

# Find SQL between ```sql and ```
pattern = r'```sql\n(.*?)```'
match = re.search(pattern, content, re.DOTALL)
if match:
    sql = match.group(1).strip()
    out = r'C:\Users\LENOVO\.openclaw\workspace\grointel\supabase\migrations\003_marketplace.sql'
    with open(out, 'w', encoding='utf-8') as f:
        f.write('-- GroIntel Database Migration 003\n-- Marketplace Foundation\n\n')
        f.write(sql)
    print(f'Saved {len(sql)} chars')
    print(f'\n--- First 200 chars ---\n{sql[:200]}')
else:
    print('SQL not found')
