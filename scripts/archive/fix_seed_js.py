path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\scripts\seed-passports.js'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace('const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));', 'const sleep = (ms) => new Promise((r) => setTimeout(r, ms));')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
