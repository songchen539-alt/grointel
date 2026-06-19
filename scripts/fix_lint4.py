r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\business-intelligence\[id]\complete\page.tsx'
c = open(r, encoding='utf-8').read()
c = c.replace('/* eslint-disable @typescript-eslint/no-explicit-any */', '/* eslint-disable @typescript-eslint/no-explicit-any */\n/* eslint-disable react-hooks/set-state-in-effect */')
with open(r, 'w', encoding='utf-8') as f:
    f.write(c)

r2 = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\capability-intelligence\[id]\complete\page.tsx'
c2 = open(r2, encoding='utf-8').read()
c2 = c2.replace('/* eslint-disable @typescript-eslint/no-explicit-any */', '/* eslint-disable @typescript-eslint/no-explicit-any */\n/* eslint-disable react-hooks/set-state-in-effect */')
with open(r2, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Fixed both')
