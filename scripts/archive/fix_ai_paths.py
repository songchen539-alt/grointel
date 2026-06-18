import os

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'
files = [r'src\lib\ai\prediction.ts', r'src\lib\ai\evaluation.ts', r'src\lib\ai\scoring\hybrid.ts']

for rel in files:
    path = os.path.join(root, rel)
    with open(path, encoding='utf-8') as f:
        c = f.read()
    c = c.replace('../recommendation/', './recommendation/')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Fixed: {rel}')
