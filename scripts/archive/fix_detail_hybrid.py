import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matching\recommendations\[growthNeedId]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace the score display
c = c.replace(
    '{rec.overallScore}</span>',
    '{rec.hybridScore ?? rec.overallScore}</span>'
)

# Add hybrid formula next to confidence
c = c.replace(
    '{rec.confidence}</span>',
    '{rec.confidence}</span>\n              <span className="text-[10px] text-gray-500 ml-2">Formula: Rule 80% + Semantic 20%</span>'
)

# Add rule/semantic scores before Reasons section
c = c.replace(
    '<p className="text-[10px] text-gray-500 uppercase">Reasons</p>',
    '<div className="flex gap-4 mb-2">\n                <div><span className="text-[10px] text-gray-500">Rule Score:</span> <span className="text-sm font-bold text-emerald-400">{rec.ruleScore ?? "?"}</span></div>\n                <div><span className="text-[10px] text-gray-500">Semantic:</span> <span className="text-sm font-bold text-amber-400">{rec.embeddingScore ?? "?"}</span></div>\n              </div>\n              <p className="text-[10px] text-gray-500 uppercase">Reasons</p>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated detail page')
