import os, re

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api'
found = []

for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if f != 'route.ts':
            continue
        path = os.path.join(dirpath, f)
        rel = os.path.relpath(path, root)
        with open(path, encoding='utf-8') as fh:
            content = fh.read()
        
        # Find all order= patterns
        for m in re.finditer(r'order=([a-z_]+)\.(desc|asc)', content):
            col = m.group(1)
            table_match = re.search(r'rest/v1/([a-z_]+)\?', content)
            table = table_match.group(1) if table_match else "?"
            print(f'{rel}: table={table} order={col}')
            found.append((rel, table, col))

print(f'\nTotal order clauses: {len(found)}')
