path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\embedding\similarity.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace('import { MockEmbeddingProvider } from "./embedding";', 'import { MockEmbeddingProvider } from "./mock";')
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
