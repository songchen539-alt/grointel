// GroIntel Capability Intelligence Verification Script
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";
const profiles = [
  "https://youtube.com/@channel",
  "https://linkedin.com/company/agency",
  "https://github.com/dev",
  "https://substack.com/@writer",
  "https://unknown-portfolio.example.com"
];

async function main() {
  console.log("=== Capability Intelligence Verification ===\n");
  let passed = 0, failed = 0;

  for (const url of profiles) {
    const r1 = await fetch(BASE + "/api/capability-intelligence/intake", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ profileUrl: url }),
    });
    const d1 = await r1.json();
    const ok = d1.success ? "OK" : "FAIL";
    if (ok === "OK") passed++; else failed++;
    console.log(`  ${url.split("/")[2] || url}: ${ok}`);

    if (d1.success) {
      const hasScan = !!d1.scanProfile?.id;
      const hasKnowledge = !!d1.knowledgeProfile?.id;
      const name = d1.knowledgeProfile?.capability_identity?.name || "?";
      const type = d1.knowledgeProfile?.capability_identity?.type || "?";
      const conf = d1.knowledgeProfile?.knowledge_confidence?.overall || "?";
      console.log(`    Scan: ${hasScan}  Knowledge: ${hasKnowledge}`);
      console.log(`    Name: ${name} | Type: ${type} | Confidence: ${conf}%`);

      // GET detail
      if (d1.knowledgeProfile?.id) {
        const r2 = await fetch(BASE + "/api/capability-intelligence/" + d1.knowledgeProfile.id);
        const d2 = await r2.json();
        const linked = !!d2.scanProfile?.id;
        const hasCaps = d2.scanProfile?.detected_capabilities?.length > 0;
        const hasDNA = d2.profile?.capability_dna && Object.keys(d2.profile.capability_dna).length > 0;
        const hasStrengths = d2.profile?.strengths?.length > 0;
        console.log(`    Detail: linked=${linked} capabilities=${hasCaps} dna=${hasDNA} strengths=${hasStrengths}`);
      }
    }
    console.log();
  }

  const r3 = await fetch(BASE + "/api/capability-intelligence");
  const d3 = await r3.json();
  const count = d3.profiles?.length || 0;
  console.log(`  List: ${count} knowledge profiles`);

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===`);
}

main().catch(console.error);
