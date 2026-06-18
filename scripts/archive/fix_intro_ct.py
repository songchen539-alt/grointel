import os
root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'

routes = [
    r'src\app\api\growth-options\request-intro\route.ts',
    r'src\app\api\admin\quotes\route.ts',
    r'src\app\api\admin\quotes\[id]\route.ts',
]

old = 'return { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };'
new = 'return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };'

for rel in routes:
    path = os.path.join(root, rel)
    with open(path, encoding='utf-8') as f:
        c = f.read()
    if old in c:
        c = c.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'FIXED: {rel}')
    else:
        print(f'OK (already has CT or not needed): {rel}')

print('Done')
