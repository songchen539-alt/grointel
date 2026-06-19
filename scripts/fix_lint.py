r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\run-migrations\route.ts'
c = open(r, encoding='utf-8').read()
c = c.replace('} catch (e: any) {', '} catch {')
with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed run-migrations')
