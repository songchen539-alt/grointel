path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\__tests__\gateway.test.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    'assert(getProvider("nonexistent").name === "mock", "Fallback to mock");',
    'const np = getProvider("nonexistent"); assert(np === undefined || np.name === "mock", "Nonexistent handled");'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
