path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\[id]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Fix the duplicate closing divs
c = c.replace(
    '        </div>\n      </div>\n    </div>\n\n      <MatchQuotesSection',
    '        </div>\n      </div>\n\n      <MatchQuotesSection'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
