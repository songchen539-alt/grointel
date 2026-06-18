path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\admin\channels\[id]\services\route.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'return { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };',
    'return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
