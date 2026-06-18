import os

routes = [
    r"src\app\api\admin\matches\route.ts",
    r"src\app\api\admin\quotes\route.ts",
    r"src\app\api\admin\quotes\[id]\route.ts",
    r"src\app\api\admin\matches\[id]\route.ts",
    r"src\app\api\admin\growth-needs\[id]\route.ts",
    r"src\app\api\admin\growth-channels\[id]\route.ts",
    r"src\app\api\admin\growth-needs\route.ts",
    r"src\app\api\admin\growth-channels\route.ts",
    r"src\app\api\admin\channel-services\[serviceId]\route.ts",
]

root = r"C:\Users\LENOVO\.openclaw\workspace\grointel"
old_sb = 'return { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };'
new_sb = 'return { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": "Bearer " + serviceKey };'

for rel in routes:
    path = os.path.join(root, rel)
    if not os.path.exists(path):
        print(f"SKIP: {rel} not found")
        continue
    with open(path, encoding="utf-8") as f:
        c = f.read()
    if "Content-Type" not in c and old_sb in c:
        c = c.replace(old_sb, new_sb)
        with open(path, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"FIXED: {rel}")
    else:
        print(f"OK: {rel}")

print("\nAll done")
