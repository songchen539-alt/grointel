r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\core\cognitive_kernel\__tests__\kernel.test.ts'
c = open(r, encoding='utf-8').read()
c = c.replace('} catch (e: any) {', '} catch {')
c = c.replace('let received: any = null;', 'let received: Record<string, unknown> | null = null;')
with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed kernel test')
