import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add hybrid badge near the confidence/score area
c = c.replace(
    '<span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">Hybrid AI</span>',
    '<span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">Hybrid AI</span>'
)  # no-op, already correct

# Replace the score display to show hybrid score prominently
c = c.replace(
    'onClick={() => applyRec(rec)}',
    'onClick={() => applyRec(rec)}'
)

# The main change: update the score display area
# Find: rec.overallScore in the card template
# Replace the score badge
c = c.replace(
    '<span className={"text-xs font-bold ml-auto " + getConfidenceColor(rec.confidence)}>{rec.overallScore}</span>',
    '<span className="text-xs font-bold ml-auto text-blue-400">{rec.hybridScore ?? rec.overallScore}</span>'
)

# Update the score text
c = c.replace(
    '<span className="text-[10px] text-gray-500">Score: {rec.overallScore}</span>',
    '<span className="text-[10px] text-gray-500">Hybrid: {rec.hybridScore ?? rec.overallScore}</span>'
)

# Replace confidence badge with hybrid badge
c = c.replace(
    '<span className={"text-[10px] " + getConfidenceColor(rec.confidence)}>{rec.confidence}</span>',
    '<span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">Hybrid AI</span>'
)

# Add rule + semantic scores after solution type
c = c.replace(
    '{rec.recommendedSolutionType && <span className="text-[10px] text-gray-500">| {rec.recommendedSolutionType}</span>}',
    '{rec.recommendedSolutionType && <span className="text-[10px] text-gray-500">| {rec.recommendedSolutionType}</span>}\n                    <div className="flex gap-2 mt-0.5">\n                      <span className="text-[9px] text-gray-600">Rule: {rec.ruleScore ?? "?"}</span>\n                      <span className="text-[9px] text-gray-600">Semantic: {rec.embeddingScore ?? "?"}</span>\n                    </div>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated frontend cards')
