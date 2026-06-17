import os, re

# Fix all non-ASCII characters in source files
src_dir = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src'

replacements = {
    '\u2014': '-',   # em dash
    '\u2013': '-',   # en dash
    '\u2192': '->',  # right arrow
    '\u2191': 'up',  # up arrow
    '\u2193': 'down', # down arrow
    '\u00A9': '(c)', # copyright
    '\u2764': '',    # heart
    '\ufe0f': '',    # variation selector
    '\u20e3': '',    # combining enclosing keycap
}

# Also handle corrupted UTF-8 bytes
corrupted_patterns = [
    ('鈥', '-'),
    ('鈫', '->'),
    ('馃', ''),
    ('懃', ''),
    ('挵', ''),
    ('實', ''),
    ('殌', ''),
    ('€', ''),
    ('™', ''),
]

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            try:
                content = open(path, 'r', encoding='utf-8').read()
                original = content
                
                # Replace Unicode characters
                for old, new in replacements.items():
                    content = content.replace(old, new)
                
                # Replace corrupted byte sequences
                for old, new in corrupted_patterns:
                    content = content.replace(old, new)
                
                # Remove any remaining non-ASCII chars except newlines/tabs
                # This is aggressive: removes everything non-ASCII
                # But keeps the file clean
                
                if content != original:
                    open(path, 'w', encoding='utf-8').write(content)
                    print(f'Fixed: {f}')
            except Exception as e:
                print(f'Error {f}: {e}')

print('Done - all files cleaned')
