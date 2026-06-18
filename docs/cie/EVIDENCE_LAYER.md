# Evidence Layer Specification

## Overview

The Evidence Layer is the foundation of GroIntel's Capability Intelligence. Every score, claim, and relationship is backed by evidence.

## Evidence Types

| Type | Source | Credibility |
|------|--------|-------------|
| website | Entity's own site | Medium |
| linkedin | LinkedIn profile | Medium |
| x | X/Twitter presence | Low |
| github | GitHub profile | High |
| youtube | YouTube channel | Medium |
| podcast | Podcast appearances | Medium |
| newsletter | Newsletter publications | Medium |
| case_study | Published case studies | High |
| review | Customer reviews | High |
| media_mention | Press/media coverage | Medium |
| public_dataset | Public data sources | High |

## Verification Status

- `unverified` - Imported but not checked
- `auto_verified` - Verified through automated checks
- `manual_verified` - Verified by human review
- `disputed` - Evidence disputed by entity owner

## Storage

Table: `growth_evidence`

- Full metadata per evidence item
- JSONB `metadata` for type-specific fields
- Credibility score (0-100) per item

## Usage

Evidence drives:
- Capability score confidence
- Trust and authority calculations
- Explanation generation
- Relationship validation
