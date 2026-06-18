path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\matches\new\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace specific any declarations
c = c.replace('const [needs, setNeeds] = useState<any[]>([]);', 'const [needs, setNeeds] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any')
c = c.replace('const [channels, setChannels] = useState<any[]>([]);', 'const [channels, setChannels] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any')
c = c.replace('const [aiRecs, setAiRecs] = useState<any[]>([]);', 'const [aiRecs, setAiRecs] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any')
c = c.replace('const [aiError, setAiError] = useState("");', 'const [aiError, setAiError] = useState("");')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
