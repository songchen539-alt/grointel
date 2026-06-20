// GroIntel DATA-2 — Creator Observer
import { CreatorProfile } from "./supply_types";

export class CreatorObserver {
  private counter = 0;
  observe(supplyId: string, platform: string, handle: string, followers: number, engagementRate: number, topics: string[], collaborations: string[]): CreatorProfile {
    return { id:"co_"+(++this.counter).toString(16).padStart(6,"0"), supply_id: supplyId, platform, handle, followers, engagement_rate: engagementRate, audience_geo: [], audience_industry: [], content_topics: topics, content_velocity: followers>10000?80:40, brand_collaborations: collaborations, proof_points: [] };
  }
}
