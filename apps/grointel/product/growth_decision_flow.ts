// GroIntel PRODUCT-1 — Growth Decision Flow (orchestrates the product)
import { GrowthDecisionRequest, GrowthDecisionReport } from "./growth_decision_types";
import { CompanyInputAnalyzer } from "./company_input_analyzer";
import { GrowthGoalInterpreter } from "./growth_goal_interpreter";
import { GrowthDiagnosisEngine } from "./growth_diagnosis";
import { PatternRetriever } from "./pattern_retriever";
import { CausalExplainer } from "./causal_explainer";
import { SupplyCategoryRecommender } from "./supply_category_recommender";
import { DecisionReportBuilder } from "./decision_report_builder";
import { ProductTraceRecorder } from "./product_trace";

export class GrowthDecisionFlow {
  public readonly companyAnalyzer = new CompanyInputAnalyzer();
  public readonly goalInterpreter = new GrowthGoalInterpreter();
  public readonly diagnosis = new GrowthDiagnosisEngine();
  public readonly patternRetriever = new PatternRetriever();
  public readonly causalExplainer = new CausalExplainer();
  public readonly supplyRecommender = new SupplyCategoryRecommender();
  public readonly reportBuilder = new DecisionReportBuilder();
  public readonly traces = new ProductTraceRecorder();

  run(request: GrowthDecisionRequest): GrowthDecisionReport {
    const company = this.companyAnalyzer.analyze(request.company_website);
    const goal = this.goalInterpreter.interpret(request.growth_goal);
    const diag = this.diagnosis.diagnose(company, goal);
    const patterns = this.patternRetriever.retrieve(company.industry, company.region, goal);
    const causalExplanation = patterns.length > 0
      ? this.causalExplainer.explain(patterns[0], company.industry, company.region)
      : "No patterns available for causal explanation.";
    const supplyCats = this.supplyRecommender.recommend(goal);
    const report = this.reportBuilder.build(request, company, goal, diag, patterns, causalExplanation, supplyCats);
    this.traces.record("report_generated", report.id, `${company.company_domain} → ${goal.category}`);
    return report;
  }
}
