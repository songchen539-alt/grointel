const baseUrl = process.env.GROINTEL_BASE_URL || "https://grointel.vercel.app";
const includeHeartbeat = process.argv.includes("--heartbeat");

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${String(text).slice(0, 300)}`);
  }
  return body;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`GroIntel smoke target: ${baseUrl}`);

  const identityPage = await fetch(`${baseUrl}/identity`);
  assert(identityPage.ok, "/identity should render");
  console.log("ok /identity");

  const web3Page = await fetch(`${baseUrl}/web3-growth`);
  assert(web3Page.ok, "/web3-growth should render");
  console.log("ok /web3-growth");

  const company = await request("/api/grointel/identity-intake", {
    method: "POST",
    body: JSON.stringify({ identity: "arbitrum.io" }),
  });
  assert(company.success, "company identity intake should succeed");
  assert(company.side === "company", "arbitrum.io should classify as company");
  assert(company.web3Decision, "arbitrum.io should attach a Web3 decision");
  console.log(`ok identity company: ${company.profile.identity.name} / ${company.profile.identity.industry}`);

  const kol = await request("/api/grointel/identity-intake", {
    method: "POST",
    body: JSON.stringify({ identity: "x.com/cobie" }),
  });
  assert(kol.success, "KOL identity intake should succeed");
  assert(kol.side === "kol", "x.com/cobie should classify as KOL");
  assert((kol.recommendedCompanyProfiles || []).length > 0, "KOL should receive recommended company profiles");
  assert(kol.recommendedCompanyProfiles[0].fitScore > 0, "KOL company match should include fit score");
  assert(kol.recommendedCompanyProfiles[0].fitReason, "KOL company match should explain fit");
  assert(kol.recommendedCompanyProfiles[0].suggestedCollaboration, "KOL company match should include collaboration format");
  assert(kol.recommendedCompanyProfiles[0].keyMetric, "KOL company match should include key metric");
  console.log(`ok identity KOL: ${kol.profile.identity.name} / ${kol.profile.identity.type} / ${kol.recommendedCompanyProfiles[0].company}`);

  const decision = await request("/api/grointel/web3-decision", {
    method: "POST",
    body: JSON.stringify({
      projectName: "Smoke L2",
      sector: "Ethereum L2",
      growthGoal: "Acquire real users through quest and KOL partnerships",
      targetAudience: "crypto-native builders",
      riskTolerance: "low",
    }),
  });
  assert(decision.success, "web3 decision should succeed");
  assert((decision.decision?.matchedEvents || []).length > 0, "web3 decision should match events");
  assert((decision.decision?.measurementPlan || []).length > 0, "web3 decision should include measurement plan");
  assert((decision.decision?.recommendedConcretePartners || []).length > 0, "web3 decision should recommend concrete KOL/supply partners");
  assert(decision.decision.recommendedConcretePartners.length >= 8, "web3 decision should use expanded KOL/supply pool");
  assert(decision.decision.recommendedConcretePartners.some((partner) => partner.source || (partner.tags || []).length > 0), "web3 decision should include discovery-sourced KOL/supply partners");
  assert(new Set(decision.decision.recommendedConcretePartners.map((partner) => partner.supplyType)).size >= 3, "web3 decision should diversify supply partner types");
  console.log(`ok web3 decision: ${decision.memory.eventCount} events / ${decision.decision.confidence}% confidence / ${decision.decision.recommendedConcretePartners[0].name}`);

  const memoryStatus = await request("/api/grointel/world-memory-status");
  assert(memoryStatus.success !== false, "world memory status should respond");
  assert(memoryStatus.ready || memoryStatus.legacyReady, "primary or legacy world memory should be available");
  console.log(`ok memory status: ready=${Boolean(memoryStatus.ready)} legacyReady=${Boolean(memoryStatus.legacyReady)}`);

  const aiHealth = await request("/api/grointel/ai-health");
  assert(aiHealth.success, "AI health should respond");
  assert(aiHealth.active?.chat, "AI health should expose active chat provider");
  assert(["real_ai_active", "fallback_ready", "mock_only"].includes(aiHealth.mode), "AI health should expose usable mode");
  console.log(`ok ai health: ${aiHealth.mode} / chat=${aiHealth.active.chat}`);

  const discovery = await request("/api/grointel/web3-discovery?limit=5");
  assert(discovery.success, "Web3 discovery should respond");
  assert(discovery.stats?.web3DemandCount >= 40, "Web3 discovery should include an expanded company demand pool");
  assert(discovery.stats?.web3SupplyCount >= 30, "Web3 discovery should include an expanded KOL/supply pool");
  console.log(`ok web3 discovery: demand=${discovery.stats.web3DemandCount} supply=${discovery.stats.web3SupplyCount}`);

  if (includeHeartbeat) {
    const heartbeat = await request("/api/grointel/heartbeat?limit=2");
    assert(heartbeat.success, "heartbeat should succeed");
    assert(heartbeat.status === "alive", "heartbeat status should be alive");
    assert(heartbeat.memorySaved, "heartbeat should save memory");
    assert(heartbeat.life?.status === "alive", "heartbeat should expose life status");
    assert(heartbeat.life?.cronSchedule, "heartbeat should expose cron schedule");
    assert(heartbeat.life?.manualTickAvailable, "heartbeat should expose manual tick availability");
    assert(heartbeat.world?.discovery?.web3DemandCount >= 40, "heartbeat should carry expanded Web3 company pool");
    assert(heartbeat.world?.discovery?.web3SupplyCount >= 30, "heartbeat should carry expanded Web3 supply pool");
    const observedKinds = new Set((heartbeat.heartbeat?.targets_observed || []).map((target) => target.kind));
    assert(observedKinds.has("company"), "heartbeat should observe Web3 demand/company side");
    assert(observedKinds.has("kol") || observedKinds.has("partner"), "heartbeat should observe Web3 KOL/supply side");
    console.log(`ok heartbeat: ${heartbeat.status} / ${heartbeat.observedAt}`);
  }

  console.log("GroIntel smoke passed.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
