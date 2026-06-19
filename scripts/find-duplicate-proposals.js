// GroIntel Duplicate Proposal Finder
// Outputs duplicate proposals by title (case-insensitive)
// Does NOT delete anything

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";

async function main() {
  const res = await fetch(BASE + "/api/proposals");
  const data = await res.json();
  const proposals = data.proposals || [];

  // Group by title (lowercase)
  const groups = {};
  for (const p of proposals) {
    const key = (p.title || "").toLowerCase().trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  console.log("=== Duplicate Proposal Check ===\n");
  let dupCount = 0;
  for (const [title, items] of Object.entries(groups)) {
    if (items.length > 1) {
      dupCount++;
      console.log(`DUPLICATE (${items.length}x): "${items[0].title}"`);
      for (const item of items) {
        console.log(`  ID: ${item.id}`);
        console.log(`  Business: ${item.business?.display_name || "?"}`);
        console.log(`  Status: ${item.status}`);
        console.log(`  Created: ${item.created_at ? new Date(item.created_at).toISOString().slice(0,10) : "?"}`);
        console.log();
      }
      console.log("---\n");
    }
  }

  if (dupCount === 0) {
    console.log("No duplicate proposals found.");
  } else {
    console.log(`Found ${dupCount} duplicate title groups.`);
    console.log("TIP: Archive duplicates via PATCH /api/proposals/[id] with status: archived");
  }

  console.log(`\nTotal proposals scanned: ${proposals.length}`);
}

main().catch(console.error);
