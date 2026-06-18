path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\__tests__\all.test.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    'import { computeMetrics, compareEngines } from "../learning/metrics";',
    'import { computeMetrics } from "../learning/metrics";\nimport { compareEngines } from "../evaluation";'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
