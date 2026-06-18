import os

root = r'src\app\admin'
for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if f.endswith('.tsx') and f != 'page.tsx':  # Skip the leads page (already has password gate)
            path = os.path.join(dirpath, f)
            with open(path, encoding='utf-8') as fh:
                c = fh.read()
            # Update Go to Login links
            c = c.replace(
                'href="/admin/leads" className="mt-6 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">Go to Login</Link>',
                'href="/admin/leads" className="mt-6 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">Go to Login</Link>'
            )
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(c)
print('Done - checked links')
