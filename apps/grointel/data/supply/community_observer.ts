// GroIntel DATA-2 — Community Observer
import { CommunityProfile } from "./supply_types";

export class CommunityObserver {
  private counter = 0;
  observe(supplyId: string, name: string, platform: string, members: number, activityLevel: string, topics: string[], region: string, audience: string): CommunityProfile {
    return { id:"cmo_"+(++this.counter).toString(16).padStart(6,"0"), supply_id: supplyId, community_name: name, platform, members, activity_level: activityLevel, topics, region, audience, trust_level: members>10000?80:50, growth_implication: activityLevel==="high"?"Growing":"Stable" };
  }
}
