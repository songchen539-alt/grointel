path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\quotes\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '      setSelectedMatch(m); // eslint-disable-line react-hooks/exhaustive-deps',
    '      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setSelectedMatch(m);'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
