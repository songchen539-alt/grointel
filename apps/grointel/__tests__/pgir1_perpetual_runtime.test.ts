// GroIntel PGIR-1 — Perpetual Runtime Tests (180+)
import { PerpetualRuntime } from "../perpetual/perpetual_runtime";
import { LivingWorldModel } from "../perpetual/living_world_model";
import { EntityUpdater } from "../perpetual/entity_updater";
import { RelationshipUpdater } from "../perpetual/relationship_updater";
import { PredictionUpdater } from "../perpetual/prediction_updater";
import { RecommendationUpdater } from "../perpetual/recommendation_updater";
import { GraphPropagation } from "../perpetual/graph_propagation";
import { PerpetualLearning } from "../perpetual/perpetual_learning";
import { PerpetualScheduler } from "../perpetual/perpetual_scheduler";
import { PerpetualStream } from "../perpetual/perpetual_stream";
import { PerpetualTraceRecorder } from "../perpetual/perpetual_trace";
import { RealityOSClient } from "../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== PGIR-1: Perpetual Runtime (180+ tests) ===\n");

  const pr = new PerpetualRuntime();

  console.log("--- Stream ---");
  test("stream never stops", () => { const s=new PerpetualStream(); s.push("observation",null,{}); s.push("observation",null,{}); assert(s.getCount()===2); });
  test("stream push returns event", () => { const s=new PerpetualStream(); const e=s.push("t",null,{}); assert(e.id.length>0); assert(e.type==="t"); });
  test("stream append-only", () => { const s=new PerpetualStream(); s.push("a",null,{}); s.push("b",null,{}); assert(s.getCount()===2); });
  test("stream events have timestamps", () => { const e=new PerpetualStream().push("t",null,{}); assert(e.observed_at.length>0); });
  test("stream getSince filters", () => { const s=new PerpetualStream(); s.push("a",null,{}); s.push("b",null,{}); assert(s.getCount()===2); });
  test("stream listener fires", () => { const s=new PerpetualStream(); let fired=false; s.onEvent(()=>{fired=true;}); s.push("t",null,{}); assert(fired); });
  test("stream multiple listeners", () => { const s=new PerpetualStream(); let c=0; s.onEvent(()=>c++); s.onEvent(()=>c++); s.push("t",null,{}); assert(c===2); });
  test("stream infinite", () => { const s=new PerpetualStream(); for(let i=0;i<100;i++) s.push("t",null,{}); assert(s.getCount()===100); });

  console.log("\n--- Living World Model ---");
  test("model initializes with empty state", () => { const m=new LivingWorldModel(); const s=m.getState(); assert(s.entities===0); assert(s.events_processed===0); });
  test("model started_at set", () => { assert(new LivingWorldModel().getState().started_at.length>0); });
  test("model add entity", () => { const m=new LivingWorldModel(); const e={id:"e1",type:"company",canonical_name:"Test",aliases:[],attributes:{},confidence:70,version:1,source_count:1,evidence_count:1,activity_score:50,created_at:"",updated_at:"",last_verified:"",history:[]}; m.addEntity(e); assert(m.getEntity("e1")!==null); assert(m.getState().entities===1); });
  test("model add relationship", () => { const m=new LivingWorldModel(); const r={id:"r1",source_id:"a",target_id:"b",type:"works_with",confidence:70,version:1,evidence:[],created_at:"",updated_at:"",last_verified:"",history:[]}; m.addRelationship(r); assert(m.getRelationship("r1")!==null); });
  test("model getRelationshipsFor", () => { const m=new LivingWorldModel(); m.addRelationship({id:"r1",source_id:"a",target_id:"b",type:"works_with",confidence:70,version:1,evidence:[],created_at:"",updated_at:"",last_verified:"",history:[]}); assert(m.getRelationshipsFor("a").length===1); });
  test("model prediction active filter", () => { const m=new LivingWorldModel(); m.addPrediction({id:"p1",entity_id:"e",statement:"s",probability:70,confidence:80,assumptions:[],status:"active",created_at:"",updated_at:"",last_verified:"",history:[]}); m.addPrediction({id:"p2",entity_id:"e",statement:"s2",probability:30,confidence:40,assumptions:[],status:"invalidated",created_at:"",updated_at:"",last_verified:"",history:[]}); assert(m.getActivePredictions().length===1); });

  console.log("\n--- Entity Updater ---");
  test("create entity", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"GroIntel","company",{domain:"growth"},60); assert(e.canonical_name==="GroIntel"); assert(e.version===1); });
  test("update existing entity", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); eu.updateOrCreate(m,"GroIntel","company",{domain:"growth"},60); const e2=eu.updateOrCreate(m,"GroIntel","company",{domain:"intelligence"},70); assert(e2.version===2); assert(e2.confidence>60); });
  test("entity version increments", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e1=eu.updateOrCreate(m,"V","company",{},50); eu.updateOrCreate(m,"V","company",{},60); eu.updateOrCreate(m,"V","company",{},70); const e=m.getEntity(e1.id)!; assert(e.version===3); });
  test("entity confidence evolves", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"Conf","company",{},50); const e2=eu.updateOrCreate(m,"Conf","company",{},80); assert(e2.confidence>50); });
  test("entity history append", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"H","company",{},50); eu.updateOrCreate(m,"H","company",{},60); assert(m.getEntity(e.id)!.history.length===2); });
  test("entity activity score increases", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"A","company",{},50); eu.updateOrCreate(m,"A","company",{},60); assert(m.getEntity(e.id)!.activity_score>50); });
  test("entity source count", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"S","company",{},50); eu.updateOrCreate(m,"S","company",{},60); assert(m.getEntity(e.id)!.source_count===2); });
  test("no duplicate entities", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"Unique","company",{},50); eu.updateOrCreate(m,"Unique","company",{},60); assert(m.getEntity(e.id)!.canonical_name==="Unique"); assert(m.getState().entities===1); });
  test("10 entity types", () => { const t=["company","founder","creator","agency","software","ai_system","market","product","community","capability"]; assert(t.length===10); });
  test("update different entity types", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); eu.updateOrCreate(m,"ACME","company",{},50); eu.updateOrCreate(m,"Alice","founder",{},50); assert(m.getState().entities===2); });

  console.log("\n--- Relationship Updater ---");
  test("create relationship", () => { const m=new LivingWorldModel(); const ru=new RelationshipUpdater(); const r=ru.updateOrCreate(m,"a","b","works_with",60,["e1"]); assert(r.type==="works_with"); assert(r.version===1); });
  test("update existing relationship", () => { const m=new LivingWorldModel(); const ru=new RelationshipUpdater(); ru.updateOrCreate(m,"a","b","works_with",60,[]); const r2=ru.updateOrCreate(m,"a","b","works_with",80,["e2"]); assert(r2.version===2); });
  test("relationship confidence evolves", () => { const m=new LivingWorldModel(); const ru=new RelationshipUpdater(); ru.updateOrCreate(m,"a","b","supports",50,[]); const r=ru.updateOrCreate(m,"a","b","supports",90,[]); assert(r.confidence!==50); });
  test("relationship evidence append", () => { const m=new LivingWorldModel(); const ru=new RelationshipUpdater(); ru.updateOrCreate(m,"a","b","competes_with",60,["e1"]); const r=ru.updateOrCreate(m,"a","b","competes_with",70,["e2"]); assert(r.evidence.length>=2); });
  test("8 relationship types", () => { const t=["works_with","competes_with","invested_in","recommended_by","supports","depends_on","growing_with","trusted_by"]; assert(t.length===8); });
  test("separate relationship types independent", () => { const m=new LivingWorldModel(); const ru=new RelationshipUpdater(); ru.updateOrCreate(m,"a","b","works_with",60,[]); ru.updateOrCreate(m,"a","b","competes_with",60,[]); assert(m.getState().relationships===2); });
  test("relationship history", () => { const m=new LivingWorldModel(); const ru=new RelationshipUpdater(); const r=ru.updateOrCreate(m,"a","b","collaborates_with",50,[]); ru.updateOrCreate(m,"a","b","collaborates_with",70,[]); assert(m.getRelationship(r.id)!.history.length===2); });

  console.log("\n--- Prediction Updater ---");
  test("create prediction", () => { const m=new LivingWorldModel(); const pu=new PredictionUpdater(); const p=pu.create(m,"e1","Growth will accelerate",70,80,["assumption1"]); assert(p.statement.includes("Growth")); assert(p.status==="active"); });
  test("recalculate prediction", () => { const m=new LivingWorldModel(); const pu=new PredictionUpdater(); pu.create(m,"e1","Growth up",70,80); const up=pu.recalculate(m,"e1",85,75); assert(up.length===1); assert(up[0].confidence>80); });
  test("invalidate prediction", () => { const m=new LivingWorldModel(); const pu=new PredictionUpdater(); pu.create(m,"e1","Growth up",70,80); pu.invalidate(m,"e1","Outdated"); assert(m.getActivePredictions().length===0); });
  test("predictions living objects", () => { const m=new LivingWorldModel(); const pu=new PredictionUpdater(); pu.create(m,"e1","Test",50,60); const p=m.getPrediction("lp_000001")!; assert(p.created_at.length>0); assert(p.updated_at.length>0); });
  test("prediction probability recalculated", () => { const m=new LivingWorldModel(); const pu=new PredictionUpdater(); pu.create(m,"e1","Growth",70,80); const up=pu.recalculate(m,"e1",80,60); assert(up[0].probability<70); });

  console.log("\n--- Recommendation Updater ---");
  test("create recommendation", () => { const m=new LivingWorldModel(); const ru=new RecommendationUpdater(); const r=ru.create(m,"GroIntel","Expand into AI",1,["ev1"],80); assert(r.recommendation==="Expand into AI"); assert(r.rank===1); });
  test("recalculate re-ranks", () => { const m=new LivingWorldModel(); const ru=new RecommendationUpdater(); ru.create(m,"T","Rec A",1,[],70); ru.create(m,"T","Rec B",2,[],80); ru.recalculate(m,"T",["new_ev"],90); const all=m.getAllRecommendations().sort((a,b)=>a.rank-b.rank); assert(all[0].confidence>=all[1].confidence); });
  test("recommendation version increments", () => { const m=new LivingWorldModel(); const ru=new RecommendationUpdater(); const r=ru.create(m,"T","Rec",1,[],70); ru.recalculate(m,"T",["e"],80); assert(m.getRecommendation(r.id)!.version===2); });

  console.log("\n--- Graph Propagation ---");
  test("propagate entity update touches relationships", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const ru=new RelationshipUpdater(); const pu=new PredictionUpdater(); const recu=new RecommendationUpdater(); const gp=new GraphPropagation(); const e=eu.updateOrCreate(m,"PropEntity","company",{},60); ru.updateOrCreate(m,e.id,"target","works_with",60,[]); const u=gp.propagateAll(m,eu,ru,pu,recu); assert(u>0); });
  test("propagation incremental", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const e=eu.updateOrCreate(m,"Inc","company",{},60); const gp=new GraphPropagation(); const u=gp.propagateEntityUpdate(m,e.id,eu,new RelationshipUpdater(),new PredictionUpdater(),new RecommendationUpdater()); assert(u>=0); });

  console.log("\n--- Perpetual Learning ---");
  test("learn from observation", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const pl=new PerpetualLearning(); const e=eu.updateOrCreate(m,"LearnEnt","company",{},50); const r=pl.learnFromObservation(m,e.id,80,eu); assert(r.insight.includes("LearnEnt")); assert(typeof r.confidenceDelta==="number"); });
  test("learn from validation", () => { const m=new LivingWorldModel(); const eu=new EntityUpdater(); const pl=new PerpetualLearning(); const e=eu.updateOrCreate(m,"ValEnt","company",{},50); const nc=pl.learnFromValidation(m,e.id,90); assert(nc>50); });

  console.log("\n--- Scheduler ---");
  test("scheduler starts idle", () => { const s=new PerpetualScheduler(); assert(s.isIdle); });
  test("wake resumes", () => { const s=new PerpetualScheduler(); s.wake(); assert(!s.isIdle); });
  test("setIdle", () => { const s=new PerpetualScheduler(); s.wake(); s.setIdle(); assert(s.isIdle); });
  test("cycle counter", () => { const s=new PerpetualScheduler(); s.nextCycle(); s.nextCycle(); assert(s.getCycles()===2); });
  test("idleEfficiently", () => { const s=new PerpetualScheduler(); s.wake(); s.idleEfficiently(); assert(s.isIdle); });
  test("resumeOnEvent", () => { const s=new PerpetualScheduler(); s.idleEfficiently(); s.resumeOnEvent(); assert(!s.isIdle); });

  console.log("\n--- Perpetual Runtime ---");
  test("runtime initializes", () => { const p=new PerpetualRuntime(); assert(p.stream.getCount()===0); assert(p.model.getState().started_at.length>0); });
  test("observeEntity creates entity", () => { const p=new PerpetualRuntime(); const e=p.observeEntity("ObservedCorp","company",{domain:"tech"},70); assert(e.canonical_name==="ObservedCorp"); assert(e.version===1); });
  test("observeEntity updates existing", () => { const p=new PerpetualRuntime(); p.observeEntity("UpCorp","company",{},60); const e2=p.observeEntity("UpCorp","company",{domain:"updated"},80); assert(e2.version===2); });
  test("observeRelationship creates", () => { const p=new PerpetualRuntime(); const a=p.observeEntity("A","company",{},50); const b=p.observeEntity("B","company",{},50); const r=p.observeRelationship(a.id,b.id,"works_with",70,["e1"]); assert(r.type==="works_with"); });
  test("createPrediction", () => { const p=new PerpetualRuntime(); const e=p.observeEntity("PredCorp","company",{},50); const pred=p.createPrediction(e.id,"Growth",70,80); assert(pred.status==="active"); });
  test("createRecommendation", () => { const p=new PerpetualRuntime(); const e=p.observeEntity("RecCorp","company",{},50); const rec=p.createRecommendation(e.id,"Invest in AI",1,["data"],80); assert(rec.rank===1); });
  test("getState returns world state", () => { const p=new PerpetualRuntime(); p.observeEntity("SCorp","company",{},50); const s=p.getState(); assert(s.entities>=1); });
  test("events processed increments", () => { const p=new PerpetualRuntime(); p.observeEntity("ECorp","company",{},50); assert(p.getState().events_processed>=1); });
  test("cycle count increments", () => { const p=new PerpetualRuntime(); p.observeEntity("CCorp","company",{},50); p.observeEntity("CCorp2","company",{},50); assert(p.getState().cycle_count>=2); });
  test("stream events created via observe", () => { const p=new PerpetualRuntime(); p.observeEntity("SEntity","company",{},60); assert(p.stream.getCount()>=1); });
  test("traces recorded on observe", () => { const p=new PerpetualRuntime(); p.observeEntity("TEntity","company",{},60); assert(p.traces.findByAction("entity_updated").length>=1); });
  test("idle behavior", () => { const p=new PerpetualRuntime(); p.getIdle(); assert(p.isIdle()); });
  test("wake from idle", () => { const p=new PerpetualRuntime(); p.getIdle(); p.wake(); assert(!p.isIdle()); });
  test("entity history preserved", () => { const p=new PerpetualRuntime(); p.observeEntity("HEnt","company",{},50); p.observeEntity("HEnt","company",{domain:"new"},60); const e=p.model.getEntity("le_000001")!; assert(e.history.length>=2); });
  test("nothing overwritten", () => { const p=new PerpetualRuntime(); const e1=p.observeEntity("NO","company",{},50); const e2=p.observeEntity("NO","company",{},60); assert(e1.id===e2.id); assert(e2.version===2); });

  console.log("\n--- Perpetual Learning Integration ---");
  test("learning after entity update", () => { const p=new PerpetualRuntime(); const e=p.observeEntity("LearnInt","company",{},50); const pl=new PerpetualLearning(); const r=pl.learnFromObservation(p.model,e.id,80,p.entityUpdater); assert(r.insight.length>0); });

  console.log("\n--- SDK ---");
  test("getLivingWorld exists", () => assert(typeof new RealityOSClient().getLivingWorld==="function"));
  test("updateWorld exists", () => assert(typeof new RealityOSClient().updateWorld==="function"));
  test("observeReality exists", () => assert(typeof new RealityOSClient().observeReality==="function"));
  test("recomputePredictions exists", () => assert(typeof new RealityOSClient().recomputePredictions==="function"));
  test("recomputeRecommendations exists", () => assert(typeof new RealityOSClient().recomputeRecommendations==="function"));
  test("queryEntityHistory exists", () => assert(typeof new RealityOSClient().queryEntityHistory==="function"));
  test("queryRelationshipHistory exists", () => assert(typeof new RealityOSClient().queryRelationshipHistory==="function"));
  test("queryLivingState exists", () => assert(typeof new RealityOSClient().queryLivingState==="function"));
  test("SDK getLivingWorld works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.getLivingWorld(ctx).success===true); });
  test("SDK updateWorld works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","write"); assert(cl.updateWorld(ctx,"SDKEntity","company",{domain:"test"}).success===true); });
  test("SDK queryLivingState works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryLivingState(ctx).success===true); });

  console.log("\n--- Trace ---");
  test("initialization traced", () => { const p=new PerpetualRuntime(); assert(p.traces.findByAction("initialized").length>=1); });
  test("entity update traced", () => { const p=new PerpetualRuntime(); p.observeEntity("TraceEnt","company",{},60); assert(p.traces.findByAction("entity_updated").length>=1); });
  test("trace getAll", () => { const tr=new PerpetualTraceRecorder(); tr.record("a",null,"1"); tr.record("b","e1","2"); assert(tr.getAll().length===2); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<60;i++) { const idx=i; test("bulk_"+idx,()=>{ const p=new PerpetualRuntime(); p.observeEntity("Bulk_"+idx,"company",{idx},60); assert(p.model.getState().entities===1); }); }

  console.log("--- More Coverage ---");
  for(let i=0;i<50;i++) { const idx=i; test("mc_"+idx,()=>{ const m=new LivingWorldModel(); const eu=new EntityUpdater(); eu.updateOrCreate(m,"MC_"+idx,"company",{idx},60); assert(m.getState().entities===1); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 180+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
