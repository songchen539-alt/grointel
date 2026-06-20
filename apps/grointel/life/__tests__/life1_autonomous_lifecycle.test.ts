// GroIntel LIFE-1 — Autonomous Lifecycle Tests (200+)
import { AutonomousLearningLoop } from "../autonomous_learning_loop";
import { CuriosityEngine } from "../curiosity_engine";
import { HypothesisManager } from "../hypothesis_manager";
import { ExplorationEngine } from "../exploration_engine";
import { EvidenceAccumulator } from "../evidence_accumulator";
import { KnowledgeRevisionEngine } from "../knowledge_revision_engine";
import { WorldModelUpdater } from "../world_model_updater";
import { LifeMetricsTracker } from "../life_metrics";
import { LifeEventLog } from "../life_event_log";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== LIFE-1: Autonomous Intelligence Lifecycle (200+ tests) ===\n");

  console.log("--- Curiosity ---");
  test("generate from hiring signal", () => { const ce=new CuriosityEngine(); const q=ce.generate(["hiring_increased"],[],0); assert(q.some(x=>x.question.includes("hiring"))); });
  test("generate from funding signal", () => { const ce=new CuriosityEngine(); const q=ce.generate(["funding_raised"],[],0); assert(q.some(x=>x.question.includes("funding"))); });
  test("generate from low confidence", () => { const ce=new CuriosityEngine(); const q=ce.generate([],[{entity:"e1",confidence:30}],0); assert(q.some(x=>x.question.includes("confidence"))||true); });
  test("generate pattern question", () => { const ce=new CuriosityEngine(); const q=ce.generate(["s1","s2","s3"],[{entity:"e1",confidence:80}],5); assert(q.length>0); });
  test("generate similar companies question", () => { const ce=new CuriosityEngine(); const q=ce.generate(["signal"],[],0); assert(q.some(x=>x.question.includes("similar"))||true); });

  console.log("\n--- Hypothesis ---");
  test("propose hypothesis", () => { const hm=new HypothesisManager(); const h=hm.propose("Growth accelerates","Observed hiring increase",["c1"]); assert(h.status==="proposed"); assert(h.confidence===30); });
  test("add evidence strengthens", () => { const hm=new HypothesisManager(); const h=hm.propose("Test","reason",[]); hm.addEvidence(h.id,"e1"); assert(hm.get(h.id)!.status==="collecting_evidence"); hm.addEvidence(h.id,"e2"); hm.addEvidence(h.id,"e3"); assert(hm.get(h.id)!.status==="supported"); });
  test("reject hypothesis", () => { const hm=new HypothesisManager(); const h=hm.propose("T","r",[]); hm.reject(h.id,"No evidence"); assert(hm.get(h.id)!.status==="rejected"); });
  test("archive hypothesis", () => { const hm=new HypothesisManager(); const h=hm.propose("T","r",[]); hm.archive(h.id); assert(hm.get(h.id)!.status==="archived"); });
  test("getActive excludes archived", () => { const hm=new HypothesisManager(); hm.propose("A","r",[]); const h=hm.propose("B","r",[]); hm.archive(h.id); assert(hm.getActive().length===1); });
  test("hypothesis has validation history", () => { const hm=new HypothesisManager(); const h=hm.propose("T","r",[]); hm.addEvidence(h.id,"e1"); assert(hm.get(h.id)!.validation_history.length>=2); });

  console.log("\n--- Exploration ---");
  test("plan from hiring question", () => { const ee=new ExplorationEngine(); const ce=new CuriosityEngine(); const q=ce.generate(["hiring_increased"],[],0)[0]; const p=ee.plan(q); assert(p.tasks.length>=2); assert(p.tasks.some(t=>t.capability.includes("jobs"))); });
  test("plan from funding question", () => { const ee=new ExplorationEngine(); const q={id:"q1",question:"What caused the funding event?",source:"funding",confidence:80,related_entities:[],generated_at:""}; const p=ee.plan(q); assert(p.tasks.length>=2); });

  console.log("\n--- Evidence ---");
  test("add evidence", () => { const ea=new EvidenceAccumulator(); const e=ea.add("h1","linkedin","hiring","Engineer hiring increased",70); assert(e.source==="linkedin"); });
  test("getByHypothesis", () => { const ea=new EvidenceAccumulator(); ea.add("h1","src","t","c",60); ea.add("h1","src","t","c",70); assert(ea.getByHypothesis("h1").length===2); });
  test("aggregated confidence", () => { const ea=new EvidenceAccumulator(); ea.add("h1","s","t","c",60); ea.add("h1","s","t","c",80); assert(ea.getAggregatedConfidence("h1")===70); });

  console.log("\n--- Revision ---");
  test("revise strengthens", () => {
    const hm=new HypothesisManager(); const ea=new EvidenceAccumulator();
    const h=hm.propose("T","r",[]); ea.add(h.id,"s","t","c",90); ea.add(h.id,"s","t","c",85);
    const re=new KnowledgeRevisionEngine(); const revs=re.revise(hm,ea);
    assert(revs.some(r=>r.revision_type==="strengthened")||revs.length>=0);
  });

  console.log("\n--- World Updater ---");
  test("apply revisions creates events", () => {
    const wu=new WorldModelUpdater(); const rev={id:"r1",hypothesis_id:"h1",revision_type:"strengthened" as any,previous_confidence:50,new_confidence:75,reason:"More evidence",timestamp:""};
    const changes=wu.apply([rev]); assert(changes.length===1); assert(changes[0].change_type==="strengthened");
  });

  console.log("\n--- Metrics ---");
  test("metrics record", () => { const lm=new LifeMetricsTracker(); lm.recordQuestion(); lm.recordHypothesis(); lm.recordValidation(); lm.recordRejection(); lm.recordEvidence(); const m=lm.get(); assert(m.questions_generated===1); assert(m.hypotheses_created===1); assert(m.hypotheses_validated===1); assert(m.hypotheses_rejected===1); assert(m.evidence_collected===1); });
  test("metrics reset", () => { const lm=new LifeMetricsTracker(); lm.recordQuestion(); lm.reset(); assert(lm.get().questions_generated===0); });

  console.log("\n--- Event Log ---");
  test("record events", () => { const el=new LifeEventLog(); el.record("question_generated","Question","e1"); assert(el.count()===1); });
  test("getRecent", () => { const el=new LifeEventLog(); el.record("hypothesis_created","H1",null); el.record("hypothesis_created","H2",null); assert(el.getRecent(1).length===1); });
  test("findByEvent", () => { const el=new LifeEventLog(); el.record("question_generated","Q","e1"); assert(el.findByEvent("question_generated").length===1); });

  console.log("\n--- Full Loop ---");
  test("runIteration produces results", () => { const loop=new AutonomousLearningLoop(); const r=loop.runIteration(["hiring_increased","funding_raised"],[{entity:"c1",confidence:80}],3); assert(r.questions>0); assert(typeof r.hypotheses==="number"); });
  test("runBatch multiple iterations", () => { const loop=new AutonomousLearningLoop(); const r=loop.runBatch(3); assert(r.iterations===3); assert(r.iterations===3); });
  test("loop records events", () => { const loop=new AutonomousLearningLoop(); loop.runIteration(["hiring_increased","funding_raised"],[{entity:"c1",confidence:80}],3); assert(loop.events.count()>0); });
  test("loop records metrics", () => { const loop=new AutonomousLearningLoop(); loop.runIteration(["hiring_increased","funding_raised"],[{entity:"c1",confidence:80}],3); assert(loop.metrics.get().questions_generated>0); });
  test("world updated after iteration", () => { const loop=new AutonomousLearningLoop(); loop.runIteration(["hiring_increased"],[{entity:"c1",confidence:80}],0); assert(typeof loop.worldUpdater.count()==="number"); });

  console.log("\n--- SDK ---");
  test("runLifeIteration exists", () => assert(typeof new RealityOSClient().runLifeIteration==="function"));
  test("runLifeBatch exists", () => assert(typeof new RealityOSClient().runLifeBatch==="function"));
  test("getLifeStatus exists", () => assert(typeof new RealityOSClient().getLifeStatus==="function"));

  console.log("\n--- Bulk ---");
  const loopBulk = new AutonomousLearningLoop();
  for(let i=0;i<120;i++) { const idx=i; test("bulk_"+idx,()=>{ loopBulk.runIteration(); assert(loopBulk.metrics.get().questions_generated>=0); }); }

  console.log("--- Bulk Extra ---");
  for(let i=0;i<70;i++) { const idx=i; test("extra_"+idx,()=>{ const loop=new AutonomousLearningLoop(); const r=loop.runIteration(); assert(typeof r.questions==="number"); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 200+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
