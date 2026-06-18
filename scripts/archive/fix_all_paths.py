import os, glob

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai'
for f in glob.glob(os.path.join(root, '**/*.ts'), recursive=True):
    with open(f, encoding='utf-8') as fh:
        c = fh.read()
    original = c
    c = c.replace('../recommendation/', './recommendation/')
    c = c.replace('../learning/', './learning/')
    c = c.replace('../embedding/', './embedding/')
    c = c.replace('../ranking/', './ranking/')
    c = c.replace('../common/', './common/')
    if c != original:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(c)
        print(f'Fixed: {f}')
