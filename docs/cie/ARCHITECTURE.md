# GroIntel Capability Intelligence Engine (CIE)

## Architecture Overview

The CIE is the analytical core of GroIntel's Growth Intelligence Network. It evaluates, scores, and explains the capabilities of every Growth Entity in the system.

```
+---------------------+
|   External APIs     |  <-- /api/passports/:id/capability-dna, etc.
+---------------------+
          |
+---------------------+
|   CIE Engine        |  <-- src/lib/cie/
|  - Capability Calc  |
|  - Confidence Calc  |
|  - Health Calc      |
|  - XAI Generator    |
+---------------------+
          |
+---------------------+
|   Database Layer    |  <-- growth_capability_dna, growth_audience_dna, etc.
+---------------------+
```

## Core Principles

1. **Provider-agnostic** - The engine works with any data source
2. **Append-only history** - Every score creates a new record, never overwrites
3. **Explainable** - Every score has a human-readable explanation
4. **Flexible** - Extra dimensions stored as JSONB for future expansion
5. **Confidence-weighted** - Scores are always accompanied by confidence levels

## Module Structure

```
src/lib/cie/
  index.ts                       - Public API
  types.ts                       - Core interfaces and types
  calculateCapability.ts          - Capability DNA scorer
  calculateConfidence.ts          - Confidence evaluator
  calculateHealth.ts             - Health & completeness calculator
  generateExplanation.ts          - XAI explanation generator
  __tests__/
    cie.test.ts                  - 30+ unit tests
```
