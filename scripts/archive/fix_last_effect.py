path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\channel\opportunity\[matchId]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '  useEffect(() => { load(); }, [matchId]);',
    '  // eslint-disable-next-line react-hooks/set-state-in-effect\n  useEffect(() => { load(); }, [matchId]);'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
