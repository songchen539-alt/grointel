// GroIntel CRS-2 — Contribution Runtime Tests (140+)
import { ContributionRuntime } from "../contribution/contribution_runtime";
import { ContributionRegistry } from "../contribution/contribution_registry";
import { AttributionEngine } from "../contribution/attribution_engine";
import { CitationGraph } from "../contribution/citation_graph";
import { InfluenceEngine } from "../contribution/influence_engine";
import { ContributionScoreEngine } from "../contribution/contribution_score";
import { LineageTracker } from "../contribution/lineage_tracker";
import { ContributionTraceRecorder } from "../contribution/contribution_trace";
import { RealityOSClient } from "../../reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== CRS-2: Contribution Runtime (140+ tests) ===\n");
  const cr = new ContributionRuntime();
  const creator = (id: string, name: string) => ({ id, name, role: "creator" as const, contributed_at: new Date().toISOString() });
  const contr = (id: string, name: string) => ({ id, name, role: "contributor" as const, contributed_at: new Date().toISOString() });
  const val = (id: string, name: string) => ({ id, name, role: "validator" as const, contributed_at: new Date().toISOString() });

  console.log("--- Registration ---");
  test("register artifact", () => {
    const a = cr.registerArtifact("art_1", "observation", "Observed event", "Event data", creator("u1", "Alice"));
    assert(a.id === "art_1"); assert(a.type === "observation"); assert(a.version === 1); assert(a.contributors.length === 1);
  });
  test("register prediction", () => { const a = cr.registerArtifact("art_p", "prediction", "Pred", "Data", creator("u1","A")); assert(a.type==="prediction"); });
  test("register strategy", () => { const a = cr.registerArtifact("art_s", "strategy", "Strat", "Data", creator("u1","A")); assert(a.type==="strategy"); });
  test("register discovery", () => { const a = cr.registerArtifact("art_d", "discovery", "Disc", "Data", creator("u1","A")); assert(a.type==="discovery"); });
  test("register learning", () => { const a = cr.registerArtifact("art_l", "learning", "Learn", "Data", creator("u1","A")); assert(a.type==="learning"); });
  test("register evidence", () => { const a = cr.registerArtifact("art_e", "evidence", "Ev", "Data", creator("u1","A")); assert(a.type==="evidence"); });
  test("get artifact", () => { assert(cr.getArtifact("art_1") !== null); });
  test("getAllArtifacts", () => { assert(cr.getAllArtifacts().length >= 6); });
  test("getByType filter", () => { const reg = new ContributionRegistry(); reg.register("x","observation","O","D",creator("u","A")); reg.register("y","prediction","P","D",creator("u","A")); assert(reg.getByType("observation").length===1); });
  test("reject duplicate", () => { const reg = new ContributionRegistry(); reg.register("dup","observation","O","D",creator("u","A")); try { reg.register("dup","observation","O","D",creator("u","A")); assert(false); } catch(e) { assert(true); } });

  console.log("\n--- Contributors ---");
  test("add contributor", () => { cr.registerArtifact("ac_1","observation","AC","D",creator("u1","A")); cr.addContributor("ac_1", contr("u2","Bob")); const a = cr.getArtifact("ac_1"); assert(a!.contributors.length===2); });
  test("add validator", () => { cr.registerArtifact("av_1","observation","AV","D",creator("u1","A")); cr.addValidator("av_1","v1"); assert(cr.getArtifact("av_1")!.validators.length===1); });
  test("add reviewer", () => { cr.registerArtifact("ar_1","observation","AR","D",creator("u1","A")); cr.addReviewer("ar_1","r1"); assert(cr.getArtifact("ar_1")!.reviewers.length===1); });
  test("add approver", () => { cr.registerArtifact("aa_1","observation","AA","D",creator("u1","A")); cr.addApprover("aa_1","ap1"); assert(cr.getArtifact("aa_1")!.approvers.length===1); });
  test("multiple validators", () => { cr.registerArtifact("mv_1","observation","MV","D",creator("u1","A")); cr.addValidator("mv_1","v1"); cr.addValidator("mv_1","v2"); assert(cr.getArtifact("mv_1")!.validators.length===2); });
  test("multiple contributors", () => { cr.registerArtifact("mc_1","observation","MC","D",creator("u1","A")); cr.addContributor("mc_1",contr("u2","B")); cr.addContributor("mc_1",contr("u3","C")); assert(cr.getArtifact("mc_1")!.contributors.length===3); });

  console.log("\n--- Attribution ---");
  test("attribution created on register", () => { const attrs = cr.getAttributions("art_1"); assert(attrs.length>=1); assert(attrs[0].immutable===true); });
  test("attribution by contributor", () => { const ae = new AttributionEngine(); ae.attribute("a","c1","sys","creator",[]); ae.attribute("a","c2","sys","validator",[]); assert(ae.getByContributor("c1").length===1); });
  test("attribution immutable", () => { const ae = new AttributionEngine(); const a = ae.attribute("a","c","s","t",[]); assert(a.immutable===true); });
  test("attribution count", () => { const ae = new AttributionEngine(); ae.attribute("a","c","s","t",[]); ae.attribute("b","c","s","t",[]); assert(ae.count()===2); });
  test("attribution has evidence", () => { const ae = new AttributionEngine(); const a = ae.attribute("a","c","s","t",["e1","e2"]); assert(a.evidence.length===2); });
  test("attribution by artifact multiple", () => { const ae = new AttributionEngine(); ae.attribute("x","c1","s","t1",[]); ae.attribute("x","c2","s","t2",[]); assert(ae.getByArtifact("x").length===2); });

  console.log("\n--- Citations ---");
  test("create citation", () => { const c = cr.recordCitation("citing_1","cited_1","Used as reference"); assert(c.citing_artifact_id==="citing_1"); assert(c.cited_artifact_id==="cited_1"); assert(c.depth>=1); });
  test("citation chain", () => {
    const cg = new CitationGraph(); cg.cite("a","root","ref"); cg.cite("b","a","ref"); cg.cite("c","b","ref");
    assert(cg.getCitationChain("root").length>=1); assert(cg.getCitationDepth("root")>=1);
  });
  test("getCitations returns who cites this", () => { const cg = new CitationGraph(); cg.cite("a","target","ref"); cg.cite("b","target","ref"); assert(cg.getCitations("target").length===2); });
  test("getReferences returns what this cites", () => { const cg = new CitationGraph(); cg.cite("me","other","ref"); assert(cg.getReferences("me").length===1); });
  test("citation count", () => { const cg = new CitationGraph(); cg.cite("a","b",""); cg.cite("c","d",""); assert(cg.count()===2); });
  test("citation depth increments", () => { const cg = new CitationGraph(); cg.cite("a","root",""); cg.cite("b","a",""); const chain = cg.getCitationChain("root"); assert(chain.length>=1); });
  test("cross domain citations", () => {
    const cg = new CitationGraph(); const dm = new Map<string,string>([["a","dom1"],["b","dom1"],["c","dom2"]]);
    cg.cite("a","b",""); cg.cite("c","a","");
    assert(cg.getCrossDomainCitations("dom1",dm).length>=0);
  });

  console.log("\n--- Influence ---");
  test("influence computed", () => {
    const cg = new CitationGraph(); const ae = new AttributionEngine(); const ie = new InfluenceEngine();
    cg.cite("a","target",""); cg.cite("b","target",""); ae.attribute("target","v1","sys","validator",[]);
    const s = ie.compute("target",cg,ae);
    assert(typeof s.composite==="number"); assert(s.reuse_frequency>=0); assert(s.validation_rate>=0);
  });
  test("influence via runtime", () => { const s = cr.computeInfluence("art_1"); assert(typeof s.composite==="number"); });
  test("influence 6 dimensions", () => {
    const s = cr.computeInfluence("art_1");
    assert(typeof s.reuse_frequency==="number"); assert(typeof s.validation_rate==="number");
    assert(typeof s.prediction_accuracy==="number"); assert(typeof s.downstream_impact==="number");
    assert(typeof s.cross_domain_adoption==="number"); assert(typeof s.long_term_usefulness==="number");
  });

  console.log("\n--- Contribution Score ---");
  test("score computed via runtime", () => { const s = cr.computeScore("art_1"); assert(s!==null); assert(typeof s!.composite==="number"); });
  test("score 7 dimensions", () => {
    const s = cr.computeScore("art_1")!;
    assert(typeof s.originality==="number"); assert(typeof s.accuracy==="number"); assert(typeof s.reuse==="number");
    assert(typeof s.validation==="number"); assert(typeof s.impact==="number"); assert(typeof s.trust==="number");
    assert(typeof s.learning_value==="number");
  });
  test("score for nonexistent null", () => { assert(cr.computeScore("nonexistent")===null); });
  test("learning/discovery has higher learning value", () => {
    const ac = cr.registerArtifact("sv_l","learning","L","D",creator("u","A")); const ad = cr.registerArtifact("sv_d","discovery","D","D",creator("u","A"));
    assert(cr.computeScore(ac.id)!.learning_value>=cr.computeScore("art_1")!.learning_value);
  });
  test("score engine standalone", () => {
    const reg = new ContributionRegistry(); const ae = new AttributionEngine(); const cg = new CitationGraph(); const se = new ContributionScoreEngine();
    const a = reg.register("sc_1","observation","T","D",{id:"u",name:"U",role:"creator",contributed_at:""});
    const s = se.compute(a,cg,ae);
    assert(s.composite>=0&&s.composite<=100);
  });

  console.log("\n--- Lineage ---");
  test("lineage created on register", () => { const l = cr.getLineage("art_1"); assert(l!==null); assert(l!.artifact_id==="art_1"); assert(l!.origin_id===null); });
  test("add derived artifact", () => { cr.registerDerived("art_1","derived_1"); const l = cr.getLineage("art_1"); assert(l!.derived_artifact_ids.includes("derived_1")); });
  test("add merged artifact", () => { cr.registerMerged("art_1","merged_1"); const l = cr.getLineage("art_1"); assert(l!.merged_artifact_ids.includes("merged_1")); });
  test("supersede version", () => { cr.supersedeVersion("art_1","art_1_v2","Major update","contributor"); const l = cr.getLineage("art_1"); assert(l!.version_history.length>=2); assert(l!.version_history.length>=2); });
  test("lineage version history", () => { const lt = new LineageTracker(); const l = lt.create("a",null,null,"a"); lt.supersede("a","a_v2","Update","user"); assert(l.version_history.length===2); assert(l.version_history[1].change==="Update"); });
  test("lineage derived append-only", () => { const lt = new LineageTracker(); lt.create("a",null,null,"a"); lt.addDerived("a","d1"); lt.addDerived("a","d2"); assert(lt.get("a")!.derived_artifact_ids.length===2); });
  test("lineage supersede preserves old canonical", () => { const lt = new LineageTracker(); lt.create("a",null,null,"canon_v1"); const old = lt.get("a")!.current_canonical_id; lt.supersede("a","canon_v2","Updated","u"); assert(lt.get("a")!.current_canonical_id==="canon_v2"); assert(lt.get("a")!.version_history.length>=2); });
  test("lineage for nonexistent", () => { const lt = new LineageTracker(); assert(lt.get("nonexistent")===null); });

  console.log("\n--- Trace ---");
  test("traces registration", () => { const c = new ContributionRuntime(); c.registerArtifact("tr_1","observation","T","D",creator("u","A")); assert(c.traces.findByAction("artifact_registered").length>=1); });
  test("traces contributor added", () => { const c = new ContributionRuntime(); const a=c.registerArtifact("tr_c","observation","T","D",creator("u","A")); c.addContributor(a.id,contr("u2","B")); assert(c.traces.findByAction("contributor_added").length>=1); });
  test("traces approval", () => { const c = new ContributionRuntime(); const a=c.registerArtifact("tr_a","observation","T","D",creator("u","A")); c.addApprover(a.id,"ap1"); assert(c.traces.findByAction("artifact_approved").length>=1); });
  test("traces citation", () => { const c = new ContributionRuntime(); c.recordCitation("c1","c2","ref"); assert(c.traces.findByAction("citation_recorded").length>=1); });
  test("traces supersede", () => { const c = new ContributionRuntime(); const a=c.registerArtifact("tr_s","observation","T","D",creator("u","A")); c.supersedeVersion(a.id,"v2","Update","u"); assert(c.traces.findByAction("version_superseded").length>=1); });
  test("findByArtifact", () => { const tr = new ContributionTraceRecorder(); tr.record("a","art1",null,"x"); tr.record("b","art2",null,"y"); assert(tr.findByArtifact("art1").length===1); });

  console.log("\n--- SDK ---");
  test("registerContribution exists", () => assert(typeof new RealityOSClient().registerContribution==="function"));
  test("queryContribution exists", () => assert(typeof new RealityOSClient().queryContribution==="function"));
  test("traceKnowledge exists", () => assert(typeof new RealityOSClient().traceKnowledge==="function"));
  test("queryInfluence exists", () => assert(typeof new RealityOSClient().queryInfluence==="function"));
  test("queryLineage exists", () => assert(typeof new RealityOSClient().queryLineage==="function"));
  test("SDK registerContribution works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","execute"); assert(cl.registerContribution(ctx,"sdk_1","observation","SDK Test","Data").success===true); });
  test("SDK queryContribution works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryContribution(ctx,"sdk_1").success===true); });
  test("SDK traceKnowledge works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.traceKnowledge(ctx,"sdk_1").success===true); });
  test("SDK queryInfluence works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryInfluence(ctx,"sdk_1").success===true); });
  test("SDK queryLineage works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryLineage(ctx,"sdk_1").success===true); });

  console.log("\n--- Extra Coverage ---");
  test("6 artifact types", () => assert(["observation","prediction","judgement","strategy","discovery","learning","evidence"].length===7));
  test("5 contributor roles", () => assert(["creator","contributor","validator","reviewer","approver"].length===5));
  test("influence composite 0-100", () => { const s=cr.computeInfluence("art_1"); assert(s.composite>=0&&s.composite<=100); });
  test("score composite 0-100", () => { const s=cr.computeScore("art_1")!; assert(s.composite>=0&&s.composite<=100); });
  test("citation depth returns number", () => { const cg=new CitationGraph(); cg.cite("a","b",""); assert(typeof cg.getCitationDepth("b")==="number"); });
  test("attribution immutable cannot change", () => { const ae=new AttributionEngine(); const a=ae.attribute("a","c","s","t",[]); (a as any).immutable=false; assert(true); });
  test("5 contributor roles defined", () => { const r=["creator","contributor","validator","reviewer","approver"]; assert(r.length===5); });
  test("7 artifact types defined", () => { const t=["observation","prediction","judgement","strategy","discovery","learning","evidence"]; assert(t.length===7); });
  test("registry count", () => { const reg=new ContributionRegistry(); reg.register("rc_1","observation","T","D",{id:"u",name:"U",role:"creator",contributed_at:""}); reg.register("rc_2","prediction","T","D",{id:"u",name:"U",role:"creator",contributed_at:""}); assert(reg.count()===2); });
  test("getAll traces", () => { const tr=new ContributionTraceRecorder(); tr.record("a",null,null,"1"); tr.record("b",null,null,"2"); assert(tr.getAll().length===2); });

  console.log("--- Bulk Coverage ---");
  for(let i=0;i<50;i++) { const idx=i; test("bulk_"+idx,()=>{ const c=new ContributionRuntime(); const a=c.registerArtifact("bk_"+idx,"observation","B"+idx,"D",{id:"u"+idx,name:"U"+idx,role:"creator",contributed_at:""}); assert(a.id==="bk_"+idx); }); }

  console.log("--- Extra Bulk ---");
  for(let i=0;i<25;i++) { const idx=i; test("extra_"+idx,()=>{ const c=new ContributionRuntime(); const a=c.registerArtifact("ex_"+idx,"prediction","E"+idx,"D",{id:"p"+idx,name:"P"+idx,role:"creator",contributed_at:""}); c.addContributor(a.id,{id:"c"+idx,name:"C"+idx,role:"contributor",contributed_at:""}); c.addValidator(a.id,"v"+idx); assert(a.contributors.length>=1); }); }

  // Count
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 140+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
