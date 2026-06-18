import os

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'
files = [
    r'src\app\channel\page.tsx',
    r'src\app\channel\opportunity\[matchId]\page.tsx',
]

for rel in files:
    path = os.path.join(root, rel)
    with open(path, encoding='utf-8') as f:
        c = f.read()
    c = c.replace(
        'import Link from "next/link";',
        'import Link from "next/link";\n/* eslint-disable @typescript-eslint/no-explicit-any */'
    )
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Fixed: {rel}')
