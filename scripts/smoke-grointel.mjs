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
  assert(company.web3CollaborationBrief, "arbitrum.io should attach a Web3 collaboration brief");
  assert((company.web3CollaborationBrief?.partnerBriefs || []).length >= 3, "company identity should include KOL collaboration briefs");
  assert(company.web3AIGrowthInsight, "company identity should attach an AI growth insight");
  console.log(`ok identity company: ${company.profile.identity.name} / ${company.profile.identity.industry}`);

  const kol = await request("/api/grointel/identity-intake", {
    method: "POST",
    body: JSON.stringify({ identity: "x.com/cobie" }),
  });
  assert(kol.success, "KOL identity intake should succeed");
  assert(kol.side === "kol", "x.com/cobie should classify as KOL");
  assert((kol.recommendedCompanyProfiles || []).length > 0, "KOL should receive recommended company profiles");
  assert(kol.liveMatching?.attempted === true, "KOL identity should attempt live demand matching");
  assert(kol.liveMatching?.demandCandidateCount > 0, "KOL identity should use live demand candidates");
  assert(kol.recommendedCompanyProfiles.some((company) => company.source === "defillama_live"), "KOL should receive at least one live demand company match");
  assert(kol.web3KOLSupplyInsight, "KOL identity should attach an AI supply insight");
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
  assert(decision.liveMatching?.attempted === true, "web3 decision should attempt live supply matching");
  assert(decision.liveMatching?.injectedSupplyProfiles > 0, "web3 decision should inject live supply profiles");
  assert(decision.decision.recommendedConcretePartners.some((partner) => partner.source === "web3_media_feeds_live"), "web3 decision should recommend at least one live media-feed supply partner");
  assert(new Set(decision.decision.recommendedConcretePartners.map((partner) => partner.supplyType)).size >= 3, "web3 decision should diversify supply partner types");
  assert(decision.aiInsight?.growthState, "web3 decision should include AI growth insight");
  console.log(`ok web3 decision: ${decision.memory.eventCount} events / ${decision.decision.confidence}% confidence / ${decision.decision.recommendedConcretePartners[0].name}`);

  const brief = await request("/api/grointel/web3-collaboration-brief", {
    method: "POST",
    body: JSON.stringify({
      projectName: "Smoke L2",
      sector: "Ethereum L2",
      growthGoal: "Acquire real users through quest and KOL partnerships",
      targetAudience: "crypto-native builders",
      riskTolerance: "low",
      partnerLimit: 5,
    }),
  });
  assert(brief.success, "web3 collaboration brief should succeed");
  assert((brief.brief?.partnerBriefs || []).length >= 3, "brief should include multiple partner briefs");
  assert(brief.liveMatching?.attempted === true, "collaboration brief should attempt live supply matching");
  assert(brief.liveMatching?.injectedSupplyProfiles > 0, "collaboration brief should inject live supply profiles");
  assert(brief.brief.partnerBriefs[0].outreachMessage, "brief should include outreach copy");
  assert(brief.brief.partnerBriefs[0].suggestedDeliverables.length >= 3, "brief should include deliverables");
  assert(brief.brief.partnerBriefs[0].successMetrics.length >= 2, "brief should include success metrics");
  assert((brief.brief?.campaignPlan || []).length >= 4, "brief should include campaign plan");
  assert(brief.aiInsight?.growthState, "brief should include AI growth insight");
  console.log(`ok web3 collaboration brief: ${brief.brief.partnerBriefs.length} partners / ${brief.brief.partnerBriefs[0].partnerName}`);

  const bidirectional = await request("/api/grointel/bidirectional-matching-readiness");
  assert(bidirectional.success, "bidirectional matching readiness should respond");
  assert(bidirectional.ready, "bidirectional live matching should be ready");
  assert((bidirectional.companyToSupply?.liveMatches || []).length > 0, "company-to-supply should include live supply matches");
  assert((bidirectional.supplyToCompany?.liveDemandMatches || []).some((match) => match.source === "defillama_live"), "supply-to-company should include live demand matches");
  console.log(`ok bidirectional matching: liveSupply=${bidirectional.companyToSupply.liveMatches.length} liveDemand=${bidirectional.supplyToCompany.liveDemandMatches.length}`);

  const memoryStatus = await request("/api/grointel/world-memory-status");
  assert(memoryStatus.success !== false, "world memory status should respond");
  assert(memoryStatus.ready || memoryStatus.legacyReady, "primary or legacy world memory should be available");
  console.log(`ok memory status: ready=${Boolean(memoryStatus.ready)} legacyReady=${Boolean(memoryStatus.legacyReady)}`);

  const memoryMigration = await request("/api/grointel/world-memory-migration");
  assert(memoryMigration.success, "world memory migration status should respond");
  assert(memoryMigration.migration?.path?.includes("013_world_memory.sql"), "world memory migration should point to 013 migration");
  assert(memoryMigration.migration?.sha256, "world memory migration should expose a SQL checksum");
  assert(memoryMigration.primary?.requiredTables >= 9, "world memory migration should list primary memory tables");
  console.log(`ok memory migration: ready=${Boolean(memoryMigration.ready)} missing=${(memoryMigration.primary?.missingTables || []).length}`);

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

  const dailyIngestion = await request("/api/grointel/daily-ingestion?demandTarget=100&supplyTarget=100");
  assert(dailyIngestion.success, "daily ingestion should respond");
  assert(dailyIngestion.mode === "preview", "daily ingestion smoke should preview by default");
  assert(dailyIngestion.batch?.demandCount >= 100, "daily ingestion should prepare at least 100 demand/company entities");
  assert(dailyIngestion.batch?.supplyCount >= 100, "daily ingestion should prepare at least 100 KOL/supply entities");
  assert(dailyIngestion.batch?.sourceSummary?.registeredSources >= 12, "daily ingestion should expose global discovery source registry");
  assert(dailyIngestion.batch?.sourceSummary?.avgDiscoveryScore >= 70, "daily ingestion should score candidates with source-aware quality");
  assert(dailyIngestion.liveDiscovery?.attempted === true, "daily ingestion should attempt a live Web3 discovery source");
  assert(dailyIngestion.liveDiscovery?.source === "multi_live", "daily ingestion should expose the live discovery aggregate");
  assert((dailyIngestion.liveDiscovery?.sources || []).some((source) => source.source === "defillama"), "daily ingestion should include DefiLlama as a live demand source");
  assert((dailyIngestion.liveDiscovery?.sources || []).some((source) => source.source === "web3_media_feeds"), "daily ingestion should include Web3 media feeds as a live supply source");
  if (dailyIngestion.liveDiscovery?.success) {
    assert(dailyIngestion.liveDiscovery.candidateCount > 0, "successful live discovery should produce candidates");
    assert(dailyIngestion.liveDiscovery.demandCandidateCount > 0, "successful live discovery should produce demand candidates");
    assert(dailyIngestion.liveDiscovery.supplyCandidateCount > 0, "successful live discovery should produce supply candidates");
  }
  assert(dailyIngestion.world?.web3DemandCount >= 100, "daily ingestion preview should enter company entities into runtime world");
  assert(dailyIngestion.world?.web3SupplyCount >= 100, "daily ingestion preview should enter KOL/supply entities into runtime world");
  console.log(`ok daily ingestion: demand=${dailyIngestion.batch.demandCount} supply=${dailyIngestion.batch.supplyCount} sources=${dailyIngestion.batch.sourceSummary.registeredSources} live=${dailyIngestion.liveDiscovery.success ? `${dailyIngestion.liveDiscovery.demandCandidateCount}/${dailyIngestion.liveDiscovery.supplyCandidateCount}` : "fallback"}`);

  const readiness = await request("/api/grointel/delivery-readiness");
  assert(readiness.success, "delivery readiness should respond");
  assert(readiness.readyForDelivery, "delivery readiness should not be blocked");
  assert(readiness.score >= 80, "delivery readiness should be high enough for handoff");
  assert(readiness.counts?.web3Demand >= 40, "delivery readiness should count Web3 company demand");
  assert(readiness.counts?.web3Supply >= 30, "delivery readiness should count Web3 KOL/supply");
  assert(readiness.counts?.entityMemories > 0, "delivery readiness should expose L2 memory");
  assert(readiness.counts?.decisionMemories > 0, "delivery readiness should expose L3 memory");
  assert(readiness.counts?.evolutionMemories > 0, "delivery readiness should expose L4 memory");
  assert(readiness.counts?.dailyDemandBatch >= 100, "delivery readiness should expose daily 100 demand ingestion");
  assert(readiness.counts?.dailySupplyBatch >= 100, "delivery readiness should expose daily 100 KOL/supply ingestion");
  assert(readiness.counts?.discoverySources >= 12, "delivery readiness should expose global discovery sources");
  console.log(`ok delivery readiness: ${readiness.status} / score=${readiness.score}`);

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

    const world = await request("/api/grointel/world?limit=2");
    assert(world.success, "world API should respond");
    assert((world.memory?.entityMemories || []).length > 0, "world memory should expose L2 entity memory or legacy projection");
    assert((world.memory?.decisionMemories || []).length > 0, "world memory should expose L3 decision memory or legacy projection");
    assert((world.memory?.evolutionMemories || []).length > 0, "world memory should expose L4 evolution memory or legacy projection");
    console.log(`ok world memory layers: L2=${world.memory.entityMemories.length} L3=${world.memory.decisionMemories.length} L4=${world.memory.evolutionMemories.length}`);
  }

  console.log("GroIntel smoke passed.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
