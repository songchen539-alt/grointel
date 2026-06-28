import type { RealityTarget } from "./worldRuntime";

export type Web3DiscoverySegment = "demand" | "supply";
export type Web3DiscoverySource = "seed" | "ecosystem" | "kol_index" | "media_research" | "data_security";

export type Web3DiscoveryTarget = RealityTarget & {
  segment: Web3DiscoverySegment;
  source: Web3DiscoverySource;
  priority: number;
  tags: string[];
};

const demand = (
  id: string,
  name: string,
  identity: string,
  domain: string,
  priority: number,
  tags: string[],
  source: Web3DiscoverySource = "ecosystem",
): Web3DiscoveryTarget => ({
  id: `web3.discovery.company.${id}`,
  name,
  identity,
  kind: "company",
  domain,
  segment: "demand",
  source,
  priority,
  tags,
});

const supply = (
  id: string,
  name: string,
  identity: string,
  domain: string,
  priority: number,
  tags: string[],
  source: Web3DiscoverySource = "kol_index",
): Web3DiscoveryTarget => ({
  id: `web3.discovery.supply.${id}`,
  name,
  identity,
  kind: "kol",
  domain,
  segment: "supply",
  source,
  priority,
  tags,
});

export const WEB3_DISCOVERY_TARGETS: Web3DiscoveryTarget[] = [
  demand("base", "Base", "base.org", "Web3 / Ethereum L2 consumer and builder ecosystem", 96, ["l2", "ethereum", "consumer", "builders"]),
  demand("zksync", "zkSync", "zksync.io", "Web3 / ZK Ethereum scaling ecosystem", 92, ["l2", "zk", "ethereum", "ecosystem"]),
  demand("starknet", "Starknet", "starknet.io", "Web3 / ZK rollup and Cairo developer ecosystem", 90, ["l2", "zk", "developers"]),
  demand("mantle", "Mantle", "mantle.xyz", "Web3 / modular Ethereum L2 ecosystem", 88, ["l2", "defi", "ecosystem"]),
  demand("linea", "Linea", "linea.build", "Web3 / Ethereum L2 ecosystem", 86, ["l2", "ethereum", "builders"]),
  demand("scroll", "Scroll", "scroll.io", "Web3 / zkEVM scaling ecosystem", 84, ["l2", "zk", "ethereum"]),
  demand("blast", "Blast", "blast.io", "Web3 / yield-native Ethereum L2", 82, ["l2", "defi", "consumer"]),
  demand("solana", "Solana", "solana.com", "Web3 / high-throughput L1 ecosystem", 96, ["l1", "consumer", "defi", "developers"]),
  demand("monad", "Monad", "monad.xyz", "Web3 / EVM L1 developer ecosystem", 90, ["l1", "evm", "developers"]),
  demand("berachain", "Berachain", "berachain.com", "Web3 / EVM-compatible L1 and DeFi ecosystem", 88, ["l1", "defi", "community"]),
  demand("celestia", "Celestia", "celestia.org", "Web3 / modular data availability network", 86, ["modular", "infrastructure", "developers"]),
  demand("eigenlayer", "EigenLayer", "eigenlayer.xyz", "Web3 / restaking and AVS ecosystem", 90, ["restaking", "infrastructure", "defi"]),
  demand("babylon", "Babylon", "babylonlabs.io", "Web3 / Bitcoin staking ecosystem", 84, ["bitcoin", "staking", "infrastructure"]),
  demand("layerzero", "LayerZero", "layerzero.network", "Web3 / omnichain interoperability", 88, ["interop", "developers", "infrastructure"]),
  demand("wormhole", "Wormhole", "wormhole.com", "Web3 / cross-chain interoperability", 84, ["interop", "developers", "infrastructure"]),
  demand("chainlink", "Chainlink", "chain.link", "Web3 / oracle and infrastructure network", 92, ["oracle", "infrastructure", "developers"]),
  demand("uniswap", "Uniswap", "uniswap.org", "Web3 / DeFi exchange protocol", 95, ["defi", "dex", "ethereum"]),
  demand("aave", "Aave", "aave.com", "Web3 / DeFi lending protocol", 92, ["defi", "lending", "dao"]),
  demand("lido", "Lido", "lido.fi", "Web3 / liquid staking protocol", 88, ["defi", "staking", "ethereum"]),
  demand("ethena", "Ethena", "ethena.fi", "Web3 / synthetic dollar protocol", 86, ["defi", "stablecoin", "yield"]),
  demand("pendle", "Pendle", "pendle.finance", "Web3 / yield trading protocol", 82, ["defi", "yield", "traders"]),
  demand("jupiter", "Jupiter", "jup.ag", "Web3 / Solana DeFi aggregator", 88, ["defi", "solana", "traders"]),
  demand("hyperliquid", "Hyperliquid", "hyperliquid.xyz", "Web3 / on-chain perpetuals exchange", 90, ["defi", "traders", "exchange"]),
  demand("polymarket", "Polymarket", "polymarket.com", "Web3 / prediction market", 86, ["consumer", "prediction", "marketplace"]),
  demand("phantom", "Phantom", "phantom.com", "Web3 / consumer wallet", 90, ["wallet", "consumer", "solana"]),
  demand("metamask", "MetaMask", "metamask.io", "Web3 / Ethereum wallet", 92, ["wallet", "consumer", "ethereum"]),
  demand("rabby", "Rabby", "rabby.io", "Web3 / multi-chain wallet", 78, ["wallet", "defi", "power-users"]),
  demand("safe", "Safe", "safe.global", "Web3 / smart account infrastructure", 82, ["wallet", "dao", "infrastructure"]),
  demand("privy", "Privy", "privy.io", "Web3 / embedded wallet infrastructure", 82, ["wallet", "infrastructure", "consumer"]),
  demand("alchemy", "Alchemy", "alchemy.com", "Web3 / developer infrastructure", 88, ["infrastructure", "developers", "api"]),
  demand("quicknode", "QuickNode", "quicknode.com", "Web3 / RPC and developer infrastructure", 82, ["infrastructure", "developers", "api"]),
  demand("magiceden", "Magic Eden", "magiceden.io", "Web3 / NFT marketplace", 82, ["nft", "marketplace", "consumer"]),
  demand("opensea", "OpenSea", "opensea.io", "Web3 / NFT marketplace", 82, ["nft", "marketplace", "consumer"]),
  demand("zora", "Zora", "zora.co", "Web3 / creator and on-chain media protocol", 82, ["creator", "nft", "consumer"]),
  demand("farcaster", "Farcaster", "farcaster.xyz", "Web3 / decentralized social protocol", 86, ["social", "consumer", "creators"]),
  demand("lens", "Lens", "lens.xyz", "Web3 / decentralized social graph", 80, ["social", "creators", "consumer"]),
  demand("pumpfun", "Pump.fun", "pump.fun", "Web3 / memecoin launch platform", 78, ["consumer", "memecoin", "traders"]),
  demand("worldcoin", "World", "world.org", "Web3 / identity and consumer crypto network", 82, ["identity", "consumer", "wallet"]),

  supply("vitalik", "Vitalik Buterin", "vitalik.eth.limo", "Web3 / Ethereum founder and research audience", 98, ["ethereum", "research", "founders"]),
  supply("balaji", "Balaji", "x.com/balajis", "Web3 / crypto, network state, and technology audience", 92, ["crypto", "tech", "founders"]),
  supply("arthurhayes", "Arthur Hayes", "x.com/CryptoHayes", "Web3 / macro and crypto trader audience", 88, ["macro", "traders", "bitcoin"]),
  supply("laurashin", "Laura Shin", "unchainedcrypto.com", "Web3 / journalism and founder interview audience", 88, ["media", "journalism", "founders"], "media_research"),
  supply("pomp", "Anthony Pompliano", "x.com/APompliano", "Web3 / Bitcoin and investor media audience", 86, ["bitcoin", "investors", "media"]),
  supply("haska", "Hsaka", "x.com/HsakaTrades", "Web3 / crypto trader audience", 80, ["traders", "markets", "crypto"]),
  supply("defillama", "DefiLlama", "defillama.com", "Web3 / DeFi data and protocol audience", 94, ["data", "defi", "research"], "data_security"),
  supply("tokenterminal", "Token Terminal", "tokenterminal.com", "Web3 / protocol fundamentals data audience", 88, ["data", "research", "fundamentals"], "data_security"),
  supply("nansen", "Nansen", "nansen.ai", "Web3 / on-chain analytics audience", 86, ["data", "wallets", "analytics"], "data_security"),
  supply("arkham", "Arkham", "arkhamintelligence.com", "Web3 / on-chain intelligence audience", 84, ["data", "security", "wallets"], "data_security"),
  supply("lookonchain", "Lookonchain", "x.com/lookonchain", "Web3 / on-chain whale and trader audience", 84, ["data", "traders", "wallets"], "data_security"),
  supply("wublockchain", "Wu Blockchain", "wublockchain.com", "Web3 / Asia crypto news audience", 84, ["media", "asia", "news"], "media_research"),
  supply("theblock", "The Block", "theblock.co", "Web3 / institutional crypto media audience", 86, ["media", "research", "institutions"], "media_research"),
  supply("blockworks", "Blockworks", "blockworks.co", "Web3 / crypto finance and institutional media", 86, ["media", "institutions", "defi"], "media_research"),
  supply("rekt", "Rekt", "rekt.news", "Web3 / risk, exploit, and culture audience", 82, ["security", "culture", "risk"], "media_research"),
  supply("ruggadio", "Rug Radio", "rug.fm", "Web3 / creator media network", 78, ["media", "creators", "community"], "media_research"),
  supply("threadguy", "ThreadGuy", "x.com/0xThreadGuy", "Web3 / NFT and crypto-native culture audience", 78, ["culture", "nft", "community"]),
  supply("wale", "Wale", "x.com/waleswoosh", "Web3 / NFT and consumer crypto audience", 76, ["nft", "consumer", "culture"]),
  supply("sassal", "Sassal", "x.com/sassal0x", "Web3 / Ethereum education audience", 82, ["ethereum", "education", "defi"]),
  supply("ryanadams", "Ryan Sean Adams", "x.com/RyanSAdams", "Web3 / Ethereum and Bankless audience", 84, ["ethereum", "media", "education"], "media_research"),
  supply("davidhoffman", "David Hoffman", "x.com/TrustlessState", "Web3 / Ethereum and DeFi media audience", 84, ["ethereum", "defi", "media"], "media_research"),
  supply("milesdeutscher", "Miles Deutscher", "x.com/milesdeutscher", "Web3 / retail crypto education audience", 78, ["retail", "education", "traders"]),
  supply("ellio", "EllioTrades", "x.com/elliotrades", "Web3 / retail crypto and gaming audience", 74, ["retail", "gaming", "tokens"]),
  supply("virtualbacon", "VirtualBacon", "x.com/VirtualBacon0x", "Web3 / crypto research and retail education", 74, ["education", "research", "retail"]),
];

