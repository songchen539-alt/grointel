// GroIntel DATA-4 — Pattern Observer
import { GrowthPattern, PatternCondition, PatternSimilarity, PatternValidation, PatternConfidence } from "./pattern_types";
import { PatternExtractor } from "./pattern_extractor";
import { PatternClusterer } from "./pattern_clusterer";
import { PatternValidator } from "./pattern_validator";
import { PatternGeneralizer } from "./pattern_generalizer";
import { PatternSimilarityEngine } from "./pattern_similarity";
import { PatternConfidenceCalculator } from "./pattern_confidence";
import { PatternLibrary } from "./pattern_library";
import { PatternTraceRecorder } from "./pattern_trace";

export class PatternObserver {
  public readonly extractor = new PatternExtractor();
  public readonly clusterer = new PatternClusterer();
  public readonly validator = new PatternValidator();
  public readonly generalizer = new PatternGeneralizer();
  public readonly similarity = new PatternSimilarityEngine();
  public readonly confidenceCalc = new PatternConfidenceCalculator();
  public readonly library = new PatternLibrary();
  public readonly traces = new PatternTraceRecorder();

  extractPattern(name: string, description: string, cluster: string, conditions: PatternCondition, capabilities: string[]): GrowthPattern {
    const pattern = this.extractor.extract(name, description, cluster, conditions, {}, capabilities);
    this.library.add(pattern);
    this.traces.record("pattern_extracted", pattern.id, name);
    return pattern;
  }

  addSupportingActivity(patternId: string, activityId: string, companyId: string): GrowthPattern | null {
    const p = this.library.get(patternId);
    if (!p) return null;
    p.supporting_activity_ids.push(activityId);
    if (!p.supporting_company_ids.includes(companyId)) p.supporting_company_ids.push(companyId);
    p.sample_size++;
    p.evidence_count++;
    p.updated_at = new Date().toISOString();
    this.traces.record("supporting_activity", patternId, `Activity ${activityId} supports pattern`);
    return p;
  }

  validatePattern(patternId: string): { pattern: GrowthPattern | null; validation: PatternValidation } {
    const p = this.library.get(patternId);
    if (!p) return { pattern: null, validation: null as any };
    const validation = this.validator.validate(p);
    const promoted = this.validator.promote(p, validation);
    if (validation.passed && promoted.supporting_activity_ids.length >= 3) {
      this.validator.promoteToStable(promoted);
    }
    this.traces.record("pattern_validated", patternId, `Passed: ${validation.passed}`);
    return { pattern: promoted, validation };
  }

  generalizePattern(patternId: string, newContext: string): GrowthPattern | null {
    const p = this.library.get(patternId);
    if (!p) return null;
    this.generalizer.generalize(p, newContext);
    this.traces.record("pattern_generalized", patternId, newContext);
    return p;
  }

  findSimilar(industry: string, region: string, capabilities: string[]): PatternSimilarity[] {
    return this.similarity.findSimilar(this.library.getValidated(), industry, region, capabilities);
  }

  computeConfidence(patternId: string): PatternConfidence | null {
    const p = this.library.get(patternId);
    if (!p) return null;
    return this.confidenceCalc.compute(p);
  }

  getPattern(id: string): GrowthPattern | null { return this.library.get(id); }
  getAllPatterns(): GrowthPattern[] { return this.library.getAll(); }
  getValidatedPatterns(): GrowthPattern[] { return this.library.getValidated(); }
}
