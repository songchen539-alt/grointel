// GroIntel Growth Passport Seed Script
// Run: node scripts/seed-passports.js

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://grointel.vercel.app";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = async (url, opts = {}) => {
  const res = await fetch(BASE + url, {
    method: opts.method || "POST",
    headers: { "Content-Type": "application/json", ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
};

const ENTITIES = [
  // 20 Companies
  { type: "company", name: "Stripe", slug: "stripe", website: "https://stripe.com", country: "US", industry: "Fintech", headline: "Payments infrastructure for internet businesses" },
  { type: "company", name: "OpenAI", slug: "openai", website: "https://openai.com", country: "US", industry: "AI", headline: "Frontier AI research and deployment" },
  { type: "company", name: "Anthropic", slug: "anthropic", website: "https://anthropic.com", country: "US", industry: "AI", headline: "AI safety and research" },
  { type: "company", name: "Vercel", slug: "vercel", website: "https://vercel.com", country: "US", industry: "Developer Tools", headline: "Frontend deployment platform" },
  { type: "company", name: "Notion", slug: "notion", website: "https://notion.so", country: "US", industry: "SaaS", headline: "All-in-one workspace" },
  { type: "company", name: "Ramp", slug: "ramp", website: "https://ramp.com", country: "US", industry: "Fintech", headline: "Corporate card and spend management" },
  { type: "company", name: "Rippling", slug: "rippling", website: "https://rippling.com", country: "US", industry: "HR SaaS", headline: "Workforce management platform" },
  { type: "company", name: "Cursor", slug: "cursor", website: "https://cursor.com", country: "US", industry: "Developer Tools", headline: "AI-first code editor" },
  { type: "company", name: "Perplexity", slug: "perplexity", website: "https://perplexity.ai", country: "US", industry: "AI", headline: "AI-powered answer engine" },
  { type: "company", name: "Clay", slug: "clay", website: "https://clay.com", country: "US", industry: "GTM AI", headline: "GTM data and workflow platform" },
  { type: "company", name: "ElevenLabs", slug: "elevenlabs", website: "https://elevenlabs.io", country: "US", industry: "AI Audio", headline: "AI voice synthesis" },
  { type: "company", name: "Runway", slug: "runway", website: "https://runwayml.com", country: "US", industry: "AI Video", headline: "AI video generation platform" },
  { type: "company", name: "Mistral AI", slug: "mistral", website: "https://mistral.ai", country: "FR", industry: "AI", headline: "Open-source AI models" },
  { type: "company", name: "Glean", slug: "glean", website: "https://glean.com", country: "US", industry: "Enterprise AI", headline: "Enterprise AI search" },
  { type: "company", name: "Replit", slug: "replit", website: "https://replit.com", country: "US", industry: "Developer Tools", headline: "Online IDE and deployment" },
  { type: "company", name: "Alchemy", slug: "alchemy", website: "https://alchemy.com", country: "US", industry: "Web3", headline: "Blockchain developer platform" },
  { type: "company", name: "Monad", slug: "monad", website: "https://monad.xyz", country: "US", industry: "L1 Blockchain", headline: "High-performance L1 blockchain" },
  { type: "company", name: "Sierra", slug: "sierra", website: "https://sierra.ai", country: "US", industry: "AI", headline: "Conversational AI platform" },
  { type: "company", name: "Harvey", slug: "harvey", website: "https://harvey.ai", country: "US", industry: "Legal AI", headline: "AI for legal professionals" },
  { type: "company", name: "Groq", slug: "groq", website: "https://groq.com", country: "US", industry: "AI Infrastructure", headline: "AI inference hardware and cloud" },

  // 20 Agencies
  { type: "agency", name: "Growth Agency SEA", slug: "growth-seas", website: "https://grogrowth.com", country: "SG", industry: "Growth Marketing", headline: "SEA market entry experts" },
  { type: "agency", name: "ContentLab", slug: "content-lab", website: "https://contentlab.io", country: "US", industry: "Content Marketing", headline: "Content marketing for B2B SaaS" },
  { type: "agency", name: "SEOverflow", slug: "seo-overflow", website: "https://seoverflow.com", country: "IN", industry: "SEO", headline: "Technical SEO for growth companies" },
  { type: "agency", name: "PaidMasters", slug: "paid-masters", website: "https://paidmasters.co", country: "US", industry: "Paid Ads", headline: "Performance marketing agency" },
  { type: "agency", name: "PR Wire", slug: "pr-wire", website: "https://prwire.agency", country: "US", industry: "PR", headline: "PR for tech startups" },
  { type: "agency", name: "Community Builders", slug: "community-builders", website: "https://communitybuilders.io", country: "CA", industry: "Community", headline: "Developer community building" },
  { type: "agency", name: "Partnership Pro", slug: "partnership-pro", website: "https://partnershippro.com", country: "US", industry: "Partnerships", headline: "Strategic partnership development" },
  { type: "agency", name: "BrandForge", slug: "brand-forge", website: "https://brandforge.co", country: "UK", industry: "Branding", headline: "Brand strategy for startups" },
  { type: "agency", name: "LeadGen Labs", slug: "leadgen-labs", website: "https://leadgenlabs.io", country: "US", industry: "Lead Generation", headline: "B2B lead generation" },
  { type: "agency", name: "VideoRocket", slug: "video-rocket", website: "https://videorocket.tv", country: "US", industry: "Video Production", headline: "Video marketing for tech" },
  { type: "agency", name: "SocialFlow", slug: "social-flow", website: "https://socialflow.agency", country: "UK", industry: "Social Media", headline: "Social media management for B2B" },
  { type: "agency", name: "EmailEngine", slug: "email-engine", website: "https://emailengine.co", country: "US", industry: "Email Marketing", headline: "Email marketing and automation" },
  { type: "agency", name: "Web3 Growth Labs", slug: "web3-growth", website: "https://web3growthlabs.xyz", country: "SG", industry: "Web3 Marketing", headline: "Growth marketing for web3 projects" },
  { type: "agency", name: "RevOps Crew", slug: "revops-crew", website: "https://revopscrew.com", country: "US", industry: "RevOps", headline: "Revenue operations consulting" },
  { type: "agency", name: "Influencer Connect", slug: "influencer-connect", website: "https://influencerconnect.io", country: "US", industry: "Influencer Marketing", headline: "B2B influencer marketing" },
  { type: "agency", name: "APAC Launchpad", slug: "apac-launchpad", website: "https://apaclaunchpad.com", country: "SG", industry: "Market Entry", headline: "APAC market entry consulting" },
  { type: "agency", name: "CRO Studio", slug: "cro-studio", website: "https://crostudio.co", country: "UK", industry: "CRO", headline: "Conversion rate optimization" },
  { type: "agency", name: "DevRel Agency", slug: "devrel-agency", website: "https://devrelagency.com", country: "US", industry: "Developer Relations", headline: "Developer relations programs" },
  { type: "agency", name: "Growth Content", slug: "growth-content", website: "https://growthcontent.io", country: "CA", industry: "Content", headline: "SEO content for SaaS" },
  { type: "agency", name: "AsiaBridge", slug: "asia-bridge", website: "https://asiabridge.co", country: "JP", industry: "Market Entry", headline: "Japan and Korea market entry" },

  // 20 Creators
  { type: "creator", name: "Alex Hormozi", slug: "alex-hormozi", website: "https://acquisition.com", country: "US", industry: "Business", headline: "Business growth content" },
  { type: "creator", name: "Julian Shapiro", slug: "julian-shapiro", website: "https://shapiro.co", country: "US", industry: "Startups", headline: "Startup growth essays" },
  { type: "creator", name: "Lenny Rachitsky", slug: "lenny", website: "https://lennysnewsletter.com", country: "US", industry: "Product", headline: "Product growth insights" },
  { type: "creator", name: "Shane Parrish", slug: "farnam-street", website: "https://fs.blog", country: "CA", industry: "Thinking", headline: "Mental models and decision-making" },
  { type: "creator", name: "David Perell", slug: "david-perell", website: "https://perell.com", country: "US", industry: "Writing", headline: "Online writing and distribution" },
  { type: "creator", name: "Sahil Bloom", slug: "sahil-bloom", website: "https://sahilbloom.com", country: "US", industry: "Finance", headline: "Personal finance and growth" },
  { type: "creator", name: "Dan Koe", slug: "dan-koe", website: "https://dankoehq.com", country: "US", industry: "Creator Economy", headline: "Creator business education" },
  { type: "creator", name: "Dickie Bush", slug: "dickie-bush", website: "https://dickiebush.com", country: "US", industry: "Writing", headline: "Digital writing cohort" },
  { type: "creator", name: "Nicolas Cole", slug: "nicolas-cole", website: "https://nicolascole.com", country: "US", industry: "Writing", headline: "Writing and content strategy" },
  { type: "creator", name: "Harry Dry", slug: "harry-dry", website: "https://marketingexamples.com", country: "UK", industry: "Marketing", headline: "Marketing examples newsletter" },
  { type: "creator", name: "Katelyn Bourgoin", slug: "katelyn-bourgoin", website: "https://customercamp.com", country: "CA", industry: "Customer Research", headline: "Customer psychology insights" },
  { type: "creator", name: "TJ Walker", slug: "tj-walker", website: "https://tjwalker.com", country: "US", industry: "Communication", headline: "Media training and communication" },
  { type: "creator", name: "Justin Welsh", slug: "justin-welsh", website: "https://justinwelsh.me", country: "US", industry: "SaaS", headline: "SaaS solo founder insights" },
  { type: "creator", name: "Simon Sinek", slug: "simon-sinek", website: "https://simonsinek.com", country: "US", industry: "Leadership", headline: "Leadership and purpose" },
  { type: "creator", name: "James Clear", slug: "james-clear", website: "https://jamesclear.com", country: "US", industry: "Habits", headline: "Habits and atomic growth" },
  { type: "creator", name: "Tim Ferriss", slug: "tim-ferriss", website: "https://tim.blog", country: "US", industry: "Lifestyle", headline: "Lifestyle design and optimization" },
  { type: "creator", name: "Sam Parr", slug: "sam-parr", website: "https://thehustle.co", country: "US", industry: "Business", headline: "Business newsletter and podcast" },
  { type: "creator", name: "My First Million", slug: "my-first-million", website: "https://myfirstmillion.com", country: "US", industry: "Startups", headline: "Startup ideas and business breakdowns" },
  { type: "creator", name: "Morning Brew", slug: "morning-brew", website: "https://morningbrew.com", country: "US", industry: "News", headline: "Daily business newsletter" },
  { type: "creator", name: "Milk Road", slug: "milk-road", website: "https://milkroad.com", country: "US", industry: "Crypto", headline: "Crypto and web3 newsletter" },

  // 10 Communities
  { type: "community", name: "Indie Hackers", slug: "indie-hackers", website: "https://indiehackers.com", country: "US", industry: "Startups", headline: "Independent maker community" },
  { type: "community", name: "GrowthHackers", slug: "growthhackers", website: "https://growthhackers.com", country: "US", industry: "Growth", headline: "Growth hacking community" },
  { type: "community", name: "Product Hunt", slug: "product-hunt", website: "https://producthunt.com", country: "US", industry: "Product", headline: "Product discovery community" },
  { type: "community", name: "Hacker News", slug: "hacker-news", website: "https://news.ycombinator.com", country: "US", industry: "Tech", headline: "Tech news and discussion" },
  { type: "community", name: "Dev.to", slug: "dev-to", website: "https://dev.to", country: "US", industry: "Developer", headline: "Developer community" },
  { type: "community", name: "Women in Tech", slug: "women-in-tech", website: "https://womenintech.com", country: "US", industry: "Diversity", headline: "Women in technology community" },
  { type: "community", name: "Web3 Foundation", slug: "web3-foundation", website: "https://web3.foundation", country: "CH", industry: "Web3", headline: "Web3 ecosystem community" },
  { type: "community", name: "DAO Masters", slug: "dao-masters", website: "https://daomasters.xyz", country: "US", industry: "DAO", headline: "DAO governance community" },
  { type: "community", name: "SaaS Labs", slug: "saas-labs", website: "https://saaslabs.co", country: "US", industry: "SaaS", headline: "SaaS founder community" },
  { type: "community", name: "AI Builders", slug: "ai-builders", website: "https://aibuilders.io", country: "US", industry: "AI", headline: "AI builders community" },

  // 10 Podcasts
  { type: "podcast", name: "The Tim Ferriss Show", slug: "tim-ferriss-show", website: "https://tim.blog/podcast", country: "US", industry: "Lifestyle", headline: "World-class performer interviews" },
  { type: "podcast", name: "My First Million", slug: "mfm-podcast", website: "https://myfirstmillion.com/podcast", country: "US", industry: "Startups", headline: "Business ideas and opportunities" },
  { type: "podcast", name: "How I Built This", slug: "how-i-built-this", website: "https://npr.org/howibuiltthis", country: "US", industry: "Entrepreneurship", headline: "Founder stories" },
  { type: "podcast", name: "Acquired", slug: "acquired", website: "https://acquired.fm", country: "US", industry: "Business", headline: "Company deep dives" },
  { type: "podcast", name: "Lenny's Podcast", slug: "lennys-podcast", website: "https://lennyspodcast.com", country: "US", industry: "Product", headline: "Product and growth interviews" },
  { type: "podcast", name: "The Startup Chat", slug: "startup-chat", website: "https://thestartupchat.com", country: "US", industry: "Startups", headline: "Startup advice" },
  { type: "podcast", name: "Growth Marketing Podcast", slug: "growth-marketing-podcast", website: "https://growthmarketingpodcast.com", country: "US", industry: "Marketing", headline: "Growth marketing strategies" },
  { type: "podcast", name: "The SaaS Podcast", slug: "saas-podcast", website: "https://thesaaspodcast.com", country: "US", industry: "SaaS", headline: "SaaS founder interviews" },
  { type: "podcast", name: "Web3 with a16z", slug: "web3-a16z", website: "https://a16z.com/podcasts", country: "US", industry: "Web3", headline: "Web3 and crypto insights" },
  { type: "podcast", name: "AI Today", slug: "ai-today", website: "https://aitodaypodcast.com", country: "US", industry: "AI", headline: "AI industry analysis" },

  // 10 Newsletters
  { type: "newsletter", name: "The Hustle", slug: "the-hustle", website: "https://thehustle.co", country: "US", industry: "Business", headline: "Daily business news" },
  { type: "newsletter", name: "Morning Brew", slug: "mb-newsletter", website: "https://morningbrew.com", country: "US", industry: "News", headline: "Daily business newsletter" },
  { type: "newsletter", name: "Milk Road", slug: "mr-newsletter", website: "https://milkroad.com", country: "US", industry: "Crypto", headline: "Daily crypto newsletter" },
  { type: "newsletter", name: "Trends", slug: "trends", website: "https://trends.co", country: "US", industry: "Business", headline: "Business trend analysis" },
  { type: "newsletter", name: "Growth in Reverse", slug: "growth-in-reverse", website: "https://growthinreverse.com", country: "US", industry: "Growth", headline: "Growth analysis newsletter" },
  { type: "newsletter", name: "Product Lessons", slug: "product-lessons", website: "https://productlessons.com", country: "US", industry: "Product", headline: "Product management insights" },
  { type: "newsletter", name: "The SaaS Review", slug: "saas-review", website: "https://saasreview.co", country: "US", industry: "SaaS", headline: "SaaS industry analysis" },
  { type: "newsletter", name: "AI Edge", slug: "ai-edge", website: "https://aiedge.io", country: "US", industry: "AI", headline: "AI industry newsletter" },
  { type: "newsletter", name: "The Wallet", slug: "the-wallet", website: "https://thewallet.co", country: "US", industry: "Finance", headline: "Personal finance newsletter" },
  { type: "newsletter", name: "Not Boring", slug: "not-boring", website: "https://notboring.co", country: "US", industry: "Tech", headline: "Deep tech analysis" },

  // 10 Media
  { type: "media", name: "TechCrunch", slug: "techcrunch", website: "https://techcrunch.com", country: "US", industry: "Tech News", headline: "Startup and tech news" },
  { type: "media", name: "The Verge", slug: "the-verge", website: "https://theverge.com", country: "US", industry: "Tech", headline: "Technology news and reviews" },
  { type: "media", name: "Wired", slug: "wired", website: "https://wired.com", country: "US", industry: "Tech", headline: "Technology and culture" },
  { type: "media", name: "Business Insider", slug: "business-insider", website: "https://businessinsider.com", country: "US", industry: "Business", headline: "Business and finance news" },
  { type: "media", name: "Forbes", slug: "forbes", website: "https://forbes.com", country: "US", industry: "Business", headline: "Business and entrepreneurship" },
  { type: "media", name: "Bloomberg", slug: "bloomberg", website: "https://bloomberg.com", country: "US", industry: "Finance", headline: "Financial news and data" },
  { type: "media", name: "The Information", slug: "the-information", website: "https://theinformation.com", country: "US", industry: "Tech", headline: "Deep tech journalism" },
  { type: "media", name: "PitchBook", slug: "pitchbook", website: "https://pitchbook.com", country: "US", industry: "VC Data", headline: "VC and startup data" },
  { type: "media", name: "CoinDesk", slug: "coindesk", website: "https://coindesk.com", country: "US", industry: "Crypto", headline: "Crypto and blockchain news" },
  { type: "media", name: "The Block", slug: "the-block", website: "https://theblock.co", country: "US", industry: "Crypto", headline: "Crypto research and news" },
];

async function run() {
  console.log("=== Growth Passport Seed ===\n");
  let created = 0, skipped = 0;

  for (const e of ENTITIES) {
    // Check if slug exists
    const existing = await api("/api/entities", { method: "GET" });
    if (existing.entities?.find((x) => x.slug === e.slug)) {
      console.log(`  SKIP: ${e.name} (already exists)`);
      skipped++;
      continue;
    }

    // Create entity
    const entity = await api("/api/entities", {
      method: "POST",
      body: { entity_type: e.type, display_name: e.name, slug: e.slug, website: e.website, country: e.country, status: "active", visibility: "public" },
    });
    if (!entity.success || !entity.entity) {
      console.log(`  FAIL: ${e.name} - ${entity.error || "Entity creation failed"}`);
      continue;
    }
    const eid = entity.entity.id;

    // Create passport
    const passport = await api("/api/passports", {
      method: "POST",
      body: { entity_id: eid, headline: e.headline, primary_industry: e.industry, primary_region: "Global", overall_completion: 30 },
    });
    if (!passport.success || !passport.passport) {
      console.log(`  FAIL: ${e.name} - ${passport.error || "Passport creation failed"}`);
      continue;
    }
    const pid = passport.passport.id;

    console.log(`  CREATED: ${e.name} (${e.type}) -> entity=${eid.slice(0,8)} passport=${pid.slice(0,8)}`);
    created++;
    await sleep(200);
  }

  console.log(`\nCreated: ${created}, Skipped: ${skipped}, Total: ${created + skipped}`);
  console.log("DONE");
}

run().catch(console.error);
