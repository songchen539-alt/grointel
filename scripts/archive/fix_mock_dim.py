path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\embedding\mock.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace('import { AI_CONFIG } from "../config";', 'import { MOCK_EMBEDDING_DIMENSION } from "../common/constants";')
c = c.replace('const DIMENSION = AI_CONFIG.EMBEDDING_DIMENSION;', 'const DIMENSION = MOCK_EMBEDDING_DIMENSION;')
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed mock.ts')
