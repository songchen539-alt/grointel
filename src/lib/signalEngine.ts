// GroIntel Signal Engine
// 10 signal types explaining why this company is worth growing now.
// Each signal is an independent data source for AI replacement.

import { Company, Signal } from "@/types/company";

export function getCompanySignals(company: Company): Signal[] {
  const seed = company.website.length + company.name.length;
  const now = new Date().toISOString();

  return [
    {
      type: "funding",
      label: "Funding Signal",
      description: company.fundingStage.includes("$50M")
        ? "Significant capital raise signals strong investor confidence and growth runway."
        : company.fundingStage.includes("Series A")
        ? "Recent institutional funding provides resources for market expansion."
        : "Seed-stage company with early investor validation.",
      weight: 85,
      confidence: 60 + (seed * 7) % 35,
      updatedAt: now,
    },
    {
      type: "hiring",
      label: "Hiring Signal",
      description: company.employeeSize === "500+"
        ? "Large-scale hiring across multiple departments indicates aggressive scaling."
        : company.employeeSize === "51-200" || company.employeeSize === "201-500"
        ? "Growing team size suggests product-market fit and scaling phase."
        : "Small team. Hiring signals indicate early growth stage.",
      weight: 70,
      confidence: 50 + (seed * 11) % 35,
      updatedAt: now,
    },
    {
      type: "seo",
      label: "SEO Signal",
      description: "Organic search presence correlates with brand demand and inbound lead generation.",
      weight: 60,
      confidence: 40 + (seed * 9) % 40,
      updatedAt: now,
    },
    {
      type: "traffic",
      label: "Traffic Signal",
      description: "Website traffic trends indicate market interest and brand awareness momentum.",
      weight: 65,
      confidence: 45 + (seed * 13) % 35,
      updatedAt: now,
    },
    {
      type: "social",
      label: "Social Signal",
      description: company.socialLinks.twitter
        ? "Active social presence with community engagement across platforms."
        : "Limited social media footprint and community engagement.",
      weight: 60,
      confidence: 55 + (seed * 7) % 35,
      updatedAt: now,
    },
    {
      type: "github",
      label: "GitHub Signal",
      description: company.socialLinks.github.includes("github.com")
        ? "GitHub presence indicates developer engagement and open-source credibility."
        : "No significant GitHub activity detected.",
      weight: 75,
      confidence: 50 + (seed * 17) % 40,
      updatedAt: now,
    },
    {
      type: "product",
      label: "Product Signal",
      description: company.stage === "Mature"
        ? "Mature product with established market fit and revenue stream."
        : company.stage === "Growth"
        ? "Product in growth phase with expanding feature set and user base."
        : "Early-stage product actively developing core value proposition.",
      weight: 90,
      confidence: 65 + (seed * 9) % 30,
      updatedAt: now,
    },
    {
      type: "community",
      label: "Community Signal",
      description: company.growthChannels.some(c => ["Discord", "Telegram", "Developer Communities"].includes(c.name))
        ? "Active community channels indicate user engagement and retention potential."
        : "Limited community infrastructure. Opportunity to build.",
      weight: 70,
      confidence: 55 + (seed * 13) % 35,
      updatedAt: now,
    },
    {
      type: "media",
      label: "Media Signal",
      description: "Media coverage and industry mentions impact brand credibility and partnership opportunities.",
      weight: 50,
      confidence: 35 + (seed * 11) % 40,
      updatedAt: now,
    },
    {
      type: "partner",
      label: "Partner Signal",
      description: company.competitors.length > 0
        ? "Ecosystem partnerships and integrations expand market reach."
        : "Limited partnership network. Opportunity for ecosystem development.",
      weight: 40,
      confidence: 30 + (seed * 7) % 35,
      updatedAt: now,
    },
  ];
}
