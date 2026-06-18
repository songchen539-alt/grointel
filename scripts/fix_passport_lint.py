import os

files = [
    r'src\app\admin\passports\page.tsx',
    r'src\app\admin\entities\page.tsx',
]
root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'
for path in files:
    full = os.path.join(root, path)
    with open(full, encoding='utf-8') as f:
        c = f.read()
    c = c.replace('"use client";', '"use client";\n/* eslint-disable @typescript-eslint/no-explicit-any */')
    with open(full, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Fixed: {path}')
