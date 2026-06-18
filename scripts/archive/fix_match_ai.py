path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Fix React hooks naming conflict
c = c.replace('function confidenceColor(c) {', 'function getConfidenceColor(c) {')
c = c.replace('confidenceColor(rec.confidence)', 'getConfidenceColor(rec.confidence)')
c = c.replace('function useRecommendation(rec: any) {', 'function useRec(rec: any) {')
c = c.replace('onClick={() => useRecommendation(rec)}', 'onClick={() => useRec(rec)}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
