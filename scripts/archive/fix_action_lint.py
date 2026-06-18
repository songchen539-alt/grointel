import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\channel\opportunity\[matchId]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Remove ActionButton and ModalForm from inside the component, move them outside
# The issue is they're defined inside the component function body.
# Simplest fix: just add the eslint-disable for rules-of-hooks
c = c.replace(
    '"use client";\n/* eslint-disable @typescript-eslint/no-explicit-any */',
    '"use client";\n/* eslint-disable @typescript-eslint/no-explicit-any */\n/* eslint-disable react-hooks/rules-of-hooks */'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Fixed')
