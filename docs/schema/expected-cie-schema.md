# GroIntel Expected CIE Schema

This document defines the database schema expected by the application code (CIE engine, APIs, and seed scripts).

## growth_entities

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | All entity ops | YES |
| entity_type | text | YES | CIE engine | YES |
| display_name | text | YES | All | YES |
| slug | text | NO | SEO | NO |
| website | text | NO | CIE engine | YES |
| logo | text | NO | UI | NO |
| country | text | NO | CIE engine | OPT |
| city | text | NO | UI | NO |
| languages | text[] | NO | CIE engine | OPT |
| verified | bool | NO | UI | NO |
| claimed | bool | NO | Claim flow | YES |
| visibility | text | NO | UI | OPT |
| status | text | NO | Admin | OPT |
| created_at | timestamptz | NO | All | YES |
| updated_at | timestamptz | NO | - | OPT |

## growth_passports

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | All passport ops | YES |
| entity_id | uuid (FK) | YES | All | YES |
| headline | text | NO | CIE, Display | OPT |
| description | text | NO | CIE engine | OPT |
| mission | text | NO | CIE engine | OPT |
| primary_industry | text | NO | CIE, Matching | YES |
| secondary_industries | text[] | NO | CIE | OPT |
| primary_region | text | NO | CIE, Matching | YES |
| service_regions | text[] | NO | CIE | OPT |
| company_size | text | NO | CIE | OPT |
| team_size | int | NO | CIE | OPT |
| year_founded | int | NO | CIE | OPT |
| pricing_level | text | NO | CIE | OPT |
| availability | text | NO | CIE | OPT |
| overall_completion | int | NO | Display | OPT |
| **status** | text | NO | Seed/D2 | OPT |
| **completeness_score** | int | NO | CIE Health | OPT |
| **health_score** | int | NO | CIE Health | OPT |
| **last_ai_update** | timestamptz | NO | CIE | OPT |
| **last_evidence_update** | timestamptz | NO | CIE | OPT |
| created_at | timestamptz | NO | All | YES |
| updated_at | timestamptz | NO | - | OPT |

**Bold = added by D2 migration 006**

## growth_capability_dna

Latest capability evaluation. One row per passport.

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | API | YES |
| passport_id | uuid (FK) | YES | All | YES |
| execution_score | int | NO | CIE calc | YES |
| trust_score | int | NO | CIE calc | YES |
| authority_score | int | NO | CIE calc | YES |
| reach_score | int | NO | CIE calc | YES |
| audience_fit_score | int | NO | CIE calc | YES |
| industry_expertise_score | int | NO | CIE calc | YES |
| pricing_score | int | NO | CIE calc | YES |
| availability_score | int | NO | CIE calc | YES |
| innovation_score | int | NO | CIE calc | YES |
| roi_score | int | NO | CIE calc | YES |
| overall_score | int | NO | CIE calc | YES |
| confidence | int | NO | CIE calc | YES |
| evidence_count | int | NO | CIE calc | OPT |
| calculation_version | int | NO | CIE | OPT |
| extra_dimensions | jsonb | NO | CIE | OPT |
| last_calculated | timestamptz | NO | - | OPT |
| created_at | timestamptz | NO | All | YES |
| updated_at | timestamptz | NO | - | OPT |

## growth_audience_dna

Audience profile. One row per passport.

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | API | YES |
| passport_id | uuid (FK) | YES | All | YES |
| industries | text[] | NO | CIE | OPT |
| company_sizes | text[] | NO | CIE | OPT |
| buyer_roles | text[] | NO | CIE | OPT |
| buyer_stage | text[] | NO | CIE | OPT |
| budget_range | text | NO | CIE | OPT |
| regions | text[] | NO | CIE | OPT |
| languages | text[] | NO | CIE | OPT |
| pain_points | text[] | NO | CIE | OPT |
| preferred_channels | text[] | NO | CIE | OPT |
| decision_cycle | text | NO | CIE | OPT |
| confidence | int | NO | CIE | OPT |
| metadata | jsonb | NO | CIE | OPT |
| created_at | timestamptz | NO | All | YES |
| updated_at | timestamptz | NO | - | OPT |

## growth_capability_history

Append-only capability trace.

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | API | YES |
| passport_id | uuid (FK) | YES | All | YES |
| capability_snapshot | jsonb | YES | CIE | YES |
| overall_score | int | NO | CIE | OPT |
| confidence | int | NO | CIE | OPT |
| reason | text | NO | XAI | OPT |
| evidence_used | jsonb | NO | XAI | OPT |
| calculated_at | timestamptz | NO | - | OPT |
| created_at | timestamptz | NO | All | YES |

## growth_evidence

Evidence items.

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | API | YES |
| passport_id | uuid (FK) | YES | All | YES |
| evidence_type | text | YES | CIE | YES |
| source_url | text | NO | Display | OPT |
| source_title | text | NO | Display | OPT |
| source_description | text | NO | XAI | OPT |
| source_date | date | NO | Confidence | OPT |
| source_author | text | NO | Display | OPT |
| source_platform | text | NO | Display | OPT |
| credibility_score | int | NO | Confidence | YES |
| verification_status | text | NO | Trust | OPT |
| metadata | jsonb | NO | Flexibility | OPT |
| created_at | timestamptz | NO | All | YES |
| updated_at | timestamptz | NO | - | OPT |

## growth_capability_explanations

Explainable AI records.

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | API | YES |
| passport_id | uuid (FK) | YES | All | YES |
| capability_name | text | YES | XAI | YES |
| score | int | NO | XAI | OPT |
| confidence | int | NO | XAI | OPT |
| reason | text | NO | XAI | OPT |
| evidence_used | jsonb | NO | XAI | OPT |
| ai_model_version | text | NO | XAI | OPT |
| generated_at | timestamptz | NO | - | OPT |
| created_at | timestamptz | NO | All | YES |

## growth_relationships

Knowledge graph edges.

| Column | Type | Required | Used By | Critical |
|--------|------|----------|---------|----------|
| id | uuid | YES | API | YES |
| source_passport_id | uuid (FK) | YES | Graph | YES |
| target_passport_id | uuid (FK) | YES | Graph | YES |
| relationship_type | text | YES | Graph | YES |
| confidence | int | NO | Graph | OPT |
| evidence_url | text | NO | Graph | OPT |
| description | text | NO | Graph | OPT |
| metadata | jsonb | NO | Graph | OPT |
| created_at | timestamptz | NO | All | YES |
| updated_at | timestamptz | NO | - | OPT |
