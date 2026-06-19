-- GroIntel Schema Audit SQL
-- Run this in Supabase SQL Editor
-- Outputs: table name, column name, data type, nullable, default

select
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from
  information_schema.columns c
where
  c.table_schema = 'public'
  and c.table_name in (
    'growth_entities',
    'growth_passports',
    'growth_capability_dna',
    'growth_audience_dna',
    'growth_capability_history',
    'growth_evidence',
    'growth_capability_explanations',
    'growth_relationships'
  )
order by
  c.table_name,
  c.ordinal_position;
