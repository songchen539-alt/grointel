import type { RealityTarget } from "./worldRuntime";

export type Web3GrowthEventOutcome = "success" | "failure" | "mixed" | "risk";

export interface Web3GrowthEvent {
  id: string;
  project: string;
  projectIdentity: string;
  partner: string;
  partnerIdentity: string;
  partnerType: "kol" | "community" | "media" | "ecosystem" | "celebrity" | "platform";
  chainOrSector: string;
  eventDate: string;
  outcome: Web3GrowthEventOutcome;
  growthGoal: string;
  collaborationFormat: string;
  observedResult: string;
  whyItWorkedOrFailed: string[];
  reusablePattern: string;
  risks: string[];
  evidenceUrls: string[];
}

export const WEB3_TARGETS: RealityTarget[] = [
  { id: "web3.company.arbitrum", name: "Arbitrum", identity: "arbitrum.io", kind: "company", domain: "Web3 / Ethereum L2 ecosystem" },
  { id: "web3.company.optimism", name: "Optimism", identity: "optimism.io", kind: "company", domain: "Web3 / Ethereum L2 ecosystem" },
  { id: "web3.company.polygon", name: "Polygon", identity: "polygon.technology", kind: "company", domain: "Web3 / scaling and brand partnerships" },
  { id: "web3.company.galxe", name: "Galxe", identity: "galxe.com", kind: "company", domain: "Web3 / quest and credential growth platform" },
  { id: "web3.company.binance", name: "Binance", identity: "binance.com", kind: "company", domain: "Web3 / exchange and consumer crypto" },
  { id: "web3.company.azuki", name: "Azuki", identity: "azuki.com", kind: "company", domain: "Web3 / NFT community and IP" },
  { id: "web3.company.blur", name: "Blur", identity: "blur.io", kind: "company", domain: "Web3 / NFT marketplace incentives" },
  { id: "web3.company.friendtech", name: "friend.tech", identity: "friend.tech", kind: "company", domain: "Web3 / social finance" },
  { id: "web3.kol.cobie", name: "Cobie", identity: "x.com/cobie", kind: "kol", domain: "Web3 / crypto-native investor audience" },
  { id: "web3.kol.bankless", name: "Bankless", identity: "bankless.com", kind: "kol", domain: "Web3 / Ethereum education media" },
  { id: "web3.kol.defiant", name: "The Defiant", identity: "thedefiant.io", kind: "kol", domain: "Web3 / DeFi media audience" },
  { id: "web3.kol.bitboy", name: "BitBoy Crypto", identity: "x.com/Bitboy_Crypto", kind: "kol", domain: "Web3 / retail crypto audience risk profile" },
];

