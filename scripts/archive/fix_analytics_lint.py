import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\analytics\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add file-level eslint-disable for no-explicit-any
c = c.replace(
    '/* eslint-disable @typescript-eslint/no-explicit-any */\nimport { cookies } from "next/headers";',
    'import { cookies } from "next/headers";'
)
c = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + c

# Also fix the funnel interface issue
c = c.replace(
    'interface FunnelItem { label: string; count: number; conversion?: string; dropoff?: string; }\nconst funnelSteps: FunnelItem[] = [',
    'const funnelSteps = ['
)
# Add interface
c = c.replace(
    'const funnelSteps = [',
    'interface FunnelItem { label: string; count: number; conversion?: string; dropoff?: string; }\nconst funnelSteps: FunnelItem[] = ['
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
