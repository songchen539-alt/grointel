import os

files = {
    r'src\app\samples\page.tsx': r'''export default function SamplesPage() {
  useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);''',
    r'src\app\analyze\page.tsx': r'''export default function AnalyzePage() {
  useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);''',
    r'src\app\contact\page.tsx': r'''export default function ContactPage() {
  useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);''',
}

imports = {
    r'src\app\samples\page.tsx': 'import { useState, useEffect } from "react";\n',
    r'src\app\analyze\page.tsx': 'import { useState, useEffect } from "react";\n',
    r'src\app\contact\page.tsx': 'import { useState, useEffect } from "react";\n',
}

for path, new_def in files.items():
    full = os.path.join(r'C:\Users\LENOVO\.openclaw\workspace\grointel', path)
    with open(full, encoding='utf-8') as f:
        c = f.read()
    
    # Update import
    old_import = 'import { useState } from "react";'
    new_import = imports[path]
    c = c.replace(old_import, new_import)
    
    # Update function definition
    old_def = 'export default function SamplesPage() {' if 'samples' in path else \
              'export default function AnalyzePage() {' if 'analyze' in path else \
              'export default function ContactPage() {'
    c = c.replace(old_def, new_def)
    
    with open(full, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Fixed {path}')
