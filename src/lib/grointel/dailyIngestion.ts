import type { RealityTarget, RealityTargetKind } from "./worldRuntime";
import { WEB3_DISCOVERY_TARGETS, type Web3DiscoverySource } from "./web3Discovery";

export type DailyIngestionSide = "demand" | "supply";

export type DailyIngestionCandidate = RealityTarget & {
  side: DailyIngestionSide;
  source: Web3DiscoverySource | "daily_bootstrap" | string;
  priority: number;
  tags: string[];
  ingestionReason: string;
  discoveryScore?: number;
  sourceCoverage?: string[];
};

export type GlobalDiscoverySource = {
  id: string;
  name: string;
  side: "demand" | "supply" | "both";
  category: "project_index" | "market_data" | "social" | "media" | "research" | "developer" | "security" | "community" | "funding";
  signalTypes: string[];
  trust: number;
  freshness: "daily" | "weekly" | "monthly";
  status: "active" | "planned";
};

export type DailyIngestionBatch = {
  id: string;
  date: string;
  demandTarget: number;
  supplyTarget: number;
  demand: DailyIngestionCandidate[];
  supply: DailyIngestionCandidate[];
  targets: DailyIngestionCandidate[];
  sourceSummary: ReturnType<typeof buildSourceSummary>;
};

