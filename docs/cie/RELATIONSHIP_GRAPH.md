# Relationship Graph Specification

## Overview

The Relationship Graph forms the Knowledge Graph of the Growth Intelligence Network. It captures how Growth Entities are connected.

## Relationship Types

| Type | Description | Example |
|------|-------------|---------|
| works_with | Professional collaboration | Agency + Client |
| served | Service relationship | Creator + Community |
| collaborated_with | Joint project | Two agencies |
| featured_on | Media appearance | Person + Podcast |
| invested_in | Investment connection | VC + Startup |
| partner_of | Formal partnership | Two companies |
| sponsored_by | Sponsorship | Event + Sponsor |

## Graph Properties

- Directed edges (source -> target)
- Undirected reverse entries not required
- Bidirectional queries supported
- Confidence score per edge
- Evidence URL per edge

## Storage

Table: `growth_relationships`

- `source_passport_id` - Source node
- `target_passport_id` - Target node
- `relationship_type` - Edge label
- `confidence` - Edge confidence
- `evidence_url` - Supporting evidence

## Querying

```
-- Find all connections for a passport
SELECT * FROM growth_relationships
WHERE source_passport_id = :pid
   OR target_passport_id = :pid;

-- Find connections by type
SELECT * FROM growth_relationships
WHERE relationship_type = 'partner_of';
```

## Future

- Graph database integration (Neptune/Neo4j)
- Path finding between entities
- Community detection
- Influence propagation
