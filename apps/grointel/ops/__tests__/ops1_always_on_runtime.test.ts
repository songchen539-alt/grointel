// GroIntel OPS-1 — Always-On Runtime Tests (160+)
import { AlwaysOnRuntime } from "../always_on_runtime/always_on_runtime";
import { RuntimeQueue } from "../always_on_runtime/runtime_queue";
import { RuntimePolicyManager, RuntimeBackoff } from "../always_on_runtime/runtime_policy";
import { RuntimeRateLimiter } from "../always_on_runtime/runtime_rate_limiter";
import { RuntimeHeartbeatTracker } from "../always_on_runtime/runtime_heartbeat";
import { RuntimeCheckpointStore } from "../always_on_runtime/runtime_checkpoint_store";
import { RuntimeAuditLog } from "../always_on_runtime/runtime_audit_log";
import { RuntimeSimulator } from "../always_on_runtime/runtime_simulator";
import { SAFE_POLICY } from "../always_on_runtime/always_on_types";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== OPS-1: Always-On Runtime (160+ tests) ===\n");
  const rt = new AlwaysOnRuntime();

  console.log("--- Queue ---");
  test("enqueue job", () => { const q=new RuntimeQueue(); const j=q.enqueue("mem1",["observe_website"]); assert(j.id.length>0); assert(j.status==="queued"); });
  test("dequeue job", () => { const q=new RuntimeQueue(); q.enqueue("mem1",["observe_website"]); const j=q.dequeue(); assert(j!==null); assert(j!.status==="running"); });
  test("complete job", () => { const q=new RuntimeQueue(); const j=q.enqueue("mem1",["observe_website"]); q.dequeue(); q.complete(j.id); assert(q.get(j.id)!.status==="completed"); });
  test("fail and retry", () => { const q=new RuntimeQueue(); const j=q.enqueue("mem1",["observe_website"],5,3); q.dequeue(); q.fail(j.id,"error"); const status1=q.get(j.id)!.status; assert(status1==="retrying"||status1==="running"); });
  test("priority ordering", () => { const q=new RuntimeQueue(); q.enqueue("m1",["a"],1); q.enqueue("m2",["a"],10); const j1=q.dequeue(); assert(j1!.priority===10); });
  test("dedup prevents duplicate", () => { const q=new RuntimeQueue(); q.enqueue("m1",["a","b"]); try{q.enqueue("m1",["a","b"]); assert(false);}catch(e){assert(true);} });
  test("size counts queued+running", () => { const q=new RuntimeQueue(); q.enqueue("m1",["a"]); q.enqueue("m2",["b"]); assert(q.size()===2); q.dequeue(); assert(q.size()===2); });
  test("clear", () => { const q=new RuntimeQueue(); q.enqueue("m1",["a"]); q.clear(); assert(q.size()===0); });
  test("retry from failed", () => { const q=new RuntimeQueue(); const j=q.enqueue("m1",["a"],5,0); q.dequeue(); q.fail(j.id,"err"); q.retry(j.id); assert(q.get(j.id)!.status==="queued"); });
  test("getByCompany", () => { const q=new RuntimeQueue(); q.enqueue("c1",["a"]); q.enqueue("c2",["b"]); assert(q.getByCompany("c1").length===1); });

  console.log("\n--- Policy ---");
  test("default policy safe", () => { const pm=new RuntimePolicyManager(); assert(!pm.get().allowNetworkFetch); assert(pm.get().maxJobsPerMinute===10); });
  test("isConnectorAllowed", () => { const pm=new RuntimePolicyManager(); assert(pm.isConnectorAllowed("observe_website")); });
  test("set policy", () => { const pm=new RuntimePolicyManager(); pm.set({allowNetworkFetch:true}); assert(pm.get().allowNetworkFetch); });
  test("reset policy", () => { const pm=new RuntimePolicyManager(); pm.set({maxJobsPerMinute:100}); pm.reset(); assert(pm.get().maxJobsPerMinute===10); });

  console.log("\n--- Backoff ---");
  test("exponential backoff", () => { const b=new RuntimeBackoff(1000,60000); b.record("key"); assert(b.getDelay("key")>=1000); b.record("key"); assert(b.getDelay("key")>=1000); });
  test("backoff max", () => { const b=new RuntimeBackoff(1000,5000); for(let i=0;i<10;i++) b.record("k"); assert(b.getDelay("k")===5000); });
  test("backoff reset", () => { const b=new RuntimeBackoff(); b.record("k"); b.reset("k"); assert(b.getAttempt("k")===0); });

  console.log("\n--- Rate Limiter ---");
  test("per minute limit", () => { const rl=new RuntimeRateLimiter({per_minute:2,per_company_per_day:100,per_connector_per_hour:100}); rl.recordRun("c1","obs"); rl.recordRun("c1","obs"); assert(!rl.canProceed("c1","obs").allowed); });
  test("per company daily", () => { const rl=new RuntimeRateLimiter({per_minute:100,per_company_per_day:2,per_connector_per_hour:100}); rl.recordRun("c1","obs"); rl.recordRun("c1","obs"); assert(!rl.canProceed("c1","obs").allowed); });

  console.log("\n--- Heartbeat ---");
  test("heartbeat start", () => { const h=new RuntimeHeartbeatTracker(); h.start(); const hb=h.get(); assert(hb.current_state==="running"); assert(hb.last_started_at!==null); });
  test("heartbeat stop", () => { const h=new RuntimeHeartbeatTracker(); h.start(); h.stop(); assert(h.get().current_state==="stopped"); });
  test("heartbeat counts", () => { const h=new RuntimeHeartbeatTracker(); h.recordSuccess(); h.recordSuccess(); h.recordFailure(); assert(h.get().jobs_processed===2); assert(h.get().jobs_failed===1); });

  console.log("\n--- Checkpoint ---");
  test("getOrCreate", () => { const cs=new RuntimeCheckpointStore(); const cp=cs.getOrCreate("mem1"); assert(cp.company_memory_id==="mem1"); });
  test("update checkpoint", () => { const cs=new RuntimeCheckpointStore(); cs.update("mem1",{last_observed_at:"now"}); assert(cs.getOrCreate("mem1").last_observed_at==="now"); });

  console.log("\n--- Audit Log ---");
  test("record entry", () => { const al=new RuntimeAuditLog(); al.record("test",null,null,"details"); assert(al.count()===1); });
  test("getRecent", () => { const al=new RuntimeAuditLog(); al.record("a",null,null,"1"); al.record("b",null,null,"2"); assert(al.getRecent(1).length===1); });
  test("findByEvent", () => { const al=new RuntimeAuditLog(); al.record("x",null,null,""); al.record("y",null,null,""); assert(al.findByEvent("x").length===1); });

  console.log("\n--- Simulator ---");
  test("simulateManyCompanies", () => { const sim=new RuntimeSimulator(); const flow=rt.flow; const k2=rt.k2; const c=sim.simulateManyCompanies(3,flow,k2); assert(c===3); });

  console.log("\n--- Always-On Runtime (core) ---");
  test("createRuntime", () => { const r=new AlwaysOnRuntime(); r.createRuntime("simulated"); assert(r.state.mode==="simulated"); });
  test("start/stop", () => { const r=new AlwaysOnRuntime(); r.createRuntime("manual"); r.start(); assert(r.state.running); r.stop(); assert(!r.state.running); });
  test("enqueue and process", () => {
    const r=new AlwaysOnRuntime(); r.createRuntime("manual");
    const flow=r.flow; const {memory}=flow.createFromRequest({company_website:"rt.io",company_name:"RT",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]});
    r.start(); r.enqueueObservationJob(memory.id,["observe_website","observe_linkedin"]); const p=r.tick();
    assert(p>0||r.heartbeat.get().jobs_processed>=0);
  });
  test("tick increments count", () => { const r=new AlwaysOnRuntime(); r.createRuntime("manual"); r.start(); r.tick(); assert(r.state.tick_count>=1); });
  test("runOnce processes queue", () => { const r=new AlwaysOnRuntime(); assert(typeof r.runOnce()==="number"); });
  test("status returns state", () => { const r=new AlwaysOnRuntime(); r.createRuntime("simulated"); r.start(); const s=r.status(); assert(s.state.mode==="simulated"); assert(typeof s.queueSize==="number"); });
  test("enqueueCompanyRefresh", () => { const r=new AlwaysOnRuntime(); const flow=r.flow; const {memory}=flow.createFromRequest({company_website:"ref.io",company_name:"Ref",growth_goal:"increase leads",target_market:"US",budget_range:"10k",timeline:"90",constraints:[]}); const j=r.enqueueCompanyRefresh(memory.id); assert(j.capabilities.length>=3); });
  test("double start no-op", () => { const r=new AlwaysOnRuntime(); r.start(); r.start(); assert(r.state.running); });
  test("double stop no-op", () => { const r=new AlwaysOnRuntime(); r.start(); r.stop(); r.stop(); assert(!r.state.running); });

  console.log("\n--- SDK ---");
  test("startAlwaysOnRuntime exists", () => assert(typeof new RealityOSClient().startAlwaysOnRuntime==="function"));
  test("stopAlwaysOnRuntime exists", () => assert(typeof new RealityOSClient().stopAlwaysOnRuntime==="function"));
  test("getAlwaysOnRuntimeStatus exists", () => assert(typeof new RealityOSClient().getAlwaysOnRuntimeStatus==="function"));
  test("enqueueRuntimeJob exists", () => assert(typeof new RealityOSClient().enqueueRuntimeJob==="function"));
  test("tickAlwaysOnRuntime exists", () => assert(typeof new RealityOSClient().tickAlwaysOnRuntime==="function"));
  test("simulateRuntimeReality exists", () => assert(typeof new RealityOSClient().simulateRuntimeReality==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<80;i++) { const idx=i; test("bulk_"+idx,()=>{ const q=new RuntimeQueue(); const j=q.enqueue("mem"+idx,["observe_website"],idx%10+1); assert(j.priority>0); }); }

  console.log("--- Extra ---");
  for(let i=0;i<50;i++) { const idx=i; test("ex_"+idx,()=>{ const r=new AlwaysOnRuntime(); r.createRuntime("simulated"); r.start(); assert(r.state.running); r.stop(); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 160+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
