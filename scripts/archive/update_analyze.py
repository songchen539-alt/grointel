path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\analyze\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Title and subtitle
c = c.replace(
    'Analyze Any Company',
    'Generate an AI Company MRI'
)
c = c.replace(
    'Enter a company website to generate a Company MRI with opportunities, risks, signals and growth recommendations.',
    'Enter a company website and GroIntel will analyze public growth signals, market readiness, risks, opportunities, and recommended next actions.'
)

# Placeholder
c = c.replace(
    'placeholder="Enter company website..."',
    'placeholder="https://example.com"'
)

# Email placeholder
c = c.replace(
    'placeholder="Work email (optional)"',
    'placeholder="you@company.com"'
)
# Company placeholder
c = c.replace(
    'placeholder="Company (optional)"',
    'placeholder="Your company"'
)
# Role placeholder
c = c.replace(
    'placeholder="Your role (optional)"',
    'placeholder="Founder, CEO, Growth Lead..."'
)

# Button text - both instances (loading and normal)
c = c.replace(
    'Analyze Company',
    'Generate Company MRI'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated analyze page copy')
