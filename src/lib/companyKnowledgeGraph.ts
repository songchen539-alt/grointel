// GroIntel Company Knowledge Graph - Mock Data
// 10+ companies with complete profiles.
// Replace with database queries in production.

import { Company, companyNameFromUrl, detectIndustry } from "@/types/company";

const companiesById: Record<string, Company> = {};

function register(c: Company): Company {
  companiesById[c.id] = c;
  return c;
}

// ========== 10 Companies ==========

register({
  id: "opengradient",
  name: "OpenGradient",
  website: "https://opengradient.com",
  industry: "AI Infrastructure",
  category: "AI / ML",
  country: "Singapore",
  headquarters: "Singapore",
  businessModel: "B2B API Platform",
  estimatedStage: "Series A",
  fundingStage: "Series A ($15M)",
  employeeSize: "11-50",
  targetCustomer: "AI Developers and Enterprise ML Teams",
  productDescription: "Decentralized AI inference platform for scalable model deployment",
  description: "OpenGradient is building the infrastructure layer for decentralized AI inference.",
  markets: ["Singapore", "United States", "Japan", "South Korea"],
  competitors: [
    { name: "Replicate", url: "https://replicate.com", strength: "Strong", whatToLearn: "Developer experience and documentation quality" },
    { name: "Modal", url: "https://modal.com", strength: "Medium", whatToLearn: "Enterprise sales motion and compliance" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/opengradient", github: "https://github.com/opengradient", twitter: "https://x.com/opengradient" },
  growthChannels: [
    { name: "Developer Communities", category: "Developer", priority: "Critical", reason: "Primary acquisition channel for developer tools", estimatedROI: "Very High" },
    { name: "AI Newsletters", category: "Newsletter", priority: "Critical", reason: "Target AI/ML practitioners directly", estimatedROI: "Very High" },
    { name: "GitHub", category: "GitHub", priority: "High", reason: "Open-source credibility and community contributions", estimatedROI: "High" },
    { name: "X", category: "X", priority: "High", reason: "Real-time developer engagement and thought leadership", estimatedROI: "High" },
    { name: "Podcast Appearances", category: "Podcast", priority: "Medium", reason: "Founder-led storytelling to reach technical audience", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "funding", label: "Funding Signal", description: "Strong institutional backing with tier-1 VCs", weight: 85, confidence: 90, updatedAt: "2026-06-01" },
    { type: "hiring", label: "Hiring Signal", description: "Opened 8 new positions across engineering and growth", weight: 70, confidence: 75, updatedAt: "2026-06-10" },
    { type: "community", label: "Community Signal", description: "Discord grew 40% MoM to 8K members", weight: 65, confidence: 70, updatedAt: "2026-06-12" },
    { type: "product", label: "Product Signal", description: "New SDK launch drove 3x developer signups", weight: 90, confidence: 85, updatedAt: "2026-06-14" },
  ],
  pricing: "Usage-based + Enterprise",
  stage: "Growth",
});

register({
  id: "monad",
  name: "Monad",
  website: "https://monad.xyz",
  industry: "L1 Blockchain",
  category: "Web3 / Crypto",
  country: "United States",
  headquarters: "San Francisco, CA",
  businessModel: "Protocol / L1 Blockchain",
  estimatedStage: "Series B",
  fundingStage: "Series B ($50M+)",
  employeeSize: "51-200",
  targetCustomer: "Web3 Developers and DeFi Protocols",
  productDescription: "High-performance EVM-compatible Layer 1 blockchain",
  description: "Monad is building the next-generation EVM-compatible L1 with parallel execution.",
  markets: ["United States", "Singapore", "South Korea", "UAE"],
  competitors: [
    { name: "Solana", url: "https://solana.com", strength: "Strong", whatToLearn: "Ecosystem development and hackathon strategy" },
    { name: "Sui", url: "https://sui.io", strength: "Medium", whatToLearn: "Move language developer education" },
    { name: "Aptos", url: "https://aptoslabs.com", strength: "Medium", whatToLearn: "Enterprise partnership approach" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/monad", github: "https://github.com/monad", twitter: "https://x.com/monad" },
  growthChannels: [
    { name: "X", category: "X", priority: "Critical", reason: "Primary channel for Web3 community and developer engagement", estimatedROI: "Very High" },
    { name: "Discord", category: "Discord", priority: "Critical", reason: "Core developer community hub", estimatedROI: "Very High" },
    { name: "Web3 Podcasts", category: "Podcast", priority: "High", reason: "Reach crypto-native developers and investors", estimatedROI: "High" },
    { name: "Crypto Newsletters", category: "Newsletter", priority: "High", reason: "Target crypto-native developers", estimatedROI: "High" },
    { name: "Hackathons", category: "Events", priority: "Medium", reason: "Drive developer adoption through hands-on building", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "funding", label: "Funding Signal", description: "Raised $50M+ from top-tier crypto VCs", weight: 90, confidence: 95, updatedAt: "2026-05-15" },
    { type: "community", label: "Community Signal", description: "Discord crossed 100K members with high engagement", weight: 85, confidence: 80, updatedAt: "2026-06-08" },
    { type: "ecosystem", label: "Ecosystem Signal", description: "20+ protocols building on testnet", weight: 80, confidence: 75, updatedAt: "2026-06-13" },
  ],
  pricing: "Gas-based (protocol)",
  stage: "Growth",
});

register({
  id: "phantom",
  name: "Phantom",
  website: "https://phantom.app",
  industry: "Web3 Wallet",
  category: "Web3 / Crypto",
  country: "United States",
  headquarters: "San Francisco, CA",
  businessModel: "B2C / Multi-chain Wallet",
  estimatedStage: "Series B",
  fundingStage: "Series B ($30M+)",
  employeeSize: "51-200",
  targetCustomer: "Crypto Users and Web3 Consumers",
  productDescription: "Multi-chain crypto wallet and browser extension",
  description: "Phantom is the leading multi-chain wallet for Solana and Ethereum ecosystems.",
  markets: ["United States", "Singapore", "United Kingdom", "Brazil"],
  competitors: [
    { name: "MetaMask", url: "https://metamask.io", strength: "Strong", whatToLearn: "Distribution and browser extension market share" },
    { name: "Backpack", url: "https://backpack.app", strength: "Medium", whatToLearn: "Regulatory compliance and exchange integration" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/phantom", github: "https://github.com/phantom", twitter: "https://x.com/phantom" },
  growthChannels: [
    { name: "X", category: "X", priority: "Critical", reason: "Primary user acquisition channel for Web3 products", estimatedROI: "Very High" },
    { name: "LinkedIn", category: "LinkedIn", priority: "Medium", reason: "Talent acquisition and B2B partnerships", estimatedROI: "Medium" },
    { name: "Discord", category: "Discord", priority: "High", reason: "User support and community engagement", estimatedROI: "High" },
    { name: "Influencer Partnerships", category: "Media", priority: "High", reason: "Crypto influencer network for user acquisition", estimatedROI: "High" },
  ],
  signals: [
    { type: "product", label: "Product Signal", description: "Cross-chain swap feature drove 2x DAU growth", weight: 85, confidence: 80, updatedAt: "2026-06-05" },
    { type: "social", label: "Social Signal", description: "X following grew 25% after Bitcoin L2 announcement", weight: 75, confidence: 70, updatedAt: "2026-06-11" },
  ],
  pricing: "Free (fee-based swap revenue)",
  stage: "Growth",
});

register({
  id: "squads",
  name: "Squads",
  website: "https://squads.com",
  industry: "DAO Infrastructure",
  category: "Web3 / Crypto",
  country: "Singapore",
  headquarters: "Singapore",
  businessModel: "B2B SaaS (Crypto)",
  estimatedStage: "Series A",
  fundingStage: "Series A ($10M)",
  employeeSize: "11-50",
  targetCustomer: "DAOs and Crypto Treasuries",
  productDescription: "Smart account and multisig platform for DAOs",
  description: "Squads provides institutional-grade multisig and smart account infrastructure.",
  markets: ["Singapore", "United States", "Switzerland", "UAE"],
  competitors: [
    { name: "Gnosis Safe", url: "https://safe.global", strength: "Strong", whatToLearn: "Market dominance and trust-building" },
    { name: "Civic", url: "https://civic.com", strength: "Weak", whatToLearn: "Identity and compliance integrations" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/squads", github: "https://github.com/squads", twitter: "https://x.com/squads" },
  growthChannels: [
    { name: "Crypto Newsletters", category: "Newsletter", priority: "Critical", reason: "Reach DAO operators and treasury managers", estimatedROI: "Very High" },
    { name: "X", category: "X", priority: "High", reason: "Crypto-native audience engagement", estimatedROI: "High" },
    { name: "Discord", category: "Discord", priority: "High", reason: "Community support and user onboarding", estimatedROI: "High" },
    { name: "Enterprise Partnerships", category: "Enterprise", priority: "Medium", reason: "Institutional DAO infrastructure deals", estimatedROI: "High" },
  ],
  signals: [
    { type: "product", label: "Product Signal", description: "New smart account features driving institutional interest", weight: 75, confidence: 70, updatedAt: "2026-06-02" },
    { type: "hiring", label: "Hiring Signal", description: "Hiring for enterprise sales and compliance roles", weight: 65, confidence: 60, updatedAt: "2026-06-09" },
  ],
  pricing: "Freemium + Enterprise",
  stage: "Growth",
});

register({
  id: "funxyz",
  name: "Fun.xyz",
  website: "https://fun.xyz",
  industry: "Consumer Crypto",
  category: "Web3 / Crypto",
  country: "Singapore",
  headquarters: "Singapore",
  businessModel: "B2C Social Platform",
  estimatedStage: "Seed",
  fundingStage: "Seed ($3M)",
  employeeSize: "11-50",
  targetCustomer: "Gen Z Crypto Users in Southeast Asia",
  productDescription: "Social discovery platform for crypto communities",
  description: "Fun.xyz is a social discovery platform connecting crypto users in Southeast Asia.",
  markets: ["Malaysia", "Indonesia", "Philippines", "Thailand"],
  competitors: [
    { name: "Discord", url: "https://discord.com", strength: "Strong", whatToLearn: "Gamification and community features" },
    { name: "Telegram", url: "https://telegram.org", strength: "Strong", whatToLearn: "Regional dominance and simplicity" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/funxyz", github: "https://github.com/funxyz", twitter: "https://x.com/funxyz" },
  growthChannels: [
    { name: "Influencer Partnerships", category: "Media", priority: "Critical", reason: "Regional creator economy is primary growth driver", estimatedROI: "Very High" },
    { name: "Telegram", category: "Telegram", priority: "Critical", reason: "SEA crypto users primarily on Telegram", estimatedROI: "Very High" },
    { name: "X", category: "X", priority: "Medium", reason: "Crypto-native awareness and discovery", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "social", label: "Social Signal", description: "Viral growth in Malaysia and Indonesia", weight: 80, confidence: 75, updatedAt: "2026-06-07" },
    { type: "community", label: "Community Signal", description: "Telegram group grew to 20K members in 30 days", weight: 75, confidence: 70, updatedAt: "2026-06-13" },
  ],
  pricing: "Free (token-based economy)",
  stage: "Early",
});

register({
  id: "immunefi",
  name: "Immunefi",
  website: "https://immunefi.com",
  industry: "Cybersecurity",
  category: "Web3 / Crypto",
  country: "United States",
  headquarters: "San Francisco, CA",
  businessModel: "B2B Security Platform",
  estimatedStage: "Series A",
  fundingStage: "Series A ($24M)",
  employeeSize: "51-200",
  targetCustomer: "Web3 Protocols and Crypto Companies",
  productDescription: "Leading bug bounty and security platform for Web3",
  description: "Immunefi is the leading bug bounty platform securing the Web3 ecosystem.",
  markets: ["United States", "Singapore", "United Kingdom", "Switzerland"],
  competitors: [
    { name: "HackerOne", url: "https://hackerone.com", strength: "Medium", whatToLearn: "Enterprise sales and compliance" },
    { name: "Code4rena", url: "https://code4rena.com", strength: "Weak", whatToLearn: "Community auditing approach" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/immunefi", github: "https://github.com/immunefi", twitter: "https://x.com/immunefi" },
  growthChannels: [
    { name: "GitHub", category: "GitHub", priority: "Critical", reason: "Core channel for security researcher community", estimatedROI: "Very High" },
    { name: "X", category: "X", priority: "High", reason: "Crypto-native security announcements", estimatedROI: "High" },
    { name: "Crypto Newsletters", category: "Newsletter", priority: "High", reason: "Protocol security team outreach", estimatedROI: "High" },
    { name: "Security Conferences", category: "Events", priority: "Medium", reason: "Industry presence and credibility", estimatedROI: "Medium" },
    { name: "Discord", category: "Discord", priority: "Medium", reason: "Researcher community coordination", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "product", label: "Product Signal", description: "Expanding beyond crypto into general Web3 security", weight: 85, confidence: 80, updatedAt: "2026-06-03" },
    { type: "hiring", label: "Hiring Signal", description: "Aggressive hiring across security research and BD", weight: 75, confidence: 70, updatedAt: "2026-06-10" },
    { type: "partner", label: "Partner Signal", description: "New integrations with major L1 protocols", weight: 80, confidence: 75, updatedAt: "2026-06-14" },
  ],
  pricing: "Commission-based + Enterprise",
  stage: "Growth",
});

register({
  id: "near",
  name: "NEAR",
  website: "https://near.org",
  industry: "L1 Blockchain",
  category: "Web3 / Crypto",
  country: "Switzerland",
  headquarters: "Zug, Switzerland",
  businessModel: "Protocol / L1 Blockchain",
  estimatedStage: "Growth Stage",
  fundingStage: "Public Company / Token",
  employeeSize: "201-500",
  targetCustomer: "Web3 Developers and Enterprises",
  productDescription: "Developer-friendly L1 blockchain with sharding",
  description: "NEAR is a developer-focused L1 blockchain with human-readable accounts and sharding.",
  markets: ["United States", "Singapore", "Japan", "South Korea", "Germany"],
  competitors: [
    { name: "Ethereum", url: "https://ethereum.org", strength: "Strong", whatToLearn: "Ecosystem depth and composability" },
    { name: "Solana", url: "https://solana.com", strength: "Strong", whatToLearn: "Developer experience and speed" },
    { name: "Polkadot", url: "https://polkadot.network", strength: "Medium", whatToLearn: "Interoperability and parachain model" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/near", github: "https://github.com/near", twitter: "https://x.com/near" },
  growthChannels: [
    { name: "Developer Communities", category: "Developer", priority: "Critical", reason: "Developer adoption is core to L1 growth", estimatedROI: "Very High" },
    { name: "X", category: "X", priority: "Critical", reason: "Primary crypto community engagement channel", estimatedROI: "Very High" },
    { name: "Discord", category: "Discord", priority: "High", reason: "Developer support and community building", estimatedROI: "High" },
    { name: "Hackathons", category: "Events", priority: "High", reason: "Drive developer onboarding and project launches", estimatedROI: "High" },
    { name: "YouTube", category: "YouTube", priority: "Medium", reason: "Educational content for onboarding new developers", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "ecosystem", label: "Ecosystem Signal", description: "200+ active projects building on NEAR", weight: 85, confidence: 80, updatedAt: "2026-06-04" },
    { type: "community", label: "Community Signal", description: "Active regional communities across 15 countries", weight: 80, confidence: 75, updatedAt: "2026-06-11" },
    { type: "product", label: "Product Signal", description: "Sharding upgrade improved TPS by 10x", weight: 90, confidence: 85, updatedAt: "2026-06-15" },
  ],
  pricing: "Gas-based (protocol)",
  stage: "Mature",
});

register({
  id: "sui",
  name: "Sui",
  website: "https://sui.io",
  industry: "L1 Blockchain",
  category: "Web3 / Crypto",
  country: "United States",
  headquarters: "San Francisco, CA",
  businessModel: "Protocol / L1 Blockchain",
  estimatedStage: "Series B",
  fundingStage: "Series B ($50M+)",
  employeeSize: "201-500",
  targetCustomer: "Web3 Developers and Gaming Studios",
  productDescription: "Move-based L1 blockchain for high-throughput applications",
  description: "Sui is a high-performance L1 blockchain built on the Move language.",
  markets: ["United States", "Japan", "South Korea", "Singapore"],
  competitors: [
    { name: "Solana", url: "https://solana.com", strength: "Strong", whatToLearn: "High-throughput execution and validator network" },
    { name: "Aptos", url: "https://aptoslabs.com", strength: "Medium", whatToLearn: "Move language ecosystem development" },
    { name: "Monad", url: "https://monad.xyz", strength: "Medium", whatToLearn: "EVM compatibility advantage" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/sui", github: "https://github.com/sui", twitter: "https://x.com/sui" },
  growthChannels: [
    { name: "Developer Communities", category: "Developer", priority: "Critical", reason: "Developer adoption through Move language", estimatedROI: "Very High" },
    { name: "X", category: "X", priority: "Critical", reason: "Gaming and DeFi community engagement", estimatedROI: "Very High" },
    { name: "Discord", category: "Discord", priority: "High", reason: "Developer support and gaming community", estimatedROI: "High" },
    { name: "YouTube", category: "YouTube", priority: "Medium", reason: "Gaming and Move language tutorials", estimatedROI: "Medium" },
    { name: "Telegram", category: "Telegram", priority: "Medium", reason: "Asian community engagement", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "ecosystem", label: "Ecosystem Signal", description: "DeFi TVL growing 25% month-over-month", weight: 85, confidence: 80, updatedAt: "2026-06-06" },
    { type: "gaming", label: "Gaming Signal", description: "5 major gaming partnerships announced", weight: 80, confidence: 75, updatedAt: "2026-06-12" },
    { type: "hiring", label: "Hiring Signal", description: "Scaling team across engineering and ecosystem", weight: 75, confidence: 70, updatedAt: "2026-06-14" },
  ],
  pricing: "Gas-based (protocol)",
  stage: "Growth",
});

register({
  id: "magiceden",
  name: "Magic Eden",
  website: "https://magiceden.io",
  industry: "NFT Marketplace",
  category: "Web3 / Crypto",
  country: "United States",
  headquarters: "San Francisco, CA",
  businessModel: "B2C Marketplace",
  estimatedStage: "Series B",
  fundingStage: "Series B ($30M+)",
  employeeSize: "51-200",
  targetCustomer: "NFT Traders and Collectors",
  productDescription: "Multi-chain NFT marketplace and platform",
  description: "Magic Eden is the leading multi-chain NFT marketplace spanning Solana, Ethereum, and Bitcoin.",
  markets: ["United States", "Japan", "Singapore", "United Kingdom"],
  competitors: [
    { name: "OpenSea", url: "https://opensea.io", strength: "Strong", whatToLearn: "Brand recognition and first-mover advantage" },
    { name: "Blur", url: "https://blur.io", strength: "Medium", whatToLearn: "Professional trading features and liquidity" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/magiceden", github: "https://github.com/magiceden", twitter: "https://x.com/magiceden" },
  growthChannels: [
    { name: "X", category: "X", priority: "Critical", reason: "NFT community is primarily on X", estimatedROI: "Very High" },
    { name: "Discord", category: "Discord", priority: "Critical", reason: "Core community and trading discussions", estimatedROI: "Very High" },
    { name: "Influencer Partnerships", category: "Media", priority: "High", reason: "NFT influencers drive collection launches", estimatedROI: "High" },
    { name: "Telegram", category: "Telegram", priority: "Medium", reason: "Asian market community engagement", estimatedROI: "Medium" },
  ],
  signals: [
    { type: "product", label: "Product Signal", description: "Bitcoin Ordinals integration opened new market", weight: 85, confidence: 80, updatedAt: "2026-06-08" },
    { type: "volume", label: "Volume Signal", description: "Monthly trading volume up 40% after cross-chain launch", weight: 80, confidence: 75, updatedAt: "2026-06-13" },
  ],
  pricing: "Fee-based (2% marketplace fee)",
  stage: "Mature",
});

register({
  id: "kraken",
  name: "Kraken",
  website: "https://kraken.com",
  industry: "Financial Technology",
  category: "Fintech / Crypto",
  country: "United States",
  headquarters: "San Francisco, CA",
  businessModel: "B2C/B2B Exchange",
  estimatedStage: "Growth Stage",
  fundingStage: "Private Company",
  employeeSize: "500+",
  targetCustomer: "Crypto Traders and Institutional Investors",
  productDescription: "Leading US-regulated cryptocurrency exchange",
  description: "Kraken is one of the largest and most regulated crypto exchanges in the world.",
  markets: ["United States", "United Kingdom", "Singapore", "Japan", "Germany"],
  competitors: [
    { name: "Coinbase", url: "https://coinbase.com", strength: "Strong", whatToLearn: "Retail user experience and listing strategy" },
    { name: "Binance", url: "https://binance.com", strength: "Strong", whatToLearn: "Global expansion and product breadth" },
    { name: "Backpack", url: "https://backpack.app", strength: "Medium", whatToLearn: "Regulatory compliance approach" },
  ],
  socialLinks: { linkedin: "https://linkedin.com/company/kraken", github: "https://github.com/kraken", twitter: "https://x.com/kraken" },
  growthChannels: [
    { name: "LinkedIn", category: "LinkedIn", priority: "Critical", reason: "Institutional and enterprise outreach", estimatedROI: "Very High" },
    { name: "Crypto Newsletters", category: "Newsletter", priority: "High", reason: "Regulatory updates and product announcements", estimatedROI: "High" },
    { name: "X", category: "X", priority: "High", reason: "Crypto community and customer engagement", estimatedROI: "High" },
    { name: "Enterprise Partnerships", category: "Enterprise", priority: "High", reason: "Institutional custody and trading partnerships", estimatedROI: "Very High" },
  ],
  signals: [
    { type: "regulatory", label: "Regulatory Signal", description: "Licensed in 50+ jurisdictions globally", weight: 90, confidence: 95, updatedAt: "2026-06-01" },
    { type: "product", label: "Product Signal", description: "New staking and custody products for institutions", weight: 85, confidence: 80, updatedAt: "2026-06-10" },
    { type: "volume", label: "Volume Signal", description: "Institutional trading volume up 60% YoY", weight: 80, confidence: 85, updatedAt: "2026-06-14" },
  ],
  pricing: "Fee-based (maker/taker)",
  stage: "Mature",
});

// ========== Generic Fallback ==========

function generateGeneric(url: string): Company {
  const name = companyNameFromUrl(url);
  const industry = detectIndustry(url);
  return {
    id: name.toLowerCase(),
    name,
    website: url,
    industry,
    category: industry,
    country: "United States",
    headquarters: "San Francisco, CA",
    businessModel: "B2B Digital Platform",
    estimatedStage: "Series A",
    fundingStage: "Series A ($10M)",
    employeeSize: "11-50",
    targetCustomer: "Businesses and Enterprises",
    productDescription: `${name} is building a modern platform for the ${industry} market.`,
    description: `${name} is an innovative company operating in the ${industry} space.`,
    markets: ["United States", "Singapore", "United Kingdom"],
    competitors: [
      { name: "Industry Leader", url: "https://industry-leader.com", strength: "Strong", whatToLearn: "Market dominance and scale" },
      { name: "Emerging Competitor", url: "https://emerging-competitor.io", strength: "Medium", whatToLearn: "Growth strategy and differentiation" },
    ],
    socialLinks: {
      linkedin: `https://linkedin.com/company/${name.toLowerCase()}`,
      github: `https://github.com/${name.toLowerCase()}`,
      twitter: `https://x.com/${name.toLowerCase()}`,
    },
    growthChannels: [
      { name: "LinkedIn", category: "LinkedIn", priority: "High", reason: "B2B decision-maker acquisition", estimatedROI: "High" },
      { name: "Developer Communities", category: "Developer", priority: "Medium", reason: "Technical audience development", estimatedROI: "Medium" },
      { name: "Content Marketing", category: "Content", priority: "High", reason: "SEO-driven organic acquisition", estimatedROI: "High" },
    ],
    signals: [
      { type: "product", label: "Product Signal", description: "Active product development with regular releases", weight: 70, confidence: 65, updatedAt: "2026-06-10" },
    ],
    pricing: "Subscription + Enterprise",
    stage: "Early",
  };
}

// ========== Public API ==========

export function getCompanyByUrl(url: string): Company {
  const normalized = url.toLowerCase().replace(/https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  const match = Object.values(companiesById).find(
    (c) => c.website.toLowerCase().includes(normalized) || normalized.includes(c.id)
  );
  return match || generateGeneric(url);
}

export function getAllCompanies(): Company[] {
  return Object.values(companiesById);
}

export { companiesById };
