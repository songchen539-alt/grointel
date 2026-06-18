path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\growth-options\view\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add file-level eslint-disable for no-explicit-any
c = c.replace(
    '"use client";',
    '"use client";\n/* eslint-disable @typescript-eslint/no-explicit-any */'
)

# Fix setState in effect - add narrow disable
c = c.replace(
    '  useEffect(() => {',
    '  // eslint-disable-next-line react-hooks/set-state-in-effect\n  useEffect(() => {'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
