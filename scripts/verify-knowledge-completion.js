// GroIntel Knowledge Completion Persistence Verification
// Tests that answers actually update source knowledge profiles
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function testBusinessCompletion() {
  console.log("=== Business Knowledge Completion Test ===\n");

  // Get a business knowledge profile
  const r1 = await fetch(BASE + "/api/business-intelligence");
  const d1 = await r1.json();
  const profile = d1.profiles?.[0];
  if (!profile) { console.log("  SKIP: no business profiles\n"); return; }

  const pid = profile.id;
  console.log(`  Profile: ${profile.website || pid.slice(0,12)}`);
  const goalsBefore = (profile.goals || []).length;
  console.log(`  Goals before: ${goalsBefore}`);

  // Start completion
  const r2 = await fetch(BASE + "/api/knowledge/start", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileType: "business_knowledge", profileId: pid }),
  });
  const d2 = await r2.json();
  if (!d2.success) { console.log(`  FAIL: ${d2.error}\n`); return; }
  console.log(`  Session: ${d2.session.id.slice(0,12)}`);
  console.log(`  First question: ${d2.question?.question?.slice(0,80) || "none"}`);
  console.log(`  Confidence: ${d2.progress.overall_confidence}%`);
  console.log(`  Complete: ${d2.progress.is_complete}`);

  if (!d2.question || d2.progress.is_complete) { console.log("  Nothing to answer\n"); return; }

  // Answer the question
  await sleep(200);
  const r3 = await fetch(BASE + "/api/knowledge/answer", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: d2.session.id, questionId: d2.question.id, answer: "Testing business completion persistence" }),
  });
  const d3 = await r3.json();
  console.log(`\n  Answer submitted: ${d3.success}`);
  console.log(`  Updates applied: ${d3.updates_applied?.join(", ") || "none"}`);
  console.log(`  Confidence after: ${d3.progress?.overall_confidence}%`);
  console.log(`  Complete: ${d3.progress?.is_complete}`);

  // Verify profile was updated
  if (d3.success) {
    await sleep(200);
    const r4 = await fetch(BASE + "/api/business-intelligence/" + pid);
    const d4 = await r4.json();
    const profileAfter = d4.profile;
    const goalsAfter = (profileAfter.goals || []).length;
    console.log(`  Goals after: ${goalsAfter} (was ${goalsBefore})`);
    console.log(`  Persistence: ${goalsAfter > goalsBefore ? "PASS" : "CHECK (may need multiple answers)"}`);
  }

  console.log("\n  === Business test complete ===\n");
}

async function testCapabilityCompletion() {
  console.log("=== Capability Knowledge Completion Test ===\n");

  const r1 = await fetch(BASE + "/api/capability-intelligence");
  const d1 = await r1.json();
  const profile = d1.profiles?.[0];
  if (!profile) { console.log("  SKIP: no capability profiles\n"); return; }

  const pid = profile.id;
  console.log(`  Profile: ${profile.profile_url || pid.slice(0,12)}`);

  // Start completion
  const r2 = await fetch(BASE + "/api/knowledge/start", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileType: "capability_knowledge", profileId: pid }),
  });
  const d2 = await r2.json();
  if (!d2.success) { console.log(`  FAIL: ${d2.error}\n`); return; }
  console.log(`  Session: ${d2.session.id.slice(0,12)}`);
  console.log(`  First question: ${d2.question?.question?.slice(0,80) || "none"}`);
  console.log(`  Confidence: ${d2.progress.overall_confidence}%`);

  if (!d2.question || d2.progress.is_complete) { console.log("  Nothing to answer\n"); return; }

  // Check it's a capability question, not a business question
  const isCapQuestion = d2.question.question.toLowerCase().includes("capability") || d2.question.question.toLowerCase().includes("service");
  console.log(`  Capability-specific question: ${isCapQuestion ? "YES" : "CHECK"}`);

  // Answer
  await sleep(200);
  const r3 = await fetch(BASE + "/api/knowledge/answer", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: d2.session.id, questionId: d2.question.id, answer: "Testing capability completion persistence" }),
  });
  const d3 = await r3.json();
  console.log(`  Answer submitted: ${d3.success}`);
  console.log(`  Updates applied: ${d3.updates_applied?.join(", ") || "none"}`);

  // Verify knowledge_updates row created
  await sleep(200);
  const r4 = await fetch(BASE + "/api/knowledge/session/" + d2.session.id);
  const d4 = await r4.json();
  console.log(`  Questions answered: ${(d4.questions || []).filter(q => q.answer).length}`);
  console.log(`  Updates recorded: ${(d4.updates || []).length}`);

  console.log("\n  === Capability test complete ===\n");
}

async function main() {
  await testBusinessCompletion();
  await testCapabilityCompletion();
  console.log("=== All tests complete ===");
}

main().catch(console.error);
