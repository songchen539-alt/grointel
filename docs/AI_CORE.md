# GroIntel AI Core v1

## Architecture

```
src/lib/ai/
  index.ts                    -- Main entry, re-exports all modules
  recommendation/
    types.ts                  -- Shared AI interfaces (GrowthNeed, Channel, etc.)
    features.ts               -- Feature extraction from raw growth need data
    ruleEngine.ts             -- Deterministic scoring engine (industry/problem/region/budget/timeline)
    scoring.ts                -- Weighted scoring with custom weight support
    explain.ts                -- Human-readable explanation generator
    recommendation.ts         -- Main recommendation pipeline
    index.ts
  ranking/
    ranking.ts                -- Identity ranking (future: Learning-to-Rank)
    history.ts                -- Historical outcome tracker
    confidence.ts             -- Confidence scoring based on data quality
    index.ts
  embedding/
    provider.ts               -- Embedding provider interface (OpenAI, Voyage, etc.)
    embedding.ts              -- Mock provider (deterministic vectors for testing)
    vector.ts                 -- Vector operations (cosine similarity, normalization)
    similarity.ts             -- Entity similarity computation
    index.ts
  common/
    constants.ts              -- AI constants (weights, thresholds, solution types)
    utils.ts                  -- Utility functions
    logger.ts                 -- Structured AI logger
    cache.ts                  -- In-memory result cache
  __tests__/
    core.test.ts              -- 27 unit tests
```

## Data Flow

```
Raw Growth Need
    |
    v
Feature Extraction (features.ts)
  - Industry normalization
  - Region detection
  - Budget range parsing
  - Timeline estimation
  - Company size estimation
  - Problem keyword extraction
    |
    v
Rule Engine (ruleEngine.ts)
  - Industry match scoring (30% weight)
  - Problem fit scoring (25% weight)
  - Regional expertise (15% weight)
  - Budget compatibility (15% weight)
  - Timeline alignment (10% weight)
  - Historical outcomes (5% weight)
    |
    v
Ranking (ranking/index.ts)
  - Identity ranking (current)
  - History boost (optional)
  - Future: Learning-to-Rank
    |
    v
Explanation (explain.ts)
  - Summary generation
  - Per-dimension breakdown
  - Confidence level
    |
    v
Recommendation[]
```

## Recommendation Pipeline

```typescript
import { recommend } from "@lib/ai";

const recs = recommend({
  growthNeed,   // Raw growth need data
  channels,     // Available channels
  services,     // Channel services
  historicalOutcomes, // Optional past results
});

// recs is sorted by overallScore descending
// Each rec has: channelId, serviceId, overallScore, featureScores, confidence, reasons, matchReason
```

## Future Embedding Layer

The embedding layer is designed as a provider abstraction:

```typescript
interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<number[]>;
  similarity(a: number[], b: number[]): number;
}
```

Implementations to add:
- **OpenAI**: `text-embedding-3-small` or `text-embedding-ada-002`
- **Voyage**: `voyage-2` or `voyage-code-2`
- **Cohere**: `embed-english-v3.0`
- **Jina**: `jina-embeddings-v3`
- **Local**: `all-MiniLM-L6-v2` via ONNX runtime

## Future Learning-to-Rank

The ranking layer currently implements identity ranking (preserves order).
Future improvements:

1. **History-weighted ranking** -- Boost channels with positive outcomes
2. **Feature-weighted ranking** -- Learn optimal weight distribution
3. **ListNet / LambdaRank** -- Neural learning-to-rank
4. **Contextual bandits** -- Online learning from outcomes

## Extension Points

| Point | Location | Description |
|-------|----------|-------------|
| New scoring dimensions | `ruleEngine.ts` `ScoreBreakdown` | Add field, weight, and scorer function |
| Custom weights | `scoring.ts` `computeScore()` | Pass `Partial<Weights>` to override defaults |
| New embedding provider | `embedding/provider.ts` | Implement `EmbeddingProvider` interface |
| New solution types | `common/constants.ts` | Add to `SOLUTION_TYPES` array |
| Feature extraction | `features.ts` | Add new fields to `FeatureVector` and extraction logic |
| Ranking strategy | `ranking/ranking.ts` | Replace `rankRecommendations` with custom logic |

## No Production Impact

- No database schema changes
- No API behavior changes
- No UI changes
- No existing functionality modified
- Pure functions with no side effects
