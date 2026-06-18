# Capability Intelligence Engine - API Documentation

## Base URL

`https://grointel.vercel.app/api/passports/:id`

## Endpoints

### GET /api/passports/:id/capability-dna

Returns the latest Capability DNA evaluation.

Response:
```json
{
  "success": true,
  "capabilityDna": {
    "id": "...",
    "passport_id": "...",
    "execution_score": 78,
    "trust_score": 65,
    "overall_score": 72,
    "confidence": 75,
    ...
  }
}
```

### GET /api/passports/:id/audience-dna

Returns the audience profile.

Response:
```json
{
  "success": true,
  "audienceDna": {
    "id": "...",
    "industries": ["AI", "SaaS"],
    "buyer_roles": ["CTO", "VP Growth"],
    ...
  }
}
```

### GET /api/passports/:id/evidence

Returns all evidence items for a passport.

Response:
```json
{
  "success": true,
  "evidence": [
    {
      "id": "...",
      "evidence_type": "case_study",
      "source_title": "...",
      "credibility_score": 80
    }
  ]
}
```

### GET /api/passports/:id/history

Returns the capability calculation history (append-only).

Response:
```json
{
  "success": true,
  "history": [
    {
      "id": "...",
      "overall_score": 72,
      "confidence": 75,
      "calculated_at": "2026-06-18T..."
    }
  ]
}
```

### GET /api/passports/:id/explanations

Returns XAI explanations for capability scores.

Response:
```json
{
  "success": true,
  "explanations": [
    {
      "id": "...",
      "capability_name": "execution_score",
      "score": 78,
      "reason": "Execution Capability: 78/100 - demonstrated strong execution...",
      "ai_model_version": "cie-v1.0"
    }
  ]
}
```

## Error Handling

All endpoints return:
```json
{
  "success": false,
  "error": "Table may not exist"
}
```

HTTP status codes:
- 200: Success
- 500: Server error / table not found
