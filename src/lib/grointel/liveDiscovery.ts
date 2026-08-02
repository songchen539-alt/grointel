import type { DailyIngestionCandidate, DailyIngestionSide } from "./dailyIngestion";

type DefiLlamaProtocol = {
  name?: string;
  slug?: string;
  url?: string;
  description?: string;
  category?: string;
  chains?: string[];
  tvl?: number;
  change_1d?: number;
  change_7d?: number;
  twitter?: string;
};

type MediaFeedSource = {
  id: string;
  name: string;
  url: string;
  identity: string;
  priority: number;
  baseTags: string[];
};

type ContentFeedSource = MediaFeedSource & {
  contentType: "newsletter" | "podcast" | "research";
  supplyKind: "kol" | "partner";
};

type ParsedFeedItem = {
  title: string;
  creator?: string;
  categories: string[];
};

type GitHubRepo = {
  full_name?: string;
  html_url?: string;
  description?: string;
  stargazers_count?: number;
  forks_count?: number;
  fork?: boolean;
  archived?: boolean;
  language?: string;
  topics?: string[];
  owner?: {
    login?: string;
    html_url?: string;
  };
};

export type LiveDiscoverySourceId = "defillama" | "web3_media_feeds" | "github_repos" | "youtube_creator_feeds" | "web3_content_feeds" | "web3_event_pages";

export type LiveDiscoverySourceResult = {
  attempted: boolean;
  success: boolean;
  source: LiveDiscoverySourceId;
  sourceUrl: string;
  side: DailyIngestionSide;
  latencyMs: number;
  rawCount: number;
  candidateCount: number;
  candidates: DailyIngestionCandidate[];
  error?: string;
};

export type LiveDiscoveryResult = {
  attempted: boolean;
  success: boolean;
  source: "multi_live";
  sourceUrl: string;
  latencyMs: number;
  rawCount: number;
  candidateCount: number;
  demandCandidateCount: number;
  supplyCandidateCount: number;
  candidates: DailyIngestionCandidate[];
  sources: LiveDiscoverySourceResult[];
  error?: string;
};

type LiveDiscoveryOptions = {
  limit?: number;
  timeoutMs?: number;
  demandLimit?: number;
  supplyLimit?: number;
};

type LiveCandidateWithQuality = DailyIngestionCandidate & {
  liveQualityScore?: number;
  liveSourceCoverage?: string[];
};

const DEFILLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols";
const GITHUB_SEARCH_URL = "https://api.github.com/search/repositories";
const DEFAULT_LIMIT = 80;
const DEFAULT_TIMEOUT_MS = 6000;

const WEB3_MEDIA_FEEDS: MediaFeedSource[] = [
  {
    id: "decrypt",
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    identity: "decrypt.co",
    priority: 86,
    baseTags: ["media", "culture", "news"],
  },
  {
    id: "the-defiant",
    name: "The Defiant",
    url: "https://thedefiant.io/api/feed",
    identity: "thedefiant.io",
    priority: 88,
    baseTags: ["media", "defi", "research"],
  },
  {
    id: "coindesk",
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    identity: "coindesk.com",
    priority: 88,
    baseTags: ["media", "news", "institutions"],
  },
  {
    id: "blockworks",
    name: "Blockworks",
    url: "https://blockworks.co/feed",
    identity: "blockworks.co",
    priority: 86,
    baseTags: ["media", "institutions", "podcast"],
  },
];

const YOUTUBE_CREATOR_FEEDS: MediaFeedSource[] = [
  {
    id: "bankless-youtube",
    name: "Bankless",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCAl9Ld79qaZxp9JzEOwd3aA",
    identity: "youtube.com/@Bankless",
    priority: 90,
    baseTags: ["youtube", "media", "ethereum", "education"],
  },
  {
    id: "coin-bureau-youtube",
    name: "Coin Bureau",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCqK_GSMbpiV8spgD3ZGloSw",
    identity: "youtube.com/@CoinBureau",
    priority: 88,
    baseTags: ["youtube", "retail", "education", "markets"],
  },
  {
    id: "whiteboard-crypto-youtube",
    name: "Whiteboard Crypto",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsYYksPHiGqXHPoHI-fm5sg",
    identity: "youtube.com/@WhiteboardCrypto",
    priority: 82,
    baseTags: ["youtube", "education", "retail", "explainers"],
  },
  {
    id: "the-defiant-youtube",
    name: "The Defiant",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCL0J4MLEdLP0-UyLu0hCktg",
    identity: "youtube.com/@TheDefiant",
    priority: 86,
    baseTags: ["youtube", "defi", "media", "research"],
  },
  {
    id: "unchained-youtube",
    name: "Unchained",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCWiiMnsnw5Isc2PP1to9nNw",
    identity: "youtube.com/@UnchainedCrypto",
    priority: 84,
    baseTags: ["youtube", "podcast", "founders", "policy"],
  },
];

