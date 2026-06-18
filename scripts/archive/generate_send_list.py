import urllib.request, json, sys

base = "https://grointel.vercel.app"

# Fetch all prospects
print("Fetching prospects...")
req = urllib.request.Request(base + "/api/admin/prospects")
resp = urllib.request.urlopen(req, timeout=15)
body = json.loads(resp.read().decode())

all_prospects = body.get("prospects", [])
phase6_prospects = [p for p in all_prospects if p.get("notes") == "Phase 6 initial outbound campaign"]
phase6_priority = {p["id"]: p["priority"] for p in phase6_prospects}

print(f"Total prospects: {len(all_prospects)}")
print(f"Phase 6 prospects: {len(phase6_prospects)}")

# Also try to get by checking the created ones
# Fallback: use all if none match phase6 notes
if len(phase6_prospects) < 30:
    print("Notes filter didn't match, using all prospects sorted by priority...")
    # The earlier ones (with priority) were the Phase 6 ones
    phase6_prospects = all_prospects

# Fetch details for each
detailed = []
for p in phase6_prospects:
    try:
        req = urllib.request.Request(base + "/api/admin/prospects/" + p["id"])
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode())
        detailed.append(data.get("prospect", p))
    except:
        detailed.append(p)

# Sort by priority: A first, then B, then C
def sort_key(p):
    pri = p.get("priority", "C")
    return {"A": 0, "B": 1, "C": 2}.get(pri, 3)

detailed.sort(key=sort_key)

a_list = [p for p in detailed if p.get("priority") == "A"]
b_list = [p for p in detailed if p.get("priority") == "B"]
c_list = [p for p in detailed if p.get("priority") == "C"]

print(f"A: {len(a_list)}, B: {len(b_list)}, C: {len(c_list)}")

# Generate send list markdown
lines = []
lines.append("# GroIntel Phase 6 Outbound Send List")
lines.append("")
lines.append(f"*Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M UTC')}*")
lines.append("")
lines.append("## Summary")
lines.append("")
lines.append(f"* Total prospects: {len(detailed)}")
lines.append(f"* Reports generated: {len([p for p in detailed if p.get('report_id')])}")
lines.append(f"* Messages generated: {len([p for p in detailed if p.get('outbound_message')])}")
lines.append(f"* A priority: {len(a_list)}")
lines.append(f"* B priority: {len(b_list)}")
lines.append(f"* C priority: {len(c_list)}")
lines.append("")

lines.append("---")
lines.append("")
lines.append("## Send Today - Priority A")
lines.append("")

for p in a_list:
    cname = p.get("company_name", "Unknown")
    website = p.get("website", "")
    category = p.get("category", "")
    pid = p.get("id", "")
    rid = p.get("report_id", "")
    msg = p.get("outbound_message", "")
    
    lines.append(f"### {cname}")
    lines.append("")
    lines.append(f"**Website:** {website}")
    lines.append(f"**Category:** {category}")
    lines.append(f"**Priority:** A")
    lines.append("")
    lines.append(f"**Report URL:**")
    lines.append(f"https://grointel.vercel.app/report/view?id={rid}&prospectId={pid}")
    lines.append("")
    lines.append(f"**Admin:**")
    lines.append(f"https://grointel.vercel.app/admin/prospects/{pid}")
    lines.append("")

    # Extract subject from message
    if msg:
        first_line = msg.split("\\n")[0] if "\\n" in msg else msg.split("\n")[0]
        lines.append(f"**Subject:** {first_line.replace('Subject: ', '')}")
        lines.append("")
        lines.append("**Message:**")
        lines.append("```")
        lines.append(msg)
        lines.append("```")
    else:
        lines.append("*No message generated*")
    lines.append("")
    lines.append("---")
    lines.append("")

lines.append("")
lines.append("## Send Later - Priority B")
lines.append("")

for p in b_list:
    cname = p.get("company_name", "Unknown")
    pid = p.get("id", "")
    rid = p.get("report_id", "")
    msg = p.get("outbound_message", "")
    
    lines.append(f"### {cname}")
    lines.append(f"**Website:** {p.get('website', '')}")
    lines.append(f"**Category:** {p.get('category', '')}")
    lines.append(f"**Priority:** B")
    lines.append(f"**Report URL:** https://grointel.vercel.app/report/view?id={rid}&prospectId={pid}")
    lines.append(f"**Admin:** https://grointel.vercel.app/admin/prospects/{pid}")
    if msg:
        first_line = msg.split("\\n")[0] if "\\n" in msg else msg.split("\n")[0]
        lines.append(f"**Subject:** {first_line.replace('Subject: ', '')}")
    lines.append("")
    lines.append("---")
    lines.append("")

lines.append("")
lines.append("## Follow Up Later - Priority C")
lines.append("")

for p in c_list:
    cname = p.get("company_name", "Unknown")
    pid = p.get("id", "")
    rid = p.get("report_id", "")
    
    lines.append(f"### {cname}")
    lines.append(f"**Website:** {p.get('website', '')}")
    lines.append(f"**Category:** {p.get('category', '')}")
    lines.append(f"**Priority:** C")
    lines.append(f"**Report URL:** https://grointel.vercel.app/report/view?id={rid}&prospectId={pid}")
    lines.append(f"**Admin:** https://grointel.vercel.app/admin/prospects/{pid}")
    lines.append("")
    lines.append("---")
    lines.append("")

content = "\n".join(lines)
with open(r"C:\Users\LENOVO\.openclaw\workspace\grointel\phase6-outbound-send-list.md", "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nWritten {len(detailed)} prospects to phase6-outbound-send-list.md")
print("DONE")
