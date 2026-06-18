import os

fixes = {
    r'src\app\samples\page.tsx': (
        '  useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);\\n  useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);',
        '  useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);'
    ),
    r'src\app\analyze\page.tsx': (
        '  useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);\\n  useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);',
        '  useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);'
    ),
    r'src\app\contact\page.tsx': (
        '  useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);\\n  useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);',
        '  useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);'
    ),
}

root = r'C:\Users\LENOVO\.openclaw\workspace\grointel'

for path, (old, new_val) in fixes.items():
    full = os.path.join(root, path)
    with open(full, encoding='utf-8') as f:
        c = f.read()
    # The PowerShell Set-Content put literal \n 
    c = c.replace(old, new_val)
    # Also try with actual double-useEffect
    c = c.replace(
        'useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);\n  useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);',
        'useEffect(() => { document.title = "Sample Company MRI Reports - GroIntel"; }, []);'
    )
    c = c.replace(
        'useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);\n  useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);',
        'useEffect(() => { document.title = "Generate an AI Company MRI - GroIntel"; }, []);'
    )
    c = c.replace(
        'useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);\n  useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);',
        'useEffect(() => { document.title = "Book a Growth MRI Review - GroIntel"; }, []);'
    )
    with open(full, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Fixed {path}')