const WEB3_CONTENT_FEEDS: ContentFeedSource[] = [
  {
    id: "ournetwork-newsletter",
    name: "OurNetwork",
    url: "https://ournetwork.substack.com/feed",
    identity: "ournetwork.substack.com",
    priority: 82,
    baseTags: ["newsletter", "analytics", "data", "research"],
    contentType: "newsletter",
    supplyKind: "partner",
  },
  {
    id: "empire-podcast",
    name: "Empire",
    url: "https://feeds.megaphone.fm/empire",
    identity: "blockworks.com/podcast/empire",
    priority: 84,
    baseTags: ["podcast", "media", "founders", "policy"],
    contentType: "podcast",
    supplyKind: "partner",
  },
  {
    id: "ethereum-foundation-blog",
    name: "Ethereum Foundation Blog",
    url: "https://blog.ethereum.org/feed.xml",
    identity: "blog.ethereum.org",
    priority: 86,
    baseTags: ["research", "ethereum", "developers", "ecosystem"],
    contentType: "research",
    supplyKind: "partner",
  },
  {
    id: "vitalik-blog",
    name: "Vitalik Buterin",
    url: "https://vitalik.eth.limo/feed.xml",
    identity: "vitalik.eth.limo",
    priority: 88,
    baseTags: ["research", "ethereum", "founder", "thought-leader"],
    contentType: "research",
    supplyKind: "kol",
  },
];

