// GroIntel DATA-2 — Software Observer
import { SoftwareProfile } from "./supply_types";

export class SoftwareObserver {
  private counter = 0;
  observe(supplyId: string, productName: string, category: string, useCase: string, targetUser: string, pricing: string, integrations: string[], reviews: number): SoftwareProfile {
    return { id:"so_"+(++this.counter).toString(16).padStart(6,"0"), supply_id: supplyId, product_name: productName, category, use_case: useCase, target_user: targetUser, pricing, integrations, adoption_signals: [], reviews, growth_implication: category==="AI"?"High growth":"Standard" };
  }
}
