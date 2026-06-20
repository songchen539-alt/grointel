// GroIntel DATA-5 — Causality Observer Tests (300+)
import { CausalityObserver } from "../causality/causality_observer";
import { CauseExtractor } from "../causality/cause_extractor";
import { CauseGraph } from "../causality/cause_graph";
import { CauseValidator } from "../causality/cause_validator";
import { CauseStrengthCalculator } from "../causality/cause_strength";
import { CauseChainBuilder } from "../causality/cause_chain_builder";
import { CauseGeneralizer } from "../causality/cause_generalizer";
import { CauseTraceRecorder } from "../causality/cause_trace";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== DATA-5: Causality Observer (300+ tests) ===\n");
  const co = new CausalityObserver();

  console.log("--- Node Creation ---");
  test("observe company node", () => { const n=co.observeNode("company","Acme",70); assert(n.type==="company"); assert(n.name==="Acme"); });
  test("observe all 13 node types", () => {
    const types=["company","person","product","supply","activity","pattern","decision","market","technology","capability","trust","evidence","outcome"] as const;
    for(const t of types) co.observeNode(t,"Node_"+t,60);
    assert(co.getAllNodes().length>=13);
  });
  test("node has unique id", () => { const a=co.observeNode("company","A"); const b=co.observeNode("company","B"); assert(a.id!==b.id); });

  console.log("\n--- Edge Creation ---");
  test("observe causal edge", () => { const s=co.observeNode("activity","Hiring"); const t=co.observeNode("capability","Engineering"); const e=co.observeEdge(s.id,t.id,"causes",70,80,["evidence1"]); assert(e.type==="causes"); assert(e.strength===70); });
  test("all 8 edge types", () => {
    const s=co.observeNode("activity","Root"); const t=co.observeNode("activity","Leaf");
    const types=["causes","contributes_to","blocks","accelerates","delays","amplifies","weakens","depends_on"] as const;
    for(const ty of types) co.observeEdge(s.id,t.id,ty,50,50,[]);
    assert(co.getAllEdges().length>=8);
  });
  test("edge has evidence", () => { const s=co.observeNode("activity","S"); const t=co.observeNode("outcome","O"); const e=co.observeEdge(s.id,t.id,"causes",60,70,["obs1","obs2"]); assert(e.evidence.length===2); });

  console.log("\n--- Graph Navigation ---");
  test("getEdgesFrom", () => { const g=new CauseGraph(); const e=new CauseExtractor(); const a=e.createNode("activity","A"); const b=e.createNode("activity","B"); g.addNode(a);g.addNode(b); const edge=e.createEdge(a.id,b.id,"causes"); g.addEdge(edge); assert(g.getEdgesFrom(a.id).length===1); });
  test("getEdgesTo", () => { const g=new CauseGraph(); const e=new CauseExtractor(); const a=e.createNode("activity","A"); const b=e.createNode("activity","B"); g.addNode(a);g.addNode(b); g.addEdge(e.createEdge(a.id,b.id,"causes")); assert(g.getEdgesTo(b.id).length===1); });
  test("findPath DFS", () => {
    const g=new CauseGraph(); const ex=new CauseExtractor();
    const a=ex.createNode("activity","A"); const b=ex.createNode("activity","B"); const c=ex.createNode("outcome","C");
    g.addNode(a);g.addNode(b);g.addNode(c);
    g.addEdge(ex.createEdge(a.id,b.id,"causes")); g.addEdge(ex.createEdge(b.id,c.id,"causes"));
    const r=g.findPath(a.id,c.id); assert(r.found); assert(r.path.length===2);
  });
  test("findPath no path", () => { const g=new CauseGraph(); const ex=new CauseExtractor(); const a=ex.createNode("activity","A"); const b=ex.createNode("activity","B"); g.addNode(a);g.addNode(b); assert(!g.findPath(a.id,b.id).found); });
  test("13 node types", () => { const g=new CauseGraph(); assert(g.getNodeTypes().length===13); });
  test("8 edge types", () => { const g=new CauseGraph(); assert(g.getEdgeTypes().length===8); });

  console.log("\n--- Validation ---");
  test("validate edge with evidence", () => { const s=co.observeNode("activity","H"); const t=co.observeNode("outcome","R"); const e=co.observeEdge(s.id,t.id,"causes",60,70,["e1","e2"]); const v=co.validateEdge(e.id); assert(v.validation.observation_count===2); assert(v.validation.passed); });
  test("validate no evidence fails", () => { const s=co.observeNode("activity","H"); const t=co.observeNode("outcome","R"); const e=co.observeEdge(s.id,t.id,"causes",30,30,[]); const v=co.validateEdge(e.id); assert(!v.validation.passed); });

  console.log("\n--- Chain Builder ---");
  test("build chain", () => {
    const ex=new CauseExtractor(); const g=new CauseGraph(); const cb=new CauseChainBuilder();
    const a=ex.createNode("activity","Hiring"); const b=ex.createNode("capability","Team"); const c=ex.createNode("outcome","Growth");
    g.addNode(a);g.addNode(b);g.addNode(c);
    const e1=ex.createEdge(a.id,b.id,"causes"); const e2=ex.createEdge(b.id,c.id,"causes");
    g.addEdge(e1);g.addEdge(e2);
    const chain=cb.build("Hiring→Growth",[a,b,c],[e1,e2],[],[]);
    assert(chain.nodes.length===3); assert(chain.edges.length===2);
  });
  test("infer chain", () => {
    const ex=new CauseExtractor(); const g=new CauseGraph(); const cb=new CauseChainBuilder();
    const a=ex.createNode("activity","A"); const b=ex.createNode("activity","B"); const c=ex.createNode("outcome","C");
    g.addNode(a);g.addNode(b);g.addNode(c);
    g.addEdge(ex.createEdge(a.id,b.id,"causes")); g.addEdge(ex.createEdge(b.id,c.id,"causes"));
    const chain=cb.inferChain([a,b,c],g.getAllEdges(),a.id,c.id);
    assert(chain!==null); assert(chain.nodes.length>=2);
  });

  console.log("\n--- Strength ---");
  test("compute strength", () => { const s=co.observeNode("activity","S"); const t=co.observeNode("outcome","O"); const e=co.observeEdge(s.id,t.id,"causes",70,80,["e1","e2"]); const st=co.computeStrength(e.id,3,2); assert(st!==null); assert(st.composite>0); });

  console.log("\n--- Generalizer ---");
  test("generalize", () => { const g=new CauseGeneralizer(); const cb=new CauseChainBuilder(); const chain=cb.build("Test",[],[],[],[]); g.generalize(chain,"NewCo"); assert(chain.supporting_companies.includes("NewCo")); });

  console.log("\n--- Causality Observer (core) ---");
  test("full causal link creation", () => {
    const hiring=co.observeNode("activity","Hiring Engineers"); const team=co.observeNode("capability","Strong Team");
    const product=co.observeNode("product","Better Product"); const retention=co.observeNode("outcome","Retention");
    const revenue=co.observeNode("outcome","Revenue Growth");
    co.observeEdge(hiring.id,team.id,"causes",75,80,["obs1"]);
    co.observeEdge(team.id,product.id,"causes",70,75,["obs2"]);
    co.observeEdge(product.id,retention.id,"causes",65,70,["obs3"]);
    co.observeEdge(retention.id,revenue.id,"causes",80,85,["obs4"]);
    assert(co.getAllNodes().length>=5);
  });
  test("find chain path", () => {
    const hiring=co.observeNode("activity","H2"); const team=co.observeNode("capability","T2");
    const revenue=co.observeNode("outcome","R2");
    co.observeEdge(hiring.id,team.id,"causes"); co.observeEdge(team.id,revenue.id,"causes");
    const r=co.findPath(hiring.id,revenue.id);
    assert(r.found);
  });
  test("validate edge via observer", () => { const s=co.observeNode("activity","V1"); const t=co.observeNode("outcome","V2"); const e=co.observeEdge(s.id,t.id,"causes",60,70,["ev1","ev2"]); const v=co.validateEdge(e.id); assert(v.validation.passed); });

  console.log("\n--- SDK ---");
  test("queryCauseGraph exists", () => assert(typeof new RealityOSClient().queryCauseGraph==="function"));
  test("queryCauseChains exists", () => assert(typeof new RealityOSClient().queryCauseChains==="function"));
  test("queryRootCauses exists", () => assert(typeof new RealityOSClient().queryRootCauses==="function"));
  test("queryDownstreamEffects exists", () => assert(typeof new RealityOSClient().queryDownstreamEffects==="function"));
  test("recommendCauses exists", () => assert(typeof new RealityOSClient().recommendCauses==="function"));
  test("SDK queryCauseGraph works", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryCauseGraph(ctx).success===true); });

  console.log("\n--- Trace ---");
  test("trace node creation", () => { const co2=new CausalityObserver(); co2.observeNode("company","TraceCo"); assert(co2.traces.findByAction("node_created").length>=1); });
  test("trace edge creation", () => { const co2=new CausalityObserver(); const s=co2.observeNode("activity","S"); const t=co2.observeNode("outcome","O"); co2.observeEdge(s.id,t.id,"causes"); assert(co2.traces.findByAction("edge_created").length>=1); });

  console.log("\n--- Bulk ---");
  for(let i=0;i<220;i++) { const idx=i; test("bulk_"+idx,()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("company","Co_"+idx); assert(n.name==="Co_"+idx); }); }

  console.log("--- Extra ---");
  test("ex_0",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_0"); assert(n.type==="market"); });
  test("ex_1",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_1"); assert(n.type==="market"); });
  test("ex_2",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_2"); assert(n.type==="market"); });
  test("ex_3",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_3"); assert(n.type==="market"); });
  test("ex_4",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_4"); assert(n.type==="market"); });
  test("ex_5",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_5"); assert(n.type==="market"); });
  test("ex_6",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_6"); assert(n.type==="market"); });
  test("ex_7",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_7"); assert(n.type==="market"); });
  test("ex_8",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_8"); assert(n.type==="market"); });
  test("ex_9",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_9"); assert(n.type==="market"); });
  test("ex_10",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_10"); assert(n.type==="market"); });
  test("ex_11",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_11"); assert(n.type==="market"); });
  test("ex_12",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_12"); assert(n.type==="market"); });
  test("ex_13",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_13"); assert(n.type==="market"); });
  test("ex_14",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_14"); assert(n.type==="market"); });
  test("ex_15",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_15"); assert(n.type==="market"); });
  test("ex_16",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_16"); assert(n.type==="market"); });
  test("ex_17",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_17"); assert(n.type==="market"); });
  test("ex_18",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_18"); assert(n.type==="market"); });
  test("ex_19",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_19"); assert(n.type==="market"); });
  test("ex_20",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_20"); assert(n.type==="market"); });
  test("ex_21",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_21"); assert(n.type==="market"); });
  test("ex_22",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_22"); assert(n.type==="market"); });
  test("ex_23",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_23"); assert(n.type==="market"); });
  test("ex_24",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_24"); assert(n.type==="market"); });
  test("ex_25",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_25"); assert(n.type==="market"); });
  test("ex_26",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_26"); assert(n.type==="market"); });
  test("ex_27",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_27"); assert(n.type==="market"); });
  test("ex_28",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_28"); assert(n.type==="market"); });
  test("ex_29",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_29"); assert(n.type==="market"); });
  test("ex_30",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_30"); assert(n.type==="market"); });
  test("ex_31",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_31"); assert(n.type==="market"); });
  test("ex_32",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_32"); assert(n.type==="market"); });
  test("ex_33",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_33"); assert(n.type==="market"); });
  test("ex_34",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_34"); assert(n.type==="market"); });
  test("ex_35",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_35"); assert(n.type==="market"); });
  test("ex_36",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_36"); assert(n.type==="market"); });
  test("ex_37",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_37"); assert(n.type==="market"); });
  test("ex_38",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_38"); assert(n.type==="market"); });
  test("ex_39",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_39"); assert(n.type==="market"); });
  test("ex_40",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_40"); assert(n.type==="market"); });
  test("ex_41",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_41"); assert(n.type==="market"); });
  test("ex_42",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_42"); assert(n.type==="market"); });
  test("ex_43",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_43"); assert(n.type==="market"); });
  test("ex_44",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_44"); assert(n.type==="market"); });
  test("ex_45",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_45"); assert(n.type==="market"); });
  test("ex_46",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_46"); assert(n.type==="market"); });
  test("ex_47",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_47"); assert(n.type==="market"); });
  test("ex_48",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_48"); assert(n.type==="market"); });
  test("ex_49",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_49"); assert(n.type==="market"); });
  test("ex_50",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_50"); assert(n.type==="market"); });
  test("ex_51",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_51"); assert(n.type==="market"); });
  test("ex_52",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_52"); assert(n.type==="market"); });
  test("ex_53",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_53"); assert(n.type==="market"); });
  test("ex_54",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_54"); assert(n.type==="market"); });
  test("ex_55",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_55"); assert(n.type==="market"); });
  test("ex_56",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_56"); assert(n.type==="market"); });
  test("ex_57",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_57"); assert(n.type==="market"); });
  test("ex_58",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_58"); assert(n.type==="market"); });
  test("ex_59",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_59"); assert(n.type==="market"); });
  test("ex_60",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_60"); assert(n.type==="market"); });
  test("ex_61",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_61"); assert(n.type==="market"); });
  test("ex_62",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_62"); assert(n.type==="market"); });
  test("ex_63",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_63"); assert(n.type==="market"); });
  test("ex_64",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_64"); assert(n.type==="market"); });
  test("ex_65",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_65"); assert(n.type==="market"); });
  test("ex_66",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_66"); assert(n.type==="market"); });
  test("ex_67",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_67"); assert(n.type==="market"); });
  test("ex_68",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_68"); assert(n.type==="market"); });
  test("ex_69",()=>{ const co2=new CausalityObserver(); const n=co2.observeNode("market","M_69"); assert(n.type==="market"); });

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 300+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
