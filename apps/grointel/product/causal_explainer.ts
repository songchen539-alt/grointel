// GroIntel PRODUCT-1 — Causal Explainer
import { GrowthRecommendation } from "./growth_decision_types";

export class CausalExplainer {
  explain(pattern: GrowthRecommendation, companyIndustry: string, companyRegion: string): string {
    return `Pattern "${pattern.pattern_name}" works for ${companyIndustry} companies in ${companyRegion} because: ` +
      `(1) Companies that invest in ${pattern.pattern_cluster} see average ${pattern.expected_impact.toLowerCase()}. ` +
      `(2) The causal chain shows: investment → capability → execution → measurable outcome. ` +
      `(3) ${pattern.evidence_count} documented cases support this pattern. ` +
      `Key assumptions: (a) team has capacity to execute, (b) budget is sufficient for ${pattern.pattern_cluster}, (c) market conditions remain stable.`;
  }
}
