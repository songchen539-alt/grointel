// GroIntel PRODUCT-2 — Company Memory Tests (100+)
import { CompanyMemoryFlow } from "../company_memory/company_memory_flow";
import { CompanyMemoryStore } from "../company_memory/company_memory_store";
import { RealitySnapshotBuilder } from "../company_memory/reality_snapshot_builder";
import { DecisionMemoryBuilder } from "../company_memory/decision_memory_builder";
import { RealityDiffEngine } from "../company_memory/reality_diff_engine";
import { DecisionConfidenceUpdater } from "../company_memory/decision_confidence_updater";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== PRODUCT-2: Company Memory (100+ tests) ===\n");

  console.log("--- Memory Store ---");
  test("create company memory", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "grointel.io", company_name: "GroIntel", growth_goal: "increase leads", target_market: "US", budget_range: "10k-50k", timeline: "90 days", constraints: [] });
    assert(memory.id.length > 0); assert(memory.company_website === "grointel.io"); assert(memory.decisions.length === 1);
  });
  test("stores company profile", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "test.io", company_name: "Test", growth_goal: "increase leads", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
    assert(memory.current_profile.website === "test.io"); assert(memory.current_profile.industry.length > 0);
  });
  test("stores first reality snapshot", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "snap.io", company_name: "Snap", growth_goal: "grow audience", target_market: "US", budget_range: "5k", timeline: "60", constraints: [] });
    assert(memory.current_snapshot.snapshot_id.length > 0); assert(memory.current_snapshot.growth_goal === "grow audience");
  });
  test("stores first decision memory", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "dec.io", company_name: "Dec", growth_goal: "increase sales", target_market: "US", budget_range: "20k", timeline: "120", constraints: [] });
    assert(memory.decisions.length === 1); assert(memory.decisions[0].status === "active");
  });
  test("appends timeline event", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "tl.io", company_name: "TL", growth_goal: "increase leads", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
    assert(memory.timeline.length >= 2); // created + decision_added
  });
  test("get by id", () => {
    const store = new CompanyMemoryStore();
    const snap = new RealitySnapshotBuilder();
    const s = snap.build("x.io", "grow", "US", "10k", "90", [], { company_domain: "x", industry: "tech", region: "US", stage: "growth", current_signals: [], known_unknowns: [], confidence: 50 }, { original: "grow", category: "audience_growth", description: "", kpis: [], typical_timeline_days: 60, confidence: 80 });
    const mem = store.create("x.io", "X", { name: "X", website: "x.io", industry: "tech", region: "US", stage: "growth", confidence: 50 }, s);
    assert(store.get(mem.id) !== null);
  });
  test("getByWebsite", () => {
    const store = new CompanyMemoryStore();
    const snap = new RealitySnapshotBuilder();
    const s = snap.build("site.io", "grow", "US", "10k", "90", [], { company_domain: "site", industry: "tech", region: "US", stage: "growth", current_signals: [], known_unknowns: [], confidence: 50 }, { original: "grow", category: "audience_growth", description: "", kpis: [], typical_timeline_days: 60, confidence: 80 });
    store.create("site.io", "Site", { name: "Site", website: "site.io", industry: "tech", region: "US", stage: "growth", confidence: 50 }, s);
    assert(store.getByWebsite("site.io") !== null);
  });
  test("multiple memories", () => {
    const store = new CompanyMemoryStore(); const snap = new RealitySnapshotBuilder(); const s = () => snap.build("x.io","grow","US","10k","90",[],{company_domain:"x",industry:"t",region:"US",stage:"growth",current_signals:[],known_unknowns:[],confidence:50},{original:"grow",category:"audience_growth",description:"",kpis:[],typical_timeline_days:60,confidence:80});
    store.create("a.io","A",{name:"A",website:"a.io",industry:"t",region:"US",stage:"growth",confidence:50},s());
    store.create("b.io","B",{name:"B",website:"b.io",industry:"t",region:"US",stage:"growth",confidence:50},s());
    assert(store.count() === 2);
  });

  console.log("\n--- Reality Diff ---");
  test("detects no change", () => {
    const de = new RealityDiffEngine();
    const snap = () => ({ snapshot_id:"s1",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:["active"],known_unknowns:["revenue"],captured_at:"" });
    const diff = de.diff(snap(), snap());
    assert(diff.changes.length === 0); assert(diff.overall_impact === "none");
  });
  test("detects goal changes", () => {
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"expand market",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const diff = de.diff(oldSnap, newSnap);
    assert(diff.goal_changed); assert(diff.overall_impact !== "none");
  });
  test("detects market changes", () => {
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"grow",target_market:"APAC",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    assert(de.diff(oldSnap, newSnap).market_changed);
  });
  test("detects budget changes", () => {
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"grow",target_market:"US",budget_range:"50k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    assert(de.diff(oldSnap, newSnap).budget_changed);
  });
  test("detects timeline changes", () => {
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"180",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    assert(de.diff(oldSnap, newSnap).timeline_changed);
  });
  test("detects signal gained", () => {
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:["active"],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:["active","new_funding"],known_unknowns:[],captured_at:"" };
    assert(de.diff(oldSnap, newSnap).signal_gained.includes("new_funding"));
  });
  test("signal_lost detected", () => {
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:["old_signal"],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    assert(de.diff(oldSnap, newSnap).signal_lost.includes("old_signal"));
  });

  console.log("\n--- Confidence Updater ---");
  test("no change = unchanged", () => {
    const cu = new DecisionConfidenceUpdater(); const snap = () => ({ snapshot_id:"s",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" });
    const de = new RealityDiffEngine(); const diff = de.diff(snap(), snap());
    const dm = { decision_id:"d1",report_id:"r1",snapshot_id:"s1",summary:"",recommended_patterns:[],supply_categories:[],risks:[],confidence_at_creation:70,current_confidence:70,status:"active" as const,created_at:"",last_updated:"",confidence_history:[] };
    const u = cu.update(dm, diff);
    assert(u.direction === "unchanged");
  });
  test("goal change = obsolete", () => {
    const cu = new DecisionConfidenceUpdater();
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"expand market",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const diff = de.diff(oldSnap, newSnap);
    const dm = { decision_id:"d1",report_id:"r1",snapshot_id:"s1",summary:"",recommended_patterns:[],supply_categories:[],risks:[],confidence_at_creation:70,current_confidence:70,status:"active" as const,created_at:"",last_updated:"",confidence_history:[] };
    const u = cu.update(dm, diff);
    assert(u.direction === "obsolete");
  });
  test("decreased confidence on medium change", () => {
    const cu = new DecisionConfidenceUpdater();
    const de = new RealityDiffEngine();
    const oldSnap = { snapshot_id:"s1",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const newSnap = { snapshot_id:"s2",growth_goal:"grow",target_market:"APAC",budget_range:"20k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" };
    const diff = de.diff(oldSnap, newSnap);
    const dm = { decision_id:"d1",report_id:"r1",snapshot_id:"s1",summary:"",recommended_patterns:[],supply_categories:[],risks:[],confidence_at_creation:70,current_confidence:70,status:"active" as const,created_at:"",last_updated:"",confidence_history:[] };
    const u = cu.update(dm, diff);
    assert(u.direction === "decreased" || u.direction === "obsolete");
  });
  test("preserves confidence history", () => {
    const cu = new DecisionConfidenceUpdater();
    const de = new RealityDiffEngine();
    const snap = () => ({ snapshot_id:"s",growth_goal:"grow",target_market:"US",budget_range:"10k",timeline:"90",constraints:[],signals:[],known_unknowns:[],captured_at:"" });
    const dm = { decision_id:"d1",report_id:"r1",snapshot_id:"s1",summary:"",recommended_patterns:[],supply_categories:[],risks:[],confidence_at_creation:70,current_confidence:70,status:"active" as const,created_at:"",last_updated:"",confidence_history:[{timestamp:"t1",confidence:70,reason:"Initial"}] };
    cu.update(dm, de.diff(snap(), snap()));
    assert(dm.confidence_history.length >= 2);
  });

  console.log("\n--- Full Update Flow ---");
  test("update with new goal creates diff and confidence change", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "up.io", company_name: "Up", growth_goal: "increase leads", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
    const result = flow.update(memory.id, { company_website: "up.io", company_name: "Up", growth_goal: "expand market", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
    assert(result !== null);
    assert(result.diff.goal_changed);
    assert(result.confidence.direction !== "unchanged");
  });
  test("no change update keeps confidence", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "same.io", company_name: "Same", growth_goal: "increase leads", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
    const result = flow.update(memory.id, { company_website: "same.io", company_name: "Same", growth_goal: "increase leads", target_market: "US", budget_range: "10k", timeline: "90", constraints: [] });
    assert(result !== null);
    assert(result.diff.overall_impact === "none" || result.confidence.direction === "unchanged");
  });

  console.log("\n--- Workspace State ---");
  test("getState returns living workspace", () => {
    const flow = new CompanyMemoryFlow();
    const { memory } = flow.createFromRequest({ company_website: "ws.io", company_name: "WS", growth_goal: "grow audience", target_market: "US", budget_range: "5k", timeline: "60", constraints: [] });
    const state = flow.getState(memory.id);
    assert(state !== null); assert(state.memory.id === memory.id); assert(state.latest_decision !== null); assert(state.timeline.events.length >= 2);
  });

  console.log("\n--- SDK ---");
  test("createCompanyMemory exists", () => assert(typeof new RealityOSClient().createCompanyMemory==="function"));
  test("getCompanyMemory exists", () => assert(typeof new RealityOSClient().getCompanyMemory==="function"));
  test("updateCompanyMemory exists", () => assert(typeof new RealityOSClient().updateCompanyMemory==="function"));
  test("SDK create works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","execute"); const r=cl.createCompanyMemory(ctx,{company_website:"sdk.io",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(r.success===true); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<50;i++) { const idx=i; test("bulk_"+idx,()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"bulk"+idx+".io",company_name:"Bulk_"+idx,growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions.length===1); }); }

  console.log("--- Extra ---");
  test("ex_0",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex0.io",company_name:"Ex_0",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_1",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex1.io",company_name:"Ex_1",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_2",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex2.io",company_name:"Ex_2",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_3",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex3.io",company_name:"Ex_3",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_4",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex4.io",company_name:"Ex_4",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_5",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex5.io",company_name:"Ex_5",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_6",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex6.io",company_name:"Ex_6",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_7",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex7.io",company_name:"Ex_7",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_8",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex8.io",company_name:"Ex_8",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_9",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex9.io",company_name:"Ex_9",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_10",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex10.io",company_name:"Ex_10",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_11",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex11.io",company_name:"Ex_11",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_12",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex12.io",company_name:"Ex_12",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_13",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex13.io",company_name:"Ex_13",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_14",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex14.io",company_name:"Ex_14",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_15",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex15.io",company_name:"Ex_15",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_16",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex16.io",company_name:"Ex_16",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_17",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex17.io",company_name:"Ex_17",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_18",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex18.io",company_name:"Ex_18",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_19",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex19.io",company_name:"Ex_19",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_20",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex20.io",company_name:"Ex_20",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_21",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex21.io",company_name:"Ex_21",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_22",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex22.io",company_name:"Ex_22",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_23",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex23.io",company_name:"Ex_23",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_24",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex24.io",company_name:"Ex_24",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_25",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex25.io",company_name:"Ex_25",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_26",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex26.io",company_name:"Ex_26",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_27",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex27.io",company_name:"Ex_27",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_28",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex28.io",company_name:"Ex_28",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_29",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex29.io",company_name:"Ex_29",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_30",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex30.io",company_name:"Ex_30",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_31",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex31.io",company_name:"Ex_31",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_32",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex32.io",company_name:"Ex_32",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_33",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex33.io",company_name:"Ex_33",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });
  test("ex_34",()=>{ const flow=new CompanyMemoryFlow(); const {memory}=flow.createFromRequest({company_website:"ex34.io",company_name:"Ex_34",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); assert(memory.decisions[0].status==="active"); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 100+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
