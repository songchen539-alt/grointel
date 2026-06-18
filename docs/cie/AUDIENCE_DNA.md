# Audience DNA Specification

## Overview

Audience DNA represents the audience segments a Growth Entity is capable of serving. This is derived from their passport data, evidence, and entity type.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| industries | text[] | Target industries |
| company_sizes | text[] | Size categories served |
| buyer_roles | text[] | Decision-maker roles |
| buyer_stage | text[] | Funnel stages (awareness/consideration/decision) |
| budget_range | text | Typical engagement budget |
| regions | text[] | Geographic regions |
| languages | text[] | Languages supported |
| pain_points | text[] | Pain points the entity addresses |
| preferred_channels | text[] | Marketing channels used |
| decision_cycle | text | Sales cycle length (short/medium/long) |
| confidence | int | Data confidence (0-100) |

## Storage

Table: `growth_audience_dna`

- One row per passport
- Arrays for multi-value fields
- `metadata` (JSONB) for future expansion

## Usage

Audience DNA powers:
- Match quality assessment
- Channel recommendation
- Budget alignment
- Market fit analysis
