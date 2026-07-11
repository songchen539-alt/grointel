import { decideWeb3Growth } from "../web3Decision";
import { WEB3_GROWTH_EVENTS } from "../web3World";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${label}`);
  }
}

const decision = decideWeb3Growth({
  projectName: "Test L2",
  sector: "Ethereum L2",
  growthGoal: "Acquire real users through quest and KOL partnerships",
  targetAudience: "crypto-native builders",
  riskTolerance: "low",
}, WEB3_GROWTH_EVENTS);

console.log("=== Web3 Growth Decision Tests ===");
assert(decision.recommendedSupply.length > 0, "should recommend growth supply");
assert(decision.recommendedPartnerProfiles.length > 0, "should recommend partner profiles");
assert(decision.recommendedConcretePartners.length > 0, "should recommend concrete Web3 supply partners");
assert(decision.recommendedConcretePartners.length >= 8, "should recommend from expanded Web3 supply pool");
assert(decision.recommendedConcretePartners[0].fitScore > 0, "concrete partner should have fit score");
assert(Boolean(decision.recommendedConcretePartners[0].audienceFit), "concrete partner should explain audience fit");
assert(Boolean(decision.recommendedConcretePartners[0].recommendedAction), "concrete partner should include a recommended action");
assert(Boolean(decision.recommendedConcretePartners[0].measurement), "concrete partner should include measurement guidance");
assert(Boolean(decision.recommendedConcretePartners[0].riskControl), "concrete partner should include risk control guidance");
assert(decision.recommendedConcretePartners.some((partner) => partner.source || (partner.tags && partner.tags.length > 0)), "should include discovery-sourced partners");
assert(new Set(decision.recommendedConcretePartners.map((partner) => partner.supplyType)).size >= 3, "should diversify supply partner types");
assert(decision.matchedEvents.length > 0, "should match historical events");
assert(decision.matchedEvents[0].relevance > 0, "should score relevance");
assert(decision.nextActions.length >= 3, "should produce next actions");
assert(decision.risks.length > 0, "should surface risks");
assert(decision.measurementPlan.length > 0, "should produce measurable campaign signals");
assert(decision.qualificationQuestions.length >= 4, "should produce qualification questions");
assert(decision.confidence > 0 && decision.confidence <= 100, "confidence should be bounded");

const liveDecision = decideWeb3Growth({
  projectName: "Live Media Test",
  sector: "Ethereum L2",
  growthGoal: "Acquire real users through media education and KOL partnerships",
  targetAudience: "crypto-native builders",
  riskTolerance: "low",
}, WEB3_GROWTH_EVENTS, [{
  id: "web3.live.supply.media.test-writer",
  name: "Live Feed Writer",
  identity: "example.com/authors/live-feed-writer",
  supplyType: "media",
  audience: ["ethereum / media / builders audience", "live Web3 media coverage", "crypto-native users"],
  capabilities: ["live editorial coverage", "sponsored education", "current narrative distribution"],
  bestFor: ["ethereum growth", "media growth", "builder education"],
  collaborationFormats: ["live media brief", "sponsored educational article", "founder interview"],
  proofSignals: ["content engagement", "qualified traffic", "lead/account conversion"],
  risks: ["requires substantive story", "editorial standards limit pure promotion"],
  source: "web3_media_feeds_live",
  tags: ["media", "ethereum", "builders", "education"],
  priority: 96,
}]);
assert(liveDecision.recommendedConcretePartners.some((partner) => partner.source === "web3_media_feeds_live"), "should inject live supply profiles into concrete recommendations");

const qualityDecision = decideWeb3Growth({
  projectName: "Quality Test",
  sector: "Ethereum L2",
  growthGoal: "Acquire real users through media education and research-led growth",
  targetAudience: "crypto-native builders",
  riskTolerance: "low",
}, WEB3_GROWTH_EVENTS, [{
  id: "web3.live.supply.content.quality",
  name: "High Quality Live Research",
  identity: "quality.example.com",
  supplyType: "research",
  audience: ["ethereum / builders / research audience", "crypto-native users"],
  capabilities: ["current market analysis", "protocol education", "research-led credibility"],
  bestFor: ["ethereum growth", "builder education", "research credibility"],
  collaborationFormats: ["research thread", "protocol breakdown", "analyst briefing"],
  proofSignals: ["high-intent traffic", "qualified partner conversations", "research engagement"],
  risks: ["requires accurate technical claims", "slower than hype-led channels"],
  source: "web3_content_feeds_live",
  tags: ["research", "ethereum", "builders", "education"],
  priority: 82,
  liveQualityScore: 96,
  liveSourceCoverage: ["web3_content_feeds", "youtube_creator_feeds"],
}]);
const qualityPartner = qualityDecision.recommendedConcretePartners.find((partner) => partner.name === "High Quality Live Research");
assert(Boolean(qualityPartner), "should recommend high-quality live supply profiles");
assert(qualityPartner?.liveQualityScore === 96, "should preserve live quality score on recommendations");
assert((qualityPartner?.liveSourceCoverage || []).length === 2, "should preserve live source coverage on recommendations");

console.log(`=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
if (failed > 0) process.exit(1);
