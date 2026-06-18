path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\leads\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace('const store = cookies();', 'const store = await cookies();')
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