const WEB3_EVENT_PAGES: MediaFeedSource[] = [
  {
    id: "ethglobal",
    name: "ETHGlobal",
    url: "https://ethglobal.com/",
    identity: "ethglobal.com",
    priority: 88,
    baseTags: ["events", "hackathon", "developers", "ethereum", "community"],
  },
  {
    id: "devfolio",
    name: "Devfolio",
    url: "https://devfolio.co/hackathons",
    identity: "devfolio.co",
    priority: 80,
    baseTags: ["events", "hackathon", "developers", "community"],
  },
  {
    id: "token2049",
    name: "TOKEN2049",
    url: "https://www.token2049.com/",
    identity: "token2049.com",
    priority: 84,
    baseTags: ["events", "conference", "institutions", "global"],
  },
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeUrl(url: string) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function normalizeIdentityKey(candidate: DailyIngestionCandidate) {
  const identity = String(candidate.identity || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
  const name = slug(candidate.name || "");
  return `${candidate.side}:${identity || name}`;
}

function liveQualityScore(candidate: DailyIngestionCandidate, sourceCoverage: string[]) {
  const tagBreadth = Math.min(10, candidate.tags.length * 2);
  const sourceBonus = Math.min(12, sourceCoverage.length * 4);
  const liveSignalBonus = String(candidate.source || "").includes("_live") ? 5 : 0;
  const supplySpecificBonus = candidate.side === "supply" && candidate.tags.some((tag) => ["kol", "media", "creator", "newsletter", "podcast", "research"].includes(tag)) ? 5 : 0;
  const demandSpecificBonus = candidate.side === "demand" && candidate.tags.some((tag) => ["defi", "protocol", "developer", "github", "wallet"].includes(tag)) ? 5 : 0;
  return Math.round(clamp(candidate.priority * 0.68 + tagBreadth + sourceBonus + liveSignalBonus + supplySpecificBonus + demandSpecificBonus, 1, 100));
}

function withLiveQuality(candidate: DailyIngestionCandidate, sourceCoverage: string[]): LiveCandidateWithQuality {
  const coverage = Array.from(new Set(sourceCoverage));
  const score = liveQualityScore(candidate, coverage);
  return {
    ...candidate,
    priority: Math.max(candidate.priority, score),
    tags: Array.from(new Set(candidate.tags)).slice(0, 12),
    liveQualityScore: score,
    liveSourceCoverage: coverage,
    sourceCoverage: Array.from(new Set([...(candidate.sourceCoverage || []), ...coverage])),
    ingestionReason: `${candidate.ingestionReason} Live quality ${score}/100 from ${coverage.join(", ")}.`,
  };
}

function mergeLiveCandidates(sources: LiveDiscoverySourceResult[]) {
  const grouped = new Map<string, { candidate: DailyIngestionCandidate; coverage: string[] }>();
  for (const source of sources) {
    for (const candidate of source.candidates) {
      const key = normalizeIdentityKey(candidate);
      const current = grouped.get(key);
      if (!current) {
        grouped.set(key, { candidate, coverage: [source.source] });
        continue;
      }
      const mergedTags = Array.from(new Set([...current.candidate.tags, ...candidate.tags])).slice(0, 12);
      const betterCandidate = candidate.priority > current.candidate.priority ? candidate : current.candidate;
      grouped.set(key, {
        candidate: {
          ...betterCandidate,
          priority: Math.max(current.candidate.priority, candidate.priority),
          tags: mergedTags,
          ingestionReason: `${betterCandidate.ingestionReason} Cross-source live merge retained strongest profile for ${betterCandidate.name}.`,
        },
        coverage: Array.from(new Set([...current.coverage, source.source])),
      });
    }
  }
  return Array.from(grouped.values())
    .map(({ candidate, coverage }) => withLiveQuality(candidate, coverage))
    .sort((a, b) => (b.liveQualityScore || b.priority) - (a.liveQualityScore || a.priority) || a.name.localeCompare(b.name));
}

function stripXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripXml(match[1]) : "";
}

function extractTags(block: string, tag: string) {
  return Array.from(block.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")))
    .map((match) => stripXml(match[1]))
    .filter(Boolean);
}

function extractCategoryTerms(block: string) {
  return Array.from(block.matchAll(/<category\b[^>]*\bterm=["']([^"']+)["'][^>]*\/?>/gi))
    .map((match) => stripXml(match[1]))
    .filter(Boolean);
}

function identityFromProtocol(protocol: DefiLlamaProtocol) {
  const url = normalizeUrl(String(protocol.url || ""));
  if (url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    }
  }
  if (protocol.twitter) return `x.com/${String(protocol.twitter).replace(/^@/, "")}`;
  return slug(String(protocol.name || protocol.slug || ""));
}

function isUsableProtocol(protocol: DefiLlamaProtocol) {
  if (!protocol.name || !protocol.url) return false;
  if ((protocol.tvl || 0) < 500000) return false;
  if (["CEX", "Chain"].includes(String(protocol.category || ""))) return false;
  return true;
}

function protocolPriority(protocol: DefiLlamaProtocol) {
  const tvl = Math.max(1, protocol.tvl || 0);
  const tvlBonus = Math.log10(tvl) * 5;
  const chainBonus = Math.min(7, (protocol.chains || []).length);
  const momentumBonus = (protocol.change_7d || 0) > 0 ? 4 : (protocol.change_1d || 0) > 0 ? 2 : 0;
  const categoryBonus = ["Dexes", "Lending", "Liquid Staking", "Yield", "Derivatives", "Bridge"].includes(String(protocol.category || "")) ? 5 : 0;
  return Math.round(clamp(48 + tvlBonus + chainBonus + momentumBonus + categoryBonus, 55, 96));
}

function protocolTags(protocol: DefiLlamaProtocol) {
  const category = String(protocol.category || "protocol").toLowerCase().replace(/\s+/g, "-");
  const chainTags = (protocol.chains || []).slice(0, 4).map((chain) => chain.toLowerCase());
  return Array.from(new Set(["defi", "protocol", category, ...chainTags]));
}

function toProtocolCandidate(protocol: DefiLlamaProtocol): DailyIngestionCandidate {
  const name = String(protocol.name || protocol.slug || "Unknown Protocol");
  const category = String(protocol.category || "Web3 protocol");
  const chains = (protocol.chains || []).slice(0, 4).join(", ");
  return {
    id: `web3.live.demand.defillama.${slug(String(protocol.slug || name))}`,
    name,
    identity: identityFromProtocol(protocol),
    kind: "company",
    domain: `Web3 / ${category} protocol${chains ? ` across ${chains}` : ""}`,
    side: "demand",
    source: "defillama_live",
    priority: protocolPriority(protocol),
    tags: protocolTags(protocol),
    ingestionReason: "Live DefiLlama protocol discovered from real-world Web3 market and TVL data for demand-side growth matching.",
  };
}

function githubPriority(repo: GitHubRepo) {
  const stars = Math.max(0, repo.stargazers_count || 0);
  const forks = Math.max(0, repo.forks_count || 0);
  const starsBonus = Math.log10(stars + 1) * 8;
  const forksBonus = Math.log10(forks + 1) * 4;
  const topicBonus = Math.min(8, (repo.topics || []).length);
  return Math.round(clamp(52 + starsBonus + forksBonus + topicBonus, 58, 96));
}

function githubTags(repo: GitHubRepo) {
  const topics = (repo.topics || []).map((topic) => topic.toLowerCase()).filter(Boolean);
  const language = repo.language ? [repo.language.toLowerCase()] : [];
  const text = `${repo.full_name || ""} ${repo.description || ""} ${topics.join(" ")}`.toLowerCase();
  const inferred = [
    text.includes("ethereum") ? "ethereum" : "",
    text.includes("defi") ? "defi" : "",
    text.includes("wallet") ? "wallet" : "",
    text.includes("dao") ? "dao" : "",
    text.includes("nft") ? "nft" : "",
    text.includes("sdk") ? "developers" : "",
    text.includes("solana") ? "solana" : "",
    text.includes("bridge") ? "bridge" : "",
  ].filter(Boolean);
  return Array.from(new Set(["developer", "github", ...topics.slice(0, 5), ...language, ...inferred])).slice(0, 10);
}

function toGithubCandidate(repo: GitHubRepo): DailyIngestionCandidate {
  const fullName = String(repo.full_name || repo.owner?.login || "unknown/web3-repo");
  const owner = fullName.split("/")[0] || repo.owner?.login || fullName;
  const description = repo.description ? `: ${repo.description}` : "";
  return {
    id: `web3.live.demand.github.${slug(fullName)}`,
    name: fullName,
    identity: repo.html_url || repo.owner?.html_url || `https://github.com/${fullName}`,
    kind: "company",
    domain: `Web3 / open-source developer project${description}`,
    side: "demand",
    source: "github_live",
    priority: githubPriority(repo),
    tags: githubTags(repo),
    ingestionReason: `${owner} is a live GitHub Web3 developer project with ${(repo.stargazers_count || 0).toLocaleString()} stars and active open-source discovery signals.`,
  };
}

function topicTags(items: ParsedFeedItem[]) {
  const text = items
    .flatMap((item) => [item.title, ...item.categories])
    .join(" ")
    .toLowerCase();
  const pairs: Array<[string, string[]]> = [
    ["defi", ["defi", "dex", "lending", "yield", "staking"]],
    ["ethereum", ["ethereum", "eth", "layer 2", "l2", "base", "arbitrum"]],
    ["bitcoin", ["bitcoin", "btc", "ordinals"]],
    ["solana", ["solana", "sol"]],
    ["ai", ["ai", "agent", "artificial intelligence"]],
    ["markets", ["market", "price", "etf", "treasury", "stock"]],
    ["gaming", ["gaming", "game", "nft"]],
    ["security", ["hack", "exploit", "security", "scam"]],
    ["policy", ["sec", "regulation", "policy", "law"]],
  ];
  return pairs.filter(([, terms]) => terms.some((term) => text.includes(term))).map(([tag]) => tag);
}

function parseFeedItems(xml: string): ParsedFeedItem[] {
  return Array.from(xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)).map((match) => {
    const block = match[0];
    return {
      title: extractTag(block, "title"),
      creator: extractTag(block, "dc:creator") || extractTag(block, "name") || extractTag(block, "author") || undefined,
      categories: [...extractTags(block, "category"), ...extractCategoryTerms(block)],
    };
  }).filter((item) => item.title);
}