export function getWeb3DiscoveryTargets(limit = WEB3_DISCOVERY_TARGETS.length, tick = 0) {
  const ordered = [...WEB3_DISCOVERY_TARGETS].sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
  if (limit >= ordered.length) return ordered;
  const selected: Web3DiscoveryTarget[] = [];
  const demandTargets = ordered.filter((target) => target.segment === "demand");
  const supplyTargets = ordered.filter((target) => target.segment === "supply");
  const demandLimit = Math.ceil(limit / 2);
  const supplyLimit = limit - demandLimit;

  const take = (pool: Web3DiscoveryTarget[], count: number, offset: number) => {
    for (let index = 0; index < count && pool.length > 0; index++) {
      selected.push(pool[(offset + index) % pool.length]);
    }
  };

  take(demandTargets, demandLimit, tick % Math.max(1, demandTargets.length));
  take(supplyTargets, supplyLimit, tick % Math.max(1, supplyTargets.length));
  return selected;
}

export function web3DiscoveryStats(targets: RealityTarget[]) {
  const web3Targets = targets.filter((target) => target.id.startsWith("web3."));
  const demandCount = web3Targets.filter((target) => target.kind === "company").length;
  const supplyCount = web3Targets.length - demandCount;
  return {
    web3TargetCount: web3Targets.length,
    web3DemandCount: demandCount,
    web3SupplyCount: supplyCount,
    discoveryCatalogCount: WEB3_DISCOVERY_TARGETS.length,
  };
}
