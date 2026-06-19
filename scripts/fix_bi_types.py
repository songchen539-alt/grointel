import os
r = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\lib\db\types.ts'
with open(r, encoding='utf-8') as f:
    c = f.read()

# Find the DbBusinessIntelligenceProfile interface and replace it
old_start = 'export interface DbBusinessIntelligenceProfile'
old_end = '  updated_at: string | null;\n}'

start_idx = c.find(old_start)
if start_idx >= 0:
    end_idx = c.index('}', c.index('business_intelligence_profiles'))
    end_idx = c.index('}', end_idx + 1) + 1
    end_idx = c.index('\n', end_idx) if c[end_idx] == '\n' else end_idx
    
    new_types = '''export interface DbBusinessScanProfile {
  id: string;
  entity_id: string | null;
  website: string;
  normalized_domain: string | null;
  company_name: string | null;
  industry: string | null;
  country: string | null;
  region: string | null;
  public_summary: string | null;
  detected_products: Record<string, unknown>[] | null;
  detected_markets: Record<string, unknown>[] | null;
  detected_growth_channels: Record<string, unknown>[] | null;
  public_signals: Record<string, unknown>[] | null;
  sources: (string | Record<string, unknown>)[] | null;
  confidence: Record<string, number> | null;
  scan_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbBusinessKnowledgeProfile {
  id: string;
  entity_id: string | null;
  scan_profile_id: string | null;
  website: string;
  business_identity: Record<string, unknown> | null;
  business_model: Record<string, unknown> | null;
  market: Record<string, unknown> | null;
  goals: (string | Record<string, unknown>)[] | null;
  constraints: Record<string, unknown> | null;
  growth_stack: Record<string, unknown> | null;
  history: (string | Record<string, unknown>)[] | null;
  preferences: Record<string, unknown> | null;
  knowledge_confidence: Record<string, number> | null;
  knowledge_status: string | null;
  last_conversation_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}'''

    # Find the entire interface block and replace it
    from_old = c[start_idx:]
    end_idx = from_old.find('\nexport') 
    if end_idx < 0:
        end_idx = len(from_old)
    block = from_old[:end_idx]
    
    # Find the last closing brace
    brace_idx = block.rfind('}\n')
    if brace_idx >= 0:
        block_end = start_idx + brace_idx + 2
        c = c[:start_idx] + new_types + '\n' + c[block_end:]
    else:
        c = c[:start_idx] + new_types + '\n'
    
    with open(r, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Replaced DbBusinessIntelligenceProfile with scan + knowledge types')
else:
    print('Interface not found')
