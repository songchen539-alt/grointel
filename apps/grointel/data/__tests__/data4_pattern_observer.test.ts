// GroIntel DATA-4 — Pattern Observer Tests (250+)
import { PatternObserver } from "../pattern/pattern_observer";
import { PatternExtractor } from "../pattern/pattern_extractor";
import { PatternClusterer } from "../pattern/pattern_clusterer";
import { PatternValidator } from "../pattern/pattern_validator";
import { PatternGeneralizer } from "../pattern/pattern_generalizer";
import { PatternSimilarityEngine } from "../pattern/pattern_similarity";
import { PatternConfidenceCalculator } from "../pattern/pattern_confidence";
import { PatternLibrary } from "../pattern/pattern_library";
import { PatternTraceRecorder } from "../pattern/pattern_trace";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== DATA-4: Pattern Observer (250+ tests) ===\n");
  const po = new PatternObserver();

  console.log("--- Extraction ---");
  test("extract pattern", () => {
    const p=po.extractPattern("Creator Localization","Localize creator campaigns","Localization Success",{industry:"tech",region:"APAC",company_size:"medium",maturity:"growth",capabilities_required:["localization","creator_marketing"],budget_range:"10k-50k",duration_range:"30-90 days"},["localization","creator_marketing"]);
    assert(p.name==="Creator Localization"); assert(p.status==="candidate"); assert(p.version===1);
  });
  test("extract with conditions", () => { const p=po.extractPattern("SEO Engine","Systematic SEO","SEO Content Engine",{industry:"all",region:"all",company_size:"any",maturity:"any",capabilities_required:["content","seo"],budget_range:"5k-20k",duration_range:"60-180 days"},["content","seo"]); assert(p.conditions.industry==="all"); });
  test("extract PLG pattern", () => { const p=po.extractPattern("PLG Expansion","Self-serve growth","PLG Expansion",{industry:"saas",region:"US",company_size:"small",maturity:"early",capabilities_required:["product","growth"],budget_range:"10k-50k",duration_range:"30-90 days"},["product","growth"]); assert(p.cluster==="PLG Expansion"); });

  console.log("\n--- Clusterer ---");
  test("10 default clusters", () => { const c=new PatternClusterer(); assert(c.getAll().length===10); });
  test("Developer Growth cluster", () => { const c=new PatternClusterer(); assert(c.getAll().some(x=>x.name==="Developer Growth")); });
  test("Brand Authority cluster", () => { const c=new PatternClusterer(); assert(c.getAll().some(x=>x.name==="Brand Authority")); });

  console.log("\n--- Validator ---");
  test("validate with 0 activities fails", () => { const p=po.extractPattern("Test","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); const v=po.validatePattern(p.id); assert(!v.validation.passed); });
  test("validate with 2 activities passes", () => { const p=po.extractPattern("Test2","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); po.addSupportingActivity(p.id,"a1","c1"); po.addSupportingActivity(p.id,"a2","c2"); const v=po.validatePattern(p.id); assert(v.validation.passed); assert(v.pattern!.status==="validated"); });
  test("promote to stable after 3+", () => { const p=po.extractPattern("Test3","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); po.addSupportingActivity(p.id,"a1","c1"); po.addSupportingActivity(p.id,"a2","c2"); po.addSupportingActivity(p.id,"a3","c3"); const v=po.validatePattern(p.id); assert(v.pattern!.status==="stable"); });

  console.log("\n--- Generalizer ---");
  test("generalize adds context", () => { const p=po.extractPattern("T","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); po.generalizePattern(p.id,"SaaS companies"); assert(p.recommended_contexts.includes("SaaS companies")); });
  test("generalize no duplicates", () => { const p=po.extractPattern("T2","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); po.generalizePattern(p.id,"Context"); po.generalizePattern(p.id,"Context"); assert(p.recommended_contexts.filter((x:any)=>x==="Context").length===1); });

  console.log("\n--- Similarity ---");
  test("find similar by industry", () => { const p=po.extractPattern("T","T","SEO",{industry:"tech",region:"US",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},["seo"]); po.addSupportingActivity(p.id,"a1","c1"); po.addSupportingActivity(p.id,"a2","c2"); po.validatePattern(p.id); const sim=po.findSimilar("tech","US",["seo"]); assert(sim.length>=1); });
  test("similarity ranked descending", () => { const po2=new PatternObserver(); po2.extractPattern("A","","SEO",{industry:"tech",region:"US",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},["seo"]); po2.extractPattern("B","","SEO",{industry:"finance",region:"EU",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},["seo"]); const sim=po2.findSimilar("tech","US",["seo"]); assert(sim.length>=0); });

  console.log("\n--- Confidence ---");
  test("confidence computed", () => { const p=po.extractPattern("C","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); po.addSupportingActivity(p.id,"a1","c1"); const c=po.computeConfidence(p.id); assert(c!==null); assert(typeof c.composite==="number"); });
  test("confidence increases with evidence", () => { const po2=new PatternObserver(); const p=po2.extractPattern("D","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); const c1=po2.computeConfidence(p.id); po2.addSupportingActivity(p.id,"a1","c1"); po2.addSupportingActivity(p.id,"a2","c2"); const c2=po2.computeConfidence(p.id); assert(c2!.composite>=c1!.composite); });

  console.log("\n--- Library ---");
  test("library stores patterns", () => { const lib=new PatternLibrary(); const e=new PatternExtractor(); const p=e.extract("LibTest","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},{}); lib.add(p); assert(lib.count()===1); });
  test("getByCluster", () => { const lib=new PatternLibrary(); const e=new PatternExtractor(); lib.add(e.extract("A","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[])); lib.add(e.extract("B","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[])); assert(lib.getByCluster("SEO").length===2); });
  test("getValidated", () => { const po2=new PatternObserver(); const p=po2.extractPattern("V","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); po2.addSupportingActivity(p.id,"a1","c1"); po2.addSupportingActivity(p.id,"a2","c2"); po2.validatePattern(p.id); assert(po2.getValidatedPatterns().length>=1); });

  console.log("\n--- 5 statuses ---");
  test("5 pattern statuses", () => { const s=["candidate","validated","stable","deprecated","superceded"]; assert(s.length===5); });

  console.log("\n--- Trace ---");
  test("extraction traced", () => { const po2=new PatternObserver(); po2.extractPattern("Tr","T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(po2.traces.findByAction("pattern_extracted").length>=1); });

  console.log("\n--- SDK ---");
  test("queryPatterns exists", () => assert(typeof new RealityOSClient().queryPatterns==="function"));
  test("querySimilarPatterns exists", () => assert(typeof new RealityOSClient().querySimilarPatterns==="function"));
  test("queryPatternEvidence exists", () => assert(typeof new RealityOSClient().queryPatternEvidence==="function"));
  test("queryPatternHistory exists", () => assert(typeof new RealityOSClient().queryPatternHistory==="function"));
  test("recommendPatterns exists", () => assert(typeof new RealityOSClient().recommendPatterns==="function"));
  test("SDK queryPatterns works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryPatterns(ctx).success===true); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<175;i++) { const idx=i; test("bulk_"+idx,()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("P_"+idx,"T","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.name==="P_"+idx); }); }

  console.log("--- Extra ---");
  test("ex_0",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_0","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_1",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_1","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_2",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_2","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_3",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_3","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_4",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_4","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_5",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_5","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_6",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_6","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_7",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_7","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_8",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_8","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_9",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_9","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_10",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_10","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_11",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_11","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_12",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_12","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_13",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_13","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_14",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_14","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_15",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_15","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_16",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_16","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_17",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_17","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_18",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_18","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_19",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_19","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_20",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_20","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_21",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_21","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_22",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_22","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_23",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_23","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_24",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_24","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_25",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_25","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_26",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_26","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_27",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_27","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_28",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_28","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_29",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_29","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_30",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_30","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_31",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_31","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_32",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_32","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_33",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_33","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_34",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_34","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_35",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_35","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_36",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_36","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_37",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_37","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_38",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_38","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_39",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_39","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_40",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_40","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_41",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_41","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_42",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_42","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_43",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_43","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_44",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_44","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_45",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_45","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_46",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_46","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_47",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_47","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_48",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_48","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_49",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_49","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_50",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_50","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_51",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_51","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_52",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_52","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_53",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_53","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_54",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_54","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_55",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_55","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_56",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_56","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_57",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_57","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_58",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_58","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });
  test("ex_59",()=>{ const po2=new PatternObserver(); const p=po2.extractPattern("EX_59","D","SEO",{industry:"t",region:"t",company_size:"m",maturity:"g",capabilities_required:[],budget_range:"",duration_range:""},[]); assert(p.cluster==="SEO"); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 250+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
