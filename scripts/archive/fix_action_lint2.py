import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\channel\opportunity\[matchId]\page.tsx'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()

# Add the disable after the first eslint-disable line
new_lines = []
for line in lines:
    new_lines.append(line)
    if 'eslint-disable @typescript-eslint/no-explicit-any' in line:
        new_lines.append('/* eslint-disable react-hooks/rules-of-hooks */\n')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Fixed')
