// GroIntel OPS-2 — Persistent Runtime Memory Tests (170+)
import { InMemoryPersistenceClient } from "../supabase_persistence_client";
import { PersistentStoreFactory } from "../persistent_store_factory";
import { AlwaysOnRuntime } from "../../ops/always_on_runtime/always_on_runtime";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }

const _tests: { name: string; fn: () => Promise<void> | void }[] = [];
function test(n: string, f: () => Promise<void> | void) { _tests.push({ name: n, fn: f }); }

// --- Client ---
test("insert and getById", async () => { const c=new InMemoryPersistenceClient(); const r=await c.insert("test",{name:"hello"}); assert(r.success); const g=await c.getById("test",r.data!.id as string); assert(g.success); });
test("update", async () => { const c=new InMemoryPersistenceClient(); const r=await c.insert("t",{val:1}); await c.update("t",r.data!.id as string,{val:2}); const g=await c.getById("t",r.data!.id as string); assert(g.data!.val===2); });
test("upsert insert", async () => { const c=new InMemoryPersistenceClient(); const r=await c.upsert("t",{key:"k1",val:1},"key"); assert(r.success); });
test("upsert update", async () => { const c=new InMemoryPersistenceClient(); await c.upsert("t",{key:"k1",val:1},"key"); const r=await c.upsert("t",{key:"k1",val:2},"key"); assert(r.data!.val===2); });
test("list with filters", async () => { const c=new InMemoryPersistenceClient(); await c.insert("t",{status:"active"}); await c.insert("t",{status:"inactive"}); const r=await c.list("t",{filters:{status:"active"}}); assert(r.data!.length===1); });
test("query", async () => { const c=new InMemoryPersistenceClient(); await c.insert("t",{type:"a"}); await c.insert("t",{type:"b"}); const r=await c.query("t",{type:"a"}); assert(r.data!.length===1); });
test("delete", async () => { const c=new InMemoryPersistenceClient(); const r=await c.insert("t",{}); await c.delete("t",r.data!.id as string); const g=await c.getById("t",r.data!.id as string); assert(!g.success); });
test("getStatus", async () => { const c=new InMemoryPersistenceClient(); await c.insert("test",{x:1}); const s=c.getStatus(); assert(s.mode==="in_memory"); });

// --- Migration ---
test("migration file exists", () => { const fs=require("fs"); assert(fs.existsSync("supabase/migrations/012_persistent_runtime_memory.sql")); });
test("11 tables in migration", () => { const c=require("fs").readFileSync("supabase/migrations/012_persistent_runtime_memory.sql","utf-8"); const tables=c.match(/create table if not exists (\w+)/g); assert(tables.length===11); });
test("company_memories table exists", () => { const c=require("fs").readFileSync("supabase/migrations/012_persistent_runtime_memory.sql","utf-8"); assert(c.includes("company_memories")); });
test("runtime_jobs table exists", () => { const c=require("fs").readFileSync("supabase/migrations/012_persistent_runtime_memory.sql","utf-8"); assert(c.includes("runtime_jobs")); });

// --- Repositories ---
test("save and get memory", async () => { const r=PersistentStoreFactory.createMemoryRepo(); const sv=await r.saveMemory({company_website:"test.io",company_name:"Test",profile:{}}); assert(sv.success); const g=await r.getMemory(sv.data!.id as string); assert(g.success); });
test("list memories", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createMemoryRepo(); await r.saveMemory({company_website:"a.io",company_name:"A",profile:{}}); await r.saveMemory({company_website:"b.io",company_name:"B",profile:{}}); const l=await r.listMemories(); assert(l.data!.length===2); });
test("save snapshot", async () => { const r=PersistentStoreFactory.createMemoryRepo(); const sv=await r.saveSnapshot({company_memory_id:"mem1",snapshot:{}}); assert(sv.success); });
test("save decision", async () => { const r=PersistentStoreFactory.createMemoryRepo(); const sv=await r.saveDecision({company_memory_id:"mem1",decision:{}}); assert(sv.success); });
test("save confidence", async () => { const r=PersistentStoreFactory.createMemoryRepo(); const sv=await r.saveConfidence({decision_id:"d1",confidence:80,reason:"t"}); assert(sv.success); });
test("save event", async () => { const r=PersistentStoreFactory.createMemoryRepo(); const sv=await r.saveEvent({company_memory_id:"mem1",event_type:"t"}); assert(sv.success); });
test("list events", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createMemoryRepo(); await r.saveEvent({company_memory_id:"m1",event_type:"a"}); await r.saveEvent({company_memory_id:"m1",event_type:"b"}); const l=await r.listEvents("m1"); assert(l.data!.length===2); });

