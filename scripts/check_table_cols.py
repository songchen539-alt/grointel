import os

migrations_dir = r'C:\Users\LENOVO\.openclaw\workspace\grointel\supabase\migrations'
table_columns = {}
current_table = None

for fname in sorted(os.listdir(migrations_dir)):
    path = os.path.join(migrations_dir, fname)
    with open(path, encoding='utf-8') as f:
        for line in f:
            line_stripped = line.strip()
            if line_stripped.startswith('create table if not exists'):
                parts = line_stripped.split('create table if not exists')[1].split('(')
                current_table = parts[0].strip()
                table_columns[current_table] = []
            elif current_table and line_stripped.startswith('  '):
                words = line_stripped.split()
                if words and words[0] not in ('primary', 'unique', 'foreign', 'check', 'constraint', ')', 'alter', 'add'):
                    col = words[0].strip().rstrip(',')
                    if col:
                        table_columns[current_table].append(col)
            elif current_table and line_stripped == ');':
                current_table = None

tables_to_check = [
    'growth_capability_dna', 'growth_capability_history', 'growth_capability_explanations',
    'growth_social_accounts', 'growth_case_studies', 'growth_evidence',
    'growth_passports', 'growth_entities', 'channel_services', 'growth_channels',
    'company_growth_needs', 'growth_matches', 'channel_opportunity_events',
    'prospects', 'growth_quotes'
]

print("Table column check:")
for t in tables_to_check:
    if t in table_columns:
        cols = table_columns[t]
        has_ca = 'created_at' in cols
        has_lu = 'last_updated' in cols
        desc = f"created_at={has_ca}, last_updated={has_lu}"
        if not has_ca and not has_lu:
            desc += " WARNING: no date column!"
        print(f"  {t:<35} {desc}")
    else:
        print(f"  {t:<35} NOT FOUND")
