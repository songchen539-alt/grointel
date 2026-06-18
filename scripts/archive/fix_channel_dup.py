path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\channels\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'import Link from "next/link";\nimport { useParams } from "next/navigation";',
    'import Link from "next/link";'
)
c = c.replace(
    'import { useParams } from "next/navigation";\nimport { useParams } from "next/navigation";',
    'import { useParams } from "next/navigation";'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
