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
assert(decision.matchedEvents.length > 0, "should match historical events");
assert(decision.matchedEvents[0].relevance > 0, "should score relevance");
assert(decision.nextActions.length >= 3, "should produce next actions");
assert(decision.risks.length > 0, "should surface risks");
assert(decision.confidence > 0 && decision.confidence <= 100, "confidence should be bounded");

console.log(`=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
if (failed > 0) process.exit(1);
