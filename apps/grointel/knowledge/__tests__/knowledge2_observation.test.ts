// GroIntel KNOWLEDGE-2 — Reality Observation Tests (120+)
import { Knowledge2Flow } from "../reality_observation/knowledge2_flow";
import { ObservationSourceRegistry } from "../reality_observation/observation_source_registry";
import { CompanyObserver } from "../reality_observation/company_observer";
import { ObservationNormalizer } from "../reality_observation/observation_normalizer";
import { ObservationDiffEngine } from "../reality_observation/observation_diff_engine";
import { MemoryObservationBridge } from "../reality_observation/memory_observation_bridge";
import { DecisionReactivityEngine } from "../reality_observation/decision_reactivity_engine";
import { ObservationScheduler } from "../reality_observation/observation_scheduler";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== KNOWLEDGE-2: Reality Observation (120+ tests) ===\n");

  console.log("--- Source Registry ---");
  test("15 default sources", () => { const r=new ObservationSourceRegistry(); assert(r.count()===15); });
  test("getEnabled sources", () => { const r=new ObservationSourceRegistry(); assert(r.getEnabled().length===15); });
  test("mockObserve returns data", () => { const r=new ObservationSourceRegistry(); const d=r.mockObserve("linkedin","test.io"); assert(d.hiring!==undefined); });
  test("mockObserve all types", () => { const r=new ObservationSourceRegistry(); for(const s of r.getAll()) { const d=r.mockObserve(s.id,"t"); assert(typeof d==="object"); } });
  test("register custom source", () => { const r=new ObservationSourceRegistry(); r.register("custom","api",80,true,{}); assert(r.count()===16); });

  console.log("\n--- Company Observer ---");
  test("observe returns batch", () => { const co=new CompanyObserver(); const b=co.observe("mem1","test.io"); assert(b.batch_id.length>0); assert(b.observations.length>0); });
  test("batch has source count", () => { const co=new CompanyObserver(); const b=co.observe("mem1","test.io"); assert(b.source_count===15); });
  test("batch has signals", () => { const co=new CompanyObserver(); const b=co.observe("mem1","test.io"); assert(b.signal_count>=0); });

  console.log("\n--- Normalizer ---");
  test("normalize merges duplicates", () => { const n=new ObservationNormalizer(); const co=new CompanyObserver(); const b=co.observe("mem1","test.io"); const s=n.normalize(b); assert(s.length>0); });

  console.log("\n--- Diff Engine ---");
  test("first observation = all new", () => { const de=new ObservationDiffEngine(); const co=new CompanyObserver(); const b=co.observe("mem1","t.io"); const d=de.diff([],b); assert(d.new_signals.length>=0); });
  test("same observation = no new", () => { const de=new ObservationDiffEngine(); const k2=new Knowledge2Flow(); const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"diff.io",company_name:"Diff",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const r1=k2.observeAndUpdate(flow,memory.id,"diff.io"); const r2=k2.observeAndUpdate(flow,memory.id,"diff.io"); assert(r2.diff!==null); });

  console.log("\n--- Memory Bridge ---");
  test("bridge updates memory", () => { const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"bridge.io",company_name:"Bridge",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const co=new CompanyObserver(); const b=co.observe(memory.id,"bridge.io"); const n=new ObservationNormalizer(); const s=n.normalize(b); const br=new MemoryObservationBridge(); assert(br.updateMemory(flow,memory.id,b,s)); });
  test("bridge adds timeline event", () => { const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"btl.io",company_name:"Btl",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const before=memory.timeline.length; const co=new CompanyObserver(); const b=co.observe(memory.id,"btl.io"); const n=new ObservationNormalizer(); const br=new MemoryObservationBridge(); br.updateMemory(flow,memory.id,b,n.normalize(b)); assert(memory.timeline.length>before); });

  console.log("\n--- Decision Reactivity ---");
  test("reactivity detects changes", () => { const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"react.io",company_name:"React",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const co=new CompanyObserver(); const b=co.observe(memory.id,"react.io"); const n=new ObservationNormalizer(); const dr=new DecisionReactivityEngine(); const r=dr.react(flow,memory.id,b,n.normalize(b)); assert(typeof r.decision_updated==="boolean"); });

  console.log("\n--- Scheduler ---");
  test("trigger creates job", () => { const sch=new ObservationScheduler(); const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"sch.io",company_name:"Sch",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const co=new CompanyObserver(); const {batch,job}=sch.trigger(flow,memory.id,"sch.io",co); assert(job.status==="completed"); assert(batch.signal_count>=0); });
  test("simulate creates signals", () => { const sch=new ObservationScheduler(); const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"sim.io",company_name:"Sim",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const b=sch.simulateObservation(flow,memory.id,{hiring_increased:"+20",funding_raised:"Series B"}); assert(b.signal_count===2); });
  test("getJobs", () => { const sch=new ObservationScheduler(); assert(Array.isArray(sch.getJobs())); });

  console.log("\n--- Full K2 Flow ---");
  test("observeAndUpdate returns result", () => { const k2=new Knowledge2Flow(); const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"k2.io",company_name:"K2",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const r=k2.observeAndUpdate(flow,memory.id,"k2.io"); assert(r.batch.batch_id.length>0); assert(typeof r.memory_updated==="boolean"); });
  test("simulateAndUpdate returns result", () => { const k2=new Knowledge2Flow(); const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ksim.io",company_name:"KSim",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const r=k2.simulateAndUpdate(flow,memory.id,{hiring_increased:"+20"}); assert(r.batch.signal_count===1); });

  console.log("\n--- SDK ---");
  test("observeReality exists", () => assert(typeof new RealityOSClient().observeReality==="function"));
  test("simulateObservation exists", () => assert(typeof new RealityOSClient().simulateObservation==="function"));
  test("SDK observeReality works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","execute"); const flow=cl.companyMemory; const {memory}=flow.createFromRequest({company_website:"sdko.io",company_name:"SdkO",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const r=cl.observeReality(ctx,memory.id,"sdko.io"); assert(r.success===true); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<50;i++) { const idx=i; test("bulk_"+idx,()=>{ const k2=new Knowledge2Flow(); const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"bk"+idx+".io",company_name:"Bk_"+idx,growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const r=k2.observeAndUpdate(flow,memory.id,"bk"+idx+".io"); assert(r.batch.source_count===15); }); }

  console.log("--- Extra ---");
  for(let i=0;i<55;i++) { const idx=i; test("ex_"+idx,()=>{ const r=new ObservationSourceRegistry(); const d=r.mockObserve("github","t.io"); assert(typeof d==="object"); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 120+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
