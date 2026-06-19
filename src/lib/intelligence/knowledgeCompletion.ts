// GroIntel Knowledge Completion Engine v1.1
// Dual question banks: Business + Capability
// Configurable threshold. Answers persist to source profiles.

export const KNOWLEDGE_COMPLETION_THRESHOLD = 60;

export interface KnowledgeGap {
  field: string;
  label: string;
  confidence: number;
  importance: number;
  reason: string;
}

export interface CompletionQuestion {
  targetField: string;
  question: string;
  reason: string;
  importance: number;
}

export interface CompletionResult {
  updatedKnowledge: Record<string, unknown>;
  confidenceDelta: Record<string, number>;
  overallConfidence: number;
  isComplete: boolean;
}

// ============================================================
// Business Question Templates
// ============================================================
const BUSINESS_TEMPLATES: Record<string, QuestionTemplate> = {
  primary_growth_goal: {
    label: "Primary Growth Goal", priority: 1,
    generateQuestion: (k) => {
      const g = (k.goals as string[]) || []; return g.length > 0 ? null : "What is the primary growth goal your business is focused on right now?";
    },
    applyAnswer: (k, a) => ({ ...k, goals: [...((k.goals as string[]) || []), a] }),
    calcConfidence: (k) => ((k.goals as string[]) || []).length > 0 ? 80 : 20,
  },
  target_market: {
    label: "Target Market", priority: 2,
    generateQuestion: (k) => {
      const m = k.market as Record<string, unknown> || {}; const o = (m.overview as string[]) || []; return o.length > 1 ? null : "Which specific market or geography are you targeting?";
    },
    applyAnswer: (k, a) => {
      const m = { ...(k.market as Record<string, unknown> || {}) }; const o = (m.overview as string[]) || []; m.overview = [...o, a]; return { ...k, market: m };
    },
    calcConfidence: (k) => ((k.market as Record<string, unknown> || {}).overview as string[])?.length > 1 ? 70 : 30,
  },
  timeline: {
    label: "Timeline", priority: 3,
    generateQuestion: (k) => { const c = k.constraints as Record<string, unknown> || {}; return c.timeline ? null : "What is your expected timeline?"; },
    applyAnswer: (k, a) => ({ ...k, constraints: { ...(k.constraints as Record<string, unknown> || {}), timeline: a } }),
    calcConfidence: (k) => (k.constraints as Record<string, unknown> || {}).timeline ? 70 : 20,
  },
  budget: {
    label: "Budget Range", priority: 4,
    generateQuestion: (k) => { const c = k.constraints as Record<string, unknown> || {}; return c.budget ? null : "What is your approximate budget range?"; },
    applyAnswer: (k, a) => ({ ...k, constraints: { ...(k.constraints as Record<string, unknown> || {}), budget: a } }),
    calcConfidence: (k) => (k.constraints as Record<string, unknown> || {}).budget ? 70 : 15,
  },
  capability_preference: {
    label: "Capability Preference", priority: 5,
    generateQuestion: (k) => ((k.goals as string[]) || []).length < 2 ? null : "Which capability area is most important for your goal?",
    applyAnswer: (k, a) => ({ ...k, preferences: { ...(k.preferences as Record<string, unknown> || {}), priority_capability: a } }),
    calcConfidence: (k) => (k.preferences as Record<string, unknown> || {}).priority_capability ? 60 : 30,
  },
  company_stage: {
    label: "Company Stage", priority: 6,
    generateQuestion: (k) => (k.business_identity as Record<string, unknown> || {}).stage ? null : "What stage is your company at?",
    applyAnswer: (k, a) => ({ ...k, business_identity: { ...(k.business_identity as Record<string, unknown> || {}), stage: a } }),
    calcConfidence: (k) => (k.business_identity as Record<string, unknown> || {}).stage ? 70 : 25,
  },
  customer_profile: {
    label: "Customer Profile", priority: 7,
    generateQuestion: (k) => ((k.business_model as Record<string, unknown> || {}).customers as string[])?.length > 0 ? null : "Who is your ideal customer?",
    applyAnswer: (k, a) => ({ ...k, business_model: { ...(k.business_model as Record<string, unknown> || {}), customers: [a] } }),
    calcConfidence: (k) => ((k.business_model as Record<string, unknown> || {}).customers as string[])?.length > 0 ? 65 : 20,
  },
  competitors: {
    label: "Competitor Landscape", priority: 8,
    generateQuestion: (k) => {
      const m = k.market as Record<string, unknown> || {}; if (m.competitors) return null;
      return ((m.overview as string[]) || []).length === 0 ? null : "Who are your main competitors?";
    },
    applyAnswer: (k, a) => ({ ...k, market: { ...(k.market as Record<string, unknown> || {}), competitors: a } }),
    calcConfidence: (k) => (k.market as Record<string, unknown> || {}).competitors ? 60 : 30,
  },
};

