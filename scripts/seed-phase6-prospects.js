// GroIntel Phase 6 - Seed Prospects Batch Script
// Run: node scripts/seed-phase6-prospects.js
// Creates 30 prospects, generates MRI reports, and outbound messages.

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";

const PROSPECTS = [
  { companyName: "Perplexity", website: "https://perplexity.ai", category: "AI Search", priority: "A" },
  { companyName: "Clay", website: "https://clay.com", category: "GTM AI", priority: "A" },
  { companyName: "Cursor", website: "https://cursor.com", category: "AI Developer Tools", priority: "A" },
  { companyName: "Ramp", website: "https://ramp.com", category: "Fintech SaaS", priority: "A" },
  { companyName: "Vercel", website: "https://vercel.com", category: "Developer Platform", priority: "A" },
  { companyName: "Notion", website: "https://notion.so", category: "SaaS Productivity", priority: "A" },
  { companyName: "Rippling", website: "https://rippling.com", category: "HR SaaS", priority: "A" },
  { companyName: "ElevenLabs", website: "https://elevenlabs.io", category: "AI Audio", priority: "A" },
  { companyName: "Runway", website: "https://runwayml.com", category: "AI Video", priority: "A" },
  { companyName: "Mercor", website: "https://mercor.com", category: "AI Recruiting", priority: "A" },
  { companyName: "Anthropic", website: "https://anthropic.com", category: "Frontier AI", priority: "B" },
  { companyName: "Mistral AI", website: "https://mistral.ai", category: "Frontier AI", priority: "B" },
  { companyName: "Glean", website: "https://glean.com", category: "Enterprise AI Search", priority: "B" },
  { companyName: "Harvey", website: "https://harvey.ai", category: "Legal AI", priority: "B" },
  { companyName: "Sierra", website: "https://sierra.ai", category: "AI Customer Service", priority: "B" },
  { companyName: "Lindy", website: "https://lindy.ai", category: "AI Agents", priority: "B" },
  { companyName: "Replit", website: "https://replit.com", category: "AI Developer Platform", priority: "B" },
  { companyName: "Fireworks AI", website: "https://fireworks.ai", category: "AI Infrastructure", priority: "B" },
  { companyName: "Together AI", website: "https://together.ai", category: "AI Infrastructure", priority: "B" },
  { companyName: "Groq", website: "https://groq.com", category: "AI Infrastructure", priority: "B" },
  { companyName: "Monad", website: "https://monad.xyz", category: "Web3 Infrastructure", priority: "B" },
  { companyName: "EigenLayer", website: "https://eigenlayer.xyz", category: "Web3 Infrastructure", priority: "B" },
  { companyName: "Berachain", website: "https://berachain.com", category: "Web3 Infrastructure", priority: "B" },
  { companyName: "Alchemy", website: "https://alchemy.com", category: "Web3 Developer Infrastructure", priority: "B" },
  { companyName: "QuickNode", website: "https://quicknode.com", category: "Web3 Developer Infrastructure", priority: "B" },
  { companyName: "Privy", website: "https://privy.io", category: "Web3 Wallet Infrastructure", priority: "B" },
  { companyName: "Dynamic", website: "https://dynamic.xyz", category: "Web3 Wallet Infrastructure", priority: "B" },
  { companyName: "Turnkey", website: "https://turnkey.com", category: "Web3 Wallet Infrastructure", priority: "B" },
  { companyName: "Fireblocks", website: "https://fireblocks.com", category: "Digital Asset Infrastructure", priority: "C" },
  { companyName: "Circle", website: "https://circle.com", category: "Stablecoin Infrastructure", priority: "C" },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(path, options = {}) {
  const url = BASE + path;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log("=== Phase 6 Prospect Seeder ===\n");
  console.log(`Target: ${BASE}\n`);

  // Step 1: Check existing prospects
  console.log("=== Step 1: Checking existing prospects ===");
  const existing = await api("/api/admin/prospects");
  const knownDomains = new Set();
  let skipped = 0;

  if (existing.ok && existing.data.success) {
    for (const p of existing.data.prospects || []) {
      if (p.domain) knownDomains.add(p.domain.toLowerCase());
      if (p.website) {
        const d = p.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase();
        knownDomains.add(d);
      }
    }
    console.log(`  Existing prospects: ${existing.data.prospects?.length || 0}`);
  } else {
    console.log("  Could not check existing, will attempt create all.");
  }

  // Step 2: Create prospects
  console.log("\n=== Step 2: Creating prospects ===");
  const created = [];

  for (const p of PROSPECTS) {
    const domain = p.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase();
    if (knownDomains.has(domain)) {
      console.log(`  SKIP: ${p.companyName} (${domain}) - already exists`);
      skipped++;
      continue;
    }
    const result = await api("/api/admin/prospects", {
      method: "POST",
      body: { ...p, notes: "Phase 6 initial outbound campaign", source: "outbound" },
    });
    if (result.ok && result.data.success) {
      created.push(result.data.prospect);
      console.log(`  CREATED: ${p.companyName} (priority ${p.priority}) -> ${result.data.prospect.id.slice(0, 8)}...`);
    } else {
      console.log(`  FAIL: ${p.companyName} - ${result.data.error || result.status}`);
    }
    await sleep(400 + Math.random() * 200);
  }

  console.log(`\n  Created: ${created.length}, Skipped: ${skipped}, Total: ${created.length + skipped}`);

  // Step 3: Batch Generate MRI
  console.log("\n=== Step 3: Generating MRI reports ===");
  const allProspects = [...created];
  
  // Also get any existing prospects that don't have reports
  if (existing.ok && existing.data.success) {
    for (const p of existing.data.prospects || []) {
      if (!p.report_id && !allProspects.find((cp) => cp.id === p.id)) {
        allProspects.push(p);
      }
    }
  }

  const reportsGenerated = [];
  for (const p of allProspects) {
    const result = await api(`/api/admin/prospects/${p.id}/generate-report`, { method: "POST" });
    if (result.ok && result.data.success) {
      reportsGenerated.push({ ...p, reportId: result.data.reportId });
      console.log(`  REPORT: ${p.companyName} -> ${result.data.reportId}`);
    } else {
      console.log(`  FAIL: ${p.companyName} - ${result.data.error || result.status}`);
    }
    await sleep(1500 + Math.random() * 500);
  }

  console.log(`\n  Reports generated: ${reportsGenerated.length}/${allProspects.length}`);

  // Step 4: Batch Generate Messages
  console.log("\n=== Step 4: Generating outbound messages ===");
  const messagesGenerated = [];
  for (const p of reportsGenerated) {
    const result = await api(`/api/admin/prospects/${p.id}/generate-message`, { method: "POST" });
    if (result.ok && result.data.success) {
      messagesGenerated.push(p);
      console.log(`  MESSAGE: ${p.companyName} -> ${result.data.fullMessage?.slice(0, 60)}...`);
    } else {
      console.log(`  FAIL: ${p.companyName} - ${result.data.error || result.status}`);
    }
    await sleep(800 + Math.random() * 300);
  }

  console.log(`\n  Messages generated: ${messagesGenerated.length}/${reportsGenerated.length}`);

  // Step 5: Summary
  console.log("\n=== Summary ===");
  console.log(`Total prospects targeted: ${PROSPECTS.length}`);
  console.log(`Created: ${created.length}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`Reports generated: ${reportsGenerated.length}`);
  console.log(`Messages generated: ${messagesGenerated.length}`);

  const aCount = created.filter((p) => p.priority === "A").length;
  const bCount = created.filter((p) => p.priority === "B").length;
  const cCount = created.filter((p) => p.priority === "C").length;
  console.log(`A priority: ${aCount}, B: ${bCount}, C: ${cCount}`);

  // Return data for report generation
  return { created, reportsGenerated, messagesGenerated };
}

run().catch(console.error);
