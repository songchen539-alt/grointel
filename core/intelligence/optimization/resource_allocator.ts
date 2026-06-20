// GroIntel INT-5 — Resource Allocator
import { ResourceAllocation, OptimizationOption } from "./optimization_types";

export class ResourceAllocator {
  allocate(feasibleOptions: OptimizationOption[]): ResourceAllocation {
    const count = Math.max(1, feasibleOptions.length);
    const avgConf = feasibleOptions.reduce((s, o) => s + o.confidence, 0) / count;
    const avgRisk = feasibleOptions.reduce((s, o) => s + o.risk, 0) / count;

    return {
      attention_budget: Math.round(100 / count),
      kernel_budget: Math.round(avgConf * 0.3 + 20),
      data_budget: Math.round(80 / count),
      human_review_budget: Math.round(avgRisk > 40 ? 60 / count : 30 / count),
      execution_budget: Math.round(100 / count * 0.5),
      time_budget_days: Math.max(...feasibleOptions.map(o => o.time_days), 30),
      risk_budget: Math.round(100 - avgRisk),
    };
  }
}
