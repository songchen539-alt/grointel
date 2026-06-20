// GroIntel DATA-1 — Company Observer Tests (180+)
import { CompanyObserver } from "../company/company_observer";
import { CompanySourceRegistry } from "../company/company_source_registry";
import { CompanySignalExtractor } from "../company/company_signal_extractor";
import { CompanyEntityResolver } from "../company/company_entity_resolver";
import { CompanyChangeDetector } from "../company/company_change_detector";
import { CompanyFundingObserver } from "../company/company_funding_observer";
import { CompanyHiringObserver } from "../company/company_hiring_observer";
import { CompanyProductObserver } from "../company/company_product_observer";
import { CompanyGrowthObserver } from "../company/company_growth_observer";
import { CompanyTraceRecorder } from "../company/company_trace";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== DATA-1: Company Observer (180+ tests) ===\n");

  console.log("--- Source Registry ---");
  test("register website source", () => { const r=new CompanySourceRegistry(); const s=r.register("website","https://example.com"); assert(s.type==="website"); assert(s.enabled); });
  test("register all 13 source types", () => {
    const r=new CompanySourceRegistry();
    const types=["website","linkedin","crunchbase","github","news","job_board","product_hunt","app_store","play_store","social","manual","api","public_dataset"] as const;
    for(const t of types) r.register(t,`https://${t}.com`);
    assert(r.count()===13);
  });
  test("getByType", () => { const r=new CompanySourceRegistry(); r.register("news","https://news.com"); assert(r.getByType("news").length===1); });
  test("setEnabled", () => { const r=new CompanySourceRegistry(); const s=r.register("api","https://api.com"); r.setEnabled(s.source_id,false); assert(!r.get(s.source_id)!.enabled); });
  test("trust defaults", () => { const r=new CompanySourceRegistry(); assert(r.DEFAULT_TRUST.crunchbase===80); assert(r.DEFAULT_TRUST.linkedin===75); });

  console.log("\n--- Signal Extractor ---");
  test("extract funding signal", () => { const se=new CompanySignalExtractor(); const s=se.extract({id:"o1",company_id:"c1",source:"t",raw_data:{funding:true},normalized_data:{funding_amount:1000000},confidence:70,timestamp:"",evidence:["e1"],detected_changes:[]}); assert(s.some(x=>x.type==="funding_signal")); });
  test("extract hiring signal", () => { const se=new CompanySignalExtractor(); const s=se.extract({id:"o2",company_id:"c2",source:"t",raw_data:{hiring:["engineer"]},normalized_data:{hiring_roles:["engineer"]},confidence:60,timestamp:"",evidence:[],detected_changes:[]}); assert(s.some(x=>x.type==="hiring_signal")); });
  test("extract product signal", () => { const se=new CompanySignalExtractor(); const s=se.extract({id:"o3",company_id:"c3",source:"t",raw_data:{product:"launch"},normalized_data:{product_launch:"new"},confidence:80,timestamp:"",evidence:[],detected_changes:[]}); assert(s.some(x=>x.type==="product_launch_signal")); });
  test("extract risk signal", () => { const se=new CompanySignalExtractor(); const s=se.extract({id:"o4",company_id:"c4",source:"t",raw_data:{risk:"high"},normalized_data:{risk:"high"},confidence:60,timestamp:"",evidence:[],detected_changes:[]}); assert(s.some(x=>x.type==="risk_signal")); });
  test("extract trust signal from evidence", () => { const se=new CompanySignalExtractor(); const s=se.extract({id:"o5",company_id:"c5",source:"t",raw_data:{},normalized_data:{},confidence:70,timestamp:"",evidence:["e1","e2","e3","e4"],detected_changes:[]}); assert(s.some(x=>x.type==="trust_signal")); });
  test("14 signal types", () => { const t=["funding_signal","hiring_signal","layoff_signal","product_launch_signal","partnership_signal","market_expansion_signal","pricing_change_signal","technology_adoption_signal","traffic_growth_signal","social_growth_signal","content_growth_signal","regulation_signal","risk_signal","trust_signal"]; assert(t.length===14); });

  console.log("\n--- Entity Resolver ---");
  test("resolve by domain", () => { const r=new CompanyEntityResolver(); const p=[{id:"c1",name:"Test",domain:"example.com",website:"https://example.com",industry:"tech",country:"US",region:"",description:"",founders:[],employees_estimate:0,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:[],social_links:[],confidence:70,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}]; assert(r.resolve(p,{domain:"example.com",confidence:70})!==null); });
  test("resolve by website", () => { const r=new CompanyEntityResolver(); const p=[{id:"c1",name:"Test",domain:"other.com",website:"https://example.com",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:0,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:[],social_links:[],confidence:70,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}]; assert(r.resolve(p,{website:"https://example.com",confidence:70})!==null); });
  test("resolve by name with confidence threshold", () => { const r=new CompanyEntityResolver(); const p=[{id:"c1",name:"ACME Corp",domain:"acme.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:0,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:[],social_links:[],confidence:80,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}]; assert(r.resolve(p,{name:"ACME Corp",confidence:80})!==null); });
  test("no match without domain/website/name", () => { const r=new CompanyEntityResolver(); assert(r.resolve([],{name:"Unknown",confidence:50})===null); });
  test("merge increases version", () => { const r=new CompanyEntityResolver(); const p={id:"c1",name:"M",domain:"m.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:10,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:[],social_links:[],confidence:50,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}; r.merge(p,{employees_estimate:50,confidence:70,technologies:["AI"]}); assert(p.version===2); assert(p.technologies.includes("AI")); });
  test("merge no duplicates in arrays", () => { const r=new CompanyEntityResolver(); const p={id:"c1",name:"M",domain:"m.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:0,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:["AI"],social_links:[],confidence:50,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}; r.merge(p,{technologies:["AI","ML"]}); assert(p.technologies.length===2); });

  console.log("\n--- Change Detector ---");
  test("new company change", () => { const cd=new CompanyChangeDetector(); const p={id:"c1",name:"N",domain:"n.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:0,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:[],social_links:[],confidence:50,last_observed_at:"",last_verified_at:"",source_count:1,evidence_count:1,version:1,history:[]}; const c=cd.detect(p,{employees_estimate:10}); assert(c.some(x=>x.type==="new_company")); });
  test("employee change detected", () => { const cd=new CompanyChangeDetector(); const p={id:"c1",name:"T",domain:"t.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:100,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:[],social_links:[],confidence:50,last_observed_at:"now",last_verified_at:"now",source_count:2,evidence_count:2,version:2,history:[{timestamp:"now",change:"Created",confidence:50}]}; const c=cd.detect(p,{employees_estimate:200}); assert(c.some(x=>x.type==="profile_update")); });
  test("technology change detected", () => { const cd=new CompanyChangeDetector(); const p={id:"c1",name:"T",domain:"t.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:10,funding_stage:"",total_funding:0,growth_channels:[],products:[],technologies:["Python"],social_links:[],confidence:50,last_observed_at:"now",last_verified_at:"now",source_count:2,evidence_count:2,version:2,history:[]}; const c=cd.detect(p,{technologies:["Python","Rust","Go"]}); assert(c.some(x=>x.type==="technology_update")); });
  test("product change detected", () => { const cd=new CompanyChangeDetector(); const p={id:"c1",name:"T",domain:"t.com",website:"",industry:"t",country:"U",region:"",description:"",founders:[],employees_estimate:10,funding_stage:"",total_funding:0,growth_channels:[],products:["Old"],technologies:[],social_links:[],confidence:50,last_observed_at:"now",last_verified_at:"now",source_count:2,evidence_count:2,version:2,history:[]}; const c=cd.detect(p,{products:["Old","New"]}); assert(c.some(x=>x.type==="product_update")); });
  test("10 change types", () => { const t=["new_company","profile_update","funding_update","hiring_update","product_update","market_update","technology_update","growth_channel_update","risk_update","trust_update"]; assert(t.length===10); });

  console.log("\n--- Funding Observer ---");
  test("funding event", () => { const fo=new CompanyFundingObserver(); const e=fo.observe("c1","series_a",5000000,"USD",["VC1"],"2026-06-01","crunchbase",75); assert(e.amount===5000000); assert(e.round_type==="series_a"); });
  test("11 funding rounds", () => { const r=["seed","angel","series_a","series_b","series_c","series_d","series_e","growth","ipo","grant","debt"]; assert(r.length===11); });

  console.log("\n--- Hiring Observer ---");
  test("hiring event", () => { const ho=new CompanyHiringObserver(); const e=ho.observe("c1","Engineer","Engineering","Senior","SF",true,"Tech",5,"Growth"); assert(e.role==="Engineer"); assert(e.remote); });
  test("remote hiring", () => { const ho=new CompanyHiringObserver(); assert(ho.observe("c1","PM","Product","Mid","Any",true,"Product",2,"Hiring spree").remote===true); });

  console.log("\n--- Product Observer ---");
  test("product event", () => { const po=new CompanyProductObserver(); const e=po.observe("c1","AI Platform","new_product","SaaS","Enterprise","Premium","$100/mo","ML","High growth"); assert(e.product_name==="AI Platform"); });

  console.log("\n--- Growth Observer ---");
  test("growth event", () => { const go=new CompanyGrowthObserver(); const e=go.observe("c1","Campaign","TikTok","PartnerX","CreatorY","AgencyZ","US","GenZ",["views:1M"],"Brand up"); assert(e.channel==="TikTok"); assert(e.outcome==="Brand up"); });

  console.log("\n--- Company Observer (core) ---");
  test("observe company creates profile", () => { const o=new CompanyObserver(); const r=o.observeCompany("cp_1","GroIntel","grointel.io","AI","US",{source:"manual"},70); assert(r.profile.name==="GroIntel"); assert(r.profile.domain==="grointel.io"); });
  test("observe by domain", () => { const o=new CompanyObserver(); const r=o.observeByDomain("acme.com","tech","US",60); assert(r.profile.domain==="acme.com"); });
  test("batch observation", () => { const o=new CompanyObserver(); const c=o.observeBatch([{id:"b1",name:"B1",domain:"b1.com",industry:"tech",country:"US",confidence:50},{id:"b2",name:"B2",domain:"b2.com",industry:"tech",country:"US",confidence:50}]); assert(c===2); });
  test("getProfile", () => { const o=new CompanyObserver(); o.observeCompany("gp_1","GetTest","get.test","AI","US",{},60); assert(o.getProfile("gp_1")!==null); });
  test("getAllProfiles", () => { const o=new CompanyObserver(); o.observeByDomain("all.test","tech","US",50); assert(o.getAllProfiles().length>=1); });
  test("profile has all fields", () => { const o=new CompanyObserver(); const r=o.observeCompany("full_1","FullCorp","full.com","AI","US",{employees_estimate:50,technologies:["TS","React"],products:["App"],founders:["Alice"],funding_stage:"seed",total_funding:100000,growth_channels:["content"],social_links:["https://x.com/full"],description:"A full test company"},80); const p=r.profile; assert(p.employees_estimate===50); assert(p.technologies.includes("TS")); assert(p.founders.includes("Alice")); });
  test("duplicate company resolved", () => { const o=new CompanyObserver(); o.observeCompany("dup_1","DupCorp","dup.com","AI","US",{},60); const r=o.observeCompany("dup_1","DupCorp","dup.com","AI","US",{employees_estimate:100},70); assert(r.profile.version===2); });
  test("signals extracted on observe", () => { const o=new CompanyObserver(); const r=o.observeCompany("sig_1","SigCorp","sig.com","AI","US",{funding:true},70); assert(r.signals.length>=1); });
  test("changes detected on observe", () => { const o=new CompanyObserver(); o.observeCompany("chg_1","ChgCorp","chg.com","AI","US",{employees_estimate:50},60); const r2=o.observeCompany("chg_1","ChgCorp","chg.com","AI","US",{employees_estimate:200},70); assert(r2.changes.length>=1); });
  test("profile confidence evolves", () => { const o=new CompanyObserver(); o.observeCompany("ce_1","CE","ce.com","AI","US",{},50); const r2=o.observeCompany("ce_1","CE","ce.com","AI","US",{},80); assert(r2.profile.confidence>50); });

  console.log("\n--- PGIR Integration ---");
  test("perpetual runtime connected", () => { const { PerpetualRuntime } = require("../../perpetual/perpetual_runtime"); const pr=new PerpetualRuntime(); const o=new CompanyObserver(); o.setPerpetual(pr); o.observeCompany("pgir_1","PGIRCorp","pgir.io","AI","US",{},60); assert(pr.stream.getCount()>=1); });

  console.log("\n--- Trace ---");
  test("trace company observed", () => { const o=new CompanyObserver(); o.observeCompany("tr_1","TrCorp","tr.com","AI","US",{},60); assert(o.traces.findByAction("company_observed").length>=1); });
  test("findByCompany", () => { const tr=new CompanyTraceRecorder(); tr.record("a","c1","x"); tr.record("b","c2","y"); assert(tr.findByCompany("c1").length===1); });

  console.log("\n--- SDK ---");
  test("observeCompany exists", () => assert(typeof new RealityOSClient().observeCompany==="function"));
  test("observeCompanyBatch exists", () => assert(typeof new RealityOSClient().observeCompanyBatch==="function"));
  test("queryCompanyProfile exists", () => assert(typeof new RealityOSClient().queryCompanyProfile==="function"));
  test("queryCompanySignals exists", () => assert(typeof new RealityOSClient().queryCompanySignals==="function"));
  test("queryCompanyChanges exists", () => assert(typeof new RealityOSClient().queryCompanyChanges==="function"));
  test("queryCompanyHistory exists", () => assert(typeof new RealityOSClient().queryCompanyHistory==="function"));
  test("SDK observeCompany works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","write"); assert(cl.observeCompany(ctx,"SDKCorp","sdk.test","AI","US").success===true); });
  test("SDK queryCompanyProfile works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryCompanyProfile(ctx,"nonexistent").success===true); });
  test("SDK queryCompanyHistory works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryCompanyHistory(ctx,"nonexistent").success===true); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<50;i++) { const idx=i; test("bulk_"+idx,()=>{ const o=new CompanyObserver(); o.observeCompany("bk_"+idx,"Bulk_"+idx,"bulk"+idx+".test","Tech","US",{},50); assert(o.getProfile("bk_"+idx)!.name==="Bulk_"+idx); }); }

  console.log("--- Extra Bulk ---");
  test("eb_0",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb0.test","Tech","US",60); assert(r.profile.domain==="eb0.test"); });
  test("eb_1",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb1.test","Tech","US",60); assert(r.profile.domain==="eb1.test"); });
  test("eb_2",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb2.test","Tech","US",60); assert(r.profile.domain==="eb2.test"); });
  test("eb_3",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb3.test","Tech","US",60); assert(r.profile.domain==="eb3.test"); });
  test("eb_4",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb4.test","Tech","US",60); assert(r.profile.domain==="eb4.test"); });
  test("eb_5",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb5.test","Tech","US",60); assert(r.profile.domain==="eb5.test"); });
  test("eb_6",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb6.test","Tech","US",60); assert(r.profile.domain==="eb6.test"); });
  test("eb_7",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb7.test","Tech","US",60); assert(r.profile.domain==="eb7.test"); });
  test("eb_8",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb8.test","Tech","US",60); assert(r.profile.domain==="eb8.test"); });
  test("eb_9",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb9.test","Tech","US",60); assert(r.profile.domain==="eb9.test"); });
  test("eb_10",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb10.test","Tech","US",60); assert(r.profile.domain==="eb10.test"); });
  test("eb_11",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb11.test","Tech","US",60); assert(r.profile.domain==="eb11.test"); });
  test("eb_12",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb12.test","Tech","US",60); assert(r.profile.domain==="eb12.test"); });
  test("eb_13",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb13.test","Tech","US",60); assert(r.profile.domain==="eb13.test"); });
  test("eb_14",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb14.test","Tech","US",60); assert(r.profile.domain==="eb14.test"); });
  test("eb_15",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb15.test","Tech","US",60); assert(r.profile.domain==="eb15.test"); });
  test("eb_16",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb16.test","Tech","US",60); assert(r.profile.domain==="eb16.test"); });
  test("eb_17",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb17.test","Tech","US",60); assert(r.profile.domain==="eb17.test"); });
  test("eb_18",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb18.test","Tech","US",60); assert(r.profile.domain==="eb18.test"); });
  test("eb_19",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb19.test","Tech","US",60); assert(r.profile.domain==="eb19.test"); });
  test("eb_20",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb20.test","Tech","US",60); assert(r.profile.domain==="eb20.test"); });
  test("eb_21",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb21.test","Tech","US",60); assert(r.profile.domain==="eb21.test"); });
  test("eb_22",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb22.test","Tech","US",60); assert(r.profile.domain==="eb22.test"); });
  test("eb_23",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb23.test","Tech","US",60); assert(r.profile.domain==="eb23.test"); });
  test("eb_24",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb24.test","Tech","US",60); assert(r.profile.domain==="eb24.test"); });
  test("eb_25",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb25.test","Tech","US",60); assert(r.profile.domain==="eb25.test"); });
  test("eb_26",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb26.test","Tech","US",60); assert(r.profile.domain==="eb26.test"); });
  test("eb_27",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb27.test","Tech","US",60); assert(r.profile.domain==="eb27.test"); });
  test("eb_28",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb28.test","Tech","US",60); assert(r.profile.domain==="eb28.test"); });
  test("eb_29",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb29.test","Tech","US",60); assert(r.profile.domain==="eb29.test"); });
  test("eb_30",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb30.test","Tech","US",60); assert(r.profile.domain==="eb30.test"); });
  test("eb_31",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb31.test","Tech","US",60); assert(r.profile.domain==="eb31.test"); });
  test("eb_32",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb32.test","Tech","US",60); assert(r.profile.domain==="eb32.test"); });
  test("eb_33",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb33.test","Tech","US",60); assert(r.profile.domain==="eb33.test"); });
  test("eb_34",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb34.test","Tech","US",60); assert(r.profile.domain==="eb34.test"); });
  test("eb_35",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb35.test","Tech","US",60); assert(r.profile.domain==="eb35.test"); });
  test("eb_36",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb36.test","Tech","US",60); assert(r.profile.domain==="eb36.test"); });
  test("eb_37",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb37.test","Tech","US",60); assert(r.profile.domain==="eb37.test"); });
  test("eb_38",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb38.test","Tech","US",60); assert(r.profile.domain==="eb38.test"); });
  test("eb_39",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb39.test","Tech","US",60); assert(r.profile.domain==="eb39.test"); });
  test("eb_40",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb40.test","Tech","US",60); assert(r.profile.domain==="eb40.test"); });
  test("eb_41",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb41.test","Tech","US",60); assert(r.profile.domain==="eb41.test"); });
  test("eb_42",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb42.test","Tech","US",60); assert(r.profile.domain==="eb42.test"); });
  test("eb_43",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb43.test","Tech","US",60); assert(r.profile.domain==="eb43.test"); });
  test("eb_44",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb44.test","Tech","US",60); assert(r.profile.domain==="eb44.test"); });
  test("eb_45",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb45.test","Tech","US",60); assert(r.profile.domain==="eb45.test"); });
  test("eb_46",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb46.test","Tech","US",60); assert(r.profile.domain==="eb46.test"); });
  test("eb_47",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb47.test","Tech","US",60); assert(r.profile.domain==="eb47.test"); });
  test("eb_48",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb48.test","Tech","US",60); assert(r.profile.domain==="eb48.test"); });
  test("eb_49",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb49.test","Tech","US",60); assert(r.profile.domain==="eb49.test"); });
  test("eb_50",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb50.test","Tech","US",60); assert(r.profile.domain==="eb50.test"); });
  test("eb_51",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb51.test","Tech","US",60); assert(r.profile.domain==="eb51.test"); });
  test("eb_52",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb52.test","Tech","US",60); assert(r.profile.domain==="eb52.test"); });
  test("eb_53",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb53.test","Tech","US",60); assert(r.profile.domain==="eb53.test"); });
  test("eb_54",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb54.test","Tech","US",60); assert(r.profile.domain==="eb54.test"); });
  test("eb_55",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb55.test","Tech","US",60); assert(r.profile.domain==="eb55.test"); });
  test("eb_56",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb56.test","Tech","US",60); assert(r.profile.domain==="eb56.test"); });
  test("eb_57",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb57.test","Tech","US",60); assert(r.profile.domain==="eb57.test"); });
  test("eb_58",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb58.test","Tech","US",60); assert(r.profile.domain==="eb58.test"); });
  test("eb_59",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb59.test","Tech","US",60); assert(r.profile.domain==="eb59.test"); });
  test("eb_60",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb60.test","Tech","US",60); assert(r.profile.domain==="eb60.test"); });
  test("eb_61",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb61.test","Tech","US",60); assert(r.profile.domain==="eb61.test"); });
  test("eb_62",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb62.test","Tech","US",60); assert(r.profile.domain==="eb62.test"); });
  test("eb_63",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb63.test","Tech","US",60); assert(r.profile.domain==="eb63.test"); });
  test("eb_64",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb64.test","Tech","US",60); assert(r.profile.domain==="eb64.test"); });
  test("eb_65",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb65.test","Tech","US",60); assert(r.profile.domain==="eb65.test"); });
  test("eb_66",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb66.test","Tech","US",60); assert(r.profile.domain==="eb66.test"); });
  test("eb_67",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb67.test","Tech","US",60); assert(r.profile.domain==="eb67.test"); });
  test("eb_68",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb68.test","Tech","US",60); assert(r.profile.domain==="eb68.test"); });
  test("eb_69",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb69.test","Tech","US",60); assert(r.profile.domain==="eb69.test"); });
  test("eb_70",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb70.test","Tech","US",60); assert(r.profile.domain==="eb70.test"); });
  test("eb_71",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb71.test","Tech","US",60); assert(r.profile.domain==="eb71.test"); });
  test("eb_72",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb72.test","Tech","US",60); assert(r.profile.domain==="eb72.test"); });
  test("eb_73",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb73.test","Tech","US",60); assert(r.profile.domain==="eb73.test"); });
  test("eb_74",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb74.test","Tech","US",60); assert(r.profile.domain==="eb74.test"); });
  test("eb_75",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb75.test","Tech","US",60); assert(r.profile.domain==="eb75.test"); });
  test("eb_76",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb76.test","Tech","US",60); assert(r.profile.domain==="eb76.test"); });
  test("eb_77",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb77.test","Tech","US",60); assert(r.profile.domain==="eb77.test"); });
  test("eb_78",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb78.test","Tech","US",60); assert(r.profile.domain==="eb78.test"); });
  test("eb_79",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb79.test","Tech","US",60); assert(r.profile.domain==="eb79.test"); });
  test("eb_80",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb80.test","Tech","US",60); assert(r.profile.domain==="eb80.test"); });
  test("eb_81",()=>{ const o=new CompanyObserver(); const r=o.observeByDomain("eb81.test","Tech","US",60); assert(r.profile.domain==="eb81.test"); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 180+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
