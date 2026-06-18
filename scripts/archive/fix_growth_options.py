path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\growth-options\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect, Suspense } from "react";\n\nexport const dynamic = "force-dynamic";'
)

c = c.replace(
    'export default function GrowthOptionsPage() {',
    'export default function GrowthOptionsPage() {\n  return <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16" />}><GrowthOptionsForm /></Suspense>;\n}\n\nfunction GrowthOptionsForm() {'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
