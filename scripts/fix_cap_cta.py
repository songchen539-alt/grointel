r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\capability-intelligence\[id]\page.tsx'
with open(r, encoding='utf-8') as f:
    c = f.read()

old = 'Create Growth Passport (coming soon)'
new_link = 'Complete Capability Understanding'

# Find the button with "Create Growth Passport" text and replace the whole button wrapper
import re
# Replace the button that contains "Create Growth Passport" with a link to /complete
pattern = r'<button[^>]*>\s*Create Growth Passport \(coming soon\)\s*</button>'
replacement = '<Link href={"/capability-intelligence/" + (profile?.id || "") + "/complete"} className="rounded-lg bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15 transition-colors w-full sm:w-auto text-center">Complete Capability Understanding</Link>'
c = re.sub(pattern, replacement, c)

with open(r, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed CTA')
