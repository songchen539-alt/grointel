// GroIntel Business Intelligence Verification Script (Revised)
// Tests: POST intake -> creates scan + knowledge, GET detail with linked scan

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";
const sites = ["stripe.com", "openai.com", "clay.com", "unknown-startup.io"];

async function main() {
  console.log("=== Business Intelligence Verification (Revised) ===\n");

  for (const site of sites) {
    // POST intake
    const r1 = await fetch(BASE + "/api/business-intelligence/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website: site }),
    });
    const d1 = await r1.json();
    const ok = d1.success ? "OK" : "FAIL";
    console.log(`  ${site}: ${ok}`);

    if (d1.success) {
      const hasScan = d1.scanProfile?.id ? true : false;
      const hasKnowledge = d1.knowledgeProfile?.id ? true : false;
      const name = d1.knowledgeProfile?.business_identity?.name || "?";
      const industry = d1.knowledgeProfile?.business_identity?.industry || "?";
      const conf = d1.knowledgeProfile?.knowledge_confidence?.overall || "?";
      const redirectUrl = d1.redirectUrl || "?";
      console.log(`    Scan: ${hasScan ? "YES" : "NO"}  Knowledge: ${hasKnowledge ? "YES" : "NO"}`);
      console.log(`    Company: ${name} | Industry: ${industry} | Confidence: ${conf}%`);
      console.log(`    Redirect: ${redirectUrl}`);

      // GET detail with linked scan
      if (d1.knowledgeProfile?.id) {
        const r2 = await fetch(BASE + "/api/business-intelligence/" + d1.knowledgeProfile.id);
        const d2 = await r2.json();
        const profileOk = d2.success && d2.profile ? true : false;
        const scanLinked = d2.scanProfile?.id ? true : false;
        const hasProducts = d2.scanProfile?.detected_products && d2.scanProfile.detected_products.length > 0;
        const hasMarkets = d2.scanProfile?.detected_markets && d2.scanProfile.detected_markets.length > 0;
        const hasGoals = d2.profile?.goals && d2.profile.goals.length > 0;
        const hasBM = d2.profile?.business_model && Object.keys(d2.profile.business_model).length > 0;
        const hasConf = d2.profile?.knowledge_confidence && Object.keys(d2.profile.knowledge_confidence).length > 0;
        console.log(`    GET detail: profile=${profileOk} scanLinked=${scanLinked}`);
        console.log(`    Scan data: products=${hasProducts} markets=${hasMarkets}`);
        console.log(`    Knowledge data: goals=${hasGoals} bizModel=${hasBM} confidence=${hasConf}`);
      }
    }
    console.log();
  }

  // GET list
  const r3 = await fetch(BASE + "/api/business-intelligence");
  const d3 = await r3.json();
  const count = d3.profiles?.length || 0;
  console.log(`  List: ${count} knowledge profiles`);

  console.log("\n=== Verification Complete ===");
}

main().catch(console.error);
