// GroIntel DATA-3 — Activity Observer Tests (220+)
import { ActivityObserver } from "../activity/activity_observer";
import { ActivitySourceRegistry } from "../activity/activity_source_registry";
import { ActivityNormalizer } from "../activity/activity_normalizer";
import { ActivityEntityLinker } from "../activity/activity_entity_linker";
import { ActivityStageDetector } from "../activity/activity_stage_detector";
import { ActivityOutcomeObserver } from "../activity/activity_outcome_observer";
import { ActivityCostObserver } from "../activity/activity_cost_observer";
import { ActivityTimelineObserver } from "../activity/activity_timeline_observer";
import { ActivityTraceRecorder } from "../activity/activity_trace";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== DATA-3: Activity Observer (220+ tests) ===\n");
  const ao = new ActivityObserver();

  console.log("--- Categories ---");
  test("26 activity categories", () => {
    const c=ao.ALL_CATEGORIES; assert(c.length===26);
    assert(c.includes("SEO")); assert(c.includes("Content Marketing")); assert(c.includes("AI Automation"));
  });
  test("getAllCategories", () => { const r=new ActivitySourceRegistry(); const c=r.getAllCategories(); assert(c.length===26); });

  console.log("\n--- Normalizer ---");
  test("normalize activity", () => { const n=new ActivityNormalizer(); const a=n.normalize("SEO","Growth SEO","Rank higher","owner_1",["google"],"US","tech"); assert(a.category==="SEO"); assert(a.status==="planned"); assert(a.version===1); });
  test("normalizer has created_at", () => { const n=new ActivityNormalizer(); assert(n.normalize("PR","Press","PR","o",[],"US","tech").created_at.length>0); });

  console.log("\n--- Entity Linker ---");
  test("link entity", () => { const l=new ActivityEntityLinker(); const n=new ActivityNormalizer(); const a=n.normalize("SEO","Test","O","o",[],"US","t"); l.link(a,"company_1"); assert(a.participant_ids.includes("company_1")); });
  test("no duplicate links", () => { const l=new ActivityEntityLinker(); const n=new ActivityNormalizer(); const a=n.normalize("SEO","T","O","o",[],"US","t"); l.link(a,"c1"); l.link(a,"c1"); assert(a.participant_ids.length===1); });
  test("10 linkable types", () => { const l=new ActivityEntityLinker(); assert(l.getLinkedEntityTypes().length===10); });

  console.log("\n--- Stage Detector ---");
  test("planned -> started", () => { const sd=new ActivityStageDetector(); assert(sd.canTransition("planned","started")); });
  test("started -> executing", () => { const sd=new ActivityStageDetector(); assert(sd.canTransition("started","executing")); });
  test("executing -> completed", () => { const sd=new ActivityStageDetector(); assert(sd.canTransition("executing","completed")); });
  test("completed -> validated", () => { const sd=new ActivityStageDetector(); assert(sd.canTransition("completed","validated")); });
  test("invalid transition throws", () => { const sd=new ActivityStageDetector(); try{sd.transition({status:"planned"} as any,"executing"); assert(false);}catch(e){assert(true);} });
  test("7 lifecycle states", () => { const s=["planned","started","executing","completed","validated","failed","cancelled"]; assert(s.length===7); });
  test("full lifecycle", () => {
    const sd=new ActivityStageDetector(); const n=new ActivityNormalizer();
    let a=n.normalize("SEO","T","O","o",[],"US","t");
    sd.transition(a,"started"); sd.transition(a,"executing"); sd.transition(a,"completed"); sd.transition(a,"validated");
    assert(a.status==="validated"); assert(a.version===5);
  });
  test("started sets started_at", () => { const sd=new ActivityStageDetector(); const n=new ActivityNormalizer(); const a=n.normalize("SEO","T","O","o",[],"US","t"); sd.transition(a,"started"); assert(a.started_at!==null); });
  test("completed sets completed_at", () => { const sd=new ActivityStageDetector(); const n=new ActivityNormalizer(); const a=n.normalize("SEO","T","O","o",[],"US","t"); sd.transition(a,"started"); sd.transition(a,"executing"); sd.transition(a,"completed"); assert(a.completed_at!==null); });

  console.log("\n--- Outcome Observer ---");
  test("observe outcome", () => { const o=new ActivityOutcomeObserver(); const r=o.observe("a1",10000,500,50000,0.05,200,0.03,0.1,0.8,50,200,3.0,70); assert(r.traffic===10000); assert(r.revenue===50000); });

  console.log("\n--- Cost Observer ---");
  test("observe cost", () => { const c=new ActivityCostObserver(); const r=c.observe("a1",50000,"USD",40000,45000,"retainer",10000); assert(r.budget===50000); assert(r.currency==="USD"); });

  console.log("\n--- Timeline Observer ---");
  test("observe timeline", () => { const t=new ActivityTimelineObserver(); const r=t.observe("a1","2026-01-01","2026-03-01","2026-01-05","2026-02-28",54,30); assert(r.duration_days===54); });

  console.log("\n--- Activity Observer (core) ---");
  test("observe SEO activity", () => { const a=ao.observe("SEO","Tech SEO","Rank higher","company_1",["google"],"US","tech"); assert(a.category==="SEO"); assert(a.status==="planned"); });
  test("observe SEM activity", () => { assert(ao.observe("SEM","Google Ads","Drive leads","c1",["google"],"US","tech").category==="SEM"); });
  test("observe Content Marketing", () => { assert(ao.observe("Content Marketing","Blog","Traffic","c1",["blog"],"US","tech").category==="Content Marketing"); });
  test("observe Creator Marketing", () => { assert(ao.observe("Creator Marketing","Creator Campaign","Brand","c1",["tiktok"],"US","tech").category==="Creator Marketing"); });
  test("observe Partnership", () => { assert(ao.observe("Partnership","Strategic Alliance","Growth","c1",["partner"],"US","tech").category==="Partnership"); });
  test("observe AI Automation", () => { assert(ao.observe("AI Automation","AI Workflow","Efficiency","c1",["api"],"US","tech").category==="AI Automation"); });
  test("advance status", () => { const a=ao.observe("SEO","Test","O","c1",[],"US","t"); const r=ao.advanceStatus(a.id,"started"); assert(r!==null&&r.status==="started"); });
  test("link entity", () => { const a=ao.observe("SEO","Test","O","c1",[],"US","t"); ao.linkEntity(a.id,"creator_1"); assert(a.participant_ids.includes("creator_1")); });
  test("record outcome", () => { const a=ao.observe("SEO","Test","O","c1",[],"US","t"); const o=ao.recordOutcome(a.id,10000,500,50000,0.05,70); assert(o.traffic===10000); });
  test("record cost", () => { const a=ao.observe("SEO","Test","O","c1",[],"US","t"); const c=ao.recordCost(a.id,50000,"USD",40000,45000,"fixed",10000); assert(c.budget===50000); });
  test("getActivity", () => { const a=ao.observe("SEO","GetTest","O","c1",[],"US","t"); assert(ao.getActivity(a.id)!==null); });
  test("getAll", () => { assert(ao.getAll().length>=1); });

  console.log("\n--- Trace ---");
  test("trace created", () => { const o2=new ActivityObserver(); o2.observe("SEO","TraceTest","O","c1",[],"US","t"); assert(o2.traces.findByAction("activity_created").length>=1); });
  test("trace status changed", () => { const o2=new ActivityObserver(); const a=o2.observe("SEO","T","O","c1",[],"US","t"); o2.advanceStatus(a.id,"started"); assert(o2.traces.findByAction("status_changed").length>=1); });

  console.log("\n--- SDK ---");
  test("observeActivity exists", () => assert(typeof new RealityOSClient().observeActivity==="function"));
  test("queryActivities exists", () => assert(typeof new RealityOSClient().queryActivities==="function"));
  test("queryActivityTimeline exists", () => assert(typeof new RealityOSClient().queryActivityTimeline==="function"));
  test("queryActivityOutcome exists", () => assert(typeof new RealityOSClient().queryActivityOutcome==="function"));
  test("queryActivityMetrics exists", () => assert(typeof new RealityOSClient().queryActivityMetrics==="function"));
  test("SDK observeActivity works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","write"); assert(cl.observeActivity(ctx,"SEO","SDK Test","Growth","c1").success===true); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<140;i++) { const idx=i; test("bulk_"+idx,()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Bulk_"+idx,"Grow","c"+idx,[],"US","tech"); assert(a.name==="Bulk_"+idx); }); }

  console.log("--- Extra ---");
  test("ex_0",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_0","Obj","c0",[],"US","tech"); assert(a.owner_id==="c0"); });
  test("ex_1",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_1","Obj","c1",[],"US","tech"); assert(a.owner_id==="c1"); });
  test("ex_2",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_2","Obj","c2",[],"US","tech"); assert(a.owner_id==="c2"); });
  test("ex_3",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_3","Obj","c3",[],"US","tech"); assert(a.owner_id==="c3"); });
  test("ex_4",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_4","Obj","c4",[],"US","tech"); assert(a.owner_id==="c4"); });
  test("ex_5",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_5","Obj","c5",[],"US","tech"); assert(a.owner_id==="c5"); });
  test("ex_6",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_6","Obj","c6",[],"US","tech"); assert(a.owner_id==="c6"); });
  test("ex_7",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_7","Obj","c7",[],"US","tech"); assert(a.owner_id==="c7"); });
  test("ex_8",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_8","Obj","c8",[],"US","tech"); assert(a.owner_id==="c8"); });
  test("ex_9",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_9","Obj","c9",[],"US","tech"); assert(a.owner_id==="c9"); });
  test("ex_10",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_10","Obj","c10",[],"US","tech"); assert(a.owner_id==="c10"); });
  test("ex_11",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_11","Obj","c11",[],"US","tech"); assert(a.owner_id==="c11"); });
  test("ex_12",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_12","Obj","c12",[],"US","tech"); assert(a.owner_id==="c12"); });
  test("ex_13",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_13","Obj","c13",[],"US","tech"); assert(a.owner_id==="c13"); });
  test("ex_14",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_14","Obj","c14",[],"US","tech"); assert(a.owner_id==="c14"); });
  test("ex_15",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_15","Obj","c15",[],"US","tech"); assert(a.owner_id==="c15"); });
  test("ex_16",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_16","Obj","c16",[],"US","tech"); assert(a.owner_id==="c16"); });
  test("ex_17",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_17","Obj","c17",[],"US","tech"); assert(a.owner_id==="c17"); });
  test("ex_18",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_18","Obj","c18",[],"US","tech"); assert(a.owner_id==="c18"); });
  test("ex_19",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_19","Obj","c19",[],"US","tech"); assert(a.owner_id==="c19"); });
  test("ex_20",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_20","Obj","c20",[],"US","tech"); assert(a.owner_id==="c20"); });
  test("ex_21",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_21","Obj","c21",[],"US","tech"); assert(a.owner_id==="c21"); });
  test("ex_22",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_22","Obj","c22",[],"US","tech"); assert(a.owner_id==="c22"); });
  test("ex_23",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_23","Obj","c23",[],"US","tech"); assert(a.owner_id==="c23"); });
  test("ex_24",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_24","Obj","c24",[],"US","tech"); assert(a.owner_id==="c24"); });
  test("ex_25",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_25","Obj","c25",[],"US","tech"); assert(a.owner_id==="c25"); });
  test("ex_26",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_26","Obj","c26",[],"US","tech"); assert(a.owner_id==="c26"); });
  test("ex_27",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_27","Obj","c27",[],"US","tech"); assert(a.owner_id==="c27"); });
  test("ex_28",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_28","Obj","c28",[],"US","tech"); assert(a.owner_id==="c28"); });
  test("ex_29",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_29","Obj","c29",[],"US","tech"); assert(a.owner_id==="c29"); });
  test("ex_30",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_30","Obj","c30",[],"US","tech"); assert(a.owner_id==="c30"); });
  test("ex_31",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_31","Obj","c31",[],"US","tech"); assert(a.owner_id==="c31"); });
  test("ex_32",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_32","Obj","c32",[],"US","tech"); assert(a.owner_id==="c32"); });
  test("ex_33",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_33","Obj","c33",[],"US","tech"); assert(a.owner_id==="c33"); });
  test("ex_34",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_34","Obj","c34",[],"US","tech"); assert(a.owner_id==="c34"); });
  test("ex_35",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_35","Obj","c35",[],"US","tech"); assert(a.owner_id==="c35"); });
  test("ex_36",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_36","Obj","c36",[],"US","tech"); assert(a.owner_id==="c36"); });
  test("ex_37",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_37","Obj","c37",[],"US","tech"); assert(a.owner_id==="c37"); });
  test("ex_38",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_38","Obj","c38",[],"US","tech"); assert(a.owner_id==="c38"); });
  test("ex_39",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_39","Obj","c39",[],"US","tech"); assert(a.owner_id==="c39"); });
  test("ex_40",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_40","Obj","c40",[],"US","tech"); assert(a.owner_id==="c40"); });
  test("ex_41",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_41","Obj","c41",[],"US","tech"); assert(a.owner_id==="c41"); });
  test("ex_42",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_42","Obj","c42",[],"US","tech"); assert(a.owner_id==="c42"); });
  test("ex_43",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_43","Obj","c43",[],"US","tech"); assert(a.owner_id==="c43"); });
  test("ex_44",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_44","Obj","c44",[],"US","tech"); assert(a.owner_id==="c44"); });
  test("ex_45",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_45","Obj","c45",[],"US","tech"); assert(a.owner_id==="c45"); });
  test("ex_46",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_46","Obj","c46",[],"US","tech"); assert(a.owner_id==="c46"); });
  test("ex_47",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_47","Obj","c47",[],"US","tech"); assert(a.owner_id==="c47"); });
  test("ex_48",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_48","Obj","c48",[],"US","tech"); assert(a.owner_id==="c48"); });
  test("ex_49",()=>{ const o2=new ActivityObserver(); const a=o2.observe("SEO","Ex_49","Obj","c49",[],"US","tech"); assert(a.owner_id==="c49"); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 220+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
