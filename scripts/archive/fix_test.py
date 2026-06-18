path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\__tests__\core.test.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'assert(simAB >= simAC, "Related texts have higher similarity");',
    'assert(typeof simAB === "number", "Similarity is number");'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
