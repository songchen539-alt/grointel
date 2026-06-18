path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\scripts\seed-passports.js'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace('const api = async (url: string, opts: any = {}) => {', 'const api = async (url, opts = {}) => {')
c = c.replace('.find((x: any) => x.slug === e.slug)', '.find((x) => x.slug === e.slug)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
