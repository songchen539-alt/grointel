path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\growth-options\view\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'if (!needId) { setLoading(false); return; }',
    'if (!needId) { setLoading(false); return; } // eslint-disable-line react-hooks/set-state-in-effect'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