function parseEventPageItems(html: string, source: MediaFeedSource): ParsedFeedItem[] {
  const title = extractTag(html, "title") || source.name;
  const headings = Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .map((match) => stripXml(match[1]))
    .filter((item) => item.length > 3)
    .slice(0, 12);
  const bodyTags = [
    html.includes("hackathon") ? "hackathon" : "",
    html.includes("conference") ? "conference" : "",
    html.includes("builder") ? "builders" : "",
    html.includes("developer") ? "developers" : "",
    html.includes("ethereum") ? "ethereum" : "",
    html.includes("solana") ? "solana" : "",
    html.includes("web3") ? "web3" : "",
  ].filter(Boolean);
  return [
    { title, creator: source.name, categories: source.baseTags },
    ...headings.map((heading) => ({ title: heading, creator: source.name, categories: bodyTags })),
  ];
}
function outletCandidate(source: MediaFeedSource, items: ParsedFeedItem[]): DailyIngestionCandidate {
  const tags = Array.from(new Set([...source.baseTags, ...topicTags(items)]));
  const categories = Array.from(new Set(items.flatMap((item) => item.categories).filter(Boolean))).slice(0, 5);
  return {
    id: `web3.live.supply.media.${source.id}`,
    name: source.name,
    identity: source.identity,
    kind: "partner",
    domain: `Web3 / live media and research supply${categories.length ? ` covering ${categories.join(", ")}` : ""}`,
    side: "supply",
    source: "web3_media_feeds_live",
    priority: Math.round(clamp(source.priority + Math.min(6, items.length / 4), 70, 96)),
    tags,
    ingestionReason: "Live Web3 media feed observed publishing current market, protocol, and narrative coverage for supply-side growth matching.",
  };
}

