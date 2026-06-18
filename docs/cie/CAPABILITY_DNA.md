# Capability DNA Specification

## Overview

Capability DNA is the latest AI-generated evaluation of a Growth Entity's capabilities across 10 standardized dimensions. Each dimension is scored 0-100 and carries a confidence level.

## Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| execution_score | 20% | Demonstrated execution capability through case studies and evidence |
| trust_score | 15% | Trustworthiness based on reviews, citations, and verification |
| authority_score | 15% | Domain authority from social presence and track record |
| reach_score | 10% | Audience reach across platforms and channels |
| audience_fit_score | 10% | Alignment between capabilities and target audience needs |
| industry_expertise_score | 10% | Depth of knowledge in primary industry |
| pricing_score | 5% | Pricing competitiveness |
| availability_score | 5% | Readiness to engage |
| innovation_score | 5% | Novelty of approach |
| roi_score | 5% | Return on investment evidence |

## Calculation

```
overall_score = SUM(dimension_score * weight) for all dimensions
```

## Storage

Table: `growth_capability_dna`

- Latest eval only (one row per passport)
- `extra_dimensions` (JSONB) for future flexibility
- `calculation_version` for tracking algorithm updates

## Future

New dimensions can be added:
1. Add column to `growth_capability_dna`
2. Add scoring logic to `calculateCapability.ts`
3. Add weight to the overall calculation
