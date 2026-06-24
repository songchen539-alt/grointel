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
  console.log(`ok identity KOL: ${kol.profile.identity.name} / ${kol.profile.identity.type}`);

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
  console.log(`ok web3 decision: ${decision.memory.eventCount} events / ${decision.decision.confidence}% confidence`);

  const memoryStatus = await request("/api/grointel/world-memory-status");
  assert(memoryStatus.success !== false, "world memory status should respond");
  console.log(`ok memory status: ready=${Boolean(memoryStatus.ready)}`);

  if (includeHeartbeat) {
    const heartbeat = await request("/api/grointel/heartbeat?limit=2");
    assert(heartbeat.success, "heartbeat should succeed");
    assert(heartbeat.status === "alive", "heartbeat status should be alive");
    assert(heartbeat.memorySaved, "heartbeat should save memory");
    console.log(`ok heartbeat: ${heartbeat.status} / ${heartbeat.observedAt}`);
  }

  console.log("GroIntel smoke passed.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
