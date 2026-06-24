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
  bestForStages?: string[];
  measurableSignals?: string[];
  supplyProfile?: string;
}

export interface Web3SupplyProfile {
  id: string;
  name: string;
  identity: string;
  supplyType: "kol" | "media" | "community" | "platform" | "research" | "security" | "creator";
  audience: string[];
  capabilities: string[];
  bestFor: string[];
  collaborationFormats: string[];
  proofSignals: string[];
  risks: string[];
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
  { id: "web3.kol.ansem", name: "Ansem", identity: "x.com/blknoiz06", kind: "kol", domain: "Web3 / trader and memecoin-native audience" },
  { id: "web3.kol.ignas", name: "Ignas", identity: "x.com/DefiIgnas", kind: "kol", domain: "Web3 / DeFi research and protocol audience" },
  { id: "web3.kol.zachxbt", name: "ZachXBT", identity: "x.com/zachxbt", kind: "kol", domain: "Web3 / security and trust audience" },
  { id: "web3.kol.defidad", name: "DeFi Dad", identity: "x.com/DeFi_Dad", kind: "kol", domain: "Web3 / DeFi education audience" },
  { id: "web3.kol.coinbureau", name: "Coin Bureau", identity: "coinbureau.com", kind: "kol", domain: "Web3 / retail education media" },
  { id: "web3.kol.delphi", name: "Delphi Digital", identity: "delphidigital.io", kind: "kol", domain: "Web3 / institutional research audience" },
  { id: "web3.kol.messari", name: "Messari", identity: "messari.io", kind: "kol", domain: "Web3 / research and data audience" },
  { id: "web3.kol.unchained", name: "Unchained", identity: "unchainedcrypto.com", kind: "kol", domain: "Web3 / crypto journalism and founder audience" },
];

