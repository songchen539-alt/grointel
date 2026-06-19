r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\knowledge\start\route.ts'
c = open(r, encoding='utf-8').read()
old = 'if (!sr.ok) return NextResponse.json({ success: false, error: "Session create failed" }, { status: 500 });'
new_ = 'if (!sr.ok) { const eb = await sr.text(); return NextResponse.json({ success: false, error: "Session create failed: " + sr.status + " " + eb.slice(0,200) }, { status: 500 }); }'
c = c.replace(old, new_)
with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')
