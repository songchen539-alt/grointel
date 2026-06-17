// GroIntel Intelligence Engine - Company Profiles
// Known companies with hand-tuned intelligence profiles.
// Unknown domains get a generic profile based on domain heuristics.
// Deterministic: same domain always returns same profile.

import { normalizeDomain, NormalizedDomain } from "./normalizeDomain";

export interface CompanyProfile {
  name: string;
  industry: string;
  stage: string;
  website: string;
  description: string;
  employeeCount: string;
  headquarters: string;
  knownSignals: string[];
}

function knownProfiles(): Map<string, CompanyProfile> {
  const map = new Map<string, CompanyProfile>();

  map.set("stripe.com", {
    name: "Stripe",
    industry: "Financial Technology",
    stage: "Growth Stage",
    website: "https://stripe.com",
    description: "Online payment infrastructure for internet businesses. Processes hundreds of billions in payment volume annually. Known for developer-first approach, strong API ecosystem, and global expansion across 45+ countries.",
    employeeCount: "500+",
    headquarters: "San Francisco, CA",
    knownSignals: [
      "Expanding into emerging markets in Southeast Asia and Latin America",
      "Enterprise revenue represents 60% of total opportunity",
      "Embedded finance market projected to reach $185B",
      "Developer communities drive 3x higher retention rates",
      "Strategic acquisitions of complementary fintech tools",
    ],
  });

  map.set("opengradient.ai", {
    name: "OpenGradient",
    industry: "AI Infrastructure",
    stage: "Early Stage",
    website: "https://opengradient.ai",
    description: "Decentralized AI compute platform. Building infrastructure for on-device AI inference and training. Focused on privacy-preserving AI and edge computing solutions.",
    employeeCount: "10-50",
    headquarters: "Remote",
    knownSignals: [
      "Growing demand for decentralized AI compute resources",
      "Strategic partnerships with blockchain infrastructure providers",
      "Developer adoption of on-device AI SDKs increasing quarterly",
      "Expanding into enterprise data privacy solutions",
    ],
  });

  map.set("monad.xyz", {
    name: "Monad",
    industry: "L1 Blockchain",
    stage: "Growth Stage",
    website: "https://monad.xyz",
    description: "High-performance Layer 1 blockchain designed for parallel execution. Focuses on developer experience through full Ethereum Virtual Machine compatibility.",
    employeeCount: "50-100",
    headquarters: "Remote",
    knownSignals: [
      "Strong developer community building on the platform",
      "Testnet launch generating significant ecosystem activity",
      "Strategic focus on DeFi and gaming verticals",
      "Partnerships with leading crypto infrastructure providers",
    ],
  });

  map.set("grointel.ai", {
    name: "GroIntel",
    industry: "SaaS / Business Intelligence",
    stage: "Early Stage",
    website: "https://grointel.ai",
    description: "AI-powered company intelligence platform. Provides Company MRI reports with growth scoring, signal detection, opportunity analysis, and actionable growth recommendations.",
    employeeCount: "1-10",
    headquarters: "Remote",
    knownSignals: [
      "Building the operating system for company intelligence",
      "Company MRI reports gaining traction with growth teams",
      "Focus on deterministic AI without API dependencies",
      "Targeting growth-stage technology companies as initial market",
    ],
  });

  return map;
}

export function getCompanyProfile(domain: NormalizedDomain): CompanyProfile {
  const profiles = knownProfiles();
  const profile = profiles.get(domain.domain);

  if (profile) {
    return profile;
  }

  // Generic profile for unknown domains based on heuristics
  const hostname = domain.hostname;
  const isTech = hostname.includes("ai") || hostname.includes("tech") || hostname.includes("io") || hostname.includes("labs");
  const isFintech = hostname.includes("pay") || hostname.includes("fin") || hostname.includes("bank") || hostname.includes("invest");
  const isWeb3 = hostname.includes("xyz") || hostname.includes("eth") || hostname.includes("crypto") || hostname.includes("chain") || hostname.includes("dao") || hostname.includes("swap");

  let industry = "Technology";
  let stage = "Growth Stage";
  let description = "";
  let signals: string[] = [];

  if (isFintech) {
    industry = "Financial Technology";
    description = `A digital financial services company operating through ${domain.domain}. Focused on modern payment and banking infrastructure.`;
    signals = [
      "Digital payment adoption driving market growth",
      "Competition from traditional financial institutions increasing",
      "Regulatory landscape evolving across operating markets",
      "Investment in mobile-first customer experience",
    ];
  } else if (isWeb3) {
    industry = "Web3 / Blockchain";
    description = `A blockchain-focused project operating through ${domain.domain}. Building decentralized infrastructure and applications.`;
    signals = [
      "Web3 ecosystem expanding with developer tooling improvements",
      "Market volatility impacting token-based business models",
      "Regulatory clarity improving in key jurisdictions",
      "Cross-chain interoperability becoming a competitive differentiator",
    ];
  } else if (isTech) {
    industry = "Technology";
    description = `A technology company operating through ${domain.domain}. Building software or technology products for a growing market.`;
    signals = [
      "Technology sector seeing increased investment in AI capabilities",
      "Talent competition intensifying for engineering roles",
      "Enterprise adoption of SaaS solutions continuing to grow",
      "Expanding into adjacent markets to capture more wallet share",
    ];
  } else {
    industry = "Technology";
    description = `A company operating through ${domain.domain}. Active in the technology and digital services space.`;
    signals = [
      "Digital transformation driving demand across industries",
      "Customer acquisition costs rising in core markets",
      "Potential for expansion into enterprise and mid-market segments",
      "Building brand awareness through content and community channels",
    ];
  }

  if (domain.domain.includes("early") || domain.domain.includes("beta") || hostname.length <= 3) {
    stage = "Early Stage";
  }

  return {
    name: domain.companyName,
    industry,
    stage,
    website: domain.url,
    description,
    employeeCount: "Unknown",
    headquarters: "Remote",
    knownSignals: signals,
  };
}
