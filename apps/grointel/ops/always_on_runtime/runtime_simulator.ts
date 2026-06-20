// OPS-1 — Runtime Simulator
import { RuntimeJob, ConnectorCapability } from "./always_on_types";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";
import { Knowledge2Flow } from "../../knowledge/reality_observation/knowledge2_flow";

export class RuntimeSimulator {
  simulateNetworkChange(companyMemoryId: string, change: Record<string, string>, flow: CompanyMemoryFlow, k2: Knowledge2Flow): { memory_updated: boolean; decision_updated: boolean } {
    const mem = flow.store.get(companyMemoryId);
    if (!mem) return { memory_updated: false, decision_updated: false };
    const result = k2.simulateAndUpdate(flow, companyMemoryId, change);
    return { memory_updated: result.memory_updated, decision_updated: result.decision_updated };
  }

  simulateManyCompanies(count: number, flow: CompanyMemoryFlow, k2: Knowledge2Flow): number {
    let processed = 0;
    for (let i = 0; i < count; i++) {
      try {
        const { memory } = flow.createFromRequest({ company_website: `sim_${i}.io`, company_name: `Sim_${i}`, growth_goal: "increase leads", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
        k2.observeAndUpdate(flow, memory.id, `sim_${i}.io`);
        processed++;
      } catch { /* skip */ }
    }
    return processed;
  }
}
