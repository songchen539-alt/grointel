path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\ai\providers\registry.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace getProvider and getAvailableProviders to use a simple init flag
old_code = """let initialized = false;
function ensureInit(): void {
  if (!initialized) { initialized = true; initializeRegistry(); }
}

export function getProvider(name: string): AIProvider {
  ensureInit();
  return registry.get(name) || registry.get("mock")!;
}

export function getAvailableProviders(): string[] {
  ensureInit();
  return Array.from(registry.keys());
}"""

new_code = """export function getProvider(name: string): AIProvider {
  initializeRegistry();
  return registry.get(name) || registry.get("mock")!;
}

export function getAvailableProviders(): string[] {
  initializeRegistry();
  return Array.from(registry.keys());
}"""

if old_code in c:
    c = c.replace(old_code, new_code)
    print('Fixed with simple approach')
else:
    # Try the current code
    old_current = """export function getProvider(name: string): AIProvider {
  if (registry.size === 0) initializeRegistry();
  return registry.get(name) || registry.get("mock")!;
}

export function getAvailableProviders(): string[] {
  if (registry.size === 0) initializeRegistry();
  return Array.from(registry.keys());
}"""
    if old_current in c:
        c = c.replace(old_current, new_code)
        print('Fixed with simple approach (current)')
    else:
        print('Could not find code to replace')
        print(c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
