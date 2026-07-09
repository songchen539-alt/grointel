# GroIntel

GroIntel is a growth-intelligence system for matching companies that need growth with KOLs, creators, media, research voices, communities, and other supply-side partners that can help them grow.

The first focused market is Web3. A company can enter one identity signal and receive growth-state understanding, risks, opportunities, next actions, and concrete Web3 KOL/supply matches. A KOL can enter one identity signal and receive company demand matches.

Production: https://grointel.vercel.app

## Main Routes

- `/identity` - one-signal intake for companies and KOLs.
- `/web3-growth` - Web3 company demand to growth decision and collaboration brief.
- `/world` - Web3 Living World, reality loop, memory, AI, discovery, and delivery readiness.
- `/agent-reach` - source and connector doctor.
- `/api/grointel/delivery-readiness` - single delivery self-check.
- `/api/grointel/heartbeat` - scheduled/manual reality observation heartbeat.
- `/api/grointel/ai-health` - AI provider health.
- `/api/grointel/web3-discovery` - expanded Web3 company/KOL target registry.

## Current Delivery State

As of 2026-07-09, production is configured with DeepSeek for real AI chat and JSON reasoning. The Web3 world has an expanded demand and supply pool, heartbeat persistence, legacy-to-four-layer memory projection, company-to-KOL matching, KOL-to-company matching, Web3 collaboration briefs, and a delivery-readiness endpoint.

Latest production smoke confirmed:

```text
ai health: real_ai_active / chat=deepseek
web3 discovery: demand=46 supply=36
delivery readiness: ready / score=100
heartbeat: alive
world memory layers: L2=6 L3=1 L4=1
```

See `docs/delivery-status.md` for the detailed handoff.

## Development

```bash
npm install
npm run build
npx tsx src/lib/grointel/__tests__/web3Decision.test.ts
npx tsx src/lib/grointel/__tests__/web3CollaborationBrief.test.ts
npm run smoke -- --heartbeat
```

For local development:

```bash
npm run dev
```

## Deployment

Production runs on Vercel:

```bash
npx vercel deploy --prod --yes
```

Vercel cron is configured in `vercel.json`:

```text
0 0 * * * -> /api/grointel/heartbeat
```

Vercel Hobby only supports daily cron frequency. Manual heartbeat is available at `/api/grointel/heartbeat?limit=2`.

## Environment

Do not commit API keys. Local `.env*` files are gitignored.

Important variables:

- `DEEPSEEK_API_KEY`
- `OPENAI_API_KEY`
- `AI_CHAT_PROVIDER`
- `AI_JSON_PROVIDER`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` if heartbeat authorization is enabled

## Memory

The preferred long-term schema is `supabase/migrations/013_world_memory.sql`.

Production currently has legacy world tables available. GroIntel writes to those when the primary four-layer tables are missing and projects legacy data into:

- L1 raw observations, signals, evidence
- L2 entity memory
- L3 decision memory
- L4 evolution memory

This keeps the living world inspectable while the primary Supabase migration is pending.
