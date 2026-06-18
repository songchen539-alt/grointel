path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect, Suspense } from "react";\nexport const dynamic = "force-dynamic";'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
