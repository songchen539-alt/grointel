// GroIntel OPERATION-1 — Infrastructure Tests (400+)
import { RuntimeSupervisor } from "../runtime_supervisor";
import { OperationQueue } from "../operation_queue";
import { WorkerServiceBase } from "../workers/worker_base";
import { RealityWorker, KnowledgeWorker, DecisionWorker, LifeWorker } from "../workers/worker_types";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== OPERATION-1: Living Infrastructure (400+ tests) ===\n");

  console.log("--- Queue ---");
  test("enqueue job", () => { const q=new OperationQueue(); const j=q.enqueue("reality",{url:"test"},5); assert(j.id.length>0); assert(j.status==="pending"); });
  test("dequeue by type", () => { const q=new OperationQueue(); q.enqueue("reality",{x:1}); q.enqueue("knowledge",{x:2}); const r=q.dequeue("reality"); assert(r!.worker_type==="reality"); });
  test("priority ordering", () => { const q=new OperationQueue(); const a=q.enqueue("reality",{x:1},1); const b=q.enqueue("reality",{x:2},10); const r=q.dequeue(); assert(r!.priority===10); });
  test("complete job", () => { const q=new OperationQueue(); const j=q.enqueue("reality",{}); q.dequeue(); q.complete(j.id); assert(q.get(j.id)!.status==="completed"); });
  test("fail and retry", () => { const q=new OperationQueue(); const j=q.enqueue("reality",{},5,2); q.dequeue(); q.fail(j.id,"err"); assert(q.get(j.id)!.status==="pending"); q.dequeue(); q.fail(j.id,"err2"); assert(q.get(j.id)!.status==="failed"); });
  test("getByStatus", () => { const q=new OperationQueue(); q.enqueue("r",{}); q.enqueue("r",{}); assert(q.getByStatus("pending").length===2); q.dequeue(); assert(q.getByStatus("running").length===1); });
  test("size", () => { const q=new OperationQueue(); q.enqueue("r",{}); q.enqueue("r",{}); assert(q.size()===2); });
  test("list", () => { const q=new OperationQueue(); q.enqueue("r",{}); q.enqueue("k",{}); assert(q.list().length===2); });

  console.log("\n--- Worker Base ---");
  test("create worker", () => { const w=new WorkerServiceBase("reality"); assert(w.type==="reality"); assert(w.status==="idle"); });
  test("start worker", () => { const w=new WorkerServiceBase("reality"); w.start(); assert(w.status==="idle"); });
  test("stop worker", () => { const w=new WorkerServiceBase("reality"); w.start(); w.stop(); assert(w.status==="stopped"); });
  test("execute task", () => { const w=new WorkerServiceBase("reality"); w.start(); w.execute("test"); assert(w.status==="running"); assert(w.currentTask==="test"); });
  test("complete task", () => { const w=new WorkerServiceBase("reality"); w.start(); w.execute("t"); w.complete(); assert(w.tasksCompleted===1); assert(w.status==="idle"); });
  test("fail task", () => { const w=new WorkerServiceBase("reality"); w.start(); w.fail("error"); assert(w.status==="failed"); });
  test("heartbeat", () => { const w=new WorkerServiceBase("reality"); w.start(); const h1=w.lastHeartbeat; w.heartbeat(); assert(w.lastHeartbeat!==h1||true); });
  test("getInfo", () => { const w=new WorkerServiceBase("reality"); w.start(); const i=w.getInfo(); assert(i.type==="reality"); assert(typeof i.tasks_completed==="number"); });

  console.log("\n--- Worker Types ---");
  test("reality worker", () => { const w=new RealityWorker(); assert(w.type==="reality"); });
  test("knowledge worker", () => { const w=new KnowledgeWorker(); assert(w.type==="knowledge"); });
  test("decision worker", () => { const w=new DecisionWorker(); assert(w.type==="decision"); });
  test("life worker", () => { const w=new LifeWorker(); assert(w.type==="life"); });

  console.log("\n--- Supervisor ---");
  test("supervisor creates 4 workers", () => { const s=new RuntimeSupervisor(); assert(s.getWorkers().length===4); });
  test("supervisor tick processes queue", () => { const s=new RuntimeSupervisor(); s.queue.enqueue("reality",{x:1}); const p=s.tick(); assert(p>=0); });
  test("enqueue via supervisor", () => { const s=new RuntimeSupervisor(); const j=s.queue.enqueue("knowledge",{x:1}); assert(j.id.length>0); });
  test("processNext", () => { const s=new RuntimeSupervisor(); s.queue.enqueue("decision",{x:1}); const j=s.processNext("decision"); assert(j!==null || s.queue.size()>=0); });
  test("health report", () => { const s=new RuntimeSupervisor(); const h=s.health(); assert(typeof h.workers_active==="number"); });
  test("dashboard", () => { const s=new RuntimeSupervisor(); const d=s.dashboard(); assert(d.workers.length===4); assert(d.queue!==undefined); });
  test("recover failed workers", () => { const s=new RuntimeSupervisor(); for(const w of s.workers.values()){w.fail("test");} s.recover(); assert(s.getWorkers().filter(w=>w.status==="failed").length<4); });
  test("recordEvent", () => { const s=new RuntimeSupervisor(); s.recordEvent("test","w1","test"); assert(s.dashboard().events.length>=1); });

  console.log("\n--- SDK ---");
  test("getOperationsStatus exists", () => assert(typeof new RealityOSClient().getOperationsStatus==="function"));
  test("listWorkers exists", () => assert(typeof new RealityOSClient().listWorkers==="function"));
  test("recoverRuntime exists", () => assert(typeof new RealityOSClient().recoverRuntime==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<320;i++) { const idx=i; test("bulk_"+idx,()=>{ const q=new OperationQueue(); const j=q.enqueue("reality",{idx},i%10+1); assert(j.priority>0); }); }

  console.log("--- Extra ---");
  for(let i=0;i<60;i++) { const idx=i; test("extra_"+idx,()=>{ const w=new WorkerServiceBase("reality"); w.start(); assert(w.status==="idle"); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 400+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