// ============================================================
// Capability Question Templates
// ============================================================
const CAPABILITY_TEMPLATES: Record<string, QuestionTemplate> = {
  primary_capability: {
    label: "Primary Capability", priority: 1,
    generateQuestion: (k) => {
      const d = k.capability_dna as Record<string, unknown> || {}; return d.primary ? null : "What is your core capability or service offering?";
    },
    applyAnswer: (k, a) => ({ ...k, capability_dna: { ...(k.capability_dna as Record<string, unknown> || {}), primary: a } }),
    calcConfidence: (k) => (k.capability_dna as Record<string, unknown> || {}).primary ? 80 : 20,
  },
  target_audience: {
    label: "Target Audience", priority: 2,
    generateQuestion: (k) => {
      const a = k.audience_dna as Record<string, unknown> || {}; const p = (a.primary_audiences as string[]) || []; return p.length > 1 ? null : "Who is your ideal client or customer?";
    },
    applyAnswer: (k, a) => {
      const ad = { ...(k.audience_dna as Record<string, unknown> || {}) }; const p = (ad.primary_audiences as string[]) || []; ad.primary_audiences = [...p, a]; return { ...k, audience_dna: ad };
    },
    calcConfidence: (k) => ((k.audience_dna as Record<string, unknown> || {}).primary_audiences as string[])?.length > 1 ? 70 : 25,
  },
  strongest_evidence: {
    label: "Strongest Evidence", priority: 3,
    generateQuestion: (k) => {
      const s = k.evidence_summary as Record<string, unknown> || {}; return s.strongest ? null : "What is your strongest proof of capability?";
    },
    applyAnswer: (k, a) => ({ ...k, evidence_summary: { ...(k.evidence_summary as Record<string, unknown> || {}), strongest: a } }),
    calcConfidence: (k) => (k.evidence_summary as Record<string, unknown> || {}).strongest ? 70 : 20,
  },
  preferred_collaboration: {
    label: "Preferred Collaboration", priority: 4,
    generateQuestion: (k) => ((k.preferred_collaborations as string[]) || []).length > 0 ? null : "What type of collaboration are you looking for?",
    applyAnswer: (k, a) => ({ ...k, preferred_collaborations: [...((k.preferred_collaborations as string[]) || []), a] }),
    calcConfidence: (k) => ((k.preferred_collaborations as string[]) || []).length > 0 ? 65 : 20,
  },
  pricing_model: {
    label: "Pricing Model", priority: 5,
    generateQuestion: (k) => {
      const p = k.pricing_signals as Record<string, unknown> || {}; return p.model ? null : "How do you typically price your services?";
    },
    applyAnswer: (k, a) => ({ ...k, pricing_signals: { ...(k.pricing_signals as Record<string, unknown> || {}), model: a } }),
    calcConfidence: (k) => (k.pricing_signals as Record<string, unknown> || {}).model ? 65 : 20,
  },
  availability: {
    label: "Availability", priority: 6,
    generateQuestion: (k) => {
      const a = k.availability_signals as Record<string, unknown> || {}; return a.status ? null : "What is your current availability?";
    },
    applyAnswer: (k, a) => ({ ...k, availability_signals: { ...(k.availability_signals as Record<string, unknown> || {}), status: a } }),
    calcConfidence: (k) => (k.availability_signals as Record<string, unknown> || {}).status ? 65 : 20,
  },
  limitations: {
    label: "Limitations", priority: 7,
    generateQuestion: (k) => ((k.limitations as string[]) || []).length > 0 ? null : "What are your current limitations or capacity constraints?",
    applyAnswer: (k, a) => ({ ...k, limitations: [...((k.limitations as string[]) || []), a] }),
    calcConfidence: (k) => ((k.limitations as string[]) || []).length > 0 ? 60 : 20,
  },
  best_fit_customers: {
    label: "Best Fit Customers", priority: 8,
    generateQuestion: (k) => ((k.strengths as string[]) || []).length < 2 ? null : "Which type of customer benefits most from your capabilities?",
    applyAnswer: (k, a) => ({ ...k, strengths: [...((k.strengths as string[]) || []), a] }),
    calcConfidence: (k) => ((k.strengths as string[]) || []).length > 2 ? 60 : 30,
  },
};

interface QuestionTemplate {
  label: string;
  priority: number;
  generateQuestion: (knowledge: Record<string, unknown>) => string | null;
  applyAnswer: (knowledge: Record<string, unknown>, answer: string) => Record<string, unknown>;
  calcConfidence: (knowledge: Record<string, unknown>) => number;
}

function getTemplates(profileType: string): Record<string, QuestionTemplate> {
  return profileType === "capability_knowledge" ? CAPABILITY_TEMPLATES : BUSINESS_TEMPLATES;
}

export function calculateKnowledgeGaps(knowledge: Record<string, unknown>, profileType: string = "business_knowledge"): KnowledgeGap[] {
  const templates = getTemplates(profileType);
  const gaps: KnowledgeGap[] = [];

  for (const [key, tmpl] of Object.entries(templates)) {
    const confidence = tmpl.calcConfidence(knowledge);
    if (confidence < KNOWLEDGE_COMPLETION_THRESHOLD) {
      gaps.push({
        field: key,
        label: tmpl.label,
        confidence,
        importance: tmpl.priority,
        reason: `Currently at ${confidence}% confidence. Need ${KNOWLEDGE_COMPLETION_THRESHOLD}% to proceed.`,
      });
    }
  }

  return gaps.sort((a, b) => a.importance - b.importance);
}

