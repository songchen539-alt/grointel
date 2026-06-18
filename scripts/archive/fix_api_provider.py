path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\admin\matching\recommend\route.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add provider metadata to each recommendation in the map
c = c.replace(
    'recommendedSolutionType: r.recommendedSolutionType,',
    'recommendedSolutionType: r.recommendedSolutionType,\n        embeddingProvider: r.embeddingProvider,\n        embeddingModel: r.embeddingModel,\n        fallbackUsed: r.fallbackUsed,'
)

# Add provider metadata to the response
old_response = 'return NextResponse.json({ success: true, growthNeed: rn, recommendations: top5, scoringMode: "hybrid" });'
new_response = 'const { getProviderMetadata } = await import("@/lib/ai/embedding/factory");\n  const pm = getProviderMetadata();\n  return NextResponse.json({ success: true, growthNeed: rn, recommendations: top5, scoringMode: "hybrid", embeddingProvider: pm.provider, embeddingModel: pm.model, fallbackUsed: pm.fallbackUsed });'
c = c.replace(old_response, new_response)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated API route')