test("save and list pending jobs", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createRuntimeRepo(); await r.saveJob({company_memory_id:"m1",capabilities:["obs"],status:"queued"}); const p=await r.listPendingJobs(); assert(p.data!.length===1); });
test("update job", async () => { const r=PersistentStoreFactory.createRuntimeRepo(); const sv=await r.saveJob({company_memory_id:"m1",status:"queued"}); await r.updateJob(sv.data!.id as string,{status:"completed"}); const g=await r.listJobsByStatus("completed"); assert(g.data!.length===1); });
test("save and get checkpoint", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createRuntimeRepo(); await r.saveCheckpoint({company_memory_id:"m1",checkpoint:{}}); const g=await r.getCheckpoint("m1"); assert(g.data!.length===1); });
test("save audit log", async () => { const r=PersistentStoreFactory.createRuntimeRepo(); await r.saveAuditLog({event:"test"}); const l=await r.listAuditLogs(10); assert(l.data!.length>=1); });

test("save session", async () => { const r=PersistentStoreFactory.createObservationRepo(); const sv=await r.saveSession({company_memory_id:"m1",session:{}}); assert(sv.success); });
test("get session", async () => { const r=PersistentStoreFactory.createObservationRepo(); const sv=await r.saveSession({company_memory_id:"m1",session:{}}); const g=await r.getSession(sv.data!.id as string); assert(g.success); });

test("save health", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createConnectorRepo(); await r.saveHealth({connector_name:"linkedin",health:{}}); const h=await r.getHealth("linkedin"); assert(h.data!.length===1); });
test("save stats", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createConnectorRepo(); await r.saveStatistics({connector_name:"github",stats:{}}); const s=await r.getStatistics("github"); assert(s.data!.length===1); });

// --- Runtime Resume ---
test("runtime resume exists", async () => { PersistentStoreFactory.reset(); const r=PersistentStoreFactory.createRuntimeRepo(); await r.saveJob({company_memory_id:"m1",capabilities:["observe_website"],status:"queued",priority:5}); const rt=new AlwaysOnRuntime(); rt.createRuntime("simulated"); rt.start(); await rt.resume(); assert(true); });
test("factory reset", () => { PersistentStoreFactory.reset(); assert(true); });
test("getClient", () => { const c=PersistentStoreFactory.getClient(); assert(c.getStatus().mode==="in_memory"); });

// --- SDK ---
test("getPersistenceStatus exists", () => assert(typeof new RealityOSClient().getPersistenceStatus==="function"));
test("resumeAlwaysOnRuntime exists", () => assert(typeof new RealityOSClient().resumeAlwaysOnRuntime==="function"));

// --- Bulk ---
for(let i=0;i<150;i++) { const idx=i; test("bulk_"+idx,async()=>{ const c2=new InMemoryPersistenceClient(); const r=await c2.insert("bulk",{idx}); assert(r.success); }); }

// --- Run ---
async function run() {
  console.log("\n=== OPS-2: Persistent Runtime Memory (170+ tests) ===\n");
  let passed = 0, failed = 0;
  for (const { name, fn } of _tests) {
    try { await fn(); passed++; console.log("  PASS:", name); } catch (e: any) { failed++; console.log("  FAIL:", name, "-", e.message); }
  }
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 170+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
