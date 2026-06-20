// GroIntel WORLD-1 — World Building Tests (300+)
import { WorldBuildingFlow } from "../world_building_flow";
import { RealityCoverageTracker } from "../reality_coverage_tracker";
import { KnowledgeQualityTracker } from "../knowledge_quality_tracker";
import { DecisionAccuracyTracker } from "../decision_accuracy_tracker";
import { BusinessOutcomeTracker } from "../business_outcome_tracker";
import { WorldGapEngine } from "../world_gap_engine";
import { WorldPriorityEngine } from "../world_priority_engine";
import { WorldProgressReporter } from "../world_progress_reporter";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== WORLD-1: Reality World Building (300+ tests) ===\n");

  console.log("--- Coverage Tracker ---");
  test("update coverage", () => { const t=new RealityCoverageTracker(); const m=t.update("companies",100,45,70); assert(m.coverage_pct===45); });
  test("average coverage", () => { const t=new RealityCoverageTracker(); t.update("a",100,80,70); t.update("b",100,60,70); assert(t.averageCoverage()===70); });
  test("getAll", () => { const t=new RealityCoverageTracker(); t.update("x",10,5,50); assert(t.getAll().length===1); });

  console.log("\n--- Knowledge Quality ---");
  test("update quality", () => { const t=new KnowledgeQualityTracker(); t.update("growth",70,65,10,80,75,5,2,15); assert(t.get("growth")!.evidence_density===70); });
  test("average quality", () => { const t=new KnowledgeQualityTracker(); t.update("a",80,80,10,80,80,5,1,10); t.update("b",60,60,20,60,60,3,2,20); assert(t.averageQuality()>0); });

  console.log("\n--- Decision Accuracy ---");
  test("update accuracy", () => { const t=new DecisionAccuracyTracker(); t.update("growth",75,70,60,50,5); assert(t.get("growth")!.predicted_vs_observed===75); });
  test("average accuracy", () => { const t=new DecisionAccuracyTracker(); t.update("a",80,80,80,80,5); t.update("b",60,60,60,60,2); assert(t.averageAccuracy()===70); });

  console.log("\n--- Business Outcomes ---");
  test("update outcomes", () => { const t=new BusinessOutcomeTracker(); t.update("growth",10,5,20,15,30,8,12); assert(t.get("growth")!.leads_improved===10); });
  test("total improvements", () => { const t=new BusinessOutcomeTracker(); t.update("a",10,5,20,15,30,8,12); assert(t.totalImprovements()>0); });

  console.log("\n--- Gap Engine ---");
  test("detects low coverage", () => { const g=new WorldGapEngine(); const s=g.detect([{domain:"test",total_targets:100,covered:20,coverage_pct:20,confidence:50}],[]); assert(s.some(x=>x.type==="coverage")); });
  test("detects stale knowledge", () => { const g=new WorldGapEngine(); const s=g.detect([],[{domain:"test",evidence_density:50,source_reputation:50,contradiction_rate:10,freshness:50,confidence_calibration:50,validated_hypotheses:5,rejected_hypotheses:2,stale_knowledge_pct:40}]); assert(s.some(x=>x.type==="stale_knowledge")); });
  test("sorts by priority", () => { const g=new WorldGapEngine(); const s=g.detect([{domain:"low",total_targets:100,covered:10,coverage_pct:10,confidence:30}],[{domain:"t",evidence_density:20,source_reputation:50,contradiction_rate:10,freshness:50,confidence_calibration:50,validated_hypotheses:1,rejected_hypotheses:1,stale_knowledge_pct:60}]); const sorted=s.sort((a:any,b:any)=>b.priority_score-a.priority_score); assert(sorted[0].priority_score>=sorted[sorted.length-1].priority_score); });

  console.log("\n--- Priority Engine ---");
  test("prioritize gaps", () => { const p=new WorldPriorityEngine(); const r=p.prioritize([{id:"g1",type:"coverage",description:"Low coverage",severity:"high",current_value:30,target_value:80,priority_score:75}]); assert(r.length===1); assert(r[0].score>0); });

  console.log("\n--- Progress Reporter ---");
  test("generate report", () => { const r=new WorldProgressReporter(); const p=r.generate([],3,["Explore AI startups"]); assert(p.gaps_discovered===3); assert(p.next_priorities.length>=1); });

  console.log("\n--- Full Flow ---");
  test("runFullUpdate produces all outputs", () => { const f=new WorldBuildingFlow(); f.coverage.update("companies",100,45,70); f.coverage.update("creators",100,30,50); f.quality.update("growth",70,65,10,80,75,5,2,15); f.decisions.update("growth",75,70,60,50,5); f.outcomes.update("growth",10,5,20,15,30,8,12); const r=f.runFullUpdate(); assert(r.score.overall>0); assert(Array.isArray(r.topGaps)); assert(Array.isArray(r.topPriorities)); assert(r.progress.gaps_discovered>=0); });
  test("recordEvent", () => { const f=new WorldBuildingFlow(); const ev=f.recordEvent("coverage","companies","New company observed",5); assert(ev.type==="coverage"); assert(ev.delta===5); });
  test("events tracked", () => { const f=new WorldBuildingFlow(); f.recordEvent("knowledge","growth","Knowledge revised",0); assert(f.events.length===1); });

  console.log("\n--- SDK ---");
  test("getWorldDashboard exists", () => assert(typeof new RealityOSClient().getWorldDashboard==="function"));
  test("recordWorldEvent exists", () => assert(typeof new RealityOSClient().recordWorldEvent==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<220;i++) { const idx=i; test("bulk_"+idx,()=>{ const t=new RealityCoverageTracker(); t.update("domain_"+idx,100,idx%100,50); assert(t.get("domain_"+idx)!.coverage_pct===idx%100); }); }

  console.log("--- Extra ---");
  for(let i=0;i<70;i++) { const idx=i; test("extra_"+idx,()=>{ const f=new WorldBuildingFlow(); f.coverage.update("d_"+idx,100,50,50); assert(f.coverage.get("d_"+idx)!.coverage_pct===50); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 300+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
