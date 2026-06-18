path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\learning\metrics.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    'export function compareEngines(',
    'function compareEngines('
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
