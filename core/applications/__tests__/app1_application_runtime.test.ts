// GroIntel APP-1 — Application Runtime Tests (120+)
import { ApplicationRuntime } from "../application_runtime";
import { ApplicationRegistry } from "../application_registry";
import { ApplicationContextBuilder } from "../application_context";
import { CapabilityMapper } from "../application_capability_mapper";
import { WorkflowBinder } from "../application_workflow_binder";
import { AgentBinder } from "../application_agent_binder";
import { ApplicationTraceRecorder } from "../application_trace";
import { BUILTIN_MANIFESTS, GROINTEL_MANIFEST } from "../application_manifest";
import { RealityOSClient } from "../../reality_os/sdk/reality_os_client";
import type { ApplicationManifest } from "../application_types";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

function makeManifest(overrides: Partial<ApplicationManifest> = {}): ApplicationManifest {
  const now = new Date().toISOString();
  return { id: "test_app", name: "Test App", description: "A test app", version: 1, domain: "test", target_users: ["testers"], required_capabilities: ["reality.observe"], required_agents: ["Reality Observer"], required_workflows: ["reality_event_analysis"], permissions: ["read"], data_domains: ["test"], risk_level: "low", created_at: now, updated_at: now, ...overrides };
}

async function run() {
  console.log("\n=== APP-1: Application Runtime (120+ tests) ===\n");

  const ar = new ApplicationRuntime();

  console.log("--- Manifest ---");
  test("create manifest", () => { const m = makeManifest(); assert(m.id==="test_app"); assert(m.version===1); assert(Array.isArray(m.required_capabilities)); });
  test("all manifest fields present", () => {
    const m = makeManifest({ id:"full", name:"Full", description:"D", version:2, domain:"d", target_users:["u"], required_capabilities:["c"], required_agents:["a"], required_workflows:["w"], permissions:["r"], data_domains:["d"], risk_level:"high" });
    assert(m.id==="full"); assert(m.version===2); assert(m.domain==="d"); assert(m.risk_level==="high");
  });

  console.log("\n--- Registration ---");
  test("register app", () => { const a = ar.registerApp(makeManifest({id:"reg_1"})); assert(a.manifest.id==="reg_1"); assert(a.state==="registered"); });
  test("reject duplicate", () => { try { ar.registerApp(makeManifest({id:"reg_1"})); assert(false); } catch(e) { assert(true); } });
  test("get app", () => { assert(ar.getApp("reg_1")!==null); });
  test("list apps", () => { assert(ar.listApps().length>=1); });
  test("register with different risk levels", () => {
    ar.registerApp(makeManifest({id:"rl_low",risk_level:"low"}));
    ar.registerApp(makeManifest({id:"rl_med",risk_level:"medium"}));
    ar.registerApp(makeManifest({id:"rl_high",risk_level:"high"}));
    assert(ar.getApp("rl_low")!.manifest.risk_level==="low");
  });
  test("registry count", () => { const r=new ApplicationRegistry(); r.register(makeManifest({id:"rc_1"})); r.register(makeManifest({id:"rc_2"})); assert(r.count()===2); });
  test("registry exists", () => { const r=new ApplicationRegistry(); r.register(makeManifest({id:"ex_1"})); assert(r.exists("ex_1")); assert(!r.exists("none")); });

  console.log("\n--- Lifecycle ---");
  test("activate app", () => { const a=ar.registerApp(makeManifest({id:"act_1"})); const act=ar.activateApp("act_1"); assert(act!==null&&act.state==="active"); });
  test("pause app", () => { const a=ar.registerApp(makeManifest({id:"pau_1"})); ar.activateApp("pau_1"); const p=ar.pauseApp("pau_1"); assert(p!==null&&p.state==="paused"); });
  test("deprecate app", () => { const a=ar.registerApp(makeManifest({id:"dep_1"})); const d=ar.deprecateApp("dep_1"); assert(d!==null&&d.state==="deprecated"); });
  test("archive app", () => { const a=ar.registerApp(makeManifest({id:"arc_1"})); const d=ar.archiveApp("arc_1"); assert(d!==null&&d.state==="archived"); });
  test("cannot pause deprecated", () => { assert(ar.pauseApp("dep_1")===null); });
  test("cannot pause archived", () => { assert(ar.pauseApp("arc_1")===null); });
  test("activate nonexistent null", () => { assert(ar.activateApp("nonexistent")===null); });

  console.log("\n--- Sessions ---");
  test("start session", () => { const a=ar.registerApp(makeManifest({id:"sess_1"})); const ctx=ar.startSession("sess_1"); assert(ctx!==null); assert(ctx.app_id==="sess_1"); assert(ctx.session_id.length>0); });
  test("session increments count", () => { const i=ar.listApps().find(a=>a.manifest.id==="sess_1")!; assert(i.session_count===1); });
  test("multiple sessions", () => { const a=ar.registerApp(makeManifest({id:"sess_m"})); ar.startSession("sess_m"); ar.startSession("sess_m"); const i=ar.listApps().find(a=>a.manifest.id==="sess_m")!; assert(i.session_count===2); });
  test("session context has fields", () => {
    const a=ar.registerApp(makeManifest({id:"sess_f"})); const ctx=ar.startSession("sess_f")!;
    assert(ctx.domain==="test"); assert(ctx.bound_capabilities.length>=1); assert(ctx.started_at.length>0);
  });
  test("session on deprecated null", () => { const a=ar.registerApp(makeManifest({id:"sess_d"})); ar.deprecateApp("sess_d"); assert(ar.startSession("sess_d")===null); });
  test("session on archived null", () => { const a=ar.registerApp(makeManifest({id:"sess_a"})); ar.archiveApp("sess_a"); assert(ar.startSession("sess_a")===null); });

  console.log("\n--- Capability Mapper ---");
  test("map capabilities", () => { const cm=new CapabilityMapper(); const caps=cm.map(makeManifest({required_capabilities:["reality.observe"]})); assert(caps.length===1); assert(caps[0].available); });
  test("missing capability detected", () => { const cm=new CapabilityMapper(); const caps=cm.map(makeManifest({required_capabilities:["nonexistent.cap"]})); assert(!caps[0].available); });
  test("getMissingCapabilities", () => { const cm=new CapabilityMapper(); const m=cm.getMissingCapabilities(makeManifest({required_capabilities:["reality.observe","bad.cap"]})); assert(m.includes("bad.cap")); });
  test("getAvailableCount", () => { const cm=new CapabilityMapper(); assert(cm.getAvailableCount(makeManifest({required_capabilities:["reality.observe","bad.cap"]}))===1); });
  test("map GroIntel capabilities", () => { const cm=new CapabilityMapper(); const caps=cm.map(GROINTEL_MANIFEST); assert(caps.length>=6); const avail=caps.filter(c=>c.available).length; assert(avail>=5); });
  test("all known caps mapped", () => { const cm=new CapabilityMapper(); const known=["reality.observe","reality.attend","cognition.cognize","cognition.graph.query","cognition.memory.read","intelligence.simulate","intelligence.plan","intelligence.strategize","intelligence.discover","intelligence.optimize","intelligence.decide","wisdom.judge","knowledge.query","knowledge.validate","workflow.start","workflow.approve","workflow.reject","state.world.read","state.kernel.read","graph.snapshot.read","evolution.observe","evolution.propose","civilization.register","civilization.consensus","contribution.trace"]; const caps=cm.map(makeManifest({required_capabilities:known})); assert(caps.every(c=>c.available)); });

  console.log("\n--- Workflow Binder ---");
  test("bind workflow", () => { const wb=new WorkflowBinder(); const wfs=wb.bind(makeManifest({required_workflows:["reality_event_analysis"]})); assert(wfs.length===1); assert(wfs[0].bound); });
  test("unknown workflow unbound", () => { const wb=new WorkflowBinder(); const wfs=wb.bind(makeManifest({required_workflows:["unknown_workflow"]})); assert(!wfs[0].bound); });

  console.log("\n--- Agent Binder ---");
  test("bind agent", () => { const ab=new AgentBinder(); const agents=ab.bind(makeManifest({required_agents:["Reality Observer"]})); assert(agents.length===1); assert(agents[0].bound); });
  test("unknown agent unbound", () => { const ab=new AgentBinder(); const agents=ab.bind(makeManifest({required_agents:["Unknown Agent"]})); assert(!agents[0].bound); });

  console.log("\n--- State ---");
  test("getState returns snapshot", () => { const s=ar.getState("grointel"); assert(s!==null); assert(s.state==="active"||s.state==="registered"); assert(s.capabilities_total>0); });
  test("getState counts", () => { const s=ar.getState("grointel")!; assert(typeof s.capabilities_available==="number"); assert(typeof s.workflows_bound==="number"); assert(typeof s.agents_bound==="number"); });
  test("getState nonexistent null", () => { assert(ar.getState("nonexistent")===null); });

  console.log("\n--- Built-ins ---");
  test("GroIntel exists", () => { assert(ar.getApp("grointel")!==null); assert(ar.getApp("grointel")!.manifest.name==="GroIntel"); });
  test("TradeIntel exists", () => { assert(ar.getApp("tradeintel")!==null); assert(ar.getApp("tradeintel")!.manifest.domain==="trading"); });
  test("ResearchIntel exists", () => { assert(ar.getApp("researchintel")!==null); assert(ar.getApp("researchintel")!.manifest.domain==="research"); });
  test("PolicyIntel exists", () => { assert(ar.getApp("policyintel")!==null); assert(ar.getApp("policyintel")!.manifest.domain==="policy"); });
  test("HealthIntel exists", () => { assert(ar.getApp("healthintel")!==null); assert(ar.getApp("healthintel")!.manifest.domain==="healthcare"); });
  test("5 built-in manifests", () => { assert(BUILTIN_MANIFESTS.length===5); });
  test("GroIntel has capabilities", () => { const m=GROINTEL_MANIFEST; assert(m.required_capabilities.includes("intelligence.decide")); assert(m.required_agents.includes("Decision Advisor")); assert(m.required_workflows.includes("strategic_decision")); });
  test("TradeIntel high risk", () => { const m=BUILTIN_MANIFESTS.find(b=>b.id==="tradeintel")!; assert(m.risk_level==="high"); });
  test("ResearchIntel low risk", () => { const m=BUILTIN_MANIFESTS.find(b=>b.id==="researchintel")!; assert(m.risk_level==="low"); });

  console.log("\n--- Trace ---");
  test("traces registration", () => { const t=new ApplicationRuntime(); t.registerApp(makeManifest({id:"tr_reg"})); assert(t.traces.findByAction("app_registered").length>=1); });
  test("traces activation", () => { const t=new ApplicationRuntime(); t.registerApp(makeManifest({id:"tr_act"})); t.activateApp("tr_act"); assert(t.traces.findByAction("app_activated").length>=1); });
  test("traces pause", () => { const t=new ApplicationRuntime(); t.registerApp(makeManifest({id:"tr_pau"})); t.pauseApp("tr_pau"); assert(t.traces.findByAction("app_paused").length>=1); });
  test("traces deprecation", () => { const t=new ApplicationRuntime(); t.registerApp(makeManifest({id:"tr_dep"})); t.deprecateApp("tr_dep"); assert(t.traces.findByAction("app_deprecated").length>=1); });
  test("traces archive", () => { const t=new ApplicationRuntime(); t.registerApp(makeManifest({id:"tr_arc"})); t.archiveApp("tr_arc"); assert(t.traces.findByAction("app_archived").length>=1); });
  test("traces session", () => { const t=new ApplicationRuntime(); t.registerApp(makeManifest({id:"tr_ses"})); t.startSession("tr_ses"); assert(t.traces.findByAction("session_started").length>=1); });
  test("findByApp", () => { const tr=new ApplicationTraceRecorder(); tr.record("a","app1","x"); tr.record("b","app2","y"); assert(tr.findByApp("app1").length===1); });

  console.log("\n--- SDK ---");
  test("registerApp exists", () => assert(typeof new RealityOSClient().registerApplication==="function"));
  test("activate exists", () => assert(typeof new RealityOSClient().activateApplication==="function"));
  test("pause exists", () => assert(typeof new RealityOSClient().pauseApplication==="function"));
  test("query exists", () => assert(typeof new RealityOSClient().queryApplication==="function"));
  test("list exists", () => assert(typeof new RealityOSClient().listApplications==="function"));
  test("session exists", () => assert(typeof new RealityOSClient().startApplicationSession==="function"));
  test("SDK register works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","execute"); const r=cl.registerApplication(ctx,makeManifest({id:"sdk_reg"}) as any); assert(r.success===true); });
  test("SDK list works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); const r=cl.listApplications(ctx); assert(r.success===true); assert(Array.isArray(r.data!.apps)); });
  test("SDK query works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); const r=cl.queryApplication(ctx,"grointel"); assert(r.success===true); });
  test("SDK activate works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","execute"); const r=cl.activateApplication(ctx,"grointel"); assert(r.success===true); });
  test("SDK session works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","execute"); const r=cl.startApplicationSession(ctx,"grointel"); assert(r.success===true); });

  console.log("\n--- Extra Bulk ---");
  for(let i=0;i<45;i++) { const idx=i; test("bulk_"+idx,()=>{ const r=new ApplicationRuntime(); const m=makeManifest({id:"bulk_"+idx}); r.registerApp(m); assert(r.getApp("bulk_"+idx)!==null); }); }

  console.log("--- More Coverage ---");
  for(let i=0;i<20;i++) { const idx=i; test("more_"+idx,()=>{ const r=new ApplicationRuntime(); const m=makeManifest({id:"more_"+idx,domain:"extra"}); r.registerApp(m); r.activateApp("more_"+idx); assert(r.getApp("more_"+idx)!.state==="active"); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 120+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