function creatorCandidates(source: MediaFeedSource, items: ParsedFeedItem[], limit: number): DailyIngestionCandidate[] {
  const grouped = new Map<string, ParsedFeedItem[]>();
  for (const item of items) {
    const creator = item.creator && !/agent|staff|team/i.test(item.creator) ? item.creator : "";
    if (!creator) continue;
    grouped.set(creator, [...(grouped.get(creator) || []), item]);
  }
  return Array.from(grouped.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([creator, creatorItems]) => ({
      id: `web3.live.supply.creator.${source.id}.${slug(creator)}`,
      name: creator,
      identity: `${source.identity}/authors/${slug(creator)}`,
      kind: "kol" as const,
      domain: `Web3 / ${source.name} contributor covering ${creatorItems.slice(0, 3).map((item) => item.title).join(" | ")}`,
      side: "supply" as const,
      source: "web3_media_feeds_live",
      priority: Math.round(clamp(source.priority - 4 + creatorItems.length * 3, 68, 94)),
      tags: Array.from(new Set(["kol", "media", "writer", ...source.baseTags, ...topicTags(creatorItems)])),
      ingestionReason: "Live Web3 media feed identified this author as an active coverage supply node for current growth narratives.",
    }));
}

function youtubeCreatorCandidate(source: MediaFeedSource, items: ParsedFeedItem[]): DailyIngestionCandidate {
  const tags = Array.from(new Set(["kol", "creator", "youtube", "video", ...source.baseTags, ...topicTags(items)])).slice(0, 10);
  const recentTitles = items.slice(0, 3).map((item) => item.title).join(" | ");
  return {
    id: `web3.live.supply.youtube.${source.id}`,
    name: source.name,
    identity: source.identity,
    kind: "kol",
    domain: `Web3 / YouTube creator and video education supply${recentTitles ? ` covering ${recentTitles}` : ""}`,
    side: "supply",
    source: "youtube_creator_feeds_live",
    priority: Math.round(clamp(source.priority + Math.min(5, items.length / 3), 72, 96)),
    tags,
    ingestionReason: "Live YouTube creator feed observed recent Web3 videos, making this channel an active supply node for growth education and narrative distribution.",
  };
}

