import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\dashboard\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add quotes count to Promise.all
c = c.replace(
    'safeCount("growth_matches"),',
    'safeCount("growth_matches"),\n    safeCount("growth_quotes"),'
)

# Add quote count variable
c = c.replace(
    '  const totalMatches = matchesCount ?? 0;',
    '  const totalMatches = matchesCount ?? 0;\n  const totalQuotes = quotesCount ?? 0;'
)

# Add quotes KPI card after the Total Matches card
c = c.replace(
    '{ label: "Total Matches", value: totalMatches',
    '{ label: "Total Quotes", value: totalQuotes',
    1  # Replace only first occurrence
)

# Actually let me be smarter - replace the entire marketplace row
old_kpi_end = '          { label: "Lead Conv. Rate", value: conversionRate, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/[0.06]" },'
new_kpi_end = '          { label: "Total Matches", value: totalMatches, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/[0.06]" },\n          { label: "Total Quotes", value: totalQuotes, icon: Target, color: "text-teal-400", bg: "bg-teal-500/[0.06]" },\n          { label: "Lead Conv. Rate", value: conversionRate, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/[0.06]" },'

c = c.replace(old_kpi_end, new_kpi_end)

# Remove duplicate Total Matches
c = c.replace('          { label: "Total Matches", value: totalMatches, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/[0.06]" },\n          { label: "Total Matches", value: totalMatches', 
              '          { label: "Total Matches", value: totalMatches')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Dashboard updated')
