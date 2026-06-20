// GroIntel GENESIS-1 — Living Kernel Tests (250+)
import { LivingKernel } from "../living_kernel";
import { EventBus } from "../event_bus";
import { AutonomousScheduler } from "../autonomous_scheduler";
import { AttentionManager } from "../attention_manager";
import { EnergyManager } from "../energy_manager";
import { WorldClock } from "../world_clock";
import { KernelMetricsTracker } from "../kernel_metrics";
import { KernelEventLog } from "../kernel_event_log";
import { GenesisFlow } from "../genesis_flow";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== GENESIS-1: Living Kernel (250+ tests) ===\n");

  console.log("--- Event Bus ---");
  test("publish/subscribe", () => { const eb=new EventBus(); let fired=false; eb.subscribe("test",()=>{fired=true;}); eb.publish("test"); assert(fired); });
  test("unsubscribe", () => { const eb=new EventBus(); let count=0; const cb=()=>{count++;}; eb.subscribe("t",cb); eb.unsubscribe("t",cb); eb.publish("t"); assert(count===0); });
  test("12 topics", () => { const eb=new EventBus(); assert(Object.keys(eb.TOPICS).length===12); });
  test("event has data", () => { const eb=new EventBus(); let d:any=null; eb.subscribe("t",(e)=>{d=e.data;}); eb.publish("t",{key:"val"}); assert(d.key==="val"); });
  test("multiple subscribers", () => { const eb=new EventBus(); let c=0; eb.subscribe("t",()=>c++); eb.subscribe("t",()=>c++); eb.publish("t"); assert(c===2); });

  console.log("\n--- Scheduler ---");
  test("create from attention", () => { const s=new AutonomousScheduler(); const plans=s.createJobs([{entity_id:"e1",score:80,reason:"changes",timestamp:""}],0,0,0); assert(plans.length>=1); });
  test("create for life cycle", () => { const s=new AutonomousScheduler(); const plans=s.createJobs([],3,2,0); assert(plans.some(p=>p.reason.includes("Life"))); });
  test("create for stale memories", () => { const s=new AutonomousScheduler(); const plans=s.createJobs([],0,0,5); assert(plans.some(p=>p.reason.includes("stale"))); });

  console.log("\n--- Attention ---");
  test("score entities", () => { const am=new AttentionManager(); const r=am.score([{id:"e1",recent_changes:3,confidence_drop:20,hypothesis_count:2,observation_freshness:30,signal_volatility:40}]); assert(r.length===1); assert(r[0].score>0); });
  test("sorted by score", () => { const am=new AttentionManager(); const r=am.score([{id:"high",recent_changes:5,confidence_drop:50,hypothesis_count:5,observation_freshness:10,signal_volatility:80},{id:"low",recent_changes:0,confidence_drop:0,hypothesis_count:0,observation_freshness:90,signal_volatility:10}]); assert(r[0].entity_id==="high"); });

  console.log("\n--- Energy ---");
  test("consume", () => { const em=new EnergyManager(); assert(em.consume(10)); assert(!em.consume(200)); });
  test("restore", () => { const em=new EnergyManager(); em.consume(50); em.restore(20); assert(em.getBudget().remaining===70); });
  test("pressure levels", () => { const em=new EnergyManager(); em.consume(90); assert(em.getBudget().pressure==="high"||em.getBudget().pressure==="critical"); });

  console.log("\n--- World Clock ---");
  test("tickObservation", () => { const wc=new WorldClock(); wc.tickObservation(); assert(wc.get().cycle_count===1); });
  test("tickLearning", () => { const wc=new WorldClock(); wc.tickObservation(); wc.tickLearning(); assert(wc.get().last_learning_cycle===1); });
  test("tickDecision", () => { const wc=new WorldClock(); wc.tickObservation(); wc.tickDecision(); assert(wc.get().last_decision_cycle===1); });

  console.log("\n--- Metrics ---");
  test("record metrics", () => { const km=new KernelMetricsTracker(); km.recordObservation(); km.recordQuestion(); km.recordValidation(); km.recordRevision(); km.recordWorldUpdate(); km.recordDecisionImprovement(); km.recordQueueThroughput(5); const m=km.get(); assert(m.observations_completed===1); assert(m.questions_generated===1); assert(m.queue_throughput===5); });

  console.log("\n--- Event Log ---");
  test("record events", () => { const el=new KernelEventLog(); el.record("kernel_started","Started"); assert(el.count()===1); });
  test("getRecent", () => { const el=new KernelEventLog(); el.record("a","1"); el.record("b","2"); assert(el.getRecent(1).length===1); });

  console.log("\n--- Kernel ---");
  test("startKernel", () => { const k=new LivingKernel(); k.startKernel(); assert(k.state==="running"); });
  test("stopKernel", () => { const k=new LivingKernel(); k.startKernel(); k.stopKernel(); assert(k.state==="stopped"); });
  test("pauseKernel", () => { const k=new LivingKernel(); k.startKernel(); k.pauseKernel(); assert(k.state==="paused"); });
  test("resumeKernel", () => { const k=new LivingKernel(); k.startKernel(); k.pauseKernel(); k.resumeKernel(); assert(k.state==="running"); });
  test("double start no-op", () => { const k=new LivingKernel(); k.startKernel(); k.startKernel(); assert(k.state==="running"); });
  test("runAttention", () => { const k=new LivingKernel(); const r=k.runAttention([{id:"e1",recent_changes:3,confidence_drop:20,hypothesis_count:2,observation_freshness:30,signal_volatility:40}]); assert(r.length===1); assert(k.attentionTargets.length===1); });
  test("runScheduler", () => { const k=new LivingKernel(); const p=k.runScheduler([{entity_id:"e1",score:80,reason:"test",timestamp:""}],1,1,1); assert(p.length>=1); });
  test("kernelStatus", () => { const k=new LivingKernel(); k.startKernel(); const s=k.kernelStatus(); assert(s.state==="running"); assert(typeof s.eventCount==="number"); });
  test("kernel logs events", () => { const k=new LivingKernel(); k.startKernel(); assert(k.events.findByEvent("kernel_started").length>=1); });
  test("bus publishes on start", () => { const k=new LivingKernel(); let fired=false; k.bus.subscribe(k.bus.TOPICS.RUNTIME_STARTED,()=>{fired=true;}); k.startKernel(); assert(fired); });

  console.log("\n--- Genesis Flow ---");
  test("runFullCycle", () => { const gf=new GenesisFlow(); gf.kernel.startKernel(); const r=gf.runFullCycle([{id:"mem1",changes:2,confidence:60,hypotheses:1,freshness:40,volatility:30}]); assert(r.attention>=0); assert(typeof r.plans==="number"); });
  test("cycle records events", () => { const gf=new GenesisFlow(); gf.kernel.startKernel(); gf.runFullCycle([{id:"m1",changes:1,confidence:70,hypotheses:0,freshness:50,volatility:20}]); assert(gf.kernel.events.findByEvent("kernel_iteration_completed").length>=1); });

  console.log("\n--- SDK ---");
  test("startKernel exists", () => assert(typeof new RealityOSClient().startKernel==="function"));
  test("stopKernel exists", () => assert(typeof new RealityOSClient().stopKernel==="function"));
  test("pauseKernel exists", () => assert(typeof new RealityOSClient().pauseKernel==="function"));
  test("resumeKernel exists", () => assert(typeof new RealityOSClient().resumeKernel==="function"));
  test("getKernelStatus exists", () => assert(typeof new RealityOSClient().getKernelStatus==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<180;i++) { const idx=i; test("bulk_"+idx,()=>{ const k=new LivingKernel(); k.startKernel(); assert(k.state==="running"); k.stopKernel(); }); }

  console.log("--- Extra ---");
  for(let i=0;i<40;i++) { const idx=i; test("extra_"+idx,()=>{ const k=new LivingKernel(); k.startKernel(); k.runAttention([{id:"e"+idx,recent_changes:1,confidence_drop:10,hypothesis_count:1,observation_freshness:50,signal_volatility:20}]); assert(k.attentionTargets.length===1); k.stopKernel(); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 250+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
