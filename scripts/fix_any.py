c = open(r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\report-leads\route.ts', encoding='utf-8').read()
c = c.replace(
    'const { error } = await (supabase.from("report_leads") as any).insert([lead]);',
    'const { error } = await (supabase.from("report_leads") as Record<string, unknown>).insert([lead]);'
)
open(r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\report-leads\route.ts', 'w', encoding='utf-8').write(c)
print('Fixed')
