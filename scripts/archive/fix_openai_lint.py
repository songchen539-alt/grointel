path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\embedding\openai.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '.sort((a: any, b: any) => a.index - b.index)',
    '.sort((a: { index: number }, b: { index: number }) => a.index - b.index)'
)
c = c.replace(
    '.map((item: any) => item.embedding || [])',
    '.map((item: { embedding?: number[] }) => item.embedding || [])'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
