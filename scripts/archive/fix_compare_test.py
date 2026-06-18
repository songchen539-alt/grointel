path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\__tests__\all.test.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    'assert(comparison.length > 0, "Comparison results");',
    'assert(Object.keys(comparison).length > 0, "Comparison results");'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
