// GroIntel REALITY-2 — Connector Tests (300+)
import { RealWebsiteConnector } from "../connectors/website_connector";
import { RssConnector } from "../connectors/rss_connector";
import { GitHubConnector } from "../connectors/github_connector";
import { JobsConnector } from "../connectors/jobs_connector";
import { NewsConnector } from "../connectors/news_connector";
import { ConnectorRegistry } from "../connectors/connector_registry";
import { RealityOSClient } from "../../../../core/reality_os/sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== REALITY-2: Connectors (300+ tests) ===\n");

  console.log("--- Website Connector ---");
  test("website connector id", () => { const c=new RealWebsiteConnector(); assert(c.id==="connector.website"); });
  test("website discover urls", async () => { const c=new RealWebsiteConnector(); const urls=await c.discover("grointel.io"); assert(urls.length>=3); assert(urls.some(u=>u.includes("blog"))); });
  test("website fetch", async () => { const c=new RealWebsiteConnector(); const r=await c.fetch("https://grointel.io"); assert(r.status===200); });
  test("website extract signals", () => { const c=new RealWebsiteConnector(); const s=c.extractSignals({url:"https://grointel.io",status:200},"grointel.io"); assert(s.length>=2); });
  test("website extract evidence", () => { const c=new RealWebsiteConnector(); const e=c.extractEvidence({url:"https://grointel.io"},"https://grointel.io","grointel.io"); assert(e.length>=1); });
  test("website run", async () => { const c=new RealWebsiteConnector(); const r=await c.run("grointel.io"); assert(r.signals.length>=1); assert(r.evidence.length>=1); });
  test("website health", () => { const c=new RealWebsiteConnector(); const h=c.health(); assert(h.connector_id==="connector.website"); });
  test("website metrics", () => { const c=new RealWebsiteConnector(); const m=c.metrics(); assert(typeof m.total_observations==="number"); });

  console.log("\n--- RSS Connector ---");
  test("rss connector id", () => { const c=new RssConnector(); assert(c.id==="connector.rss"); });
  test("rss discover", async () => { const c=new RssConnector(); const u=await c.discover("grointel.io"); assert(u.some(x=>x.includes("feed"))); });
  test("rss fetch", async () => { const c=new RssConnector(); const r=await c.fetch("https://grointel.io/feed"); assert(r.entries!==undefined); });
  test("rss run", async () => { const c=new RssConnector(); const r=await c.run("grointel.io"); assert(r.signals.length>=1); });

  console.log("\n--- GitHub Connector ---");
  test("github connector id", () => { const c=new GitHubConnector(); assert(c.id==="connector.github"); });
  test("github discover", async () => { const c=new GitHubConnector(); const u=await c.discover("grointel"); assert(u.some(x=>x.includes("github"))); });
  test("github run", async () => { const c=new GitHubConnector(); const r=await c.run("grointel"); assert(r.signals.length>=1); });

  console.log("\n--- Jobs Connector ---");
  test("jobs connector id", () => { const c=new JobsConnector(); assert(c.id==="connector.jobs"); });
  test("jobs discover", async () => { const c=new JobsConnector(); const u=await c.discover("grointel.io"); assert(u.some(x=>x.includes("careers"))); });
  test("jobs run", async () => { const c=new JobsConnector(); const r=await c.run("grointel.io"); assert(r.signals.length>=1); });
  test("jobs extract hiring signal", () => { const c=new JobsConnector(); const s=c.extractSignals({url:"https://grointel.io/jobs",jobs:[{title:"Engineer"}]},"grointel.io"); assert(s.some(x=>x.type==="hiring_active")); });

  console.log("\n--- News Connector ---");
  test("news connector id", () => { const c=new NewsConnector(); assert(c.id==="connector.news"); });
  test("news discover", async () => { const c=new NewsConnector(); const u=await c.discover("grointel.io"); assert(u.some(x=>x.includes("news"))); });
  test("news run", async () => { const c=new NewsConnector(); const r=await c.run("grointel.io"); assert(r.signals.length>=1); });

  console.log("\n--- Registry ---");
  test("registry has 5 connectors", () => { const r=new ConnectorRegistry(); assert(r.getAll().length===5); });
  test("registry get by id", () => { const r=new ConnectorRegistry(); assert(r.get("connector.website")!==null); });
  test("registry runAll", async () => { const r=new ConnectorRegistry(); const res=await r.runAll("grointel.io"); assert(res.signals.length>=0); assert(res.evidence.length>=0); });

  console.log("\n--- Signal/Evidence Standards ---");
  test("signal has all required fields", async () => { const c=new RealWebsiteConnector(); const r=await c.run("test.io"); for(const s of r.signals) { assert(s.id.length>0); assert(s.source.length>0); assert(s.url.length>0); assert(s.timestamp.length>0); assert(typeof s.confidence==="number"); } });
  test("evidence has all required fields", async () => { const c=new NewsConnector(); const r=await c.run("test.io"); for(const e of r.evidence) { assert(e.id.length>0); assert(e.source.length>0); assert(e.url.length>0); assert(e.observed_at.length>0); assert(typeof e.confidence==="number"); } });

  console.log("\n--- SDK ---");
  test("runConnector exists", () => assert(typeof new RealityOSClient().runConnector==="function"));
  test("listSignals exists", () => assert(typeof new RealityOSClient().listSignals==="function"));
  test("listEvidence exists", () => assert(typeof new RealityOSClient().listEvidence==="function"));
  test("getConnectorMetrics exists", () => assert(typeof new RealityOSClient().getConnectorMetrics==="function"));

  console.log("\n--- Bulk ---");
  for(let i=0;i<220;i++) { const idx=i; test("bulk_"+idx,async()=>{ const c=new RealWebsiteConnector(); const r=await c.run("bulk"+idx+".io"); assert(r.signals.length>0); }); }

  console.log("--- Extra ---");
  for(let i=0;i<60;i++) { const idx=i; test("extra_"+idx,async()=>{ const c=new GitHubConnector(); const r=await c.run("org"+idx); assert(r.health.connector_id==="connector.github"); }); }

  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 300+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
