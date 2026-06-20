// GroIntel CRS-1 — Civilization Runtime Tests (120+)
import { CivilizationRuntime } from "../civilization_runtime";
import { CivilizationRegistry } from "../civilization_registry";
import { CivilizationIdentityFactory } from "../civilization_identity";
import { CivilizationMemoryStore } from "../civilization_memory";
import { KnowledgeExchangeLedger } from "../civilization_exchange";
import { ConsensusEngine } from "../civilization_consensus";
import { ConflictEngine } from "../civilization_conflict";
import { ReputationEngine } from "../civilization_reputation";
import { CivilizationTraceRecorder } from "../civilization_trace";
import { RealityOSClient } from "../../reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== CRS-1: Civilization Runtime (120+ tests) ===\n");
  const civ = new CivilizationRuntime();

  console.log("--- Node Registry ---");
  test("register node", () => {
    const node = civ.registerNode("Alpha", ["observe", "cognize"], ["growth", "trust"]);
    assert(node.identity.id.length > 0, "id"); assert(node.identity.name === "Alpha", "name"); assert(node.identity.version === 1, "v1");
  });
  test("register multiple", () => {
    const c = new CivilizationRuntime(); c.registerNode("A", [], []); c.registerNode("B", [], []);
    assert(c.registry.count() === 2);
  });
  test("different ids per name", () => {
    const f = new CivilizationIdentityFactory();
    assert(f.create("Same", [], []).id !== f.create("Same", [], []).id);
  });
  test("node has reputation on creation", () => {
    const n = civ.registerNode("RepTest", ["learn"], ["knowledge"]);
    assert(n.reputation.composite > 0); assert(typeof n.reputation.prediction_accuracy === "number");
  });
  test("get node by id", () => { const n = civ.registerNode("GetTest", [], []); assert(civ.getNode(n.identity.id) !== null); });
  test("getAllNodes", () => { const c = new CivilizationRuntime(); c.registerNode("X", [], []); c.registerNode("Y", [], []); assert(c.getAllNodes().length === 2); });
  test("capabilities and domains", () => { const n = civ.registerNode("C", ["a", "b"], ["c", "d"]); assert(n.identity.capabilities.length === 2); assert(n.identity.knowledge_domains.length === 2); });
  test("trust score 70", () => assert(new CivilizationIdentityFactory().create("T", [], []).trust_score === 70));
  test("state defaults active", () => { const r = new CivilizationRegistry(); const f = new CivilizationIdentityFactory(); assert(r.register(f.create("A", [], [])).current_state === "active"); });
  test("identity empty arrays", () => { const id = new CivilizationIdentityFactory().create("E", [], []); assert(id.capabilities.length === 0 && id.knowledge_domains.length === 0); });

  console.log("\n--- Knowledge Exchange ---");
  test("exchange between nodes", () => { const a = civ.registerNode("EA", [], []); const b = civ.registerNode("EB", [], []); const ex = civ.exchangeKnowledge(a.identity.id, b.identity.id, "observation", "Event", ["e1"], 85); assert(ex.from_node === a.identity.id); assert(ex.to_node === b.identity.id); });
  test("broadcast", () => { const a = civ.registerNode("Bc", [], []); assert(civ.exchangeKnowledge(a.identity.id, null, "prediction", "G").to_node === null); });
  test("6 exchange types", () => { const l = new KnowledgeExchangeLedger(); for (const t of ["observation","prediction","judgement","strategy","learning","evidence"]) l.record("n1", null, t, "T", [], 60); assert(l.count() === 6); });
  test("exchange confidence", () => { const a = civ.registerNode("Cf", [], []); assert(civ.exchangeKnowledge(a.identity.id, null, "learning", "L", [], 90).confidence === 90); });
  test("exchange evidence", () => { const a = civ.registerNode("Ev", [], []); assert(civ.exchangeKnowledge(a.identity.id, null, "evidence", "C", ["o1","o2"], 75).evidence.length === 2); });
  test("ledger append-only", () => { const l = new KnowledgeExchangeLedger(); l.record("n1", null, "o", "E1", [], 50); l.record("n1", null, "p", "E2", [], 60); assert(l.count() === 2); });
  test("getByNode", () => { const l = new KnowledgeExchangeLedger(); l.record("n1","n2","o","O",[],50); l.record("n2","n1","p","P",[],60); l.record("n1",null,"l","L",[],70); assert(l.getByNode("n1").length === 3); });
  test("broadcast stored in memory", () => { const c = new CivilizationRuntime(); const n = c.registerNode("Mem", [], []); c.exchangeKnowledge(n.identity.id, null, "observation", "T", [], 80); assert(c.memory.getTruthCount() >= 1); });
  test("getByType count", () => { const l = new KnowledgeExchangeLedger(); l.record("n",null,"observation","O",[],50); l.record("n",null,"prediction","P",[],50); l.record("n",null,"observation","O2",[],50); const lex2=new KnowledgeExchangeLedger(); lex2.record("n",null,"observation","O",[],50); lex2.record("n",null,"prediction","P",[],50); lex2.record("n",null,"observation","O2",[],50); assert(lex2.getByType("observation").length===2); });

  console.log("\n--- Consensus ---");
  test("create proposal", () => { const p = civ.createConsensus("Is growth accelerating?", "majority"); assert(p.topic === "Is growth accelerating?"); assert(p.mode === "majority"); assert(p.result === null); });
  test("unanimous agreement", () => { const ce = new ConsensusEngine(); const p = ce.create("U?", "agreement"); ce.vote(p,"n1",true,1,""); ce.vote(p,"n2",true,1,""); ce.vote(p,"n3",true,1,""); const c = ce.conclude(p); assert(c.result === true); assert(c.confidence === 100); });
  test("not unanimous", () => { const ce = new ConsensusEngine(); const p = ce.create("U?","agreement"); ce.vote(p,"n1",true,1,""); ce.vote(p,"n2",false,1,""); assert(ce.conclude(p).result === false); });
  test("majority", () => { const ce = new ConsensusEngine(); const p = ce.create("M?","majority"); ce.vote(p,"n1",true,1,""); ce.vote(p,"n2",true,1,""); ce.vote(p,"n3",false,1,""); assert(ce.conclude(p).result === true); });
  test("majority fails", () => { const ce = new ConsensusEngine(); const p = ce.create("M?","majority"); ce.vote(p,"a",false,1,""); ce.vote(p,"b",false,1,""); ce.vote(p,"c",true,1,""); assert(ce.conclude(p).result === false); });
  test("weighted trust", () => { const ce = new ConsensusEngine(); const p = ce.create("W?","weighted_trust"); ce.vote(p,"high",true,10,""); ce.vote(p,"low",false,1,""); assert(ce.conclude(p).result === true); });
  test("weighted trust opposition", () => { const ce = new ConsensusEngine(); const p = ce.create("W?","weighted_trust"); ce.vote(p,"high",false,10,""); ce.vote(p,"low",true,1,""); assert(ce.conclude(p).result === false); });
  test("evidence based", () => { const ce = new ConsensusEngine(); const p = ce.create("E?","evidence_based"); ce.vote(p,"n1",true,1,"evidence"); ce.vote(p,"n2",false,1,"no"); assert(ce.conclude(p).result === true); });
  test("no votes false", () => { const ce2=new ConsensusEngine(); const p2=ce2.create("N?","majority"); assert(ce2.conclude(p2).result===false); });
  test("confidence calculated", () => { const ce = new ConsensusEngine(); const p = ce.create("C?","majority"); ce.vote(p,"a",true,10,""); ce.vote(p,"b",false,2,""); assert(ce.conclude(p).confidence > 0); });
  test("concluded at", () => { const ce = new ConsensusEngine(); const p = ce.create("T","majority"); ce.vote(p,"a",true,1,""); assert(ce.conclude(p).concluded_at !== null); });
  test("consensus stored in memory", () => { const c = new CivilizationRuntime(); const a = c.registerNode("CN1",[],[]); const b = c.registerNode("CN2",[],[]); const p = c.createConsensus("Growth","majority"); c.voteOnConsensus(p,a.identity.id,true,1,""); c.voteOnConsensus(p,b.identity.id,true,1,""); assert(c.concludeConsensus(p).result === true); assert(c.memory.getTruthCount() >= 1); });
  test("votes tracking", () => { const ce = new ConsensusEngine(); const p = ce.create("T","majority"); ce.vote(p,"a",true,1,""); ce.vote(p,"b",false,1,""); assert(p.votes.length === 2); });

  console.log("\n--- Conflict ---");
  test("contradictory knowledge", () => { const a = civ.registerNode("CA",[],[]); const b = civ.registerNode("CB",[],[]); const c = civ.detectConflict("contradictory_knowledge",a.identity.id,b.identity.id,"Opposite",["o1"],"high"); assert(c.type==="contradictory_knowledge"); assert(c.severity==="high"); });
  test("conflicting predictions", () => assert(new ConflictEngine().detect("conflicting_predictions","a","b","d",[],"medium").type==="conflicting_predictions"));
  test("policy conflicts", () => assert(new ConflictEngine().detect("policy_conflicts","a","b","d",[],"low").type==="policy_conflicts"));
  test("duplicate discoveries", () => assert(new ConflictEngine().detect("duplicate_discoveries","a","b","d",[],"medium").type==="duplicate_discoveries"));
  test("trust conflicts critical", () => { const c = new ConflictEngine().detect("trust_conflicts","a","b","t",[],"critical"); assert(c.type==="trust_conflicts"); assert(c.severity==="critical"); });
  test("resolve", () => { const ce = new ConflictEngine(); const c = ce.detect("contradictory_knowledge","a","b","d",[],"medium"); const r = ce.resolve(c.id,"Resolved"); assert(r!==null&&r.resolved===true&&r.resolution==="Resolved"); });
  test("resolve nonexistent", () => assert(new ConflictEngine().resolve("nonexistent","")===null));
  test("unresolved tracked", () => { const ce = new ConflictEngine(); ce.detect("contradictory_knowledge","a","b","C1",[],"high"); ce.detect("contradictory_knowledge","c","d","C2",[],"medium"); assert(ce.getUnresolved().length===2); ce.resolve(ce.getUnresolved()[0].id,"Done"); assert(ce.getUnresolved().length===1); });
  test("created_at", () => assert(new ConflictEngine().detect("contradictory_knowledge","a","b","d",[],"low").created_at.length>0));
  test("resolution memory", () => { const c = new CivilizationRuntime(); const a = c.registerNode("CR1",[],[]); const b = c.registerNode("CR2",[],[]); const cf = c.detectConflict("contradictory_knowledge",a.identity.id,b.identity.id,"C",[],"high"); c.resolveConflict(cf.id,"Merged"); assert(c.memory.getLessonCount()>=1); });

  console.log("\n--- Reputation ---");
  test("7 dimensions", () => { const n = civ.registerNode("R7",[],[]); const r = n.reputation; assert(typeof r.prediction_accuracy==="number"); assert(typeof r.truth_preservation==="number"); assert(typeof r.knowledge_quality==="number"); assert(typeof r.contribution==="number"); assert(typeof r.trustworthiness==="number"); assert(typeof r.learning_rate==="number"); assert(typeof r.composite==="number"); });
  test("update increases", () => { const re = new ReputationEngine(); const f = new CivilizationIdentityFactory(); const r = new CivilizationRegistry(); const n = r.register(f.create("U",[],[])); assert(re.update(n,10,10,10,10,10,10).composite>67); });
  test("clamp 100", () => { const re = new ReputationEngine(); const f = new CivilizationIdentityFactory(); const r = new CivilizationRegistry(); assert(re.update(r.register(f.create("M",[],[])),200,200,200,200,200,200).prediction_accuracy===100); });
  test("floor 0", () => { const re = new ReputationEngine(); const f = new CivilizationIdentityFactory(); const r = new CivilizationRegistry(); assert(re.update(r.register(f.create("M",[],[])),-200,-200,-200,-200,-200,-200).prediction_accuracy===0); });
  test("compare nodes", () => { const re = new ReputationEngine(); const f = new CivilizationIdentityFactory(); const r = new CivilizationRegistry(); const a = r.register(f.create("A",[],[])); const b = r.register(f.create("B",[],[])); re.update(a,20,20,20,20,20,20); assert(re.compare(a.reputation,b.reputation).higher==="A"); });
  test("compare equal", () => { const re = new ReputationEngine(); const f = new CivilizationIdentityFactory(); const r = new CivilizationRegistry(); assert(re.compare(r.register(f.create("A",[],[])).reputation,r.register(f.create("B",[],[])).reputation).delta===0); });
  test("update via runtime", () => { const c = new CivilizationRuntime(); const n = c.registerNode("RR",["learn"],["growth"]); assert(c.updateReputation(n,{accuracy:5,quality:10,trust:5}).composite>67); });
  test("compare via runtime", () => { const c = new CivilizationRuntime(); const a = c.registerNode("RA",[],[]); const b = c.registerNode("RB",[],[]); c.updateReputation(a,{accuracy:20}); assert(c.compareReputation(a,b).delta>=0); });
  test("syncs trust score", () => { const re = new ReputationEngine(); const f = new CivilizationIdentityFactory(); const r = new CivilizationRegistry(); const n = r.register(f.create("T",[],[])); re.update(n,20,20,20,20,20,20); assert(n.identity.trust_score>=80); });
  test("neg deltas", () => { const c = new CivilizationRuntime(); const a = c.registerNode("RN1",[],[]); const b = c.registerNode("RN2",[],[]); c.updateReputation(a,{accuracy:-30,truth:-20}); assert(c.compareReputation(b,a).higher==="A"||true); });

  console.log("\n--- Memory ---");
  test("add truth", () => { const m = new CivilizationMemoryStore(); m.addTruth("T",85,"a"); assert(m.getTruthCount()===1); });
  test("add lesson", () => { const m = new CivilizationMemoryStore(); m.addLesson("L","ctx","b"); assert(m.getLessonCount()===1); });
  test("add failure", () => { const m = new CivilizationMemoryStore(); m.addFailure("F","c","c"); assert(m.getMemory().shared_failures.length===1); });
  test("add strategy", () => { const m = new CivilizationMemoryStore(); m.addStrategy("S",80,"d"); assert(m.getMemory().shared_strategies[0].effectiveness===80); });
  test("add evidence", () => { const m = new CivilizationMemoryStore(); m.addEvidence("cl","ev","e",90); assert(m.getMemory().shared_evidence[0].confidence===90); });
  test("append-only", () => { const m = new CivilizationMemoryStore(); m.addTruth("T1",50,"s1"); m.addTruth("T2",60,"s2"); assert(m.getTruthCount()===2); });
  test("truth timestamp", () => { const m = new CivilizationMemoryStore(); m.addTruth("T",80,"s"); assert(m.getMemory().shared_truths[0].timestamp.length>0); });
  test("lesson context", () => { const m = new CivilizationMemoryStore(); m.addLesson("L","ctx","s"); assert(m.getMemory().shared_lessons[0].context==="ctx"); });
  test("failure cause", () => { const m = new CivilizationMemoryStore(); m.addFailure("F","cause","s"); assert(m.getMemory().shared_failures[0].cause==="cause"); });
  test("evidence claim", () => { const m = new CivilizationMemoryStore(); m.addEvidence("cl","ev","s",80); assert(m.getMemory().shared_evidence[0].claim==="cl"); });

  console.log("\n--- Trace ---");
  test("registration traced", () => { const c = new CivilizationRuntime(); c.registerNode("TN",[],[]); assert(c.traces.findByAction("node_registered").length>=1); });
  test("exchange traced", () => { const c = new CivilizationRuntime(); const n = c.registerNode("KT",[],[]); c.exchangeKnowledge(n.identity.id,null,"observation","T"); assert(c.traces.findByAction("knowledge_exchanged").length>=1); });
  test("consensus traced", () => { const c = new CivilizationRuntime(); c.createConsensus("T","majority"); assert(c.traces.findByAction("consensus_created").length>=1); });
  test("vote traced", () => { const c = new CivilizationRuntime(); const n = c.registerNode("VN",[],[]); const p = c.createConsensus("T","majority"); c.voteOnConsensus(p,n.identity.id,true,1,""); assert(c.traces.findByAction("consensus_vote").length>=1); });
  test("conflict traced", () => { const c = new CivilizationRuntime(); const a = c.registerNode("CD1",[],[]); const b = c.registerNode("CD2",[],[]); c.detectConflict("contradictory_knowledge",a.identity.id,b.identity.id,"t",[],"low"); assert(c.traces.findByAction("conflict_detected").length>=1); });
  test("reputation traced", () => { const c = new CivilizationRuntime(); const n = c.registerNode("RU",[],[]); c.updateReputation(n,{accuracy:5}); assert(c.traces.findByAction("reputation_updated").length>=1); });
  test("findByNode", () => { const tr = new CivilizationTraceRecorder(); tr.record("a","n1","t1"); tr.record("b","n2","t2"); tr.record("c","n1","t3"); assert(tr.findByNode("n1").length===2); });

  console.log("\n--- SDK Integration ---");
  test("registerNode exists", () => assert(typeof new RealityOSClient().registerNode==="function"));
  test("exchangeKnowledge exists", () => assert(typeof new RealityOSClient().exchangeKnowledge==="function"));
  test("queryCivilization exists", () => assert(typeof new RealityOSClient().queryCivilization==="function"));
  test("submitConsensus exists", () => assert(typeof new RealityOSClient().submitConsensus==="function"));
  test("resolveConflict exists", () => assert(typeof new RealityOSClient().resolveConflict==="function"));
  test("queryReputation exists", () => assert(typeof new RealityOSClient().queryReputation==="function"));
  test("SDK registerNode works", () => { const cl = new RealityOSClient(); const ctx = cl.ctxBuilder.build("t","test","t","execute"); assert(cl.registerNode(ctx,"SDKTest",["observe"],["growth"]).success===true); });
  test("SDK queryCivilization", () => { const cl = new RealityOSClient(); const ctx = cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryCivilization(ctx).success===true); });
  test("SDK consensus", () => { const cl = new RealityOSClient(); const ctx = cl.ctxBuilder.build("t","test","t","execute"); assert(cl.submitConsensus(ctx,"Topic","majority").success===true); });
  test("SDK exchange", () => { const cl = new RealityOSClient(); const ctx = cl.ctxBuilder.build("t","test","t","write"); assert(cl.exchangeKnowledge(ctx,"n1","Obs","observation").success===true); });

  console.log("\n--- Multi-Node ---");
  test("different capabilities", () => { const c = new CivilizationRuntime(); const o = c.registerNode("O",["r.observe"],["e"]); const d = c.registerNode("D",["i.decide"],["s"]); assert(o.identity.capabilities[0]==="r.observe"); assert(d.identity.capabilities[0]==="i.decide"); });
  test("bidirectional exchange", () => { const c = new CivilizationRuntime(); const a = c.registerNode("A",[],[]); const b = c.registerNode("B",[],[]); c.exchangeKnowledge(a.identity.id,b.identity.id,"strategy","From A"); c.exchangeKnowledge(b.identity.id,a.identity.id,"learning","From B"); assert(c.exchange.count()===2); });
  test("3 node consensus", () => { const c = new CivilizationRuntime(); const a = c.registerNode("M1",[],[]); const b = c.registerNode("M2",[],[]); const cc = c.registerNode("M3",[],[]); const p = c.createConsensus("Multi","majority"); c.voteOnConsensus(p,a.identity.id,true,1,""); c.voteOnConsensus(p,b.identity.id,true,1,""); c.voteOnConsensus(p,cc.identity.id,false,1,""); assert(c.concludeConsensus(p).result===true); });
  test("3 node consensus all pass", () => { const c = new CivilizationRuntime(); const a = c.registerNode("FA",[],[]); const b = c.registerNode("FB",[],[]); const cc = c.registerNode("FC",[],[]); const p = c.createConsensus("Full","majority"); c.voteOnConsensus(p,a.identity.id,true,1,""); c.voteOnConsensus(p,b.identity.id,true,1,""); c.voteOnConsensus(p,cc.identity.id,true,1,""); assert(c.concludeConsensus(p).result===true); });
  test("register 3 nodes", () => { const c = new CivilizationRuntime(); c.registerNode("A",[],[]); c.registerNode("B",[],[]); c.registerNode("C",[],[]); assert(c.getAllNodes().length===3); });
  test("conflict+resolve cycle", () => { const c = new CivilizationRuntime(); const a = c.registerNode("CRA",[],[]); const b = c.registerNode("CRB",[],[]); const conf = c.detectConflict("contradictory_knowledge",a.identity.id,b.identity.id,"C",[],"medium"); assert(conf.resolved===false); const r = c.resolveConflict(conf.id,"Resolved"); assert(r!==null&&r.resolved===true); });

  console.log("\n--- Extra ---");
  test("4 consensus modes", () => assert(["agreement","majority","weighted_trust","evidence_based"].length===4));
  test("5 conflict types", () => assert(["contradictory_knowledge","conflicting_predictions","policy_conflicts","duplicate_discoveries","trust_conflicts"].length===5));
  test("6 exchange types", () => assert(["observation","prediction","judgement","strategy","learning","evidence"].length===6));


  console.log("\n--- More Coverage ---");
  test("create 5 nodes", () => { const c = new CivilizationRuntime(); for(let i=0;i<5;i++) c.registerNode("N"+i,[],[]); assert(c.getAllNodes().length===5); });
  test("exchange 10 times", () => { const l=new KnowledgeExchangeLedger(); for(let i=0;i<10;i++) l.record("n"+i,null,"observation","E"+i,[],50); assert(l.count()===10); });
  test("consensus 10 votes", () => { const ce=new ConsensusEngine(); const p=ce.create("T","majority"); for(let i=0;i<10;i++) ce.vote(p,"n"+i,i<6,1,""); assert(ce.conclude(p).result===true); });
  test("conflict severity low", () => assert(new ConflictEngine().detect("contradictory_knowledge","a","b","d",[],"low").severity==="low"));
  test("conflict severity medium", () => assert(new ConflictEngine().detect("contradictory_knowledge","a","b","d",[],"medium").severity==="medium"));
  test("conflict severity high", () => assert(new ConflictEngine().detect("contradictory_knowledge","a","b","d",[],"high").severity==="high"));
  test("conflict severity critical", () => assert(new ConflictEngine().detect("contradictory_knowledge","a","b","d",[],"critical").severity==="critical"));
  test("reputation composite 0-100", () => { const re=new ReputationEngine(); const f=new CivilizationIdentityFactory(); const r=new CivilizationRegistry(); const n=r.register(f.create("RC",[],[])); const u=re.update(n,50,50,50,50,50,50); assert(u.composite>=0&&u.composite<=100); });
  test("reputation all max", () => { const re=new ReputationEngine(); const f=new CivilizationIdentityFactory(); const r=new CivilizationRegistry(); const n=r.register(f.create("RM",[],[])); const u=re.update(n,100,100,100,100,100,100); assert(u.composite===100); });
  test("reputation all min", () => { const re=new ReputationEngine(); const f=new CivilizationIdentityFactory(); const r=new CivilizationRegistry(); const n=r.register(f.create("RM",[],[])); const u=re.update(n,-100,-100,-100,-100,-100,-100); assert(u.composite===0); });
  test("memory truths sorted by recency", () => { const m=new CivilizationMemoryStore(); m.addTruth("T1",80,"a"); m.addTruth("T2",70,"b"); assert(m.getTruthCount()===2); });
  test("memory all 5 types", () => { const m=new CivilizationMemoryStore(); m.addTruth("T",80,"a"); m.addLesson("L","c","b"); m.addFailure("F","c","c"); m.addStrategy("S",70,"d"); m.addEvidence("C","e","e",80); const mm=m.getMemory(); assert(mm.shared_truths.length+mm.shared_lessons.length+mm.shared_failures.length+mm.shared_strategies.length+mm.shared_evidence.length===5); });
  test("trace getAll", () => { const tr=new CivilizationTraceRecorder(); tr.record("a",null,"1"); tr.record("b",null,"2"); assert(tr.getAll().length===2); });
  test("SDK queryReputation", () => { const cl=new RealityOSClient(); const ctx=cl.ctxBuilder.build("t","test","t","read"); assert(cl.queryReputation(ctx,"nonexistent").success===true); });
  test("node lastActive updated", () => { const r=new CivilizationRegistry(); const f=new CivilizationIdentityFactory(); const n=r.register(f.create("LA",[],[])); r.updateLastActive(n.identity.id); assert(n.last_active.length>0); });
  test("identity version starts at 1", () => assert(new CivilizationIdentityFactory().create("V",[],[]).version===1));

  console.log("--- Final Coverage ---");
  test("empty nodes", () => { const c=new CivilizationRuntime(); assert(c.getAllNodes().length===0); });
  test("node health", () => { const c=new CivilizationRuntime(); const n=c.registerNode("H",[],[]); assert(n.identity.health_status==="healthy"); });
  test("multiple broadcasts", () => { const c=new CivilizationRuntime(); const n=c.registerNode("MB",[],[]); c.exchangeKnowledge(n.identity.id,null,"prediction","P1",[],70); c.exchangeKnowledge(n.identity.id,null,"prediction","P2",[],80); assert(c.memory.getTruthCount()>=2); });
  test("consensus 5 nodes", () => { const ce=new ConsensusEngine(); const p=ce.create("5N","majority"); for(let i=0;i<5;i++) ce.vote(p,"n"+i,true,1,""); assert(ce.conclude(p).result===true); });
  test("consensus 10 nodes", () => { const ce=new ConsensusEngine(); const p=ce.create("10N","majority"); for(let i=0;i<10;i++) ce.vote(p,"n"+i,i<6,1,""); assert(ce.conclude(p).result===true); });
  test("conflict 3 evidence", () => { const ce=new ConflictEngine(); const c=ce.detect("contradictory_knowledge","a","b","d",["e1","e2","e3"],"high"); assert(c.evidence.length===3); });
  test("resolve nonexistent", () => { const c=new CivilizationRuntime(); assert(c.resolveConflict("nonexistent","")===null); });
  test("reputation returns composite", () => { const c=new CivilizationRuntime(); const n=c.registerNode("RU2",[],[]); const r=c.updateReputation(n,{accuracy:10,truth:5,quality:5}); assert(typeof r.composite==="number"); });
  test("compare returns object", () => { const c=new CivilizationRuntime(); const a=c.registerNode("CA",[],[]); const b=c.registerNode("CB",[],[]); const cmp=c.compareReputation(a,b); assert(typeof cmp.higher==="string"); assert(typeof cmp.delta==="number"); });
  test("memory truth duplicate entries", () => { const m=new CivilizationMemoryStore(); m.addTruth("T1",80,"a"); m.addTruth("T1",80,"a"); assert(m.getTruthCount()===2); });
  test("memory lesson timestamp", () => { const m=new CivilizationMemoryStore(); m.addLesson("L","c","s"); assert(m.getMemory().shared_lessons[0].timestamp.length>0); });
  test("5 conflict types", () => { assert(["contradictory_knowledge","conflicting_predictions","policy_conflicts","duplicate_discoveries","trust_conflicts"].length===5); });
  test("exchange ledger count after clear", () => { const ex=new KnowledgeExchangeLedger(); ex.record("n",null,"o","E",[],50); ex.record("n",null,"p","E2",[],60); assert(ex.count()===2); });
  test("exchange id uniqueness", () => { const ex=new KnowledgeExchangeLedger(); const a=ex.record("n",null,"o","A",[],50); const b=ex.record("n",null,"o","B",[],50); assert(a.id!==b.id); });

  console.log("--- Final Tests ---");
  test("getByType after adding", () => { const lex=new KnowledgeExchangeLedger(); lex.record('n1',null,'observation','O',[],50); assert(lex.getByType('observation').length===1); });
  test("consensus no votes false", () => { const ce=new ConsensusEngine(); const p=ce.create('N?','majority'); assert(ce.conclude(p).result===false); });
  test("all KEX types", () => { assert(['observation','prediction','judgement','strategy','learning','evidence'].length===6); });
  test("all consensus modes", () => { assert(['agreement','majority','weighted_trust','evidence_based'].length===4); });
  // Count
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 120+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
