path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\providers\registry.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    'return registry.get(name) || registry.get("mock")!;',
    'if (registry.has(name)) return registry.get(name)!;\n  if (registry.has("mock")) return registry.get("mock")!;\n  const { MockAIProvider } = await import("./mock");\n  const m = new MockAIProvider();\n  registerProvider("mock", m);\n  return m;'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed registry')
