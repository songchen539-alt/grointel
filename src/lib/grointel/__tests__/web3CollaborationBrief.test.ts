import { buildWeb3CollaborationBrief } from "../web3CollaborationBrief";
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

const demand = {
  projectName: "Brief Test Protocol",
  sector: "Solana DeFi trading",
  growthGoal: "Acquire real traders through KOL, media, and research partnerships",
  targetAudience: "crypto-native traders and DeFi users",
  riskTolerance: "medium" as const,
};
const decision = decideWeb3Growth(demand, WEB3_GROWTH_EVENTS);
const brief = buildWeb3CollaborationBrief(demand, decision, 5);

console.log("=== Web3 Collaboration Brief Tests ===");
assert(brief.briefTitle.includes(demand.projectName), "brief title should include project name");
assert(brief.partnerBriefs.length >= 3, "brief should include multiple partner briefs");
assert(brief.partnerBriefs.every((partner) => partner.outreachMessage.includes(demand.projectName)), "each partner should have usable outreach copy");
assert(brief.partnerBriefs.every((partner) => partner.suggestedDeliverables.length >= 3), "each partner should include deliverables");
assert(brief.partnerBriefs.every((partner) => partner.successMetrics.length >= 2), "each partner should include success metrics");
assert(brief.campaignPlan.length === 4, "brief should include campaign phases");
assert(brief.trackingPlan.length > 0, "brief should include tracking plan");
assert(brief.doNotDo.length > 0, "brief should include avoid list");
assert(brief.nextActionChecklist.length >= 4, "brief should include next action checklist");

console.log(`=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
if (failed > 0) process.exit(1);