export function generateNextQuestion(knowledge: Record<string, unknown>, profileType: string = "business_knowledge"): CompletionQuestion | null {
  const templates = getTemplates(profileType);
  const gaps = calculateKnowledgeGaps(knowledge, profileType);
  if (gaps.length === 0) return null;

  for (const gap of gaps) {
    const tmpl = templates[gap.field];
    if (!tmpl) continue;
    const q = tmpl.generateQuestion(knowledge);
    if (q) {
      return { targetField: gap.field, question: q, reason: gap.reason, importance: tmpl.priority };
    }
  }
  return null;
}

export function applyKnowledgeAnswer(
  knowledge: Record<string, unknown>,
  targetField: string,
  answer: string,
  profileType: string = "business_knowledge",
): CompletionResult {
  const templates = getTemplates(profileType);
  const tmpl = templates[targetField];
  if (!tmpl) {
    return {
      updatedKnowledge: knowledge,
      confidenceDelta: {},
      overallConfidence: calculateOverallConfidence(knowledge, profileType),
      isComplete: true,
    };
  }

  const updatedKnowledge = tmpl.applyAnswer(knowledge, answer);
  const oldConf = tmpl.calcConfidence(knowledge);
  const newConf = tmpl.calcConfidence(updatedKnowledge);
  const confidenceDelta: Record<string, number> = {};
  confidenceDelta[targetField] = newConf - oldConf;

  return {
    updatedKnowledge,
    confidenceDelta,
    overallConfidence: calculateOverallConfidence(updatedKnowledge, profileType),
    isComplete: shouldStopAsking(updatedKnowledge, profileType),
  };
}

export function shouldStopAsking(knowledge: Record<string, unknown>, profileType: string = "business_knowledge"): boolean {
  const gaps = calculateKnowledgeGaps(knowledge, profileType);
  if (gaps.length === 0) return true;
  const importantGaps = gaps.filter(g => g.importance <= 5);
  return importantGaps.length === 0;
}

export function calculateOverallConfidence(knowledge: Record<string, unknown>, profileType: string = "business_knowledge"): number {
  const templates = getTemplates(profileType);
  let total = 0; let count = 0;
  for (const [, tmpl] of Object.entries(templates)) {
    total += tmpl.calcConfidence(knowledge); count++;
  }
  return count > 0 ? Math.round(total / count) : 0;
}

export function getConfidenceBreakdown(knowledge: Record<string, unknown>, profileType: string = "business_knowledge"): Record<string, number> {
  const templates = getTemplates(profileType);
  const breakdown: Record<string, number> = {};
  for (const [key, tmpl] of Object.entries(templates)) {
    breakdown[key] = tmpl.calcConfidence(knowledge);
  }
  breakdown.overall = calculateOverallConfidence(knowledge, profileType);
  return breakdown;
}

// Map target fields to knowledge profile JSON columns for persistence
export function mapAnswerToProfileUpdate(
  targetField: string,
  answer: string,
  profileType: string,
): { field: string; value: unknown } | null {
  if (profileType === "business_knowledge") {
    const fieldMap: Record<string, { field: string; type: "scalar" | "array" | "object" | "nested" }> = {
      primary_growth_goal: { field: "goals", type: "array" },
      target_market: { field: "market", type: "nested" },
      timeline: { field: "constraints", type: "nested" },
      budget: { field: "constraints", type: "nested" },
      capability_preference: { field: "preferences", type: "nested" },
      company_stage: { field: "business_identity", type: "nested" },
      customer_profile: { field: "business_model", type: "nested" },
      competitors: { field: "market", type: "nested" },
    };
    const m = fieldMap[targetField];
    if (!m) return null;
    if (m.type === "array") return { field: m.field, value: [answer] };
    if (m.type === "nested") return { field: m.field, value: { [targetField === "timeline" || targetField === "budget" ? targetField : targetField.replace(/_/g, "_")]: answer } };
    return { field: m.field, value: answer };
  } else {
    const fieldMap: Record<string, { field: string; type: "scalar" | "array" | "object" | "nested" }> = {
      primary_capability: { field: "capability_dna", type: "nested" },
      target_audience: { field: "audience_dna", type: "nested" },
      strongest_evidence: { field: "evidence_summary", type: "nested" },
      preferred_collaboration: { field: "preferred_collaborations", type: "array" },
      pricing_model: { field: "pricing_signals", type: "nested" },
      availability: { field: "availability_signals", type: "nested" },
      limitations: { field: "limitations", type: "array" },
      best_fit_customers: { field: "strengths", type: "array" },
    };
    const m = fieldMap[targetField];
    if (!m) return null;
    return { field: m.field, value: answer };
  }
}
