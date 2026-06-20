// GroIntel DATA-2 — Supply Signal Extractor
import { SupplySignal, SupplySignalType, GrowthSupplyObservation } from "./supply_types";

export class SupplySignalExtractor {
  extract(obs: GrowthSupplyObservation): SupplySignal[] {
    const s: SupplySignal[] = [];
    if (obs.normalized_data.followers || obs.raw_data.followers) s.push(this.make("audience_growth_signal",65,obs.confidence,[obs.id],[obs.supply_id||""],60));
    if (obs.normalized_data.engagement || obs.raw_data.engagement) s.push(this.make("engagement_signal",70,obs.confidence,[obs.id],[obs.supply_id||""],65));
    if (obs.normalized_data.case_study || obs.raw_data.case_study) s.push(this.make("case_study_signal",80,obs.confidence,[obs.id],[obs.supply_id||""],75));
    if (obs.normalized_data.capability || obs.raw_data.capability) s.push(this.make("capability_signal",60,obs.confidence,[obs.id],[obs.supply_id||""],70));
    if (obs.normalized_data.pricing || obs.raw_data.pricing) s.push(this.make("pricing_signal",50,obs.confidence,[obs.id],[obs.supply_id||""],55));
    if (obs.normalized_data.trust || obs.raw_data.trust) s.push(this.make("trust_signal",75,obs.confidence,[obs.id],[obs.supply_id||""],80));
    if (obs.normalized_data.risk || obs.raw_data.risk) s.push(this.make("risk_signal",85,obs.confidence,[obs.id],[obs.supply_id||""],70));
    if (obs.normalized_data.content_velocity || obs.raw_data.content_v) s.push(this.make("content_velocity_signal",55,obs.confidence,[obs.id],[obs.supply_id||""],65));
    if (obs.normalized_data.community || obs.raw_data.community) s.push(this.make("community_growth_signal",60,obs.confidence,[obs.id],[obs.supply_id||""],70));
    if (obs.normalized_data.software || obs.raw_data.software) s.push(this.make("software_adoption_signal",65,obs.confidence,[obs.id],[obs.supply_id||""],60));
    if (obs.normalized_data.partnership || obs.raw_data.partner) s.push(this.make("partnership_signal",70,obs.confidence,[obs.id],[obs.supply_id||""],75));
    if (obs.evidence.length > 2) s.push(this.make("market_relevance_signal",50,obs.confidence,obs.evidence,[obs.supply_id||""],60));
    return s;
  }
  private counter = 0;
  private make(type: SupplySignalType, strength: number, confidence: number, evidence: string[], entities: string[], freshness: number): SupplySignal {
    return { id:"sig_"+(++this.counter).toString(16).padStart(6,"0"), type, strength, confidence, evidence, freshness, affected_entities: entities };
  }
}
