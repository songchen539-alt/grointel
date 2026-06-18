path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\cie\calculateHealth.ts'
with open(path) as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if ' as any' in line or ': any' in line:
        print(f'{i+1}: {line.strip()[:100]}')
