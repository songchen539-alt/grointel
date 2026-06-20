// GroIntel DATA-3 — Activity Cost Observer
import { GrowthBudget } from "./activity_types";

export class ActivityCostObserver {
  private counter = 0;
  observe(activityId: string, budget: number, currency: string, estimatedCost: number, actualCost: number, pricingModel: string, resourceCost: number): GrowthBudget {
    return { id:"ac_"+(++this.counter).toString(16).padStart(6,"0"), activity_id: activityId, budget, currency, estimated_cost: estimatedCost, actual_cost: actualCost, pricing_model: pricingModel, resource_cost: resourceCost };
  }
}