export const GLOBAL_WEB3_DISCOVERY_SOURCES: GlobalDiscoverySource[] = [
  { id: "coingecko", name: "CoinGecko", side: "demand", category: "market_data", signalTypes: ["market", "token", "category"], trust: 82, freshness: "daily", status: "active" },
  { id: "coinmarketcap", name: "CoinMarketCap", side: "demand", category: "market_data", signalTypes: ["market", "token", "category"], trust: 78, freshness: "daily", status: "active" },
  { id: "defillama", name: "DefiLlama", side: "demand", category: "market_data", signalTypes: ["tvl", "revenue", "protocol"], trust: 88, freshness: "daily", status: "active" },
  { id: "l2beat", name: "L2Beat", side: "demand", category: "research", signalTypes: ["l2", "risk", "ecosystem"], trust: 88, freshness: "weekly", status: "active" },
  { id: "rootdata", name: "RootData", side: "both", category: "funding", signalTypes: ["funding", "team", "project"], trust: 78, freshness: "weekly", status: "planned" },
  { id: "cryptorank", name: "CryptoRank", side: "demand", category: "funding", signalTypes: ["fundraising", "token", "launch"], trust: 74, freshness: "weekly", status: "planned" },
  { id: "dune", name: "Dune", side: "demand", category: "market_data", signalTypes: ["dashboard", "usage", "community"], trust: 76, freshness: "weekly", status: "planned" },
  { id: "github", name: "GitHub", side: "demand", category: "developer", signalTypes: ["repo", "developer", "activity"], trust: 78, freshness: "daily", status: "active" },
  { id: "x-twitter", name: "X/Twitter", side: "supply", category: "social", signalTypes: ["kol", "audience", "conversation"], trust: 68, freshness: "daily", status: "planned" },
  { id: "youtube", name: "YouTube", side: "supply", category: "social", signalTypes: ["creator", "video", "audience"], trust: 72, freshness: "daily", status: "active" },
  { id: "substack", name: "Substack/Newsletters", side: "supply", category: "media", signalTypes: ["newsletter", "writer", "audience"], trust: 72, freshness: "weekly", status: "planned" },
  { id: "podcasts", name: "Crypto Podcasts", side: "supply", category: "media", signalTypes: ["podcast", "guest", "audience"], trust: 70, freshness: "weekly", status: "planned" },
  { id: "blockworks", name: "Blockworks", side: "supply", category: "media", signalTypes: ["media", "institutional", "podcast"], trust: 80, freshness: "daily", status: "active" },
  { id: "coindesk", name: "CoinDesk", side: "supply", category: "media", signalTypes: ["news", "conference", "institutional"], trust: 82, freshness: "daily", status: "active" },
  { id: "messari", name: "Messari", side: "both", category: "research", signalTypes: ["research", "protocol", "sector"], trust: 86, freshness: "weekly", status: "active" },
  { id: "security-feeds", name: "Security Feeds", side: "supply", category: "security", signalTypes: ["risk", "exploit", "trust"], trust: 82, freshness: "daily", status: "planned" },
  { id: "community-directories", name: "Community Directories", side: "supply", category: "community", signalTypes: ["dao", "builder", "community"], trust: 66, freshness: "monthly", status: "planned" },
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function candidate(
  side: DailyIngestionSide,
  name: string,
  identity: string,
  domain: string,
  priority: number,
  tags: string[],
  source: DailyIngestionCandidate["source"] = "daily_bootstrap",
  kind: RealityTargetKind = side === "demand" ? "company" : "kol",
): DailyIngestionCandidate {
  return {
    id: `web3.daily.${side}.${slug(name || identity)}`,
    name,
    identity,
    kind,
    domain,
    side,
    source,
    priority,
    tags,
    ingestionReason: side === "demand"
      ? "Web3 company or protocol that may have growth demand and can be matched with KOL/supply partners."
      : "Web3 KOL, media, research, data, security, or community supply that may help companies grow.",
  };
}

const demand = (
  name: string,
  identity: string,
  domain: string,
  priority: number,
  tags: string[],
) => candidate("demand", name, identity, domain, priority, tags);

const supply = (
  name: string,
  identity: string,
  domain: string,
  priority: number,
  tags: string[],
) => candidate("supply", name, identity, domain, priority, tags);

export const DAILY_WEB3_DEMAND_CANDIDATES: DailyIngestionCandidate[] = [
  demand("Coinbase", "coinbase.com", "Web3 / exchange, wallet, and consumer crypto platform", 95, ["exchange", "wallet", "consumer"]),
  demand("Kraken", "kraken.com", "Web3 / crypto exchange and institutional platform", 88, ["exchange", "institutional", "consumer"]),
  demand("OKX", "okx.com", "Web3 / exchange, wallet, and Web3 app platform", 88, ["exchange", "wallet", "asia"]),
  demand("Binance", "binance.com", "Web3 / global exchange ecosystem", 90, ["exchange", "global", "consumer"]),
  demand("Bybit", "bybit.com", "Web3 / crypto exchange and trading platform", 84, ["exchange", "traders", "global"]),
  demand("Bitget", "bitget.com", "Web3 / exchange and copy trading platform", 82, ["exchange", "traders", "copy-trading"]),
  demand("KuCoin", "kucoin.com", "Web3 / crypto exchange and altcoin marketplace", 78, ["exchange", "retail", "tokens"]),
  demand("Crypto.com", "crypto.com", "Web3 / consumer exchange, wallet, and card platform", 82, ["exchange", "consumer", "payments"]),
  demand("Gemini", "gemini.com", "Web3 / regulated exchange and custody platform", 76, ["exchange", "regulated", "custody"]),
  demand("Bitpanda", "bitpanda.com", "Web3 / European crypto investment platform", 74, ["exchange", "europe", "consumer"]),
  demand("Sui", "sui.io", "Web3 / Move L1 ecosystem", 90, ["l1", "move", "consumer"]),
  demand("Aptos", "aptoslabs.com", "Web3 / Move L1 ecosystem", 88, ["l1", "move", "developers"]),
  demand("Avalanche", "avax.network", "Web3 / L1 and subnet ecosystem", 88, ["l1", "defi", "gaming"]),
  demand("Near", "near.org", "Web3 / chain abstraction and L1 ecosystem", 82, ["l1", "abstraction", "developers"]),
  demand("Sei", "sei.io", "Web3 / high-performance L1 ecosystem", 80, ["l1", "trading", "consumer"]),
  demand("Injective", "injective.com", "Web3 / finance-focused L1 ecosystem", 80, ["l1", "defi", "trading"]),
  demand("Cosmos", "cosmos.network", "Web3 / interchain ecosystem", 82, ["l1", "interchain", "developers"]),
  demand("Polkadot", "polkadot.com", "Web3 / multichain ecosystem", 78, ["l1", "interoperability", "developers"]),
  demand("Cardano", "cardano.org", "Web3 / L1 blockchain ecosystem", 74, ["l1", "community", "staking"]),
  demand("TON", "ton.org", "Web3 / Telegram-adjacent consumer blockchain ecosystem", 88, ["l1", "consumer", "telegram"]),
  demand("Tron", "tron.network", "Web3 / stablecoin and payments blockchain ecosystem", 80, ["l1", "stablecoin", "payments"]),
  demand("Xai", "xai.games", "Web3 / gaming-focused L3 ecosystem", 74, ["gaming", "l3", "consumer"]),
  demand("Immutable", "immutable.com", "Web3 / gaming infrastructure and marketplace ecosystem", 82, ["gaming", "nft", "infrastructure"]),
  demand("Ronin", "roninchain.com", "Web3 / gaming blockchain ecosystem", 80, ["gaming", "consumer", "community"]),
  demand("Pixels", "pixels.xyz", "Web3 / on-chain social farming game", 72, ["gaming", "consumer", "community"]),
  demand("Axie Infinity", "axieinfinity.com", "Web3 / gaming and NFT ecosystem", 72, ["gaming", "nft", "community"]),
  demand("Illuvium", "illuvium.io", "Web3 / game studio and token ecosystem", 70, ["gaming", "tokens", "community"]),
  demand("Big Time", "bigtime.gg", "Web3 / multiplayer action RPG economy", 70, ["gaming", "nft", "consumer"]),
  demand("Parallel", "parallel.life", "Web3 / trading card game ecosystem", 72, ["gaming", "cards", "nft"]),
  demand("Treasure", "treasure.lol", "Web3 / gaming ecosystem and marketplace", 72, ["gaming", "community", "marketplace"]),
  demand("OpenSea Pro", "pro.opensea.io", "Web3 / NFT trading product", 72, ["nft", "traders", "marketplace"]),
  demand("Blur", "blur.io", "Web3 / NFT marketplace and trader product", 78, ["nft", "traders", "marketplace"]),
  demand("Tensor", "tensor.trade", "Web3 / Solana NFT marketplace", 76, ["nft", "solana", "marketplace"]),
  demand("Magic Eden Wallet", "wallet.magiceden.io", "Web3 / NFT wallet and marketplace product", 72, ["nft", "wallet", "consumer"]),
  demand("Manifold", "manifold.xyz", "Web3 / creator NFT tooling", 70, ["creator", "nft", "tools"]),
  demand("Sound.xyz", "sound.xyz", "Web3 / music and creator platform", 70, ["creator", "music", "nft"]),
  demand("Mirror", "mirror.xyz", "Web3 / creator publishing platform", 72, ["creator", "publishing", "community"]),
  demand("Paragraph", "paragraph.xyz", "Web3 / newsletter and creator platform", 70, ["creator", "publishing", "community"]),
  demand("Drakula", "drakula.app", "Web3 / creator video app", 68, ["creator", "video", "consumer"]),
  demand("friend.tech", "friend.tech", "Web3 / social finance app", 72, ["socialfi", "consumer", "creators"]),
  demand("FriendTech V2", "friend.tech", "Web3 / social token and club product", 70, ["socialfi", "clubs", "consumer"]),
  demand("Friendzone", "friendzone.gg", "Web3 / social graph and rewards product", 66, ["socialfi", "rewards", "consumer"]),
  demand("Fantasy.top", "fantasy.top", "Web3 / creator trading card product", 72, ["socialfi", "creators", "cards"]),
  demand("DeBank", "debank.com", "Web3 / portfolio, social, and wallet data platform", 78, ["wallet", "data", "social"]),
  demand("Zapper", "zapper.xyz", "Web3 / portfolio and on-chain discovery app", 76, ["wallet", "portfolio", "consumer"]),
  demand("Zerion", "zerion.io", "Web3 / wallet and portfolio app", 76, ["wallet", "portfolio", "defi"]),
  demand("Rainbow", "rainbow.me", "Web3 / consumer Ethereum wallet", 78, ["wallet", "consumer", "ethereum"]),
  demand("Trust Wallet", "trustwallet.com", "Web3 / multi-chain consumer wallet", 78, ["wallet", "consumer", "multi-chain"]),
  demand("Backpack", "backpack.app", "Web3 / wallet and exchange ecosystem", 76, ["wallet", "exchange", "solana"]),
  demand("Frame", "frame.sh", "Web3 / desktop Ethereum wallet", 68, ["wallet", "ethereum", "power-users"]),
  demand("Argent", "argent.xyz", "Web3 / smart wallet and Starknet wallet", 74, ["wallet", "smart-account", "starknet"]),
  demand("Braavos", "braavos.app", "Web3 / Starknet wallet", 68, ["wallet", "starknet", "consumer"]),
  demand("Jito", "jito.network", "Web3 / Solana MEV and staking infrastructure", 80, ["solana", "staking", "infrastructure"]),
  demand("Marinade", "marinade.finance", "Web3 / Solana liquid staking protocol", 74, ["solana", "staking", "defi"]),
  demand("Kamino", "kamino.finance", "Web3 / Solana DeFi protocol", 78, ["solana", "defi", "lending"]),
  demand("Drift", "drift.trade", "Web3 / Solana derivatives exchange", 78, ["solana", "defi", "trading"]),
  demand("MarginFi", "marginfi.com", "Web3 / Solana lending protocol", 72, ["solana", "defi", "lending"]),
  demand("Meteora", "meteora.ag", "Web3 / Solana liquidity protocol", 74, ["solana", "defi", "liquidity"]),
  demand("Raydium", "raydium.io", "Web3 / Solana DEX", 76, ["solana", "defi", "dex"]),
  demand("Orca", "orca.so", "Web3 / Solana DEX", 74, ["solana", "defi", "dex"]),
  demand("Curve", "curve.fi", "Web3 / DeFi stable-swap protocol", 78, ["defi", "dex", "stablecoin"]),
  demand("MakerDAO", "makerdao.com", "Web3 / DeFi stablecoin protocol", 78, ["defi", "stablecoin", "dao"]),
  demand("Sky", "sky.money", "Web3 / DeFi stablecoin and savings ecosystem", 76, ["defi", "stablecoin", "consumer"]),
  demand("Compound", "compound.finance", "Web3 / DeFi lending protocol", 74, ["defi", "lending", "dao"]),
  demand("Synthetix", "synthetix.io", "Web3 / derivatives liquidity protocol", 74, ["defi", "derivatives", "dao"]),
  demand("GMX", "gmx.io", "Web3 / decentralized perpetuals exchange", 76, ["defi", "perps", "trading"]),
  demand("dYdX", "dydx.trade", "Web3 / decentralized derivatives exchange", 78, ["defi", "perps", "trading"]),
  demand("Aerodrome", "aerodrome.finance", "Web3 / Base DEX and liquidity protocol", 78, ["base", "defi", "dex"]),
  demand("Velodrome", "velodrome.finance", "Web3 / Optimism DEX and liquidity protocol", 74, ["optimism", "defi", "dex"]),
  demand("Sushi", "sushi.com", "Web3 / multi-chain DEX protocol", 72, ["defi", "dex", "multi-chain"]),
  demand("Balancer", "balancer.fi", "Web3 / AMM and liquidity protocol", 72, ["defi", "liquidity", "dao"]),
  demand("1inch", "1inch.io", "Web3 / DEX aggregator", 78, ["defi", "aggregator", "traders"]),
  demand("CowSwap", "cow.fi", "Web3 / intent-based DEX protocol", 76, ["defi", "dex", "intent"]),
  demand("Matcha", "matcha.xyz", "Web3 / DEX aggregator product", 72, ["defi", "aggregator", "consumer"]),
  demand("Rocket Pool", "rocketpool.net", "Web3 / decentralized Ethereum staking protocol", 74, ["staking", "ethereum", "dao"]),
  demand("Swell", "swellnetwork.io", "Web3 / liquid staking and restaking protocol", 72, ["staking", "restaking", "defi"]),
  demand("Ether.fi", "ether.fi", "Web3 / liquid restaking protocol", 78, ["restaking", "defi", "ethereum"]),
  demand("Renzo", "renzoprotocol.com", "Web3 / liquid restaking protocol", 74, ["restaking", "defi", "ethereum"]),
  demand("Kelp DAO", "kelpdao.xyz", "Web3 / liquid restaking protocol", 72, ["restaking", "defi", "dao"]),
  demand("Puffer", "puffer.fi", "Web3 / liquid restaking and validator protocol", 74, ["restaking", "infrastructure", "ethereum"]),
  demand("Avail", "availproject.org", "Web3 / data availability and rollup infrastructure", 76, ["modular", "data-availability", "infrastructure"]),
  demand("Dymension", "dymension.xyz", "Web3 / rollapp and modular blockchain ecosystem", 74, ["modular", "rollups", "ecosystem"]),
  demand("Manta Network", "manta.network", "Web3 / modular L2 and privacy ecosystem", 72, ["l2", "modular", "privacy"]),
  demand("Taiko", "taiko.xyz", "Web3 / based rollup ecosystem", 76, ["l2", "ethereum", "zk"]),
  demand("Mode", "mode.network", "Web3 / OP Stack L2 ecosystem", 72, ["l2", "defi", "builders"]),
  demand("Mitosis", "mitosis.org", "Web3 / liquidity and modular ecosystem", 68, ["defi", "modular", "liquidity"]),
  demand("Across", "across.to", "Web3 / cross-chain bridge and intents protocol", 76, ["bridge", "intent", "interop"]),
  demand("Stargate", "stargate.finance", "Web3 / omnichain liquidity transport", 74, ["bridge", "liquidity", "interop"]),
  demand("Synapse", "synapseprotocol.com", "Web3 / cross-chain bridge and messaging", 70, ["bridge", "interop", "multi-chain"]),
  demand("Axelar", "axelar.network", "Web3 / interoperability network", 76, ["interop", "developers", "infrastructure"]),
  demand("Socket", "socket.tech", "Web3 / chain abstraction and interoperability protocol", 72, ["interop", "abstraction", "developers"]),
  demand("Li.Fi", "li.fi", "Web3 / bridge aggregation and cross-chain infrastructure", 74, ["bridge", "aggregation", "developers"]),
  demand("Pyth", "pyth.network", "Web3 / oracle network", 78, ["oracle", "data", "defi"]),
  demand("RedStone", "redstone.finance", "Web3 / oracle infrastructure", 74, ["oracle", "defi", "infrastructure"]),
  demand("API3", "api3.org", "Web3 / oracle and API infrastructure", 70, ["oracle", "api", "dao"]),
  demand("The Graph", "thegraph.com", "Web3 / indexing protocol", 78, ["data", "indexing", "developers"]),
  demand("Goldsky", "goldsky.com", "Web3 / crypto data indexing infrastructure", 72, ["data", "developers", "infrastructure"]),
  demand("Dune", "dune.com", "Web3 / community analytics platform", 80, ["data", "analytics", "community"]),
  demand("Flipside", "flipsidecrypto.xyz", "Web3 / blockchain analytics and community data", 74, ["data", "analytics", "community"]),
  demand("Covalent", "covalenthq.com", "Web3 / blockchain data API", 70, ["data", "api", "developers"]),
  demand("Moralis", "moralis.io", "Web3 / developer data and API platform", 70, ["data", "api", "developers"]),
  demand("Tenderly", "tenderly.co", "Web3 / smart contract developer platform", 78, ["developers", "debugging", "infrastructure"]),
  demand("Thirdweb", "thirdweb.com", "Web3 / app development platform", 76, ["developers", "sdk", "infrastructure"]),
  demand("Alchemy Pay", "alchemypay.org", "Web3 / fiat-crypto payments", 72, ["payments", "fiat", "consumer"]),
  demand("MoonPay", "moonpay.com", "Web3 / fiat onramp and payment infrastructure", 78, ["payments", "onramp", "consumer"]),
  demand("Transak", "transak.com", "Web3 / fiat onramp infrastructure", 72, ["payments", "onramp", "wallets"]),
  demand("Layer3", "layer3.xyz", "Web3 / quests and user acquisition platform", 80, ["quests", "growth", "community"]),
  demand("Zealy", "zealy.io", "Web3 / community quest platform", 74, ["quests", "community", "growth"]),
  demand("QuestN", "questn.com", "Web3 / quest and community growth platform", 70, ["quests", "community", "growth"]),
  demand("Guild", "guild.xyz", "Web3 / token-gated community infrastructure", 74, ["community", "access", "dao"]),
  demand("Snapshot", "snapshot.org", "Web3 / governance voting platform", 74, ["dao", "governance", "community"]),
];

export const DAILY_WEB3_SUPPLY_CANDIDATES: DailyIngestionCandidate[] = [
  supply("Cobie", "x.com/cobie", "Web3 / crypto-native culture and trading audience", 96, ["kol", "traders", "culture"]),
  supply("Bankless", "bankless.com", "Web3 / Ethereum education and media audience", 94, ["media", "ethereum", "education"]),
  supply("The Defiant", "thedefiant.io", "Web3 / DeFi media and research audience", 90, ["media", "defi", "research"]),
  supply("CoinDesk", "coindesk.com", "Web3 / mainstream crypto media audience", 90, ["media", "news", "institutions"]),
  supply("Cointelegraph", "cointelegraph.com", "Web3 / global crypto news audience", 86, ["media", "news", "retail"]),
  supply("Decrypt", "decrypt.co", "Web3 / crypto culture and news media", 84, ["media", "culture", "news"]),
  supply("Messari", "messari.io", "Web3 / institutional research audience", 92, ["research", "data", "institutions"]),
  supply("Delphi Digital", "delphidigital.io", "Web3 / crypto research and venture audience", 90, ["research", "venture", "institutions"]),
  supply("Electric Capital", "electriccapital.com", "Web3 / developer and venture research audience", 88, ["research", "developers", "venture"]),
  supply("a16z Crypto", "a16zcrypto.com", "Web3 / founder, builder, and policy audience", 92, ["venture", "founders", "policy"]),
  supply("Paradigm", "paradigm.xyz", "Web3 / research, engineering, and founder audience", 90, ["research", "founders", "engineering"]),
  supply("Dragonfly", "dragonfly.xyz", "Web3 / global crypto venture audience", 84, ["venture", "global", "founders"]),
  supply("Variant", "variant.fund", "Web3 / consumer crypto and ownership economy audience", 82, ["venture", "consumer", "founders"]),
  supply("1kx", "1kx.network", "Web3 / token network and founder audience", 78, ["venture", "token", "founders"]),
  supply("IOSG Ventures", "iosg.vc", "Web3 / Asia and global crypto venture audience", 78, ["venture", "asia", "founders"]),
  supply("Mechanism Capital", "mechanism.capital", "Web3 / DeFi and crypto venture audience", 78, ["venture", "defi", "founders"]),
  supply("Spartan Group", "spartangroup.io", "Web3 / Asia crypto venture and advisory audience", 76, ["venture", "asia", "advisory"]),
  supply("Hasu", "x.com/hasufl", "Web3 / crypto research and protocol audience", 88, ["research", "ethereum", "protocols"]),
  supply("DCinvestor", "x.com/iamDCinvestor", "Web3 / Ethereum, NFT, and collector audience", 82, ["ethereum", "nft", "collectors"]),
  supply("Eric Wall", "x.com/ercwl", "Web3 / Bitcoin, Ethereum, and crypto critique audience", 80, ["bitcoin", "ethereum", "research"]),
  supply("Mert Mumtaz", "x.com/0xMert_", "Web3 / Solana builder and founder audience", 84, ["solana", "builders", "founders"]),
  supply("Toly", "x.com/aeyakovenko", "Web3 / Solana founder and developer audience", 88, ["solana", "developers", "founders"]),
  supply("Austin Federa", "x.com/Austin_Federa", "Web3 / Solana ecosystem and policy audience", 78, ["solana", "ecosystem", "policy"]),
  supply("Anatoly Yakovenko", "x.com/aeyakovenko", "Web3 / Solana engineering and ecosystem audience", 88, ["solana", "engineering", "ecosystem"]),
  supply("Ansem", "x.com/blknoiz06", "Web3 / crypto trading and culture audience", 84, ["traders", "culture", "memecoins"]),
  supply("Degen Spartan", "x.com/DegenSpartan", "Web3 / DeFi and trading audience", 82, ["defi", "traders", "culture"]),
  supply("CL", "x.com/CL207", "Web3 / crypto trading audience", 78, ["traders", "markets", "crypto"]),
  supply("GCR", "x.com/GiganticRebirth", "Web3 / crypto trading and market audience", 82, ["traders", "markets", "macro"]),
  supply("CryptoCred", "x.com/CryptoCred", "Web3 / technical analysis education audience", 76, ["education", "trading", "technical-analysis"]),
  supply("Koroush AK", "x.com/KoroushAK", "Web3 / crypto trading education audience", 74, ["education", "trading", "retail"]),
  supply("Crypto Twitter Daily", "x.com/CTD", "Web3 / crypto-native social audience", 70, ["social", "culture", "retail"]),
  supply("ZachXBT", "x.com/zachxbt", "Web3 / security, investigations, and trust audience", 92, ["security", "trust", "investigations"]),
  supply("SlowMist", "slowmist.com", "Web3 / security research audience", 86, ["security", "research", "asia"]),
  supply("PeckShield", "peckshield.com", "Web3 / security monitoring audience", 84, ["security", "monitoring", "risk"]),
  supply("CertiK", "certik.com", "Web3 / security audit and risk audience", 78, ["security", "audit", "risk"]),
  supply("Trail of Bits", "trailofbits.com", "Web3 / security engineering audience", 78, ["security", "engineering", "audit"]),
  supply("OpenZeppelin", "openzeppelin.com", "Web3 / smart contract developer and security audience", 84, ["security", "developers", "smart-contracts"]),
  supply("Immunefi", "immunefi.com", "Web3 / bug bounty and security audience", 82, ["security", "bug-bounty", "protocols"]),
  supply("Chainalysis", "chainalysis.com", "Web3 / compliance and investigation audience", 76, ["compliance", "security", "institutions"]),
  supply("TRM Labs", "trmlabs.com", "Web3 / compliance and risk intelligence audience", 74, ["compliance", "risk", "institutions"]),
  supply("Elliptic", "elliptic.co", "Web3 / compliance intelligence audience", 72, ["compliance", "risk", "institutions"]),
  supply("Banteg", "x.com/bantg", "Web3 / DeFi builder and Yearn audience", 78, ["defi", "builders", "ethereum"]),
  supply("Andre Cronje", "x.com/AndreCronjeTech", "Web3 / DeFi founder and developer audience", 82, ["defi", "founders", "developers"]),
  supply("Stani Kulechov", "x.com/StaniKulechov", "Web3 / DeFi and social graph founder audience", 84, ["defi", "social", "founders"]),
  supply("Hayden Adams", "x.com/haydenzadams", "Web3 / DeFi and Ethereum builder audience", 86, ["defi", "ethereum", "founders"]),
  supply("Rune Christensen", "x.com/RuneKek", "Web3 / DeFi stablecoin and governance audience", 78, ["defi", "stablecoin", "governance"]),
  supply("Kain Warwick", "x.com/kaiynne", "Web3 / DeFi derivatives and founder audience", 76, ["defi", "derivatives", "founders"]),
  supply("Tarun Chitra", "x.com/tarunchitra", "Web3 / DeFi research and mechanism design audience", 82, ["research", "defi", "mechanism-design"]),
  supply("Gauntlet", "gauntlet.xyz", "Web3 / DeFi risk and governance audience", 80, ["risk", "defi", "governance"]),
  supply("Chaos Labs", "chaoslabs.xyz", "Web3 / DeFi risk and simulation audience", 78, ["risk", "defi", "simulation"]),
  supply("LlamaRisk", "llamarisk.com", "Web3 / DeFi risk research audience", 72, ["risk", "defi", "research"]),
  supply("DeFi Dad", "x.com/DeFi_Dad", "Web3 / DeFi education audience", 78, ["education", "defi", "retail"]),
  supply("The Daily Gwei", "thedailygwei.xyz", "Web3 / Ethereum education audience", 82, ["ethereum", "education", "media"]),
  supply("Week in Ethereum News", "weekinethereumnews.com", "Web3 / Ethereum developer newsletter audience", 78, ["ethereum", "developers", "newsletter"]),
  supply("EthHub", "ethhub.io", "Web3 / Ethereum education audience", 76, ["ethereum", "education", "community"]),
  supply("Ethereum Foundation Blog", "blog.ethereum.org", "Web3 / Ethereum research and ecosystem audience", 84, ["ethereum", "research", "developers"]),
  supply("ETHGlobal", "ethglobal.com", "Web3 / hackathon and builder community", 84, ["developers", "hackathon", "community"]),
  supply("Devfolio", "devfolio.co", "Web3 / hackathon and builder audience", 76, ["developers", "hackathon", "community"]),
  supply("Encode Club", "encode.club", "Web3 / developer education and hackathon audience", 74, ["developers", "education", "hackathon"]),
  supply("Superteam", "superteam.fun", "Web3 / Solana builder community", 82, ["solana", "builders", "community"]),
  supply("Developer DAO", "developerdao.com", "Web3 / developer community", 74, ["developers", "dao", "community"]),
  supply("Boys Club", "boysclub.vip", "Web3 / culture, media, and community audience", 76, ["culture", "community", "media"]),
  supply("FWB", "fwb.help", "Web3 / culture and creator community", 74, ["culture", "creators", "community"]),
  supply("Seed Club", "seedclub.xyz", "Web3 / consumer crypto and community builder audience", 76, ["community", "consumer", "builders"]),
  supply("Forefront", "forefront.market", "Web3 / social token and community audience", 70, ["community", "social-token", "creators"]),
  supply("Collab.Land", "collab.land", "Web3 / token-gated community audience", 72, ["community", "access", "dao"]),
  supply("Gitcoin", "gitcoin.co", "Web3 / public goods and builder community", 80, ["public-goods", "builders", "community"]),
  supply("GreenPill", "greenpill.network", "Web3 / regen and public goods community", 70, ["public-goods", "community", "regen"]),
  supply("Kernel", "kernel.community", "Web3 / builder learning community", 74, ["builders", "education", "community"]),
  supply("BanklessDAO", "bankless.community", "Web3 / Ethereum media and DAO community", 72, ["dao", "media", "ethereum"]),
  supply("Farcaster", "warpcast.com", "Web3 / social graph and creator audience", 84, ["social", "creators", "consumer"]),
  supply("Farcaster Builders", "farcaster.xyz", "Web3 / decentralized social builder audience", 82, ["social", "builders", "developers"]),
  supply("Base Community", "base.org", "Web3 / Base builder and consumer audience", 82, ["base", "builders", "consumer"]),
  supply("Solana Foundation", "solana.org", "Web3 / Solana ecosystem and developer audience", 86, ["solana", "ecosystem", "developers"]),
  supply("Polygon Labs", "polygon.technology", "Web3 / Ethereum scaling and BD audience", 80, ["polygon", "ecosystem", "developers"]),
  supply("Arbitrum DAO", "arbitrum.foundation", "Web3 / L2 governance and ecosystem audience", 78, ["arbitrum", "dao", "ecosystem"]),
  supply("Optimism Collective", "optimism.io", "Web3 / Superchain governance and builder audience", 78, ["optimism", "governance", "builders"]),
  supply("Starknet Foundation", "starknet.io", "Web3 / Starknet developer and ecosystem audience", 76, ["starknet", "developers", "ecosystem"]),
  supply("zkSync Community", "zksync.io", "Web3 / ZK ecosystem and developer audience", 76, ["zksync", "developers", "community"]),
  supply("Solana Legend", "x.com/SolanaLegend", "Web3 / Solana retail and ecosystem audience", 74, ["solana", "retail", "community"]),
  supply("SolanaFloor", "x.com/SolanaFloor", "Web3 / Solana news and market audience", 76, ["solana", "media", "news"]),
  supply("The Rollup", "therollup.co", "Web3 / modular blockchain and rollup audience", 76, ["modular", "rollups", "media"]),
  supply("Modular Media", "x.com/modularmedia", "Web3 / modular blockchain audience", 70, ["modular", "media", "builders"]),
  supply("Blocmates", "blocmates.com", "Web3 / DeFi education and research audience", 74, ["defi", "education", "research"]),
  supply("Alpha Please", "alphaplease.com", "Web3 / crypto market newsletter audience", 72, ["newsletter", "markets", "retail"]),
  supply("The Tie", "thetie.io", "Web3 / institutional crypto data and media audience", 74, ["data", "institutions", "media"]),
  supply("Kaiko", "kaiko.com", "Web3 / market data and institutional research audience", 72, ["data", "markets", "institutions"]),
  supply("Glassnode", "glassnode.com", "Web3 / on-chain data and macro audience", 78, ["data", "on-chain", "macro"]),
  supply("Santiment", "santiment.net", "Web3 / on-chain and social data audience", 70, ["data", "social", "analytics"]),
  supply("Token Unlocks", "token.unlocks.app", "Web3 / tokenomics and unlock data audience", 74, ["data", "tokenomics", "traders"]),
  supply("CryptoRank", "cryptorank.io", "Web3 / token and fundraising data audience", 70, ["data", "tokens", "research"]),
  supply("RootData", "rootdata.com", "Web3 / project and fundraising intelligence audience", 72, ["data", "fundraising", "research"]),
  supply("CoinGecko", "coingecko.com", "Web3 / retail market data audience", 82, ["data", "retail", "markets"]),
  supply("CoinMarketCap", "coinmarketcap.com", "Web3 / retail market data audience", 82, ["data", "retail", "markets"]),
  supply("L2Beat", "l2beat.com", "Web3 / L2 risk and data audience", 84, ["data", "l2", "risk"]),
  supply("GrowThePie", "growthepie.xyz", "Web3 / Ethereum scaling analytics audience", 78, ["data", "l2", "analytics"]),
  supply("Artemis", "artemis.xyz", "Web3 / crypto fundamentals data audience", 78, ["data", "fundamentals", "research"]),
  supply("OurNetwork", "ournetwork.xyz", "Web3 / on-chain analytics newsletter audience", 74, ["newsletter", "analytics", "data"]),
  supply("Revelo Intel", "revelointel.com", "Web3 / research and podcast audience", 72, ["research", "podcast", "media"]),
  supply("Empire", "blockworks.co/podcast/empire", "Web3 / founder and investor podcast audience", 78, ["podcast", "founders", "investors"]),
  supply("Uncommon Core", "uncommoncore.co", "Web3 / crypto research podcast audience", 72, ["podcast", "research", "markets"]),
  supply("Lightspeed", "blockworks.co/podcast/lightspeed", "Web3 / Solana podcast audience", 74, ["podcast", "solana", "media"]),
  supply("Bell Curve", "blockworks.co/podcast/bell-curve", "Web3 / protocol and market structure audience", 72, ["podcast", "research", "protocols"]),
  supply("The Chopping Block", "unchainedcrypto.com/the-chopping-block", "Web3 / crypto founder and investor podcast audience", 70, ["podcast", "founders", "investors"]),
];

function fromDiscovery(target: (typeof WEB3_DISCOVERY_TARGETS)[number]): DailyIngestionCandidate {
  return {
    id: target.id.replace("web3.discovery.", "web3.daily."),
    name: target.name,
    identity: target.identity,
    kind: target.kind,
    domain: target.domain,
    side: target.segment,
    source: target.source,
    priority: target.priority,
    tags: target.tags,
    ingestionReason: target.segment === "demand"
      ? "Existing Web3 discovery demand target promoted into the daily ingestion system."
      : "Existing Web3 discovery supply target promoted into the daily ingestion system.",
  };
}

function normalizeIdentity(identity: string) {
  return identity.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function sourceMatches(candidate: DailyIngestionCandidate) {
  const identity = normalizeIdentity(candidate.identity);
  const candidateSource = String(candidate.source || "");
  return GLOBAL_WEB3_DISCOVERY_SOURCES.filter((source) => {
    if (source.side !== "both" && source.side !== candidate.side) return false;
    if (candidateSource.includes(source.id)) return true;
    if (identity.includes(source.id.replace("-feeds", ""))) return true;
    if (candidate.source === "media_research" && ["media", "research"].includes(source.category)) return true;
    if (candidate.source === "data_security" && ["market_data", "security", "research"].includes(source.category)) return true;
    if (candidate.tags.some((tag) => source.signalTypes.includes(tag))) return true;
    if (candidate.tags.some((tag) => tag.includes(source.category))) return true;
    return false;
  });
}

function scoreCandidate(candidate: DailyIngestionCandidate): DailyIngestionCandidate {
  const sources = sourceMatches(candidate);
  const sourceTrust = sources.length > 0
    ? Math.round(sources.reduce((sum, source) => sum + source.trust, 0) / sources.length)
    : 58;
  const activeBonus = sources.some((source) => source.status === "active") ? 6 : 0;
  const freshnessBonus = sources.some((source) => source.freshness === "daily") ? 5 : sources.some((source) => source.freshness === "weekly") ? 3 : 1;
  const tagBreadthBonus = Math.min(8, candidate.tags.length * 2);
  const sideBonus = candidate.side === "demand"
    ? candidate.tags.some((tag) => ["consumer", "defi", "wallet", "infrastructure", "gaming"].includes(tag)) ? 5 : 0
    : candidate.tags.some((tag) => ["media", "research", "security", "community", "education", "data"].includes(tag)) ? 5 : 0;
  const discoveryScore = Math.max(1, Math.min(100, Math.round(candidate.priority * 0.55 + sourceTrust * 0.3 + activeBonus + freshnessBonus + tagBreadthBonus + sideBonus)));
  return {
    ...candidate,
    discoveryScore,
    sourceCoverage: sources.map((source) => source.id),
  };
}

function buildSourceSummary(targets: DailyIngestionCandidate[]) {
  const coveredSources = new Set(targets.flatMap((target) => target.sourceCoverage || []));
  const activeSources = GLOBAL_WEB3_DISCOVERY_SOURCES.filter((source) => source.status === "active").length;
  const plannedSources = GLOBAL_WEB3_DISCOVERY_SOURCES.filter((source) => source.status === "planned").length;
  const scored = targets.filter((target) => typeof target.discoveryScore === "number");
  const avgDiscoveryScore = scored.length > 0
    ? Math.round(scored.reduce((sum, target) => sum + (target.discoveryScore || 0), 0) / scored.length)
    : 0;
  const coverageByCategory = GLOBAL_WEB3_DISCOVERY_SOURCES.reduce<Record<string, number>>((acc, source) => {
    acc[source.category] = (acc[source.category] || 0) + (coveredSources.has(source.id) ? 1 : 0);
    return acc;
  }, {});
  return {
    registeredSources: GLOBAL_WEB3_DISCOVERY_SOURCES.length,
    activeSources,
    plannedSources,
    coveredSources: coveredSources.size,
    avgDiscoveryScore,
    coverageByCategory,
  };
}

function uniqueByIdentity(candidates: DailyIngestionCandidate[]) {
  const seen = new Set<string>();
  const result: DailyIngestionCandidate[] = [];
  for (const item of candidates) {
    const key = normalizeIdentity(item.identity);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function selectBalanced(candidates: DailyIngestionCandidate[], count: number, date: string) {
  const dayOffset = Math.floor(Date.parse(`${date}T00:00:00.000Z`) / 86400000);
  const ordered = uniqueByIdentity(candidates.map(scoreCandidate)).sort((a, b) => (b.discoveryScore || b.priority) - (a.discoveryScore || a.priority) || a.name.localeCompare(b.name));
  if (ordered.length <= count) return ordered;
  const top = ordered.slice(0, Math.ceil(count * 0.7));
  const rotatingPool = ordered.slice(top.length);
  const selected = [...top];
  let index = dayOffset % Math.max(1, rotatingPool.length);
  while (selected.length < count && rotatingPool.length > 0) {
    selected.push(rotatingPool[index % rotatingPool.length]);
    index++;
  }
  return selected.slice(0, count);
}

export function buildDailyWeb3IngestionBatch(
  date = new Date().toISOString().slice(0, 10),
  demandTarget = 100,
  supplyTarget = 100,
  liveCandidates: DailyIngestionCandidate[] = [],
): DailyIngestionBatch {
  const discoveryCandidates = WEB3_DISCOVERY_TARGETS.map(fromDiscovery);
  const demandCandidates = [
    ...liveCandidates.filter((target) => target.side === "demand"),
    ...discoveryCandidates.filter((target) => target.side === "demand"),
    ...DAILY_WEB3_DEMAND_CANDIDATES,
  ];
  const supplyCandidates = [
    ...liveCandidates.filter((target) => target.side === "supply"),
    ...discoveryCandidates.filter((target) => target.side === "supply"),
    ...DAILY_WEB3_SUPPLY_CANDIDATES,
  ];
  const demand = selectBalanced(demandCandidates, demandTarget, date);
  const supply = selectBalanced(supplyCandidates, supplyTarget, date);
  const targets = [...demand, ...supply];
  return {
    id: `web3_daily_ingestion_${date}`,
    date,
    demandTarget,
    supplyTarget,
    demand,
    supply,
    targets,
    sourceSummary: buildSourceSummary(targets),
  };
}

export function dailyCandidateToRealityTarget(candidate: DailyIngestionCandidate): RealityTarget {
  return {
    id: candidate.id,
    name: candidate.name,
    identity: candidate.identity,
    kind: candidate.kind,
    domain: candidate.domain,
  };
}
