// GroIntel DATA-2 — Agency Observer
import { AgencyProfile } from "./supply_types";

export class AgencyObserver {
  private counter = 0;
  observe(supplyId: string, services: string[], industries: string[], regions: string[], clients: string[], teamSize: number, pricingModel: string): AgencyProfile {
    return { id:"ao_"+(++this.counter).toString(16).padStart(6,"0"), supply_id: supplyId, services, industries, regions, clients, case_studies: [], team_size: teamSize, pricing_model: pricingModel, growth_channels: [], proof_points: [] };
  }
}
