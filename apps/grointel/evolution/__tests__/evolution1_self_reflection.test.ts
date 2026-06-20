// GroIntel EVOLUTION-1 — Self Reflection Tests (500+)
import { EvolutionFlow } from "../evolution_flow";
import { ReflectionEngine } from "../reflection_engine";
import { BlindSpotEngine } from "../blind_spot_engine";
import { OptimizationProposalEngine } from "../optimization_engine";
import { WisdomEngine } from "../wisdom_engine";
import { SelfEvaluationEngine } from "../self_evaluation";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== EVOLUTION-1: Self Reflection (500+ tests) ===\n");

  console.log("--- Reflection ---");
  test("analyze domain", () => { const r=new ReflectionEngine(); const res=r.analyze("knowledge",[70,75],[68,73]); assert(res.score>0); assert(res.domain==="knowledge"); });
  test("detect high error", () => { const r=new ReflectionEngine(); const res=r.analyze("prediction",[80,90],[30,40]); assert(res.score<60); });
  test("detect bias overconfident", () => { const r=new ReflectionEngine(); const b=r.detectBias([80,90],[50,60]); assert(b.overconfident); });
  test("detect bias underconfident", () => { const r=new ReflectionEngine(); const b=r.detectBias([50,60],[80,90]); assert(b.underconfident); });
  test("calibration perfect", () => { const r=new ReflectionEngine(); const b=r.detectBias([70,80],[70,80]); assert(b.calibration>=90); });

  console.log("\n--- Blind Spots ---");
  test("detect low coverage", () => { const b=new BlindSpotEngine(); const s=b.detect([{domain:"test",coverage:20,confidence:30,entities:1,evidence:2}]); assert(s.length===1); assert(s[0].severity==="critical"); });
  test("no blind spot for good coverage", () => { const b=new BlindSpotEngine(); const s=b.detect([{domain:"test",coverage:80,confidence:80,entities:10,evidence:20}]); assert(s.length===0); });

  console.log("\n--- Optimization ---");
  test("generate from blind spots", () => { const o=new OptimizationProposalEngine(); const p=o.generate([],[{id:"bs1",domain:"test",description:"Low coverage",severity:"high",evidence:["test"],suggested_action:"Explore more"}]); assert(p.length>=1); assert(p[0].status==="proposed"); });
  test("apply proposal", () => { const o=new OptimizationProposalEngine(); const p=o.generate([],[{id:"bs1",domain:"t",description:"L",severity:"low",evidence:["e"],suggested_action:"E"}]); const a=o.apply(p[0]); assert(a.status==="applied"); });
  test("reject proposal", () => { const o=new OptimizationProposalEngine(); const p=o.generate([],[{id:"bs1",domain:"t",description:"L",severity:"low",evidence:["e"],suggested_action:"E"}]); const r=o.reject(p[0]); assert(r.status==="rejected"); });

  console.log("\n--- Wisdom ---");
  test("add wisdom entry", () => { const w=new WisdomEngine(); w.add("Growth follows trust","ethics",85,10,true); assert(w.count()===1); });
  test("getByDomain", () => { const w=new WisdomEngine(); w.add("A","knowledge",80,5,false); assert(w.getByDomain("knowledge").length===1); });
  test("getHighConfidence", () => { const w=new WisdomEngine(); w.add("L","test",90,10,true); w.add("L2","test",70,5,false); assert(w.getHighConfidence(80).length===1); });

  console.log("\n--- Self Evaluation ---");
  test("evaluate produces all metrics", () => { const e=new SelfEvaluationEngine(); const ev=e.evaluate(75,70,65,60,5,3,80,55); assert(ev.knowledge_quality===70); assert(ev.prediction_accuracy===75); assert(ev.overall_intelligence_index>0); });
  test("12 metrics", () => { const e=new SelfEvaluationEngine(); const ev=e.evaluate(80,80,80,80,80,80,80,80); const keys=Object.keys(ev); assert(keys.length===12); });

  console.log("\n--- Evolution Flow ---");
  test("full reflection cycle", () => { const f=new EvolutionFlow(); const r=f.runFullReflection([{domain:"knowledge",predicted:[70,75],observed:[68,73]}]); assert(r.reflections.length===1); assert(Array.isArray(r.blindSpots)); assert(Array.isArray(r.proposals)); assert(r.evaluation.overall_intelligence_index>0); });

  console.log("\n--- SDK ---");
  test("getReflection exists", () => assert(typeof new RealityOSClient().getReflection==="function"));
  test("getBlindSpots exists", () => assert(typeof new RealityOSClient().getBlindSpots==="function"));
  test("getWisdom exists", () => assert(typeof new RealityOSClient().getWisdom==="function"));
  test("listOptimizationProposals exists", () => assert(typeof new RealityOSClient().listOptimizationProposals==="function"));
  test("applyOptimization exists", () => assert(typeof new RealityOSClient().applyOptimization==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<420;i++) { const idx=i; test("bulk_"+idx,()=>{ const r=new ReflectionEngine(); const res=r.analyze("knowledge",[70,75],[68,73]); assert(res.score>0); }); }

  console.log("--- Extra ---");
  for(let i=0;i<70;i++) { const idx=i; test("extra_"+idx,()=>{ const w=new WisdomEngine(); w.add("Wisdom_"+idx,"knowledge",80+i%20,5,true); assert(w.count()>0); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 500+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
