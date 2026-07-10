# GroIntel Delivery Status

Last updated: 2026-07-09

## Current Product Loop

GroIntel is now wired around the intended loop:

Demand -> Intelligence -> Decision -> Action -> Supply

The first focused market is Web3. The current working path is:

1. User can start from one identity signal at `/identity`.
2. GroIntel classifies the subject as company or KOL/partner, creates the first understanding pass, and asks the missing questions that matter.
3. Web3 companies are automatically routed into the Web3 decision engine.
4. User can enter a Web3 project growth demand at `/web3-growth`.
5. GroIntel compares the demand against historical Web3 company/KOL/channel growth events.
6. The Web3 decision engine returns recommended supply types, partner profiles, collaboration patterns, risks, matched evidence events, measurement signals, qualification questions, and next actions.
7. The Web3 decision engine now recommends concrete KOL/media/research supply matches from Supply World, including fit score, suggested collaboration format, key metric, and primary risk.
8. The Web3 collaboration brief engine turns the shortlist into partner-specific angles, deliverables, outreach copy, success metrics, risk controls, qualification questions, and a four-phase pilot plan.
9. The AI Gateway now feeds Web3 decision/brief output with an AI growth insight: growth state, opportunity, risk, recommended move, missing evidence, and operator note.
10. Web3 KOLs can enter through `/identity` and receive company demand matches with fit score, fit reason, suggested collaboration format, key metric, and evidence pattern.
11. The Web3 event intake form can add new historical growth events.
12. `/world` shows the Web3 Living World, reality signals, four-layer memory status, and growth event memory.
13. Web3 KOLs, media, research providers, security voices, and creator communities are now first-class supply-side world entities.
14. `/api/grointel/heartbeat` runs the scheduled reality observation cycle and seeds Web3 event memory.
15. `/api/grointel/delivery-readiness` gives a single delivery status across AI, Web3 demand, KOL supply, reality loop, memory, and growth-event evidence.
16. `/world` now surfaces the same delivery-readiness state so operators can see whether the living world is ready without opening raw API JSON.
17. `/api/grointel/daily-ingestion` prepares a daily 100 Web3 demand entities + 100 Web3 KOL/supply entities batch.
18. `/api/grointel/daily-ingestion/run` executes the daily batch and persists it into primary world memory or legacy world tables.

## Live Routes

- `/web3-growth` - Web3 demand-to-decision workspace.
- `/identity` - unified one-signal identity intake for companies and KOLs.
- `/world` - Web3 Living World dashboard.
- `/agent-reach` - source/connector doctor for social and web routes.
- `/api/grointel/identity-intake` - identity classification and first-pass understanding API.
- `/api/grointel/web3-decision` - Web3 growth decision API.
- `/api/grointel/web3-collaboration-brief` - Web3 partner shortlist to execution brief API.
- `/api/grointel/growth-events` - growth event memory read/write API.
- `/api/grointel/heartbeat` - scheduled reality heartbeat.
- `/api/grointel/ai-health` - AI Gateway provider health and fallback status.
- `/api/grointel/web3-discovery` - expanded Web3 company/KOL discovery registry and runtime target pool.
- `/api/grointel/world-memory-status` - persistent world memory table status.
- `/api/grointel/delivery-readiness` - delivery self-check for real AI, demand/supply pool, heartbeat, four-layer memory, and growth-event memory.
- `/api/grointel/daily-ingestion` - preview daily 100 demand + 100 supply ingestion.
- `/api/grointel/daily-ingestion/run` - run daily ingestion for cron/manual execution.

## Four-Layer Memory

The memory model is implemented as:

1. L1 raw reality memory: `world_observations`, `world_signals`, `world_evidence`.
2. L2 entity understanding memory: `world_entity_memories`.
3. L3 decision memory: `world_decision_memories`.
4. L4 evolution memory: `world_evolution_memories`.

Historical company/KOL/channel collaboration events are stored in `world_growth_events`.

Production currently uses the legacy world tables as the persistence layer because the primary `013_world_memory.sql` tables are not installed yet. GroIntel projects those legacy observations, events, and signals into L2/L3/L4 memory so `/world`, `/api/grointel/world`, `/api/grointel/delivery-readiness`, and smoke tests can still inspect the four-layer model. The primary migration remains the preferred long-term schema.

## Web3 Seed Event Types

The first event library includes:

- Quest-based ecosystem growth: Arbitrum Odyssey, Optimism Quests.
- Celebrity and regulatory-risk growth: Binance x Cristiano Ronaldo.
- NFT community trust failure: Azuki Elementals.
- Crypto Twitter product-led virality: friend.tech.

The Business Intelligence core also has first-class Web3 entity knowledge for:

- Arbitrum
- Optimism
- Polygon
- Galxe
- friend.tech

The Capability Intelligence core has first-class Web3 KOL/media profiles for:

- Cobie
- Bankless
- The Defiant
- BitBoy Crypto risk profile

The World runtime also tracks a broader Web3 supply pool:

- Cobie
- Bankless
- The Defiant
- BitBoy Crypto
- Ansem
- Ignas
- ZachXBT
- DeFi Dad
- Coin Bureau
- Delphi Digital
- Messari
- Unchained

Heartbeat target selection is balanced so low-limit runs still observe both sides of the market. Production verification confirmed `limit=2` observed one KOL and one company.

## Known Deployment State

Production is deployed through Vercel from `main`.

If production appears to show the older Analyze/Sample Reports navigation or `/identity` returns 404, the alias is pointing at an old deployment. Restore the latest local `main` build with:

```text
npx vercel deploy --prod --yes
npm run smoke
```

`/api/grointel/world-memory-status` currently reports whether Supabase has the required world memory tables.

If `ready=false`, run:

