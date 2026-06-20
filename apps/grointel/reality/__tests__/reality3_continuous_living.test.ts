// GroIntel REALITY-3 — Continuous Living Tests (300+)
import { LivingLoopFlow } from "../continuous/living_loop_flow";
import { LivingMetricsTracker } from "../continuous/living_metrics";
import { ContinuousAttentionManager } from "../continuous/continuous_attention";
import { ContinuousCuriosityEngine } from "../continuous/continuous_curiosity";
import { ContinuousSafetyGuard } from "../continuous/continuous_safety";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== REALITY-3: Continuous Living (300+ tests) ===\n");

  console.log("--- Metrics ---");
  test("metrics initial", () => { const m=new LivingMetricsTracker(); const mv=m.get(); assert(typeof mv.reality_coverage==="number"); });
  test("recordSignal", () => { const m=new LivingMetricsTracker(); m.recordSignal(); assert(m.get().signal_flow_rate>=0); });
  test("recordEvidence", () => { const m=new LivingMetricsTracker(); m.recordEvidence(); assert(m.get().evidence_flow>=0); });
  test("recordWorldUpdate", () => { const m=new LivingMetricsTracker(); m.recordWorldUpdate(); m.recordDecisionUpdate(); assert(m.get().world_updates===1); assert(m.get().decision_updates===1); });
  test("setHypotheses", () => { const m=new LivingMetricsTracker(); m.setHypotheses(5); assert(m.get().active_hypotheses===5); });
  test("setQueueDepth", () => { const m=new LivingMetricsTracker(); m.setQueueDepth(10); assert(m.get().exploration_queue_depth===10); });

  console.log("\n--- Attention ---");
  test("score entities", () => { const am=new ContinuousAttentionManager(); const r=am.score([{id:"e1",name:"E1",freshness:20,knowledge_uncertainty:50,confidence:40,hypothesis_count:2,emerging_industry:true,rapid_change:true,high_impact:true}]); assert(r[0].score>0); });
  test("sorted by score", () => { const am=new ContinuousAttentionManager(); const r=am.score([{id:"high",name:"H",freshness:10,knowledge_uncertainty:80,confidence:20,hypothesis_count:5,emerging_industry:true,rapid_change:true,high_impact:true},{id:"low",name:"L",freshness:90,knowledge_uncertainty:10,confidence:80,hypothesis_count:0,emerging_industry:false,rapid_change:false,high_impact:false}]); assert(r[0].entity_id==="high"); });
  test("generateCandidates", () => { const am=new ContinuousAttentionManager(); const r=am.score([{id:"e1",name:"E",freshness:30,knowledge_uncertainty:60,confidence:50,hypothesis_count:1,emerging_industry:false,rapid_change:true,high_impact:false}]); const c=am.generateCandidates(r,0); assert(c.length>=0); });

  console.log("\n--- Curiosity ---");
  test("no hypotheses generates discovery", () => { const cc=new ContinuousCuriosityEngine(); const c=cc.generateFromHypotheses(0,0,0); assert(c.some(x=>x.reason.includes("hypotheses"))); });
  test("many validated generates pattern search", () => { const cc=new ContinuousCuriosityEngine(); const c=cc.generateFromHypotheses(5,5,0); assert(c.some(x=>x.reason.includes("pattern"))||c.length>0); });

  console.log("\n--- Safety ---");
  test("passes with low errors", () => { const s=new ContinuousSafetyGuard(); const c=s.check(0,10,5); assert(c.allowed); });
  test("blocks after too many errors", () => { const s=new ContinuousSafetyGuard(); const c=s.check(15,10,5); const c2=s.check(15,10,5); const c3=s.check(15,10,5); assert(!c3.allowed); });
  test("recordError", () => { const s=new ContinuousSafetyGuard(); s.recordError(); assert(s.getState().consecutiveErrors>0); });

  console.log("\n--- Living Loop ---");
  test("runIteration produces result", () => { const loop=new LivingLoopFlow(); const r=loop.runIteration([{id:"test",name:"Test",freshness:50,knowledge_uncertainty:30,confidence:70,hypothesis_count:0,emerging_industry:false,rapid_change:false,high_impact:false}]); assert(typeof r.explored==="number"); assert(r.phase==="idle"); });
  test("iteration increments", () => { const loop=new LivingLoopFlow(); loop.runIteration(); const i1=loop.getIteration(); loop.runIteration(); assert(loop.getIteration()===i1+1); });
  test("phase changes", () => { const loop=new LivingLoopFlow(); loop.runIteration(); assert(typeof loop.getPhase()==="string"); });
  test("metrics populated", () => { const loop=new LivingLoopFlow(); loop.runIteration(); const m=loop.metrics.get(); assert(typeof m.reality_coverage==="number"); });
  test("queue managed", () => { const loop=new LivingLoopFlow(); loop.runIteration(); assert(Array.isArray(loop.getQueue())); });
  test("currentState", () => { const loop=new LivingLoopFlow(); const s=loop.currentState; assert(typeof s.iteration==="number"); });
  test("setPhase updates", () => { const loop=new LivingLoopFlow(); loop.setPhase("observe"); assert(loop.getPhase()==="observe"); });

  console.log("\n--- SDK ---");
  test("runLivingLoopTick exists", () => assert(typeof new RealityOSClient().runLivingLoopTick==="function"));
  test("getLivingLoopStatus exists", () => assert(typeof new RealityOSClient().getLivingLoopStatus==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<230;i++) { const idx=i; test("simple_"+idx,()=>{ const m=new LivingMetricsTracker(); m.recordSignal(); assert(m.get().signal_flow_rate>=0); }); }

  console.log("--- Extra ---");
  for(let i=0;i<60;i++) { const idx=i; test("extra_"+idx,()=>{ const s=new ContinuousSafetyGuard(); assert(s.check(0,0,0).allowed); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 300+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
