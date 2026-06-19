r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\intelligence\goalIntelligence.ts'
c = open(r, encoding='utf-8').read()

# Fix any casts
c = c.replace(
    '((businessKnowledge.business_identity as any)?.industry || "").toLowerCase();',
    '((businessKnowledge.business_identity as Record<string, unknown>)?.industry as string || "").toLowerCase();'
)
c = c.replace(
    'const goals = (businessKnowledge.goals as string[]) || [];',
    'const goals = (businessKnowledge.goals as unknown as string[]) || [];'
)
c = c.replace(
    'const market = (businessKnowledge.market as any)?.overview || [];',
    'const market = (businessKnowledge.market as Record<string, unknown>)?.overview as string[] || [];'
)

with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed goalIntelligence')
