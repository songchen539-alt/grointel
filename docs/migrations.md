# GroIntel Database Migrations

## Migration Files

| File | Tables | Purpose |
|------|--------|---------|
| 001_company_mri_reports.sql | company_mri_reports, report_events | Phase 1 — Company MRI reports |
| 002_prospects.sql | prospects | Phase 5 — Outbound prospecting |
| 003_marketplace.sql | company_demands, growth_channels, channel_services, company_growth_needs, growth_matches, growth_quotes | Phase 6 — Marketplace |
| 004_channel_events.sql | channel_opportunity_events | Phase 6 — Channel events |
| 005_growth_passports.sql | growth_entities, growth_passports, growth_capabilities, growth_audiences, growth_channels_supported, growth_case_studies, growth_social_accounts, growth_metrics, growth_claim_requests | Sprint 1 — Growth Passport |
| 006_capability_intelligence.sql | growth_capability_dna, growth_audience_dna, growth_capability_history, growth_evidence, growth_capability_explanations, growth_relationships | Sprint 2 — CIE |
| 007_schema_reconciliation.sql | (ALTER TABLE only) | Sprint G2 — Schema fix |
| 008_proposal_workspace.sql | growth_proposals, growth_proposal_versions, growth_proposal_comments | Sprint G3 — Proposals |
| 009_business_scan_and_knowledge.sql | business_scan_profiles, business_knowledge_profiles | Sprint G5 — Business Intelligence |
| 010_capability_scan_and_knowledge.sql | capability_scan_profiles, capability_knowledge_profiles | Sprint G6 — Capability Intelligence |
| 011_growth_intelligence_engine.sql | growth_goals, growth_constraints, growth_strategies | Sprint G7 — GIE v1 |
| 011_knowledge_completion.sql | knowledge_completion_sessions, knowledge_completion_questions, knowledge_updates | Sprint G8 — Knowledge Completion |

## Note on 011 Migrations

Two migrations share the `011_` prefix. Both must be run:
1. `011_growth_intelligence_engine.sql` — Goal library, constraints, strategies tables
2. `011_knowledge_completion.sql` — Knowledge completion sessions, questions, updates

Additional migrations:
- `012_persistent_runtime_memory.sql` - persistent runtime memory and connector state.
- `013_world_memory.sql` - four-layer world memory: raw reality, entity understanding, decision memory, and evolution memory.

Future migrations should continue with `014_`, `015_`, etc.
