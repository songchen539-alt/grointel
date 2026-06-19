r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\knowledge\start\route.ts'
c = open(r, encoding='utf-8').read()
c = c.replace('const firstQuestion = generateNextQuestion(knowledgeObj);', 'const firstQuestion = generateNextQuestion(knowledgeObj, b.profileType);')
c = c.replace('const overallConfidence = calculateOverallConfidence(knowledgeObj);', 'const overallConfidence = calculateOverallConfidence(knowledgeObj, b.profileType);')
with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed start route')
