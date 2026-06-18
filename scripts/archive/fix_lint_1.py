import os

# Fix 1: matches/[id].tsx - unescaped entities in MatchQuotesSection
path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# The issue: `&quot;Quotes for This Match (&quot; + quotes.length + &quot;)` - curly quotes in JSX
# Fix: use JSX expression syntax
c = c.replace(
    'Quotes for This Match (" + quotes.length + ")',
    "Quotes for This Match ({quotes.length})"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed match quotes unescaped entities')
