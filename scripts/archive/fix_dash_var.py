path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\dashboard\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'channelServicesCount, matchesCount]',
    'channelServicesCount, matchesCount, quotesCount]'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
