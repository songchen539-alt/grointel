// GroIntel DATA-2 — Supply Change Detector
import { SupplyChange, SupplyChangeType, GrowthSupplyProfile } from "./supply_types";

export class SupplyChangeDetector {
  private counter = 0;
  detect(p: GrowthSupplyProfile, u: Partial<GrowthSupplyProfile>): SupplyChange[] {
    const c: SupplyChange[] = [];
    if (!p.last_observed_at || p.version === 1) c.push(this.mk("new_supply_entity",p.id,{},{},p.name,"high",80,false));
    if (u.capabilities && u.capabilities.length > p.capabilities.length) c.push(this.mk("capability_update",p.id,{old:p.capabilities},{new:u.capabilities},"New capabilities","high",70,false));
    if (u.audiences && u.audiences.length > p.audiences.length) c.push(this.mk("audience_update",p.id,{old:p.audiences},{new:u.audiences},"Audience expanded","medium",60,false));
    return c;
  }
  private mk(type: SupplyChangeType, id: string, b: any, a: any, delta: string, imp: any, conf: number, rv: boolean): SupplyChange {
    return { id:"sc_"+(++this.counter).toString(16).padStart(6,"0"), type, supply_id: id, before: b, after: a, delta: delta, importance: imp, confidence: conf, requires_review: rv, timestamp: new Date().toISOString() };
  }
}
