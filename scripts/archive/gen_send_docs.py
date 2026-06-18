import json

path = r"C:\Users\LENOVO\.openclaw\workspace\grointel\scripts\a_data.json"
with open(path, encoding="utf-8") as f:
    prospects = json.load(f)

personalizations = {
    "Perplexity": "Since Perplexity is competing in AI-native search, the growth signals around market readiness and competitive pressure may be especially useful for their go-to-market strategy.",
    "Clay": "Since Clay is already focused on GTM workflows, GroIntel may be relevant as an intelligence layer for account and market prioritization.",
    "Cursor": "Since Cursor is redefining the developer tooling space, the report's technology health and hiring momentum dimensions may offer timely strategic signals.",
    "Ramp": "Since Ramp operates in the fast-moving fintech/SaaS space, the report's expansion readiness and competition risk analysis could support their next growth phase.",
    "Vercel": "Since Vercel is the frontend cloud for AI-native applications, the market readiness and technology health scores may provide valuable benchmarking signals.",
    "Notion": "Since Notion continues to expand across enterprise and AI-powered workflows, the growth readiness and expansion insights may be relevant to their planning.",
    "Rippling": "Since Rippling is scaling across HR, IT, and finance, the report's multi-dimensional scoring may help identify untapped growth levers.",
    "ElevenLabs": "Since ElevenLabs is at the forefront of AI audio, the competitive signals and technology health dimensions may be especially actionable.",
    "Runway": "Since Runway is pioneering AI video generation, the technology signals and growth opportunity analysis could support their strategic roadmap.",
    "Mercor": "Since Mercor is transforming AI recruiting, the market readiness and hiring momentum dimensions may offer unique growth intelligence."
}

# --- Generate phase6-priority-a-send-today.md ---
lines = []
lines.append("# GroIntel Phase 6 -- Priority A Send Today")
lines.append("")
lines.append("## Sending Rules")
lines.append("")
lines.append("- Do not mass send.")
lines.append("- Send manually.")
lines.append("- Personalize the first line before sending.")
lines.append("- Send no more than 10 today.")
lines.append("- After sending, update prospect status to **contacted**.")
lines.append("- Watch for **opened** / **clicked_cta** / **replied** in admin dashboard.")
lines.append("")

for i, p in enumerate(prospects):
    cname = p.get("company_name", "Unknown")
    website = p.get("website", "")
    category = p.get("category", "")
    pid = p.get("id", "")
    rid = p.get("report_id", "")
    msg = p.get("outbound_message", "")
    
    lines.append("---")
    lines.append("")
    lines.append(f"## {i+1}. {cname}")
    lines.append("")
    lines.append(f"**Website:** {website}")
    lines.append(f"**Category:** {category}")
    lines.append("")
    lines.append(f"**Admin Link:**")
    lines.append(f"https://grointel.vercel.app/admin/prospects/{pid}")
    lines.append("")
    lines.append(f"**Report URL:**")
    lines.append(f"https://grointel.vercel.app/report/view?id={rid}&prospectId={pid}")
    lines.append("")
    
    if msg:
        parts = msg.split("\n", 1)
        subject_line = parts[0] if len(parts) > 0 else ""
        subject = subject_line.replace("Subject: ", "") if subject_line.startswith("Subject:") else subject_line
        body = parts[1] if len(parts) > 1 else msg
        lines.append("**Subject:**")
        lines.append(subject)
        lines.append("")
        lines.append("**Message:**")
        lines.append("```")
        lines.append(body.strip())
        lines.append("```")
    lines.append("")
    
    # Personalization
    pnote = personalizations.get(cname, "Consider adding a brief personalization note about why this company might benefit from GroIntel.")
    lines.append("**Manual Personalization Note:**")
    lines.append(pnote)
    lines.append("")
    
    lines.append("**Status After Sending:**")
    lines.append("Update to **contacted**")
    lines.append("")

content = "\n".join(lines)
out = r"C:\Users\LENOVO\.openclaw\workspace\grointel\phase6-priority-a-send-today.md"
with open(out, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Written: {out}")

# --- Generate phase6-send-tracker.md ---
tlines = []
tlines.append("# GroIntel Phase 6 Send Tracker")
tlines.append("")
tlines.append("## Priority A")
tlines.append("")
tlines.append("| # | Company | Sent? | Channel | Date Sent | Status Before | Status After | Opened? | CTA Clicked? | Replied? | Notes |")
tlines.append("|---|---------|-------|---------|-----------|---------------|-------------|---------|--------------|----------|-------|")

for i, p in enumerate(prospects):
    cname = p.get("company_name", "Unknown")
    tlines.append(f"| {i+1} | {cname} | No | Manual | - | report_generated | contacted | Pending | Pending | Pending | - |")

tlines.append("")
tlines.append("## Priority B (send later)")
tlines.append("")
tlines.append("| # | Company | Sent? | Channel | Date Sent | Status Before | Status After | Opened? | CTA Clicked? | Replied? | Notes |")
tlines.append("|---|---------|-------|---------|-----------|---------------|-------------|---------|--------------|----------|-------|")

# Add B priority summary - just company names as placeholders
b_companies = ["Anthropic", "Mistral AI", "Glean", "Harvey", "Sierra", "Lindy", "Replit", "Fireworks AI", "Together AI", "Groq", "Monad", "EigenLayer", "Berachain", "Alchemy", "QuickNode", "Privy", "Dynamic", "Turnkey"]
for i, cname in enumerate(b_companies):
    tlines.append(f"| {i+1} | {cname} | No | Manual | - | report_generated | contacted | Pending | Pending | Pending | - |")

tlines.append("")
tlines.append("## Priority C")
tlines.append("")
tlines.append("| # | Company | Sent? | Channel | Date Sent | Status Before | Status After | Opened? | CTA Clicked? | Replied? | Notes |")
tlines.append("|---|---------|-------|---------|-----------|---------------|-------------|---------|--------------|----------|-------|")
tlines.append("| 1 | Fireblocks | No | Manual | - | report_generated | contacted | Pending | Pending | Pending | - |")
tlines.append("| 2 | Circle | No | Manual | - | report_generated | contacted | Pending | Pending | Pending | - |")

tlines.append("")
tlines.append("## Key")
tlines.append("- Sent? = No / Yes / Skipped")
tlines.append("- Channel = Manual / Email / LinkedIn / Other")
tlines.append("- Opened/CTA Clicked/Replied = Pending / Yes / No / N/A")
tlines.append("- Update this table after each send.")
tlines.append("- When a prospect clicks the report URL, status auto-updates to **opened**.")
tlines.append("- When CTA is clicked, status auto-updates to **clicked_cta**.")
tlines.append("- When contact form is submitted, status auto-updates to **replied**.")

tcontent = "\n".join(tlines)
tout = r"C:\Users\LENOVO\.openclaw\workspace\grointel\phase6-send-tracker.md"
with open(tout, "w", encoding="utf-8") as f:
    f.write(tcontent)
print(f"Written: {tout}")

# Clean up temp file
import os
os.remove(path)
print("Done")
