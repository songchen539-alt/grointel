import type { DailyIngestionCandidate } from "./dailyIngestion";

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

export type LiveDiscoveryResult = {
  attempted: boolean;
  success: boolean;
  source: "defillama";
  sourceUrl: string;
  latencyMs: number;
  rawCount: number;
  candidateCount: number;
  candidates: DailyIngestionCandidate[];
  error?: string;
};

type LiveDiscoveryOptions = {
  limit?: number;
  timeoutMs?: number;
};

const DEFILLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols";
const DEFAULT_LIMIT = 80;
const DEFAULT_TIMEOUT_MS = 6000;

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeUrl(url: string) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
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

function toDailyCandidate(protocol: DefiLlamaProtocol): DailyIngestionCandidate {
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

export async function fetchLiveWeb3DiscoveryCandidates(options: LiveDiscoveryOptions = {}): Promise<LiveDiscoveryResult> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const limit = Math.max(1, Math.min(options.limit || DEFAULT_LIMIT, 200));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(DEFILLAMA_PROTOCOLS_URL, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "accept": "application/json" },
    });
    if (!response.ok) throw new Error(`DefiLlama responded ${response.status}`);

    const protocols = await response.json() as DefiLlamaProtocol[];
    const candidates = protocols
      .filter(isUsableProtocol)
      .sort((a, b) => protocolPriority(b) - protocolPriority(a))
      .slice(0, limit)
      .map(toDailyCandidate);

    return {
      attempted: true,
      success: true,
      source: "defillama",
      sourceUrl: DEFILLAMA_PROTOCOLS_URL,
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
      latencyMs: Date.now() - startedAt,
      rawCount: 0,
      candidateCount: 0,
      candidates: [],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}
