# GroIntel Delivery Status

Last updated: 2026-06-24

## Current Product Loop

GroIntel is now wired around the intended loop:

Demand -> Intelligence -> Decision -> Action -> Supply

The first focused market is Web3. The current working path is:

1. User enters a Web3 project growth demand at `/web3-growth`.
2. GroIntel compares the demand against historical Web3 company/KOL/channel growth events.
3. The Web3 decision engine returns recommended supply types, collaboration patterns, risks, matched evidence events, and next actions.
4. The Web3 event intake form can add new historical growth events.
5. `/world` shows the Web3 Living World, reality signals, four-layer memory status, and growth event memory.
6. `/api/grointel/heartbeat` runs the scheduled reality observation cycle and seeds Web3 event memory.

## Live Routes

- `/web3-growth` - Web3 demand-to-decision workspace.
- `/world` - Web3 Living World dashboard.
- `/agent-reach` - source/connector doctor for social and web routes.
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

## Known Deployment State

Production is deployed through Vercel from `main`.

`/api/grointel/world-memory-status` currently reports whether Supabase has the required world memory tables.

If `ready=false`, run:

```text
supabase/migrations/013_world_memory.sql
```

in the Supabase SQL editor or migration system. Until this migration is applied, GroIntel continues to operate from in-memory runtime plus built-in Web3 seed events, but long-term world memory writes return `saved=false`.

## Verification

Local verification used:

```text
npm run build
npm test
```

Production smoke checks used:

- `GET https://grointel.vercel.app/web3-growth`
- `POST https://grointel.vercel.app/api/grointel/web3-decision`
- `GET https://grointel.vercel.app/world`
- `GET https://grointel.vercel.app/api/grointel/world-memory-status`

