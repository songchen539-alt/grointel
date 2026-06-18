path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\contact\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Subtitle
c = c.replace(
    'Tell us more about your company and we will set up a personalized Growth MRI Review.',
    'Share your company details and our team will review your growth signals, risks, opportunities, and next best actions.'
)

# Message placeholder
c = c.replace(
    'placeholder="Tell us about your growth challenges and goals..."',
    'placeholder="Tell us what you want to understand - growth readiness, market expansion, competitor pressure, hiring momentum, or sales opportunities."'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated contact page copy')
