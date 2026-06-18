import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\dashboard\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add marketplace queries to Promise.all
old_perf = '''  const [reportsCount, leadsCount, events, recentLeads, prospects, allProspects] = await Promise.all([
    safeCount("company_mri_reports"),
    safeCount("leads"),
    safeQuery<ReportEvent>("report_events", "event_type,report_id", { limit: 10000 }),
    safeQuery<Lead>("leads", "id,name,email,company_website,target_market,created_at", { order: "created_at.desc", limit: 5 }),
    safeQuery<Prospect>("prospects", "id,company_name,report_id,status", { limit: 10000 }),
    safeQuery<Prospect>("prospects", "id,company_name,status,created_at", { order: "created_at.desc", limit: 5 }),
  ]);'''

new_perf = '''  const [reportsCount, leadsCount, events, recentLeads, prospects, allProspects, growthNeedsCount, growthChannelsCount, channelServicesCount, matchesCount] = await Promise.all([
    safeCount("company_mri_reports"),
    safeCount("leads"),
    safeQuery<ReportEvent>("report_events", "event_type,report_id", { limit: 10000 }),
    safeQuery<Lead>("leads", "id,name,email,company_website,target_market,created_at", { order: "created_at.desc", limit: 5 }),
    safeQuery<Prospect>("prospects", "id,company_name,report_id,status", { limit: 10000 }),
    safeQuery<Prospect>("prospects", "id,company_name,status,created_at", { order: "created_at.desc", limit: 5 }),
    safeCount("company_growth_needs"),
    safeCount("growth_channels"),
    safeCount("channel_services"),
    safeCount("growth_matches"),
  ]);'''

c = c.replace(old_perf, new_perf)

# Add marketplace KPI calculation
old_kpi = '''  const totalReports = reportsCount;
  const totalLeads = leadsCount;'''

new_kpi = '''  const totalReports = reportsCount;
  const totalLeads = leadsCount;
  const totalGrowthNeeds = growthNeedsCount ?? 0;
  const totalGrowthChannels = growthChannelsCount ?? 0;
  const totalChannelServices = channelServicesCount ?? 0;
  const totalMatches = matchesCount ?? 0;'''

c = c.replace(old_kpi, new_kpi)

# Add marketplace KPI row after the regular KPI grid
old_row_end = '''      </div>

      {/* Recent + Prospects + Events */}'''

new_row = '''      </div>

      {/* Marketplace KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Growth Needs", value: totalGrowthNeeds, icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/[0.06]" },
          { label: "Growth Channels", value: totalGrowthChannels, icon: Globe, color: "text-indigo-400", bg: "bg-indigo-500/[0.06]" },
          { label: "Channel Services", value: totalChannelServices, icon: Target, color: "text-teal-400", bg: "bg-teal-500/[0.06]" },
          { label: "Total Matches", value: totalMatches, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/[0.06]" },
          { label: "Lead Conv. Rate", value: conversionRate, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/[0.06]" },
        ].map((kpi) => (
          <div key={kpi.label} className={"rounded-xl border border-white/5 " + kpi.bg + " p-4"}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={"h-4 w-4 " + kpi.color} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{kpi.label}</span>
            </div>
            <p className={"text-2xl font-bold " + kpi.color}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent + Prospects + Events */}'''

c = c.replace(old_row_end, new_row)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated dashboard')
