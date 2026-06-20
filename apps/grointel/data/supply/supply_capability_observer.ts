// GroIntel DATA-2 — Supply Capability Observer (17 capability types)
import { CapabilityProfile, CapabilityType } from "./supply_types";

export class SupplyCapabilityObserver {
  private counter = 0;
  observe(supplyId: string, capabilityType: CapabilityType, strength: number, evidence: string[], industryFit: string[], regionFit: string[], audienceFit: string[], priceFit: string, trustLevel: number): CapabilityProfile {
    return { id:"cap_"+(++this.counter).toString(16).padStart(6,"0"), supply_id: supplyId, capability_type: capabilityType, strength, evidence, industry_fit: industryFit, region_fit: regionFit, audience_fit: audienceFit, price_fit: priceFit, trust_level: trustLevel, confidence: Math.round((strength+trustLevel)/2) };
  }

  getAllTypes(): CapabilityType[] {
    return ["seo","paid_ads","content","influencer_marketing","community_growth","partnerships","pr","sales_outbound","product_growth","conversion_optimization","brand_strategy","market_entry","localization","ai_automation","analytics","creative_production","video_production"];
  }
}
