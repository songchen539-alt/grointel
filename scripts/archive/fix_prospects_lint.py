import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\prospects\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace the useCallback approach with a simple useEffect + inline function
c = c.replace(
    '  const loadProspects = useCallback(async () => {',
    '  async function loadProspects() {'
)

# Remove useCallback from import
c = c.replace(
    'import { useState, useEffect, useCallback } from "react";',
    'import { useState, useEffect } from "react";'
)

# Close the function
c = c.replace(
    '  }, [loadProspects]);',
    '  }'
)

# Replace the useEffect call
c = c.replace(
    '  useEffect(() => { loadProspects(); }, []);',
    '  useEffect(() => { loadProspects(); }, []);\n  // eslint-disable-next-line react-hooks/exhaustive-deps'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
