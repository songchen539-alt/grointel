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

type ParsedFeedItem = {
  title: string;
  creator?: string;
  categories: string[];
};

export type LiveDiscoverySourceId = "defillama" | "web3_media_feeds";

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

const DEFILLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols";
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

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeUrl(url: string) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function stripXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
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
  return Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => {
    const block = match[0];
    return {
      title: extractTag(block, "title"),
      creator: extractTag(block, "dc:creator") || extractTag(block, "author") || undefined,
      categories: extractTags(block, "category"),
    };
  }).filter((item) => item.title);
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

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
      headers: { "accept": "application/rss+xml, application/xml, text/xml, application/json, */*" },
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

export async function fetchLiveWeb3DiscoveryCandidates(options: LiveDiscoveryOptions = {}): Promise<LiveDiscoveryResult> {
  const startedAt = Date.now();
  const limit = Math.max(1, Math.min(options.limit || DEFAULT_LIMIT, 200));
  const demandLimit = Math.max(1, Math.min(options.demandLimit || limit, 200));
  const supplyLimit = Math.max(1, Math.min(options.supplyLimit || Math.ceil(limit / 2), 100));
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  const sources = await Promise.all([
    fetchDefiLlamaDemand(demandLimit, timeoutMs),
    fetchWeb3MediaSupply(supplyLimit, timeoutMs),
  ]);
  const candidates = sources.flatMap((source) => source.candidates);
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
