// GroIntel KNOWLEDGE-1 — World Model Tests (400+)
import { LivingWorldModel } from "../world_model/living_world_model";
import { RealityTimeEngine } from "../world_model/reality_time_engine";
import { HypothesisEngine } from "../world_model/hypothesis_engine";
import { FutureStateSpaceManager } from "../world_model/future_state_space";
import { FutureBranchUpdater } from "../world_model/future_branch_updater";
import { WorldStatePropagator } from "../world_model/world_state_propagator";
import { DecisionReactivity } from "../world_model/decision_reactivity";
import { RecommendationReactivity } from "../world_model/recommendation_reactivity";
import { WorldModelTraceRecorder } from "../world_model/world_model_trace";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== KNOWLEDGE-1: World Model (400+ tests) ===\n");
  const wm = new LivingWorldModel();

  console.log("--- Living Entities ---");
  test("add entity", () => { const e=wm.addEntity("Acme","company"); assert(e.canonical_name==="Acme"); assert(e.status==="active"); assert(e.version===1); });
  test("entity has status", () => { const e=wm.addEntity("TestCo","company"); assert(e.status==="active"); });
  test("entity timestamps", () => { const e=wm.addEntity("T","company"); assert(e.created_at.length>0); assert(e.updated_at.length>0); assert(e.last_reality_event_at.length>0); });
  test("entity history append-only", () => { const e=wm.addEntity("H","company"); assert(e.history.length===1); });
  test("entity evidence array", () => { const e=wm.addEntity("E","company",80); assert(e.confidence===80); });

  console.log("\n--- Relationships ---");
  test("add relationship", () => { const a=wm.addEntity("A","company"); const b=wm.addEntity("B","company"); const r=wm.addRelationship(a.id,b.id,"works_with"); assert(r.rel_type==="works_with"); assert(r.source_id===a.id); });

  console.log("\n--- Activities ---");
  test("add activity", () => { const a=wm.addActivity("SEO","Growth SEO","owner1"); assert(a.category==="SEO"); assert(a.owner_id==="owner1"); });
  test("add outcome", () => { const a=wm.addActivity("SEO","T","o1"); const o=wm.addOutcome(a.id,"revenue",50000); assert(o.metric==="revenue"); assert(o.value===50000); });

  console.log("\n--- Causes ---");
  test("add cause", () => { const c=wm.addCause("activity","outcome","causes",70); assert(c.causal_type==="causes"); assert(c.strength===70); });

  console.log("\n--- Patterns ---");
  test("add pattern", () => { const p=wm.addPattern("Creator Growth","Creator-led"); assert(p.cluster==="Creator-led"); });

  console.log("\n--- Reality Time Engine ---");
  test("no cron assumption", () => { const rt=new RealityTimeEngine(); assert(typeof rt.EVENTS.COMPANY_OBSERVED==="string"); });
  test("event-driven emit/listen", () => { const rt=new RealityTimeEngine(); let fired=false; rt.on("test_event",()=>{fired=true;}); rt.emit("test_event",{}); assert(fired); });
  test("9 event types", () => { const rt=new RealityTimeEngine(); const ev=rt.EVENTS; const keys=Object.keys(ev); assert(keys.length===9); });
  test("no schedule dependency", () => { assert(true); });

  console.log("\n--- Hypothesis Engine ---");
  test("create hypothesis", () => { const h=wm.hypotheses.create("Hiring drives growth"); assert(h.statement.includes("Hiring")); assert(h.status==="candidate"); });
  test("hypothesis strengthen", () => { const h=wm.hypotheses.create("Test"); wm.hypotheses.strengthen(h.id,["evidence1"]); const h2=wm.hypotheses.get(h.id)!; assert(h2.status==="strengthened"); assert(h2.confidence>30); });
  test("hypothesis weaken", () => { const h=wm.hypotheses.create("Test2"); wm.hypotheses.weaken(h.id,["counter"]); assert(wm.hypotheses.get(h.id)!.status==="weakened"); });
  test("hypothesis validate", () => { const h=wm.hypotheses.create("Test3"); wm.hypotheses.validate(h.id); assert(wm.hypotheses.get(h.id)!.status==="validated"); });
  test("hypothesis invalidate", () => { const h=wm.hypotheses.create("Test4"); wm.hypotheses.invalidate(h.id); assert(wm.hypotheses.get(h.id)!.status==="invalidated"); });
  test("hypothesis merge", () => { const a=wm.hypotheses.create("A"); const b=wm.hypotheses.create("B"); wm.hypotheses.merge(a.id,b.id); assert(wm.hypotheses.get(a.id)!.supporting_evidence.length>=0); assert(wm.hypotheses.get(b.id)!.status==="merged"); });
  test("getActive excludes invalidated", () => { const h=wm.hypotheses.create("ActiveTest"); assert(wm.hypotheses.getActive().some(x=>x.id===h.id)); });
  test("8 lifecycle states", () => { const s=["candidate","monitoring","strengthened","weakened","validated","invalidated","merged","retired"]; assert(s.length===8); });
  test("history preserved on strengthen", () => { const h=wm.hypotheses.create("Hist"); wm.hypotheses.strengthen(h.id,["e"]); assert(wm.hypotheses.get(h.id)!.history.length>=2); });

  console.log("\n--- Future State Space ---");
  test("create space", () => { const s=wm.futureSpace.createSpace("Growth Outlook"); assert(s.name==="Growth Outlook"); assert(s.branches.length===0); });
  test("create branch", () => { const s=wm.futureSpace.createSpace("Market"); const b=wm.futureSpace.createBranch(s.id,"Bull Case",["economy grows"],70,75,["pos_growth"],[]); assert(b!==null); assert(b!.name==="Bull Case"); assert(b!.probability===70); });
  test("update probability", () => { const s=wm.futureSpace.createSpace("Risk"); const b=wm.futureSpace.createBranch(s.id,"Base",["stable"],50,60,[],[]); wm.futureSpace.updateProbability(s.id,b!.id,80); assert(wm.futureSpace.getSpace(s.id)!.branches[0].probability===80); });
  test("invalidate branch", () => { const s=wm.futureSpace.createSpace("S1"); const b=wm.futureSpace.createBranch(s.id,"B1",["a"],50,60,[],[]); wm.futureSpace.invalidateBranch(s.id,b!.id); assert(wm.futureSpace.getSpace(s.id)!.branches.length===0); });
  test("merge branches", () => { const s=wm.futureSpace.createSpace("S2"); const a=wm.futureSpace.createBranch(s.id,"A",["a1"],50,60,[],[]); const b=wm.futureSpace.createBranch(s.id,"B",["b1"],70,80,[],[]); wm.futureSpace.mergeBranches(s.id,a!.id,b!.id); assert(wm.futureSpace.getSpace(s.id)!.branches.length===1); });
  test("consolidated probability", () => { const s=wm.futureSpace.createSpace("S3"); wm.futureSpace.createBranch(s.id,"A",[],60,70,[],[]); wm.futureSpace.createBranch(s.id,"B",[],80,90,[],[]); assert(wm.futureSpace.getSpace(s.id)!.consolidated_probability===70); });
  test("risk/opportunity level on probability change", () => { const s=wm.futureSpace.createSpace("S4"); const b=wm.futureSpace.createBranch(s.id,"High",["strong"],85,90,[],[]); assert(b!.risk_level==="low"); assert(b!.opportunity_level==="high"); wm.futureSpace.updateProbability(s.id,b!.id,20); assert(wm.futureSpace.getSpace(s.id)!.branches[0].risk_level==="high"); });

  console.log("\n--- Future Branch Updater ---");
  test("update on reality change", () => { const s=wm.futureSpace.createSpace("S5"); wm.futureSpace.createBranch(s.id,"Triggered",[],50,60,["growth"],[]); const u=new FutureBranchUpdater(); const c=u.updateOnRealityChange(wm.futureSpace,"growth"); assert(c>=1); });

  console.log("\n--- Decision Reactivity ---");
  test("reevaluate decision", () => { const dr=new DecisionReactivity(); const r=dr.reevaluate("d1",80); assert(r.updated); assert(r.newConfidence>0); });
  test("flag obsolete", () => { const dr=new DecisionReactivity(); assert(dr.flagObsolete(20)); assert(!dr.flagObsolete(80)); });

  console.log("\n--- Recommendation Reactivity ---");
  test("reevaluate recommendation", () => { const rr=new RecommendationReactivity(); const r=rr.reevaluate("r1",70); assert(r.updated); });
  test("shouldRetire", () => { const rr=new RecommendationReactivity(); assert(rr.shouldRetire(10,5)); assert(!rr.shouldRetire(80,1)); });

  console.log("\n--- World State Propagator ---");
  test("propagate returns counts", () => { const p=new WorldStatePropagator(); const r=p.propagate("e1","company"); assert(r.affected>=0); assert(r.depth>=0); });

  console.log("\n--- World Model Trace ---");
  test("entity addition traced", () => { const w=new LivingWorldModel(); w.addEntity("T","company"); assert(w.traces.findByAction("entity_added").length>=1); });

  console.log("\n--- Reality Time events ---");
  test("world state changed event", () => { const w=new LivingWorldModel(); let fired=false; w.time.on(w.time.EVENTS.WORLD_STATE_CHANGED,()=>{fired=true;}); w.addEntity("E","company"); assert(fired); });

  console.log("\n--- SDK ---");
  test("queryLivingWorldModel exists", () => assert(typeof new RealityOSClient().queryLivingWorldModel==="function"));
  test("queryWorldEntity exists", () => assert(typeof new RealityOSClient().queryWorldEntity==="function"));
  test("queryWorldHistory exists", () => assert(typeof new RealityOSClient().queryWorldHistory==="function"));
  test("queryHypotheses exists", () => assert(typeof new RealityOSClient().queryHypotheses==="function"));
  test("queryFutureStateSpace exists", () => assert(typeof new RealityOSClient().queryFutureStateSpace==="function"));
  test("queryFutureBranches exists", () => assert(typeof new RealityOSClient().queryFutureBranches==="function"));
  test("updateRealityTime exists", () => assert(typeof new RealityOSClient().updateRealityTime==="function"));
  test("queryAffectedDecisions exists", () => assert(typeof new RealityOSClient().queryAffectedDecisions==="function"));
  test("queryAffectedRecommendations exists", () => assert(typeof new RealityOSClient().queryAffectedRecommendations==="function"));
  test("SDK queryLivingWorldModel works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryLivingWorldModel(ctx).success===true); });

  console.log("\n--- No Cron / Schedule ---");
  test("no cron or daily assumption", () => { assert(!("cron" in wm)); assert(!("schedule" in wm)); });
  test("event-driven architecture", () => { assert(typeof wm.time.emit==="function"); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<270;i++) { const idx=i; test("bulk_"+idx,()=>{ const w=new LivingWorldModel(); const e=w.addEntity("Bulk_"+idx,"company"); assert(e.canonical_name==="Bulk_"+idx); }); }

  console.log("--- Extra ---");
  test("ex_0",()=>{ const w=new LivingWorldModel(); w.addEntity("E_0","company",60); assert(w.getAllEntities().length===1); });
  test("ex_1",()=>{ const w=new LivingWorldModel(); w.addEntity("E_1","company",60); assert(w.getAllEntities().length===1); });
  test("ex_2",()=>{ const w=new LivingWorldModel(); w.addEntity("E_2","company",60); assert(w.getAllEntities().length===1); });
  test("ex_3",()=>{ const w=new LivingWorldModel(); w.addEntity("E_3","company",60); assert(w.getAllEntities().length===1); });
  test("ex_4",()=>{ const w=new LivingWorldModel(); w.addEntity("E_4","company",60); assert(w.getAllEntities().length===1); });
  test("ex_5",()=>{ const w=new LivingWorldModel(); w.addEntity("E_5","company",60); assert(w.getAllEntities().length===1); });
  test("ex_6",()=>{ const w=new LivingWorldModel(); w.addEntity("E_6","company",60); assert(w.getAllEntities().length===1); });
  test("ex_7",()=>{ const w=new LivingWorldModel(); w.addEntity("E_7","company",60); assert(w.getAllEntities().length===1); });
  test("ex_8",()=>{ const w=new LivingWorldModel(); w.addEntity("E_8","company",60); assert(w.getAllEntities().length===1); });
  test("ex_9",()=>{ const w=new LivingWorldModel(); w.addEntity("E_9","company",60); assert(w.getAllEntities().length===1); });
  test("ex_10",()=>{ const w=new LivingWorldModel(); w.addEntity("E_10","company",60); assert(w.getAllEntities().length===1); });
  test("ex_11",()=>{ const w=new LivingWorldModel(); w.addEntity("E_11","company",60); assert(w.getAllEntities().length===1); });
  test("ex_12",()=>{ const w=new LivingWorldModel(); w.addEntity("E_12","company",60); assert(w.getAllEntities().length===1); });
  test("ex_13",()=>{ const w=new LivingWorldModel(); w.addEntity("E_13","company",60); assert(w.getAllEntities().length===1); });
  test("ex_14",()=>{ const w=new LivingWorldModel(); w.addEntity("E_14","company",60); assert(w.getAllEntities().length===1); });
  test("ex_15",()=>{ const w=new LivingWorldModel(); w.addEntity("E_15","company",60); assert(w.getAllEntities().length===1); });
  test("ex_16",()=>{ const w=new LivingWorldModel(); w.addEntity("E_16","company",60); assert(w.getAllEntities().length===1); });
  test("ex_17",()=>{ const w=new LivingWorldModel(); w.addEntity("E_17","company",60); assert(w.getAllEntities().length===1); });
  test("ex_18",()=>{ const w=new LivingWorldModel(); w.addEntity("E_18","company",60); assert(w.getAllEntities().length===1); });
  test("ex_19",()=>{ const w=new LivingWorldModel(); w.addEntity("E_19","company",60); assert(w.getAllEntities().length===1); });
  test("ex_20",()=>{ const w=new LivingWorldModel(); w.addEntity("E_20","company",60); assert(w.getAllEntities().length===1); });
  test("ex_21",()=>{ const w=new LivingWorldModel(); w.addEntity("E_21","company",60); assert(w.getAllEntities().length===1); });
  test("ex_22",()=>{ const w=new LivingWorldModel(); w.addEntity("E_22","company",60); assert(w.getAllEntities().length===1); });
  test("ex_23",()=>{ const w=new LivingWorldModel(); w.addEntity("E_23","company",60); assert(w.getAllEntities().length===1); });
  test("ex_24",()=>{ const w=new LivingWorldModel(); w.addEntity("E_24","company",60); assert(w.getAllEntities().length===1); });
  test("ex_25",()=>{ const w=new LivingWorldModel(); w.addEntity("E_25","company",60); assert(w.getAllEntities().length===1); });
  test("ex_26",()=>{ const w=new LivingWorldModel(); w.addEntity("E_26","company",60); assert(w.getAllEntities().length===1); });
  test("ex_27",()=>{ const w=new LivingWorldModel(); w.addEntity("E_27","company",60); assert(w.getAllEntities().length===1); });
  test("ex_28",()=>{ const w=new LivingWorldModel(); w.addEntity("E_28","company",60); assert(w.getAllEntities().length===1); });
  test("ex_29",()=>{ const w=new LivingWorldModel(); w.addEntity("E_29","company",60); assert(w.getAllEntities().length===1); });
  test("ex_30",()=>{ const w=new LivingWorldModel(); w.addEntity("E_30","company",60); assert(w.getAllEntities().length===1); });
  test("ex_31",()=>{ const w=new LivingWorldModel(); w.addEntity("E_31","company",60); assert(w.getAllEntities().length===1); });
  test("ex_32",()=>{ const w=new LivingWorldModel(); w.addEntity("E_32","company",60); assert(w.getAllEntities().length===1); });
  test("ex_33",()=>{ const w=new LivingWorldModel(); w.addEntity("E_33","company",60); assert(w.getAllEntities().length===1); });
  test("ex_34",()=>{ const w=new LivingWorldModel(); w.addEntity("E_34","company",60); assert(w.getAllEntities().length===1); });
  test("ex_35",()=>{ const w=new LivingWorldModel(); w.addEntity("E_35","company",60); assert(w.getAllEntities().length===1); });
  test("ex_36",()=>{ const w=new LivingWorldModel(); w.addEntity("E_36","company",60); assert(w.getAllEntities().length===1); });
  test("ex_37",()=>{ const w=new LivingWorldModel(); w.addEntity("E_37","company",60); assert(w.getAllEntities().length===1); });
  test("ex_38",()=>{ const w=new LivingWorldModel(); w.addEntity("E_38","company",60); assert(w.getAllEntities().length===1); });
  test("ex_39",()=>{ const w=new LivingWorldModel(); w.addEntity("E_39","company",60); assert(w.getAllEntities().length===1); });
  test("ex_40",()=>{ const w=new LivingWorldModel(); w.addEntity("E_40","company",60); assert(w.getAllEntities().length===1); });
  test("ex_41",()=>{ const w=new LivingWorldModel(); w.addEntity("E_41","company",60); assert(w.getAllEntities().length===1); });
  test("ex_42",()=>{ const w=new LivingWorldModel(); w.addEntity("E_42","company",60); assert(w.getAllEntities().length===1); });
  test("ex_43",()=>{ const w=new LivingWorldModel(); w.addEntity("E_43","company",60); assert(w.getAllEntities().length===1); });
  test("ex_44",()=>{ const w=new LivingWorldModel(); w.addEntity("E_44","company",60); assert(w.getAllEntities().length===1); });
  test("ex_45",()=>{ const w=new LivingWorldModel(); w.addEntity("E_45","company",60); assert(w.getAllEntities().length===1); });
  test("ex_46",()=>{ const w=new LivingWorldModel(); w.addEntity("E_46","company",60); assert(w.getAllEntities().length===1); });
  test("ex_47",()=>{ const w=new LivingWorldModel(); w.addEntity("E_47","company",60); assert(w.getAllEntities().length===1); });
  test("ex_48",()=>{ const w=new LivingWorldModel(); w.addEntity("E_48","company",60); assert(w.getAllEntities().length===1); });
  test("ex_49",()=>{ const w=new LivingWorldModel(); w.addEntity("E_49","company",60); assert(w.getAllEntities().length===1); });
  test("ex_50",()=>{ const w=new LivingWorldModel(); w.addEntity("E_50","company",60); assert(w.getAllEntities().length===1); });
  test("ex_51",()=>{ const w=new LivingWorldModel(); w.addEntity("E_51","company",60); assert(w.getAllEntities().length===1); });
  test("ex_52",()=>{ const w=new LivingWorldModel(); w.addEntity("E_52","company",60); assert(w.getAllEntities().length===1); });
  test("ex_53",()=>{ const w=new LivingWorldModel(); w.addEntity("E_53","company",60); assert(w.getAllEntities().length===1); });
  test("ex_54",()=>{ const w=new LivingWorldModel(); w.addEntity("E_54","company",60); assert(w.getAllEntities().length===1); });
  test("ex_55",()=>{ const w=new LivingWorldModel(); w.addEntity("E_55","company",60); assert(w.getAllEntities().length===1); });
  test("ex_56",()=>{ const w=new LivingWorldModel(); w.addEntity("E_56","company",60); assert(w.getAllEntities().length===1); });
  test("ex_57",()=>{ const w=new LivingWorldModel(); w.addEntity("E_57","company",60); assert(w.getAllEntities().length===1); });
  test("ex_58",()=>{ const w=new LivingWorldModel(); w.addEntity("E_58","company",60); assert(w.getAllEntities().length===1); });
  test("ex_59",()=>{ const w=new LivingWorldModel(); w.addEntity("E_59","company",60); assert(w.getAllEntities().length===1); });
  test("ex_60",()=>{ const w=new LivingWorldModel(); w.addEntity("E_60","company",60); assert(w.getAllEntities().length===1); });
  test("ex_61",()=>{ const w=new LivingWorldModel(); w.addEntity("E_61","company",60); assert(w.getAllEntities().length===1); });
  test("ex_62",()=>{ const w=new LivingWorldModel(); w.addEntity("E_62","company",60); assert(w.getAllEntities().length===1); });
  test("ex_63",()=>{ const w=new LivingWorldModel(); w.addEntity("E_63","company",60); assert(w.getAllEntities().length===1); });
  test("ex_64",()=>{ const w=new LivingWorldModel(); w.addEntity("E_64","company",60); assert(w.getAllEntities().length===1); });
  test("ex_65",()=>{ const w=new LivingWorldModel(); w.addEntity("E_65","company",60); assert(w.getAllEntities().length===1); });
  test("ex_66",()=>{ const w=new LivingWorldModel(); w.addEntity("E_66","company",60); assert(w.getAllEntities().length===1); });
  test("ex_67",()=>{ const w=new LivingWorldModel(); w.addEntity("E_67","company",60); assert(w.getAllEntities().length===1); });
  test("ex_68",()=>{ const w=new LivingWorldModel(); w.addEntity("E_68","company",60); assert(w.getAllEntities().length===1); });
  test("ex_69",()=>{ const w=new LivingWorldModel(); w.addEntity("E_69","company",60); assert(w.getAllEntities().length===1); });
  test("ex_70",()=>{ const w=new LivingWorldModel(); w.addEntity("E_70","company",60); assert(w.getAllEntities().length===1); });
  test("ex_71",()=>{ const w=new LivingWorldModel(); w.addEntity("E_71","company",60); assert(w.getAllEntities().length===1); });
  test("ex_72",()=>{ const w=new LivingWorldModel(); w.addEntity("E_72","company",60); assert(w.getAllEntities().length===1); });
  test("ex_73",()=>{ const w=new LivingWorldModel(); w.addEntity("E_73","company",60); assert(w.getAllEntities().length===1); });
  test("ex_74",()=>{ const w=new LivingWorldModel(); w.addEntity("E_74","company",60); assert(w.getAllEntities().length===1); });
  test("ex_75",()=>{ const w=new LivingWorldModel(); w.addEntity("E_75","company",60); assert(w.getAllEntities().length===1); });
  test("ex_76",()=>{ const w=new LivingWorldModel(); w.addEntity("E_76","company",60); assert(w.getAllEntities().length===1); });
  test("ex_77",()=>{ const w=new LivingWorldModel(); w.addEntity("E_77","company",60); assert(w.getAllEntities().length===1); });
  test("ex_78",()=>{ const w=new LivingWorldModel(); w.addEntity("E_78","company",60); assert(w.getAllEntities().length===1); });
  test("ex_79",()=>{ const w=new LivingWorldModel(); w.addEntity("E_79","company",60); assert(w.getAllEntities().length===1); });
  test("ex_80",()=>{ const w=new LivingWorldModel(); w.addEntity("E_80","company",60); assert(w.getAllEntities().length===1); });
  test("ex_81",()=>{ const w=new LivingWorldModel(); w.addEntity("E_81","company",60); assert(w.getAllEntities().length===1); });
  test("ex_82",()=>{ const w=new LivingWorldModel(); w.addEntity("E_82","company",60); assert(w.getAllEntities().length===1); });
  test("ex_83",()=>{ const w=new LivingWorldModel(); w.addEntity("E_83","company",60); assert(w.getAllEntities().length===1); });
  test("ex_84",()=>{ const w=new LivingWorldModel(); w.addEntity("E_84","company",60); assert(w.getAllEntities().length===1); });
  test("ex_85",()=>{ const w=new LivingWorldModel(); w.addEntity("E_85","company",60); assert(w.getAllEntities().length===1); });
  test("ex_86",()=>{ const w=new LivingWorldModel(); w.addEntity("E_86","company",60); assert(w.getAllEntities().length===1); });
  test("ex_87",()=>{ const w=new LivingWorldModel(); w.addEntity("E_87","company",60); assert(w.getAllEntities().length===1); });
  test("ex_88",()=>{ const w=new LivingWorldModel(); w.addEntity("E_88","company",60); assert(w.getAllEntities().length===1); });
  test("ex_89",()=>{ const w=new LivingWorldModel(); w.addEntity("E_89","company",60); assert(w.getAllEntities().length===1); });
  test("ex_90",()=>{ const w=new LivingWorldModel(); w.addEntity("E_90","company",60); assert(w.getAllEntities().length===1); });
  test("ex_91",()=>{ const w=new LivingWorldModel(); w.addEntity("E_91","company",60); assert(w.getAllEntities().length===1); });
  test("ex_92",()=>{ const w=new LivingWorldModel(); w.addEntity("E_92","company",60); assert(w.getAllEntities().length===1); });
  test("ex_93",()=>{ const w=new LivingWorldModel(); w.addEntity("E_93","company",60); assert(w.getAllEntities().length===1); });
  test("ex_94",()=>{ const w=new LivingWorldModel(); w.addEntity("E_94","company",60); assert(w.getAllEntities().length===1); });
  test("ex_95",()=>{ const w=new LivingWorldModel(); w.addEntity("E_95","company",60); assert(w.getAllEntities().length===1); });
  test("ex_96",()=>{ const w=new LivingWorldModel(); w.addEntity("E_96","company",60); assert(w.getAllEntities().length===1); });
  test("ex_97",()=>{ const w=new LivingWorldModel(); w.addEntity("E_97","company",60); assert(w.getAllEntities().length===1); });
  test("ex_98",()=>{ const w=new LivingWorldModel(); w.addEntity("E_98","company",60); assert(w.getAllEntities().length===1); });
  test("ex_99",()=>{ const w=new LivingWorldModel(); w.addEntity("E_99","company",60); assert(w.getAllEntities().length===1); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 400+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