export const WEB3_SUPPLY_PROFILES: Web3SupplyProfile[] = [
  {
    id: "web3.supply.cobie",
    name: "Cobie",
    identity: "x.com/cobie",
    supplyType: "kol",
    audience: ["crypto-native traders", "founders", "investors", "high-context Web3 users"],
    capabilities: ["narrative validation", "market conversation", "founder/investor reach"],
    bestFor: ["credible crypto-native launch", "founder-led narrative", "high-context product validation"],
    collaborationFormats: ["selective advisory", "product-native conversation", "founder interview or public discussion"],
    proofSignals: ["qualified wallet/account creation", "high-quality inbound", "founder/investor discourse", "retention after attention spike"],
    risks: ["audience rejects shallow promotion", "requires strong product credibility", "not ideal for mainstream education"],
  },
  {
    id: "web3.supply.bankless",
    name: "Bankless",
    identity: "bankless.com",
    supplyType: "media",
    audience: ["Ethereum users", "DeFi participants", "DAO contributors", "Web3 builders"],
    capabilities: ["education", "podcast storytelling", "newsletter distribution", "community activation"],
    bestFor: ["Ethereum ecosystem education", "L2 onboarding", "DeFi protocol explainers", "wallet and governance adoption"],
    collaborationFormats: ["sponsored education", "founder interview", "ecosystem narrative campaign", "newsletter/podcast package"],
    proofSignals: ["content engagement", "qualified traffic", "wallet/account activation", "community joins", "retention after education"],
    risks: ["audience expects substance", "weak fit for low-context consumer hype", "requires clear educational angle"],
  },
  {
    id: "web3.supply.defiant",
    name: "The Defiant",
    identity: "thedefiant.io",
    supplyType: "media",
    audience: ["DeFi users", "protocol teams", "on-chain finance investors", "builders"],
    capabilities: ["DeFi editorial coverage", "protocol education", "market analysis", "launch storytelling"],
    bestFor: ["DeFi protocol launch", "ecosystem education", "serious protocol credibility", "market narrative"],
    collaborationFormats: ["sponsored report", "protocol explainer", "founder interview", "launch coverage"],
    proofSignals: ["qualified DeFi traffic", "protocol signups", "wallet activation", "community sentiment"],
    risks: ["not broad retail distribution", "needs meaningful protocol story", "editorial standards limit pure promotion"],
  },
  {
    id: "web3.supply.zachxbt",
    name: "ZachXBT",
    identity: "x.com/zachxbt",
    supplyType: "security",
    audience: ["security-conscious crypto users", "investigators", "founders", "risk-aware investors"],
    capabilities: ["trust scrutiny", "fraud awareness", "risk signal amplification", "security credibility"],
    bestFor: ["trust repair", "security-first launch", "risk transparency", "anti-scam credibility"],
    collaborationFormats: ["not a normal paid promotion fit", "security transparency reference", "risk education"],
    proofSignals: ["trust sentiment", "reduced concern volume", "security disclosure engagement", "community confidence"],
    risks: ["high scrutiny", "not a promotional channel", "can amplify unresolved risk"],
  },
  {
    id: "web3.supply.ignas",
    name: "Ignas",
    identity: "x.com/DefiIgnas",
    supplyType: "research",
    audience: ["DeFi researchers", "protocol users", "builders", "crypto analysts"],
    capabilities: ["research-led education", "protocol comparison", "DeFi narrative analysis"],
    bestFor: ["DeFi product education", "protocol differentiation", "technical audience acquisition"],
    collaborationFormats: ["research thread", "protocol breakdown", "educational campaign", "analyst briefing"],
    proofSignals: ["high-intent traffic", "qualified wallet cohorts", "developer/community questions", "repeat app usage"],
    risks: ["requires accurate technical claims", "audience notices weak mechanics", "slower than hype-led channels"],
  },
  {
    id: "web3.supply.ansem",
    name: "Ansem",
    identity: "x.com/blknoiz06",
    supplyType: "kol",
    audience: ["crypto traders", "memecoin-native users", "Solana and high-velocity retail communities"],
    capabilities: ["fast attention", "trader narrative", "community momentum"],
    bestFor: ["consumer crypto attention", "trader community activation", "social momentum campaigns"],
    collaborationFormats: ["public conversation", "launch amplification", "community-driven campaign"],
    proofSignals: ["traffic spike", "wallet/account creation", "trading or app activity", "social velocity"],
    risks: ["short attention half-life", "speculation-led churn", "high volatility audience"],
  },
  {
    id: "web3.supply.coinbureau",
    name: "Coin Bureau",
    identity: "coinbureau.com",
    supplyType: "media",
    audience: ["retail crypto learners", "global crypto users", "token researchers"],
    capabilities: ["retail education", "long-form explainers", "mainstream crypto reach"],
    bestFor: ["consumer education", "wallet/exchange onboarding", "broad awareness with learning curve"],
    collaborationFormats: ["video explainer", "sponsored education", "campaign landing funnel"],
    proofSignals: ["qualified account creation", "education completion", "traffic conversion", "support ticket quality"],
    risks: ["retail audience needs strong disclosure", "awareness may outrun product readiness", "compliance review required"],
  },
  {
    id: "web3.supply.delphi",
    name: "Delphi Digital",
    identity: "delphidigital.io",
    supplyType: "research",
    audience: ["institutional crypto teams", "funds", "serious protocol operators", "founders"],
    capabilities: ["institutional research", "market thesis", "protocol strategy", "operator credibility"],
    bestFor: ["B2B/institutional Web3", "protocol positioning", "strategic narrative", "high-ticket partnerships"],
    collaborationFormats: ["research partnership", "thesis report", "private briefing", "ecosystem strategy"],
    proofSignals: ["qualified partner intros", "institutional leads", "BD conversations", "research engagement"],
    risks: ["not for mass acquisition", "requires strong fundamentals", "longer sales cycle"],
  },
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
    bestForStages: ["ecosystem onboarding", "pre-token community growth", "app discovery"],
    measurableSignals: ["unique wallets", "bridge transactions", "quest completion rate", "retained active wallets"],
    supplyProfile: "Quest platform with anti-Sybil controls and ecosystem task design.",
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
    bestForStages: ["ecosystem education", "early app activation", "multi-app discovery"],
    measurableSignals: ["on-chain action completion", "repeat app usage", "qualified wallet cohorts", "retention after rewards"],
    supplyProfile: "Credential/quest distribution platform plus ecosystem educators.",
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
    bestForStages: ["mainstream awareness", "consumer brand campaign"],
    measurableSignals: ["qualified account creation", "risk disclosure engagement", "conversion quality", "complaint rate"],
    supplyProfile: "Mainstream celebrity partner only with compliance review and user education.",
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
    bestForStages: ["NFT/IP community expansion", "collector retention", "brand trust repair"],
    measurableSignals: ["holder sentiment", "mint conversion quality", "secondary market stability", "community retention"],
    supplyProfile: "Community-native creator network with strong collector trust and expectation management.",
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
    bestForStages: ["crypto-native launch", "social graph activation", "creator-led distribution"],
    measurableSignals: ["invite conversion", "active creators", "repeat sessions", "retention after speculation cools"],
    supplyProfile: "Crypto Twitter creator network embedded into the product loop.",
    evidenceUrls: ["https://friend.tech/", "https://x.com"],
  },
];
