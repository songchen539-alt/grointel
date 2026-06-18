path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# The confidenceColor function has a type annotation
c = c.replace('function confidenceColor(c: string) {', 'function getConfidenceColor(c: string) {')

# Rename useRec to applyRec to avoid hooks naming
c = c.replace('function useRec(rec: any) {', 'function applyRec(rec: any) {')
c = c.replace('onClick={() => useRec(rec)}', 'onClick={() => applyRec(rec)}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