```text
supabase/migrations/013_world_memory.sql
```

in the Supabase SQL editor or migration system. Until this migration is applied, GroIntel continues to operate from in-memory runtime plus built-in Web3 seed events, but long-term world memory writes return `saved=false`.

Update: production already has legacy world storage tables:

- `world_raw_observations`
- `world_events`
- `world_growth_signals`
- `world_entities`
- `world_contexts`
- `world_relationships`

GroIntel now falls back to these legacy tables when the primary `013_world_memory.sql` tables are missing. It also projects legacy memory into L2 entity memory, L3 decision memory, and L4 evolution memory. Production smoke tests confirm:

- growth event intake returns `saved=true` via `world_events`
- heartbeat returns `memory.saved=true` via legacy world tables
- `/world` and `/api/grointel/world` read observations, signals, evidence, and growth events from legacy tables when primary tables are absent
- `/api/grointel/web3-decision` merges legacy growth events with built-in Web3 seed memory, so new memories enhance the base event library instead of replacing it
- `/api/grointel/web3-decision` returns `recommendedConcretePartners` from Web3 Supply World, not just generic partner categories
- `/api/grointel/web3-collaboration-brief` returns partner-specific outreach, deliverables, metrics, risk controls, and pilot plan from the Web3 decision output
- `/api/grointel/web3-collaboration-brief` and Web3 company `/api/grointel/identity-intake` responses include `aiInsight` / `web3AIGrowthInsight` when the AI Gateway is available, with deterministic fallback if the provider fails
- `/api/grointel/identity-intake` returns KOL-to-company Web3 matches with fit score, fit reason, collaboration format, and key metric
- `/api/grointel/heartbeat` exposes top-level `status=alive`, `memorySaved`, and `growthEventsSaved` for simple monitors
- `/world` separates Demand World and Supply World, and shows Web3 Growth Supply Memory for KOL/media/research supply
- `/api/grointel/ai-health` exposes the active chat/json/embedding/rerank providers and whether GroIntel is running with a real AI provider, fallback-ready provider, or mock-only mode
- `/api/grointel/web3-discovery` exposes the expanded Web3 demand/supply registry used by heartbeat and World runtime
- `/api/grointel/delivery-readiness` reports `ready`, `score=100`, real AI passing, Web3 demand/supply counts, and non-empty L2/L3/L4 memory
- `/world` shows a Delivery Readiness band with score, pass/watch checks, and a link to the readiness API
- `/api/grointel/daily-ingestion` prepares 100 demand-side Web3 companies/protocols and 100 supply-side KOL/media/research/community entities per day
- Vercel cron runs `/api/grointel/daily-ingestion/run` daily after heartbeat to put those entities into runtime world and persistent/legacy memory

## AI Gateway

GroIntel can route generative understanding through:

- OpenAI via the Responses API when `OPENAI_API_KEY` is configured.
- DeepSeek when `DEEPSEEK_API_KEY` is configured.
- Deterministic mock fallback when no real model key is configured or a provider fails.

If no explicit `AI_CHAT_PROVIDER` / `AI_JSON_PROVIDER` is set, GroIntel automatically prefers OpenAI when `OPENAI_API_KEY` exists, then DeepSeek when `DEEPSEEK_API_KEY` exists, and otherwise mock fallback.

Production is currently configured to use DeepSeek for chat and JSON. `/api/grointel/ai-health` should report:

```text
mode=real_ai_active
chat=deepseek
json=deepseek
deepseek.status=healthy
```

Do not commit provider keys. Local `.env*` files are ignored, and production keys should be managed through Vercel environment variables.

## Web3 Discovery Registry

GroIntel now auto-expands the World target pool before every heartbeat or World snapshot. The registry currently covers 60+ Web3 demand/supply entities across:

- Demand: L1/L2 ecosystems, DeFi protocols, wallets, NFT/creator products, consumer crypto apps, developer infrastructure, interoperability, data availability, and identity.
- Supply: KOLs, crypto media, research providers, on-chain data providers, risk/security voices, trader audiences, and creator/community networks.

Initial landscape references include YC's Crypto/Web3 startup directory, Alchemy's Layer 2 ecosystem list, Messari Crypto Theses 2026, and public crypto media/research/KOL indices. The registry is not intended to be final; it is the bootstrap pool that heartbeat can continuously observe, score, and eventually replace with evidence-backed discovered entities.

The primary 4-layer schema is still the preferred long-term structure, but the system no longer depends on it to start accumulating memory.

## Verification

Local verification used:

```text
npm run build
npx tsx src/lib/grointel/__tests__/web3Decision.test.ts
npx tsx src/lib/grointel/__tests__/web3CollaborationBrief.test.ts
npm run smoke -- --heartbeat
```

Production smoke checks used:

- `POST https://grointel.vercel.app/api/grointel/identity-intake`
- `GET https://grointel.vercel.app/web3-growth`
- `POST https://grointel.vercel.app/api/grointel/web3-decision`
- `POST https://grointel.vercel.app/api/grointel/web3-collaboration-brief`
- `GET https://grointel.vercel.app/api/grointel/world`
- `GET https://grointel.vercel.app/world`
- `GET https://grointel.vercel.app/api/grointel/world-memory-status`
- `GET https://grointel.vercel.app/api/grointel/delivery-readiness`
- `GET https://grointel.vercel.app/api/grointel/daily-ingestion`

Optional heartbeat smoke:

```text
node scripts/smoke-grointel.mjs --heartbeat
```

Latest production smoke on 2026-07-09 confirmed:

```text
ai health: real_ai_active / chat=deepseek
web3 discovery: demand=46 supply=36
delivery readiness: ready / score=100
heartbeat: alive
world memory layers: L2=6 L3=1 L4=1
```