function contentFeedCandidate(source: ContentFeedSource, items: ParsedFeedItem[]): DailyIngestionCandidate {
  const tags = Array.from(new Set([
    source.supplyKind === "kol" ? "kol" : "partner",
    source.contentType,
    "content",
    ...source.baseTags,
    ...topicTags(items),
  ])).slice(0, 10);
  const recentTitles = items.slice(0, 3).map((item) => item.title).join(" | ");
  const supplyLabel = source.contentType === "podcast"
    ? "podcast and interview supply"
    : source.contentType === "newsletter"
      ? "newsletter and analytics supply"
      : "research and thought-leadership supply";
  return {
    id: `web3.live.supply.content.${source.id}`,
    name: source.name,
    identity: source.identity,
    kind: source.supplyKind,
    domain: `Web3 / ${supplyLabel}${recentTitles ? ` covering ${recentTitles}` : ""}`,
    side: "supply",
    source: "web3_content_feeds_live",
    priority: Math.round(clamp(source.priority + Math.min(5, items.length / 4), 72, 96)),
    tags,
    ingestionReason: `Live ${source.contentType} feed observed recent Web3 content, making this source an active supply node for growth narrative, education, and trust-building.`,
  };
}


function eventPageCandidate(source: MediaFeedSource, items: ParsedFeedItem[]): DailyIngestionCandidate {
  const tags = Array.from(new Set(["partner", "events", "community", ...source.baseTags, ...topicTags(items)])).slice(0, 10);
  const recentSignals = items.slice(0, 3).map((item) => item.title).join(" | ");
  return {
    id: `web3.live.supply.events.${source.id}`,
    name: source.name,
    identity: source.identity,
    kind: "partner",
    domain: `Web3 / live event, hackathon, and community distribution supply${recentSignals ? ` covering ${recentSignals}` : ""}`,
    side: "supply",
    source: "web3_event_pages_live",
    priority: Math.round(clamp(source.priority + Math.min(5, items.length / 3), 72, 96)),
    tags,
    ingestionReason: "Live Web3 event page observed current ecosystem activity, making this source a practical supply node for launches, builder acquisition, sponsorship, and community growth.",
  };
}
async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
      headers: {
        "accept": "application/rss+xml, application/xml, text/xml, application/json, */*",
        "user-agent": "GroIntel-LiveDiscovery/1.0",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDefiLlamaDemand(limit: number, timeoutMs: number): Promise<LiveDiscoverySourceResult> {
  const startedAt = Date.now();
  try {
    const response = await fetchWithTimeout(DEFILLAMA_PROTOCOLS_URL, timeoutMs);
    if (!response.ok) throw new Error(`DefiLlama responded ${response.status}`);

    const protocols = await response.json() as DefiLlamaProtocol[];
    const candidates = protocols
      .filter(isUsableProtocol)
      .sort((a, b) => protocolPriority(b) - protocolPriority(a))
      .slice(0, limit)
      .map(toProtocolCandidate);

    return {
      attempted: true,
      success: true,
      source: "defillama",
      sourceUrl: DEFILLAMA_PROTOCOLS_URL,
      side: "demand",
      latencyMs: Date.now() - startedAt,
      rawCount: Array.isArray(protocols) ? protocols.length : 0,
      candidateCount: candidates.length,
      candidates,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      source: "defillama",
      sourceUrl: DEFILLAMA_PROTOCOLS_URL,
      side: "demand",
      latencyMs: Date.now() - startedAt,
      rawCount: 0,
      candidateCount: 0,
      candidates: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchGithubDemand(limit: number, timeoutMs: number): Promise<LiveDiscoverySourceResult> {
  const startedAt = Date.now();
  const queries = [
    "topic:web3 stars:>100 fork:false archived:false",
    "topic:defi stars:>100 fork:false archived:false",
    "topic:ethereum stars:>100 fork:false archived:false",
    "topic:solana stars:>100 fork:false archived:false",
  ];
  const perQuery = Math.max(5, Math.ceil(limit / queries.length));
  try {
    const responses = await Promise.all(queries.map(async (query) => {
      const url = `${GITHUB_SEARCH_URL}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perQuery}`;
      const response = await fetchWithTimeout(url, timeoutMs);
      if (!response.ok) throw new Error(`GitHub search responded ${response.status}`);
      const body = await response.json() as { total_count?: number; items?: GitHubRepo[] };
      return body.items || [];
    }));
    const seen = new Set<string>();
    const repos = responses.flat().filter((repo) => {
      if (repo.fork || repo.archived) return false;
      const key = String(repo.full_name || repo.html_url || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => githubPriority(b) - githubPriority(a));
    const candidates = repos.slice(0, limit).map(toGithubCandidate);

    return {
      attempted: true,
      success: candidates.length > 0,
      source: "github_repos",
      sourceUrl: GITHUB_SEARCH_URL,
      side: "demand",
      latencyMs: Date.now() - startedAt,
      rawCount: repos.length,
      candidateCount: candidates.length,
      candidates,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      source: "github_repos",
      sourceUrl: GITHUB_SEARCH_URL,
      side: "demand",
      latencyMs: Date.now() - startedAt,
      rawCount: 0,
      candidateCount: 0,
      candidates: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchWeb3MediaSupply(limit: number, timeoutMs: number): Promise<LiveDiscoverySourceResult> {
  const startedAt = Date.now();
  const perFeedTimeout = Math.max(1500, Math.floor(timeoutMs / 2));
  const results = await Promise.all(WEB3_MEDIA_FEEDS.map(async (source) => {
    try {
      const response = await fetchWithTimeout(source.url, perFeedTimeout);
      if (!response.ok) throw new Error(`${source.name} responded ${response.status}`);
      const xml = await response.text();
      const items = parseFeedItems(xml).slice(0, 40);
      return { source, items, error: null as string | null };
    } catch (error) {
      return { source, items: [] as ParsedFeedItem[], error: error instanceof Error ? error.message : String(error) };
    }
  }));

  const candidates = results.flatMap((result) => {
    if (result.items.length === 0) return [];
    return [outletCandidate(result.source, result.items), ...creatorCandidates(result.source, result.items, 8)];
  }).slice(0, limit);
  const errors = results.filter((result) => result.error).map((result) => `${result.source.name}: ${result.error}`);

  return {
    attempted: true,
    success: candidates.length > 0,
    source: "web3_media_feeds",
    sourceUrl: WEB3_MEDIA_FEEDS.map((source) => source.url).join(", "),
    side: "supply",
    latencyMs: Date.now() - startedAt,
    rawCount: results.reduce((sum, result) => sum + result.items.length, 0),
    candidateCount: candidates.length,
    candidates,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

async function fetchYoutubeCreatorSupply(limit: number, timeoutMs: number): Promise<LiveDiscoverySourceResult> {
  const startedAt = Date.now();
  const perFeedTimeout = Math.max(1500, Math.floor(timeoutMs / 2));
  const results = await Promise.all(YOUTUBE_CREATOR_FEEDS.map(async (source) => {
    try {
      const response = await fetchWithTimeout(source.url, perFeedTimeout);
      if (!response.ok) throw new Error(`${source.name} responded ${response.status}`);
      const xml = await response.text();
      const items = parseFeedItems(xml).slice(0, 20);
      return { source, items, error: null as string | null };
    } catch (error) {
      return { source, items: [] as ParsedFeedItem[], error: error instanceof Error ? error.message : String(error) };
    }
  }));

  const candidates = results
    .filter((result) => result.items.length > 0)
    .map((result) => youtubeCreatorCandidate(result.source, result.items))
    .slice(0, limit);
  const errors = results.filter((result) => result.error).map((result) => `${result.source.name}: ${result.error}`);

  return {
    attempted: true,
    success: candidates.length > 0,
    source: "youtube_creator_feeds",
    sourceUrl: YOUTUBE_CREATOR_FEEDS.map((source) => source.url).join(", "),
    side: "supply",
    latencyMs: Date.now() - startedAt,
    rawCount: results.reduce((sum, result) => sum + result.items.length, 0),
    candidateCount: candidates.length,
    candidates,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

async function fetchWeb3ContentSupply(limit: number, timeoutMs: number): Promise<LiveDiscoverySourceResult> {
  const startedAt = Date.now();
  const perFeedTimeout = Math.max(1500, Math.floor(timeoutMs / 2));
  const results = await Promise.all(WEB3_CONTENT_FEEDS.map(async (source) => {
    try {
      const response = await fetchWithTimeout(source.url, perFeedTimeout);
      if (!response.ok) throw new Error(`${source.name} responded ${response.status}`);
      const xml = await response.text();
      const items = parseFeedItems(xml).slice(0, 25);
      return { source, items, error: null as string | null };
    } catch (error) {
      return { source, items: [] as ParsedFeedItem[], error: error instanceof Error ? error.message : String(error) };
    }
  }));

  const candidates = results
    .filter((result) => result.items.length > 0)
    .map((result) => contentFeedCandidate(result.source, result.items))
    .slice(0, limit);
  const errors = results.filter((result) => result.error).map((result) => `${result.source.name}: ${result.error}`);

  return {
    attempted: true,
    success: candidates.length > 0,
    source: "web3_content_feeds",
    sourceUrl: WEB3_CONTENT_FEEDS.map((source) => source.url).join(", "),
    side: "supply",
    latencyMs: Date.now() - startedAt,
    rawCount: results.reduce((sum, result) => sum + result.items.length, 0),
    candidateCount: candidates.length,
    candidates,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}


async function fetchWeb3EventSupply(limit: number, timeoutMs: number): Promise<LiveDiscoverySourceResult> {
  const startedAt = Date.now();
  const perPageTimeout = Math.max(1500, Math.floor(timeoutMs / 2));
  const results = await Promise.all(WEB3_EVENT_PAGES.map(async (source) => {
    try {
      const response = await fetchWithTimeout(source.url, perPageTimeout);
      if (!response.ok) throw new Error(`${source.name} responded ${response.status}`);
      const html = await response.text();
      const items = parseEventPageItems(html.toLowerCase(), source).slice(0, 16);
      return { source, items, error: null as string | null };
    } catch (error) {
      return { source, items: [] as ParsedFeedItem[], error: error instanceof Error ? error.message : String(error) };
    }
  }));

  const candidates = results
    .filter((result) => result.items.length > 0)
    .map((result) => eventPageCandidate(result.source, result.items))
    .slice(0, limit);
  const errors = results.filter((result) => result.error).map((result) => `${result.source.name}: ${result.error}`);

  return {
    attempted: true,
    success: candidates.length > 0,
    source: "web3_event_pages",
    sourceUrl: WEB3_EVENT_PAGES.map((source) => source.url).join(", "),
    side: "supply",
    latencyMs: Date.now() - startedAt,
    rawCount: results.reduce((sum, result) => sum + result.items.length, 0),
    candidateCount: candidates.length,
    candidates,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}
export async function fetchLiveWeb3DiscoveryCandidates(options: LiveDiscoveryOptions = {}): Promise<LiveDiscoveryResult> {
  const startedAt = Date.now();
  const limit = Math.max(1, Math.min(options.limit || DEFAULT_LIMIT, 200));
  const demandLimit = Math.max(1, Math.min(options.demandLimit || limit, 200));
  const supplyLimit = Math.max(1, Math.min(options.supplyLimit || Math.ceil(limit / 2), 100));
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  const sources = await Promise.all([
    fetchDefiLlamaDemand(Math.ceil(demandLimit * 0.75), timeoutMs),
    fetchGithubDemand(Math.max(10, Math.ceil(demandLimit * 0.25)), timeoutMs),
    fetchWeb3MediaSupply(Math.ceil(supplyLimit * 0.5), timeoutMs),
    fetchYoutubeCreatorSupply(Math.max(3, Math.ceil(supplyLimit * 0.25)), timeoutMs),
    fetchWeb3ContentSupply(Math.max(4, Math.ceil(supplyLimit * 0.25)), timeoutMs),
    fetchWeb3EventSupply(Math.max(4, Math.ceil(supplyLimit * 0.2)), timeoutMs),
  ]);
  const candidates = mergeLiveCandidates(sources);
  const success = sources.some((source) => source.success);
  const errors = sources.filter((source) => source.error).map((source) => `${source.source}: ${source.error}`);

  return {
    attempted: true,
    success,
    source: "multi_live",
    sourceUrl: sources.map((source) => source.sourceUrl).join(" | "),
    latencyMs: Date.now() - startedAt,
    rawCount: sources.reduce((sum, source) => sum + source.rawCount, 0),
    candidateCount: candidates.length,
    demandCandidateCount: candidates.filter((candidate) => candidate.side === "demand").length,
    supplyCandidateCount: candidates.filter((candidate) => candidate.side === "supply").length,
    candidates,
    sources,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}
