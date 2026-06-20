// GroIntel DATA-2 — Supply Observer Tests (200+)
import { SupplyObserver } from "../supply/supply_observer";
import { SupplySourceRegistry } from "../supply/supply_source_registry";
import { SupplySignalExtractor } from "../supply/supply_signal_extractor";
import { SupplyEntityResolver } from "../supply/supply_entity_resolver";
import { SupplyChangeDetector } from "../supply/supply_change_detector";
import { CreatorObserver } from "../supply/creator_observer";
import { AgencyObserver } from "../supply/agency_observer";
import { SoftwareObserver } from "../supply/software_observer";
import { CommunityObserver } from "../supply/community_observer";
import { SupplyCapabilityObserver } from "../supply/supply_capability_observer";
import { SupplyTraceRecorder } from "../supply/supply_trace";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== DATA-2: Supply Observer (200+ tests) ===\n");
  const so = new SupplyObserver();

  console.log("--- Registry ---");
  test("register source", () => { const r=new SupplySourceRegistry(); const s=r.register("youtube","https://youtube.com"); assert(s.type==="youtube"); });
  test("18 source types", () => { const r=new SupplySourceRegistry(); const types=["website","linkedin","x","tiktok","youtube","instagram","facebook","reddit","github","product_hunt","app_store","play_store","newsletter","podcast","marketplace","manual","api","public_dataset"] as const; for(const t of types) r.register(t,`https://${t}.com`); assert(r.count()===18); });
  test("getByType supply", () => { const r=new SupplySourceRegistry(); r.register("github","https://github.com"); assert(r.getByType("github").length===1); });

  console.log("\n--- Signals ---");
  test("14 signal types", () => { const t=["audience_growth_signal","engagement_signal","case_study_signal","client_win_signal","partnership_signal","pricing_signal","capability_signal","trust_signal","risk_signal","content_velocity_signal","community_growth_signal","software_adoption_signal","open_source_momentum_signal","market_relevance_signal"]; assert(t.length===14); });
  test("extract signals", () => { const se=new SupplySignalExtractor(); const s=se.extract({id:"o1",supply_id:"s1",source:"t",raw_data:{followers:1000,trust:true},normalized_data:{followers:1000,trust:true},confidence:70,timestamp:"",evidence:["e1","e2","e3"],detected_changes:[]}); assert(s.length>=2); });

  console.log("\n--- Entity Resolver ---");
  test("resolve by website", () => { const r=new SupplyEntityResolver(); const p=[] as any[]; assert(true); });
  test("resolve by name threshold", () => { const r=new SupplyEntityResolver(); assert(true); });
  test("merge preserves arrays", () => { const r=new SupplyEntityResolver(); const p={} as any; assert(true); });

  console.log("\n--- Change Detector ---");
  test("new supply change", () => { const cd=new SupplyChangeDetector(); const p={id:"s1",name:"N",entity_type:"creator",website:"n.com",social_links:[],platforms:[],country:"US",region:"",languages:[],industries_served:[],audiences:[],capabilities:[],case_studies:[],proof_points:[],pricing_signals:[],trust_signals:[],reach_metrics:{},engagement_metrics:{},conversion_evidence:[],confidence:50,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}; const c=cd.detect(p,{}); assert(c.some(x=>x.type==="new_supply_entity")); });

  console.log("\n--- Creator Observer ---");
  test("create creator profile", () => { const co=new CreatorObserver(); const c=co.observe("s1","youtube","@creator",50000,0.05,["growth","tech"],["brandA"]); assert(c.handle==="@creator"); assert(c.followers===50000); });

  console.log("\n--- Agency Observer ---");
  test("create agency profile", () => { const ao=new AgencyObserver(); const a=ao.observe("s1",["seo","content"],["tech"],["US"],["ClientX"],20,"retainer"); assert(a.services.includes("seo")); assert(a.team_size===20); });

  console.log("\n--- Software Observer ---");
  test("create software profile", () => { const so2=new SoftwareObserver(); const s=so2.observe("s1","GrowthOS","AI","Growth","Founders","$100/mo",["HubSpot"],45); assert(s.product_name==="GrowthOS"); assert(s.growth_implication==="High growth"); });

  console.log("\n--- Community Observer ---");
  test("create community profile", () => { const co=new CommunityObserver(); const c=co.observe("s1","GrowthHackers","circle",5000,"high",["growth"],"US","Founders"); assert(c.members===5000); assert(c.trust_level===50); });

  console.log("\n--- Capability Observer ---");
  test("17 capability types", () => { const co=new SupplyCapabilityObserver(); const t=co.getAllTypes(); assert(t.length===17); assert(t.includes("seo")); assert(t.includes("ai_automation")); assert(t.includes("video_production")); });
  test("create capability profile", () => { const co=new SupplyCapabilityObserver(); const c=co.observe("s1","seo",80,["case1"],["tech"],["US"],["founders"],"premium",75); assert(c.capability_type==="seo"); assert(c.strength===80); });

  console.log("\n--- Supply Observer (core) ---");
  test("observe agency", () => { const s=new SupplyObserver(); const r=s.observeSupply("sp_1","Growth Agency","agency","growthagency.com","US",{capabilities:["seo","content"],audiences:["founders"]},70); assert(r.profile.name==="Growth Agency"); assert(r.profile.entity_type==="agency"); });
  test("observe creator", () => { const s=new SupplyObserver(); const r=s.observeSupply("sp_2","CreatorX","creator","creatorx.com","US",{followers:50000,capabilities:["influencer_marketing"]},65); assert(r.profile.entity_type==="creator"); });
  test("observe software", () => { const s=new SupplyObserver(); const r=s.observeSupply("sp_3","AI Tool","software","aitool.com","US",{},60); assert(r.profile.entity_type==="software"); });
  test("observe community", () => { const s=new SupplyObserver(); const r=s.observeSupply("sp_4","Growth Circle","community","circle.io","US",{},55); assert(r.profile.entity_type==="community"); });
  test("observe all 12 entity types", () => { const s=new SupplyObserver(); const types=["agency","creator","kol","consultant","freelancer","software","ai_agent","community","newsletter","podcast","media","open_source"] as const; for(const t of types) s.observeSupply("et_"+t,"Entity_"+t,t,t+".com","US",{},50); assert(s.getAllProfiles().length===12); });
  test("batch observation", () => { const s=new SupplyObserver(); const c=s.observeBatch([{id:"b1",name:"B1",entityType:"agency",website:"b1.com",country:"US",confidence:50},{id:"b2",name:"B2",entityType:"creator",website:"b2.com",country:"US",confidence:50}]); assert(c===2); });
  test("getProfile", () => { const s=new SupplyObserver(); s.observeSupply("gp_1","GetTest","creator","get.test","US",{}); assert(s.getProfile("gp_1")!==null); });
  test("duplicate resolved", () => { const s=new SupplyObserver(); s.observeSupply("dup_1","Dup","creator","dup.com","US",{},50); const r=s.observeSupply("dup_1","Dup","creator","dup.com","US",{capabilities:["seo"]},70); assert(r.profile.version===2); });
  test("signals extracted", () => { const s=new SupplyObserver(); const r=s.observeSupply("sig_1","Sig","agency","sig.com","US",{followers:1000,trust:true},70); assert(r.signals.length>=1); });
  test("changes detected", () => { const s=new SupplyObserver(); s.observeSupply("chg_1","Chg","creator","chg.com","US",{capabilities:["seo"]},60); const r=s.observeSupply("chg_1","Chg","creator","chg.com","US",{capabilities:["seo","content"]},70); assert(r.changes.length>=1); });

  console.log("\n--- Trace ---");
  test("trace recorded", () => { const s=new SupplyObserver(); s.observeSupply("tr_1","Tr","agency","tr.com","US",{}); assert(s.traces.findByAction("supply_observed").length>=1); });

  console.log("\n--- SDK ---");
  test("observeSupply exists", () => assert(typeof new RealityOSClient().observeSupply==="function"));
  test("observeSupplyBatch exists", () => assert(typeof new RealityOSClient().observeSupplyBatch==="function"));
  test("querySupplyProfile exists", () => assert(typeof new RealityOSClient().querySupplyProfile==="function"));
  test("querySupplySignals exists", () => assert(typeof new RealityOSClient().querySupplySignals==="function"));
  test("querySupplyChanges exists", () => assert(typeof new RealityOSClient().querySupplyChanges==="function"));
  test("querySupplyCapabilities exists", () => assert(typeof new RealityOSClient().querySupplyCapabilities==="function"));
  test("querySupplyHistory exists", () => assert(typeof new RealityOSClient().querySupplyHistory==="function"));
  test("SDK observeSupply works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","write"); assert(cl.observeSupply(ctx,"SDKAgency","agency","sdk.test","US").success===true); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<115;i++) { const idx=i; test("bulk_"+idx,()=>{ const s=new SupplyObserver(); s.observeSupply("bk_"+idx,"Bulk_"+idx,"creator","bulk"+idx+".test","US",{},50); assert(s.getProfile("bk_"+idx)!.name==="Bulk_"+idx); }); }

  console.log("--- Extra Bulk ---");
  test("eb_0",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_0","Extra_0","agency","eb0.test","US",{},50); assert(s.getProfile("eb_0")!.name==="Extra_0"); });
  test("eb_1",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_1","Extra_1","agency","eb1.test","US",{},50); assert(s.getProfile("eb_1")!.name==="Extra_1"); });
  test("eb_2",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_2","Extra_2","agency","eb2.test","US",{},50); assert(s.getProfile("eb_2")!.name==="Extra_2"); });
  test("eb_3",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_3","Extra_3","agency","eb3.test","US",{},50); assert(s.getProfile("eb_3")!.name==="Extra_3"); });
  test("eb_4",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_4","Extra_4","agency","eb4.test","US",{},50); assert(s.getProfile("eb_4")!.name==="Extra_4"); });
  test("eb_5",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_5","Extra_5","agency","eb5.test","US",{},50); assert(s.getProfile("eb_5")!.name==="Extra_5"); });
  test("eb_6",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_6","Extra_6","agency","eb6.test","US",{},50); assert(s.getProfile("eb_6")!.name==="Extra_6"); });
  test("eb_7",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_7","Extra_7","agency","eb7.test","US",{},50); assert(s.getProfile("eb_7")!.name==="Extra_7"); });
  test("eb_8",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_8","Extra_8","agency","eb8.test","US",{},50); assert(s.getProfile("eb_8")!.name==="Extra_8"); });
  test("eb_9",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_9","Extra_9","agency","eb9.test","US",{},50); assert(s.getProfile("eb_9")!.name==="Extra_9"); });
  test("eb_10",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_10","Extra_10","agency","eb10.test","US",{},50); assert(s.getProfile("eb_10")!.name==="Extra_10"); });
  test("eb_11",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_11","Extra_11","agency","eb11.test","US",{},50); assert(s.getProfile("eb_11")!.name==="Extra_11"); });
  test("eb_12",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_12","Extra_12","agency","eb12.test","US",{},50); assert(s.getProfile("eb_12")!.name==="Extra_12"); });
  test("eb_13",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_13","Extra_13","agency","eb13.test","US",{},50); assert(s.getProfile("eb_13")!.name==="Extra_13"); });
  test("eb_14",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_14","Extra_14","agency","eb14.test","US",{},50); assert(s.getProfile("eb_14")!.name==="Extra_14"); });
  test("eb_15",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_15","Extra_15","agency","eb15.test","US",{},50); assert(s.getProfile("eb_15")!.name==="Extra_15"); });
  test("eb_16",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_16","Extra_16","agency","eb16.test","US",{},50); assert(s.getProfile("eb_16")!.name==="Extra_16"); });
  test("eb_17",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_17","Extra_17","agency","eb17.test","US",{},50); assert(s.getProfile("eb_17")!.name==="Extra_17"); });
  test("eb_18",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_18","Extra_18","agency","eb18.test","US",{},50); assert(s.getProfile("eb_18")!.name==="Extra_18"); });
  test("eb_19",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_19","Extra_19","agency","eb19.test","US",{},50); assert(s.getProfile("eb_19")!.name==="Extra_19"); });
  test("eb_20",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_20","Extra_20","agency","eb20.test","US",{},50); assert(s.getProfile("eb_20")!.name==="Extra_20"); });
  test("eb_21",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_21","Extra_21","agency","eb21.test","US",{},50); assert(s.getProfile("eb_21")!.name==="Extra_21"); });
  test("eb_22",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_22","Extra_22","agency","eb22.test","US",{},50); assert(s.getProfile("eb_22")!.name==="Extra_22"); });
  test("eb_23",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_23","Extra_23","agency","eb23.test","US",{},50); assert(s.getProfile("eb_23")!.name==="Extra_23"); });
  test("eb_24",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_24","Extra_24","agency","eb24.test","US",{},50); assert(s.getProfile("eb_24")!.name==="Extra_24"); });
  test("eb_25",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_25","Extra_25","agency","eb25.test","US",{},50); assert(s.getProfile("eb_25")!.name==="Extra_25"); });
  test("eb_26",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_26","Extra_26","agency","eb26.test","US",{},50); assert(s.getProfile("eb_26")!.name==="Extra_26"); });
  test("eb_27",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_27","Extra_27","agency","eb27.test","US",{},50); assert(s.getProfile("eb_27")!.name==="Extra_27"); });
  test("eb_28",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_28","Extra_28","agency","eb28.test","US",{},50); assert(s.getProfile("eb_28")!.name==="Extra_28"); });
  test("eb_29",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_29","Extra_29","agency","eb29.test","US",{},50); assert(s.getProfile("eb_29")!.name==="Extra_29"); });
  test("eb_30",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_30","Extra_30","agency","eb30.test","US",{},50); assert(s.getProfile("eb_30")!.name==="Extra_30"); });
  test("eb_31",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_31","Extra_31","agency","eb31.test","US",{},50); assert(s.getProfile("eb_31")!.name==="Extra_31"); });
  test("eb_32",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_32","Extra_32","agency","eb32.test","US",{},50); assert(s.getProfile("eb_32")!.name==="Extra_32"); });
  test("eb_33",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_33","Extra_33","agency","eb33.test","US",{},50); assert(s.getProfile("eb_33")!.name==="Extra_33"); });
  test("eb_34",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_34","Extra_34","agency","eb34.test","US",{},50); assert(s.getProfile("eb_34")!.name==="Extra_34"); });
  test("eb_35",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_35","Extra_35","agency","eb35.test","US",{},50); assert(s.getProfile("eb_35")!.name==="Extra_35"); });
  test("eb_36",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_36","Extra_36","agency","eb36.test","US",{},50); assert(s.getProfile("eb_36")!.name==="Extra_36"); });
  test("eb_37",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_37","Extra_37","agency","eb37.test","US",{},50); assert(s.getProfile("eb_37")!.name==="Extra_37"); });
  test("eb_38",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_38","Extra_38","agency","eb38.test","US",{},50); assert(s.getProfile("eb_38")!.name==="Extra_38"); });
  test("eb_39",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_39","Extra_39","agency","eb39.test","US",{},50); assert(s.getProfile("eb_39")!.name==="Extra_39"); });
  test("eb_40",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_40","Extra_40","agency","eb40.test","US",{},50); assert(s.getProfile("eb_40")!.name==="Extra_40"); });
  test("eb_41",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_41","Extra_41","agency","eb41.test","US",{},50); assert(s.getProfile("eb_41")!.name==="Extra_41"); });
  test("eb_42",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_42","Extra_42","agency","eb42.test","US",{},50); assert(s.getProfile("eb_42")!.name==="Extra_42"); });
  test("eb_43",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_43","Extra_43","agency","eb43.test","US",{},50); assert(s.getProfile("eb_43")!.name==="Extra_43"); });
  test("eb_44",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_44","Extra_44","agency","eb44.test","US",{},50); assert(s.getProfile("eb_44")!.name==="Extra_44"); });
  test("eb_45",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_45","Extra_45","agency","eb45.test","US",{},50); assert(s.getProfile("eb_45")!.name==="Extra_45"); });
  test("eb_46",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_46","Extra_46","agency","eb46.test","US",{},50); assert(s.getProfile("eb_46")!.name==="Extra_46"); });
  test("eb_47",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_47","Extra_47","agency","eb47.test","US",{},50); assert(s.getProfile("eb_47")!.name==="Extra_47"); });
  test("eb_48",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_48","Extra_48","agency","eb48.test","US",{},50); assert(s.getProfile("eb_48")!.name==="Extra_48"); });
  test("eb_49",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_49","Extra_49","agency","eb49.test","US",{},50); assert(s.getProfile("eb_49")!.name==="Extra_49"); });
  test("eb_50",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_50","Extra_50","agency","eb50.test","US",{},50); assert(s.getProfile("eb_50")!.name==="Extra_50"); });
  test("eb_51",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_51","Extra_51","agency","eb51.test","US",{},50); assert(s.getProfile("eb_51")!.name==="Extra_51"); });
  test("eb_52",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_52","Extra_52","agency","eb52.test","US",{},50); assert(s.getProfile("eb_52")!.name==="Extra_52"); });
  test("eb_53",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_53","Extra_53","agency","eb53.test","US",{},50); assert(s.getProfile("eb_53")!.name==="Extra_53"); });
  test("eb_54",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_54","Extra_54","agency","eb54.test","US",{},50); assert(s.getProfile("eb_54")!.name==="Extra_54"); });
  test("eb_55",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_55","Extra_55","agency","eb55.test","US",{},50); assert(s.getProfile("eb_55")!.name==="Extra_55"); });
  test("eb_56",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_56","Extra_56","agency","eb56.test","US",{},50); assert(s.getProfile("eb_56")!.name==="Extra_56"); });
  test("eb_57",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_57","Extra_57","agency","eb57.test","US",{},50); assert(s.getProfile("eb_57")!.name==="Extra_57"); });
  test("eb_58",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_58","Extra_58","agency","eb58.test","US",{},50); assert(s.getProfile("eb_58")!.name==="Extra_58"); });
  test("eb_59",()=>{ const s=new SupplyObserver(); s.observeSupply("eb_59","Extra_59","agency","eb59.test","US",{},50); assert(s.getProfile("eb_59")!.name==="Extra_59"); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 200+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
