r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\check-tables\route.ts'
c = open(r, encoding='utf-8').read()
c = c.replace('error: e.message }', 'error: "Failed" }')
with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
