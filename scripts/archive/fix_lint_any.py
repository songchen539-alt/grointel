path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\api\admin\matching\recommend\route.ts'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Replace the 4 any types with proper inline interfaces
# Line 54: rawChannels.map((c: any)
c = c.replace(
    'const channels = rawChannels.map((c: any) => ({',
    'const channels = (rawChannels || []).map((c: { id: string; channel_name?: string; website?: string; category?: string; region?: string; service_types?: string[]; target_industries?: string[]; target_client_stage?: string[]; pricing_model?: string; min_budget?: number; max_budget?: number; currency?: string; growth_outcomes?: string; case_studies?: string }) => ({'
)
# Line 71: allServices.map((s: any)
c = c.replace(
    'const services = allServices.map((s: any) => ({',
    'const services = (allServices || []).map((s: { id: string; channel_id: string; service_name?: string; service_type?: string; problem_solved?: string; growth_outcome?: string; deliverables?: string; timeline?: string; pricing_model?: string; starting_price?: number; max_price?: number; currency?: string; target_region?: string; target_industry?: string; success_metrics?: string; case_study?: string }) => ({'
)

# Line 96-97: channels.find((c: any) and services.find((s: any)
c = c.replace(
    'const ch = channels.find((c: any) => c.id === r.channelId);',
    'const ch = channels.find((c: { id: string }) => c.id === r.channelId);'
)
c = c.replace(
    'const sv = r.serviceId ? services.find((s: any) => s.id === r.serviceId) : null;',
    'const sv = r.serviceId ? services.find((s: { id: string }) => s.id === r.serviceId) : null;'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed all 4 any types')
