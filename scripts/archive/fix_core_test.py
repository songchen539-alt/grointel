path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\__tests__\core.test.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace('../embedding/embedding', '../embedding/mock')
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
