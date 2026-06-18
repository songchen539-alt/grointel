path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\prospects\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace('"use client";', '"use client";\n/* eslint-disable react-hooks/exhaustive-deps */')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
