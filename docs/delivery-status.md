# GroIntel Delivery Status

Last updated: 2026-06-24

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
8. The Web3 event intake form can add new historical growth events.
9. `/world` shows the Web3 Living World, reality signals, four-layer memory status, and growth event memory.
10. Web3 KOLs, media, research providers, security voices, and creator communities are now first-class supply-side world entities.
11. `/api/grointel/heartbeat` runs the scheduled reality observation cycle and seeds Web3 event memory.

## Live Routes

- `/web3-growth` - Web3 demand-to-decision workspace.
- `/identity` - unified one-signal identity intake for companies and KOLs.
- `/world` - Web3 Living World dashboard.
- `/agent-reach` - source/connector doctor for social and web routes.
- `/api/grointel/identity-intake` - identity classification and first-pass understanding API.
- `/api/grointel/web3-decision` - Web3 growth decision API.
- `/api/grointel/growth-events` - growth event memory read/write API.
- `/api/grointel/heartbeat` - scheduled reality heartbeat.
- `/api/grointel/world-memory-status` - persistent world memory table status.

## Four-Layer Memory

The memory model is implemented as:

1. L1 raw reality memory: `world_observations`, `world_signals`, `world_evidence`.
2. L2 entity understanding memory: `world_entity_memories`.
3. L3 decision memory: `world_decision_memories`.
4. L4 evolution memory: `world_evolution_memories`.

Historical company/KOL/channel collaboration events are stored in `world_growth_events`.

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

GroIntel now falls back to these legacy tables when the primary `013_world_memory.sql` tables are missing. Production smoke tests confirm:

- growth event intake returns `saved=true` via `world_events`
- heartbeat returns `memory.saved=true` via legacy world tables
- `/world` and `/api/grointel/world` read observations, signals, evidence, and growth events from legacy tables when primary tables are absent
- `/api/grointel/web3-decision` merges legacy growth events with built-in Web3 seed memory, so new memories enhance the base event library instead of replacing it
- `/api/grointel/web3-decision` returns `recommendedConcretePartners` from Web3 Supply World, not just generic partner categories
- `/api/grointel/heartbeat` exposes top-level `status=alive`, `memorySaved`, and `growthEventsSaved` for simple monitors
- `/world` separates Demand World and Supply World, and shows Web3 Growth Supply Memory for KOL/media/research supply

The primary 4-layer schema is still the preferred long-term structure, but the system no longer depends on it to start accumulating memory.

## Verification

Local verification used:

```text
npm run build
npm test
npm run smoke
```

Production smoke checks used:

- `POST https://grointel.vercel.app/api/grointel/identity-intake`
- `GET https://grointel.vercel.app/web3-growth`
- `POST https://grointel.vercel.app/api/grointel/web3-decision`
- `GET https://grointel.vercel.app/api/grointel/world`
- `GET https://grointel.vercel.app/world`
- `GET https://grointel.vercel.app/api/grointel/world-memory-status`

Optional heartbeat smoke:

```text
node scripts/smoke-grointel.mjs --heartbeat
```
