import re

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\report\view\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# 1. Remove the inline LeadForm function
# Find the function start
start = c.find('function LeadForm({ reportId, companyName }: { reportId: string; companyName: string })')
if start > 0:
    depth = 0
    for i in range(start, len(c)):
        if c[i] == '{':
            depth += 1
        elif c[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                c = c[:start] + c[end:]
                break

# 2. Make LeadForm import from components
c = c.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport LeadForm from "@/components/LeadForm";'
)

# 3. Remove Check and Send from the lucide-react import
c = c.replace(
    'Globe, ArrowRight, Check, Send',
    'Globe, ArrowRight'
)

# 4. Replace <LeadForm /> with proper usage
c = c.replace('<LeadForm />', '<LeadForm reportId={reportId} companyName="Stripe" />')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done - inline LeadForm removed, import added')
