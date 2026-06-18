path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\report\view\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport { Suspense } from "react";'
)
c = c.replace(
    '<ReportViewClient reportId={reportId} companyName={companyName} />',
    '<Suspense fallback={<div className="h-40" />}><ReportViewClient reportId={reportId} companyName={companyName} /></Suspense>'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
