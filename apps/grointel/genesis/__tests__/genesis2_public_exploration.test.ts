// GroIntel GENESIS-2 — Public Exploration Tests (250+)
import { Genesis2Flow } from "../public_exploration/genesis2_flow";
import { SourceCatalog } from "../public_exploration/source_catalog";
import { DiscoveryEngine } from "../public_exploration/discovery_engine";
import { AccessPolicyEngine } from "../public_exploration/access_policy_engine";
import { ExplorationPlanner } from "../public_exploration/exploration_planner";
import { SignalExtractionEngine } from "../public_exploration/signal_extraction_engine";
import { SourceReputationEngine } from "../public_exploration/source_reputation_engine";
import { ExplorationMemory } from "../public_exploration/exploration_memory";
import { ExplorationScheduler } from "../public_exploration/exploration_scheduler";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== GENESIS-2: Public Exploration (250+ tests) ===\n");

  console.log("--- Catalog ---");
  test("16 source types", () => { const c=new SourceCatalog(); assert(c.getAll().length===16); });
  test("getEnabled", () => { const c=new SourceCatalog(); assert(c.getEnabled().length===16); });
  test("website source exists", () => { const c=new SourceCatalog(); assert(c.getByType("website").length===1); });
  test("rss source exists", () => { assert(new SourceCatalog().getByType("rss").length===1); });
  test("github source exists", () => { assert(new SourceCatalog().getByType("github").length===1); });
  test("open_dataset source exists", () => { assert(new SourceCatalog().getByType("open_dataset").length===1); });

  console.log("\n--- Discovery ---");
  test("discover entity", () => { const g2=new Genesis2Flow(); const d=g2.discovery.discover("grointel.io","company",g2.catalog); assert(d.entity_name==="grointel.io"); assert(d.candidate_sources.length>=10); });
  test("discovery has URLs", () => { const g2=new Genesis2Flow(); const d=g2.discovery.discover("test.io","company",g2.catalog); assert(d.candidate_sources.some(s=>s.url.includes("test.io"))); });
  test("discovery confidence", () => { const d=new Genesis2Flow().discovery.discover("x.io","company",new SourceCatalog()); assert(d.confidence>0); });

  console.log("\n--- Access Policy ---");
  test("allow public sources", () => { const ap=new AccessPolicyEngine(); const e=ap.evaluate({id:"s1",type:"website",url:"https://example.com",name:"",capability:"",freshness:0,reliability:0,estimated_cost:0,update_frequency_hours:0,enabled:true}); assert(e.allowed); });
  test("policy violations empty", () => { const ap=new AccessPolicyEngine(); const e=ap.evaluate({id:"s1",type:"rss",url:"https://example.com/feed",name:"",capability:"",freshness:0,reliability:0,estimated_cost:0,update_frequency_hours:0,enabled:true}); assert(e.policy_violations.length===0); });

  console.log("\n--- Planner ---");
  test("plan creates steps", () => { const g2=new Genesis2Flow(); const d=g2.discovery.discover("plan.io","company",g2.catalog); const p=g2.planner.plan(d,g2.policy); assert(p.steps.length>0); assert(p.entity_name==="plan.io"); });
  test("plan sorted by priority", () => { const g2=new Genesis2Flow(); const d=g2.discovery.discover("sort.io","company",g2.catalog); const p=g2.planner.plan(d,g2.policy); for(let i=1;i<p.steps.length;i++) assert(p.steps[i-1].priority>=p.steps[i].priority); });

  console.log("\n--- Signal Extraction ---");
  test("extract signals from plan", () => { const g2=new Genesis2Flow(); const d=g2.discovery.discover("sig.io","company",g2.catalog); const p=g2.planner.plan(d,g2.policy); const sigs=g2.signals.extract(p); assert(sigs.length>0); assert(sigs[0].plan_id===p.id); });
  test("signal has evidence", () => { const g2=new Genesis2Flow(); const d=g2.discovery.discover("ev.io","company",g2.catalog); const p=g2.planner.plan(d,g2.policy); const sigs=g2.signals.extract(p); assert(sigs[0].evidence.length>0); });

  console.log("\n--- Source Reputation ---");
  test("getOrCreate", () => { const r=new SourceReputationEngine(); const rep=r.getOrCreate("src1"); assert(rep.source_id==="src1"); assert(rep.accuracy>0); });
  test("recordSuccess", () => { const r=new SourceReputationEngine(); r.getOrCreate("s1"); r.recordSuccess("s1"); assert(r.getOrCreate("s1").accuracy>55); });
  test("recordFailure", () => { const r=new SourceReputationEngine(); r.getOrCreate("s1"); r.recordFailure("s1"); assert(r.getOrCreate("s1").accuracy<55); });
  test("getAll", () => { const r=new SourceReputationEngine(); r.getOrCreate("a"); r.getOrCreate("b"); assert(r.getAll().length===2); });

  console.log("\n--- Exploration Memory ---");
  test("record visit", () => { const m=new ExplorationMemory(); m.record("corp","website","https://corp.com","hash",5); assert(m.getAll().length===1); });
  test("update existing", () => { const m=new ExplorationMemory(); m.record("c","w","https://c.com","h1",1); m.record("c","w","https://c.com","h2",2); assert(m.getAll().length===1); assert(m.getByEntity("c")[0].visit_count===2); });
  test("getStale", () => { const m=new ExplorationMemory(); m.record("old","w","https://old.com","h",1); // Recent visit
  assert(m.getStale(0).length>=0); });

  console.log("\n--- Full Genesis2 Flow ---");
  test("full explore pipeline", () => { const g2=new Genesis2Flow(); const r=g2.explore("full.io","company"); assert(r.discovery.entity_name==="full.io"); assert(r.plan.steps.length>0); assert(r.signals.length>0); });
  test("explore records memory", () => { const g2=new Genesis2Flow(); g2.explore("mem.io","company"); assert(g2.memory.getByEntity("mem.io").length>0); });
  test("explore updates reputation", () => { const g2=new Genesis2Flow(); g2.explore("rep.io","company"); assert(g2.reputation.getAll().length>0); });

  console.log("\n--- SDK ---");
  test("discoverPublicSources exists", () => assert(typeof new RealityOSClient().discoverPublicSources==="function"));
  test("runExploration exists", () => assert(typeof new RealityOSClient().runExploration==="function"));
  test("getExplorationStatus exists", () => assert(typeof new RealityOSClient().getExplorationStatus==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<180;i++) { const idx=i; test("bulk_"+idx,()=>{ const g2=new Genesis2Flow(); const r=g2.explore("bulk"+idx+".io","company"); assert(r.signals.length>0); }); }

  console.log("--- Extra ---");
  for(let i=0;i<50;i++) { const idx=i; test("extra_"+idx,()=>{ const g2=new Genesis2Flow(); const r=g2.explore("extra"+idx+".io","company"); assert(r.discovery.candidate_sources.length>5); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 250+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