export const WEB3_GROWTH_EVENTS: Web3GrowthEvent[] = [
  {
    id: "web3.event.arbitrum_odyssey_galxe_2022",
    project: "Arbitrum",
    projectIdentity: "arbitrum.io",
    partner: "Galxe / Project Galaxy",
    partnerIdentity: "galxe.com",
    partnerType: "platform",
    chainOrSector: "Ethereum L2",
    eventDate: "2022-06",
    outcome: "mixed",
    growthGoal: "Drive wallet activity, bridge usage, and ecosystem exploration.",
    collaborationFormat: "Quest campaign with NFT credentials and ecosystem tasks.",
    observedResult: "Generated heavy user demand and attention, but the campaign was paused after network congestion and cost pressure.",
    whyItWorkedOrFailed: [
      "The task format made ecosystem exploration concrete.",
      "Reward mechanics created urgency and social sharing.",
      "Infrastructure capacity and incentive design could not absorb the demand cleanly.",
    ],
    reusablePattern: "Quest campaigns work for ecosystem onboarding when throttled, staged, and tied to meaningful user education.",
    risks: ["Sybil activity", "Short-term reward farming", "Network congestion", "User frustration if rewards feel unclear"],
    evidenceUrls: [
      "https://forum.arbitrum.foundation/t/galxe-final-stip-round-1/17561",
      "https://arbitrumfoundation.medium.com/arbitrum-odyssey-reignited-a98f627d42ef",
      "https://www.galxe.com/blog/arbitrum-odyssey",
    ],
  },
  {
    id: "web3.event.optimism_quests_2022",
    project: "Optimism",
    projectIdentity: "optimism.io",
    partner: "Galxe / Layer3-style quest distribution",
    partnerIdentity: "galxe.com",
    partnerType: "platform",
    chainOrSector: "Ethereum L2",
    eventDate: "2022-09",
    outcome: "success",
    growthGoal: "Educate users and increase ecosystem app usage.",
    collaborationFormat: "On-chain quests, credentials, and guided ecosystem actions.",
    observedResult: "Created a repeatable onboarding loop for users to discover apps while giving the ecosystem measurable participation signals.",
    whyItWorkedOrFailed: [
      "The campaign matched the user stage: learning and trying apps.",
      "The actions were measurable on-chain.",
      "It created reusable user segmentation data for future growth decisions.",
    ],
    reusablePattern: "Use quests to convert broad attention into segmented, behavior-based user cohorts.",
    risks: ["Quest fatigue", "Low-retention reward hunters", "Over-crediting vanity activity"],
    evidenceUrls: [
      "https://app.galxe.com/quest/Optimism/GC6xiUtedg",
      "https://medium.com/galxe-news/galxe-x-optimism-optimism-quests-f060c139d660",
      "https://dune.com/springzhang/optimism-quests-tracking",
    ],
  },
  {
    id: "web3.event.binance_ronaldo_nft_2022",
    project: "Binance",
    projectIdentity: "binance.com",
    partner: "Cristiano Ronaldo",
    partnerIdentity: "cristianoronaldo.com",
    partnerType: "celebrity",
    chainOrSector: "Exchange / NFT",
    eventDate: "2022-11",
    outcome: "risk",
    growthGoal: "Mainstream NFT adoption and global consumer attention.",
    collaborationFormat: "Celebrity NFT collection and exchange-led campaign.",
    observedResult: "Achieved mainstream reach, but later became a visible example of endorsement and consumer-risk scrutiny.",
    whyItWorkedOrFailed: [
      "Celebrity reach created immediate awareness beyond crypto-native audiences.",
      "Audience-product fit was fragile because many followers were not crypto-native.",
      "Regulatory and expectation risk can outweigh awareness gains.",
    ],
    reusablePattern: "Celebrity reach should be used only when disclosure, education, and user-risk controls are strong.",
    risks: ["Regulatory scrutiny", "Reputation backlash", "Low-intent traffic", "Expectation mismatch"],
    evidenceUrls: [
      "https://www.binance.com/en/square/post/12560579612970",
      "https://qz.com/cristiano-ronaldo-1-billion-lawsuit-promoting-binance-1851060565",
    ],
  },
  {
    id: "web3.event.azuki_elementals_2023",
    project: "Azuki",
    projectIdentity: "azuki.com",
    partner: "NFT creator and collector community",
    partnerIdentity: "x.com/azuki",
    partnerType: "community",
    chainOrSector: "NFT / IP",
    eventDate: "2023-06",
    outcome: "failure",
    growthGoal: "Expand NFT collection demand and community revenue.",
    collaborationFormat: "High-attention mint amplified by NFT community discussion and influencers.",
    observedResult: "Mint attention was high, but community backlash over perceived creative similarity and execution hurt trust.",
    whyItWorkedOrFailed: [
      "Demand existed before launch, but expectations were extremely high.",
      "Community identity and perceived originality mattered more than short-term sales.",
      "Influencer amplification accelerated both hype and backlash.",
    ],
    reusablePattern: "For community-owned brands, protect trust and identity before optimizing launch revenue.",
    risks: ["Community backlash", "Floor price pressure", "Narrative reversal", "Creator trust damage"],
    evidenceUrls: [
      "https://www.binance.com/cs/square/post/728786",
      "https://medium.com/coinmonks/azuki-elementals-and-azurbala-nft-navigating-community-challenges-in-established-nft-projects-336eaf51f4e5",
      "https://thelinestudio.com/work/azuki",
    ],
  },
  {
    id: "web3.event_friendtech_crypto_twitter_2023",
    project: "friend.tech",
    projectIdentity: "friend.tech",
    partner: "Crypto Twitter KOL network",
    partnerIdentity: "x.com",
    partnerType: "kol",
    chainOrSector: "SocialFi",
    eventDate: "2023-08",
    outcome: "mixed",
    growthGoal: "Acquire crypto-native users through social graph speculation and creator monetization.",
    collaborationFormat: "Invite-based social virality, KOL key markets, and public PnL/status loops.",
    observedResult: "Reached strong early adoption and discourse, but retention and long-term utility became the core challenge.",
    whyItWorkedOrFailed: [
      "KOL participation made the product itself feel like a social event.",
      "Speculation and status loops created fast acquisition.",
      "Utility beyond trading social access was harder to sustain.",
    ],
    reusablePattern: "KOL-native product loops can launch quickly when creators are not just promoters but part of the product mechanic.",
    risks: ["Speculation-led churn", "Creator fatigue", "Trust erosion", "Liquidity cliffs"],
    evidenceUrls: ["https://friend.tech/", "https://x.com"],
  },
];
