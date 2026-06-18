# Capability Intelligence Engine - Database Schema

## Entity Relationship Diagram

```
growth_entities (1) ----< (1) growth_passports (1) ----< (1) growth_capability_dna
                                             (1) ----< (1) growth_audience_dna
                                             (1) ----< (*) growth_capability_history
                                             (1) ----< (*) growth_evidence
                                             (1) ----< (*) growth_capability_explanations
                                             (1) ----< (*) growth_relationships (source)
                                             (1) ----< (*) growth_relationships (target)
```

## Tables (CIE Addition)

### growth_capability_dna
Latest AI evaluation. One row per passport.

- `id` (uuid PK)
- `passport_id` (FK -> growth_passports)
- 10 score columns + `overall_score`
- `extra_dimensions` (jsonb)
- `confidence`, `evidence_count`, `calculation_version`
- `last_calculated`, `created_at`, `updated_at`

### growth_audience_dna
Audience profile. One row per passport.

- `id` (uuid PK)
- `passport_id` (FK -> growth_passports)
- 10 audience fields (mostly text[])
- `confidence`, `metadata` (jsonb)

### growth_capability_history
Append-only trace. Multiple rows per passport.

- `id` (uuid PK)
- `passport_id` (FK -> growth_passports)
- `capability_snapshot` (jsonb)
- `overall_score`, `confidence`, `reason`
- `evidence_used` (jsonb)
- `calculated_at`, `created_at`

### growth_evidence
Evidence items. Multiple rows per passport.

- `id` (uuid PK)
- `passport_id` (FK -> growth_passports)
- `evidence_type`, source metadata
- `credibility_score`, `verification_status`
- `metadata` (jsonb)

### growth_capability_explanations
XAI records. Multiple rows per passport.

- `id` (uuid PK)
- `passport_id` (FK -> growth_passports)
- `capability_name`, `score`, `confidence`, `reason`
- `evidence_used` (jsonb)
- `ai_model_version`, `generated_at`

### growth_relationships
Knowledge graph edges. Multiple rows.

- `id` (uuid PK)
- `source_passport_id` (FK)
- `target_passport_id` (FK)
- `relationship_type`, `confidence`
- `metadata` (jsonb)

## Extended growth_passports

New columns added:

- `status` - draft|ai_generated|claimed|verified|enterprise_verified
- `completeness_score` - 0-100
- `health_score` - 0-100
- `last_ai_update` - timestamptz
- `last_evidence_update` - timestamptz
