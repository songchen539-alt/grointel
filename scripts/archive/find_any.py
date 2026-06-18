import os

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src'
count = 0
for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if not f.endswith('.ts') and not f.endswith('.tsx'):
            continue
        path = os.path.join(dirpath, f)
        try:
            with open(path, encoding='utf-8') as fh:
                content = fh.read()
            if ': any' in content and 'eslint-disable' not in content:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    stripped = line.strip()
                    if ': any' in stripped and 'eslint-disable' not in stripped:
                        count += 1
                        if count <= 10:
                            print(f'{os.path.relpath(path, root)}:{i+1}: {stripped[:100]}')
        except:
            pass

if count > 10:
    print(f'... and {count - 10} more')
