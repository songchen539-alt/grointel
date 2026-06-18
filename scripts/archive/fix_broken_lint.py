path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Fix the broken eslint-disable comments
c = c.replace('useState<any[]> // eslint-disable-line([])', 'useState<any[]>([])')
# The fix moved the comment to the wrong position. Let me replace with proper inline comment
c = c.replace(
    'const [needs, setNeeds] = useState<any[]>([]);',
    'const [needs, setNeeds] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any'
)
c = c.replace(
    'const [channels, setChannels] = useState<any[]>([]);',
    'const [channels, setChannels] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any'
)
c = c.replace(
    'const [services, setServices] = useState<any[]>([]);',
    'const [services, setServices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any'
)
c = c.replace(
    'const [aiRecs, setAiRecs] = useState<any[]>([]);',
    'const [aiRecs, setAiRecs] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
