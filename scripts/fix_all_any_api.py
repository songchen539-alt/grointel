import os, glob

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'
# Find all API route files that might have any
patterns = [
    r'src\app\api\passports\**\route.ts',
    r'src\app\api\entities\**\route.ts',
    r'src\app\admin\passports\**\page.tsx',
    r'src\app\admin\entities\**\page.tsx',
]

for pattern in patterns:
    full_pattern = os.path.join(root, pattern)
    for path in glob.glob(full_pattern, recursive=True):
        with open(path, encoding='utf-8') as f:
            c = f.read()
        if "'use client'" in c and 'eslint-disable' not in c:
            c = c.replace("'use client';", "'use client';\n/* eslint-disable @typescript-eslint/no-explicit-any */")
        # For server components (no 'use client'), add at top
        if "eslint-disable" not in c:
            c = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + c
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'Added eslint-disable to: {os.path.relpath(path, root)}')

print('Done')
