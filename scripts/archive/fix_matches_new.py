path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'export const dynamic = "force-dynamic";',
    'export const dynamic = "force-dynamic";\nimport { Suspense } from "react";'
)

# Find the actual location where useSearchParams is used
# It's CreateMatchPage component. Let me wrap it
c = c.replace(
    'export default function CreateMatchPage() {',
    'export default function CreateMatchPage() {\n  return <Suspense fallback={<div className="p-8" />}><CreateMatchForm /></Suspense>;\n}\n\nfunction CreateMatchForm() {'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
