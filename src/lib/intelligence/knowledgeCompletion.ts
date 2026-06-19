// GroIntel Knowledge Completion Engine v1
// Adaptive interview engine — asks one question at a time
// Only asks when confidence is low, never when confidence is high

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

const CONFIDENCE_THRESHOLD = 60;

// Question templates organized by information gain priority
const QUESTION_TEMPLATES: Record<string, {
  label: string;
  priority: number;  // lower = asked first
  generateQuestion: (knowledge: Record<string, unknown>) => string | null;
  applyAnswer: (knowledge: Record<string, unknown>, answer: string) => Record<string, unknown>;
  calculateConfidence: (knowledge: Record<string, unknown>) => number;
}> = {
  "primary_goal": {
    label: "Primary Growth Goal",
    priority: 1,
    generateQuestion: (k) => {
      const existing = (k.goals as string[]) || [];
      if (existing.length > 0) return null;
      return "What is the primary growth goal your business is focused on right now?";
    },
    applyAnswer: (k, a) => {
      const existing = (k.goals as string[]) || [];
      return { ...k, goals: [...existing, a] };
    },
    calculateConfidence: (k) => {
      const goals = (k.goals as string[]) || [];
      return goals.length > 0 ? 80 : 20;
    },
  },
  "target_market": {
    label: "Target Market",
    priority: 2,
    generateQuestion: (k) => {
      const market = k.market as Record<string, unknown> || {};
      const overview = (market.overview as string[]) || [];
      if (overview.length > 1) return null;
      return "Which specific market or geography are you targeting for growth?";
    },
    applyAnswer: (k, a) => {
      const market = { ...(k.market as Record<string, unknown> || {}) };
      const overview = (market.overview as string[]) || [];
      market.overview = [...overview, a];
      return { ...k, market };
    },
    calculateConfidence: (k) => {
      const market = k.market as Record<string, unknown> || {};
      const overview = (market.overview as string[]) || [];
      return overview.length > 1 ? 70 : 30;
    },
  },
  "timeline": {
    label: "Timeline",
    priority: 3,
    generateQuestion: (k) => {
      const constraints = k.constraints as Record<string, unknown> || {};
      if (constraints.timeline) return null;
      return "What is your expected timeline for this initiative?";
    },
    applyAnswer: (k, a) => {
      return { ...k, constraints: { ...(k.constraints as Record<string, unknown> || {}), timeline: a } };
    },
    calculateConfidence: (k) => {
      const constraints = k.constraints as Record<string, unknown> || {};
      return constraints.timeline ? 70 : 20;
    },
  },
  "budget": {
    label: "Budget Range",
    priority: 4,
    generateQuestion: (k) => {
      const constraints = k.constraints as Record<string, unknown> || {};
      if (constraints.budget) return null;
      return "What is your approximate budget range for this growth initiative?";
    },
    applyAnswer: (k, a) => {
      return { ...k, constraints: { ...(k.constraints as Record<string, unknown> || {}), budget: a } };
    },
    calculateConfidence: (k) => {
      const constraints = k.constraints as Record<string, unknown> || {};
      return constraints.budget ? 70 : 15;
    },
  },
  "capability_preference": {
    label: "Capability Preference",
    priority: 5,
    generateQuestion: (k) => {
      const goals = (k.goals as string[]) || [];
      if (goals.length < 2) return null;
      return "Which capability area is most important for achieving your goal?";
    },
    applyAnswer: (k, a) => {
      return { ...k, preferences: { ...(k.preferences as Record<string, unknown> || {}), priority_capability: a } };
    },
    calculateConfidence: (k) => {
      return (k.preferences as Record<string, unknown> || {}).priority_capability ? 60 : 30;
    },
  },
  "company_stage": {
    label: "Company Stage",
    priority: 6,
    generateQuestion: (k) => {
      const identity = k.business_identity as Record<string, unknown> || {};
      if (identity.stage) return null;
      return "What stage is your company at currently?";
    },
    applyAnswer: (k, a) => {
      return { ...k, business_identity: { ...(k.business_identity as Record<string, unknown> || {}), stage: a } };
    },
    calculateConfidence: (k) => {
      return (k.business_identity as Record<string, unknown> || {}).stage ? 70 : 25;
    },
  },
  "customer_profile": {
    label: "Customer Profile",
    priority: 7,
    generateQuestion: (k) => {
      const bm = k.business_model as Record<string, unknown> || {};
      const customers = (bm.customers as string[]) || [];
      if (customers.length > 0) return null;
      return "Who is your ideal customer?";
    },
    applyAnswer: (k, a) => {
      return { ...k, business_model: { ...(k.business_model as Record<string, unknown> || {}), customers: [a] } };
    },
    calculateConfidence: (k) => {
      const bm = k.business_model as Record<string, unknown> || {};
      return (bm.customers as string[] || []).length > 0 ? 65 : 20;
    },
  },
  "competitors": {
    label: "Competitor Landscape",
    priority: 8,
    generateQuestion: (k) => {
      const market = k.market as Record<string, unknown> || {};
      if (market.competitors) return null;
      // Only ask if we have some market context
      const overview = (market.overview as string[]) || [];
      if (overview.length === 0) return null;
      return "Who are your main competitors in this space?";
    },
    applyAnswer: (k, a) => {
      return { ...k, market: { ...(k.market as Record<string, unknown> || {}), competitors: a } };
    },
    calculateConfidence: (k) => {
      return (k.market as Record<string, unknown> || {}).competitors ? 60 : 30;
    },
  },
};

export function calculateKnowledgeGaps(knowledge: Record<string, unknown>): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = [];

  for (const [key, tmpl] of Object.entries(QUESTION_TEMPLATES)) {
    const confidence = tmpl.calculateConfidence(knowledge);
    if (confidence < CONFIDENCE_THRESHOLD) {
      gaps.push({
        field: key,
        label: tmpl.label,
        confidence,
        importance: tmpl.priority,
        reason: `Currently at ${confidence}% confidence. Need ${CONFIDENCE_THRESHOLD}% to proceed without asking.`,
      });
    }
  }

  return gaps.sort((a, b) => a.importance - b.importance);
}

export function generateNextQuestion(knowledge: Record<string, unknown>): CompletionQuestion | null {
  const gaps = calculateKnowledgeGaps(knowledge);

  if (gaps.length === 0) return null;

  // Take the highest priority (lowest importance number) gap
  const topGap = gaps[0];
  const tmpl = QUESTION_TEMPLATES[topGap.field];
  if (!tmpl) return null;

  const question = tmpl.generateQuestion(knowledge);
  if (!question) {
    // If this gap can't generate a question (already answered), skip to next
    const remainingGaps = gaps.slice(1);
    if (remainingGaps.length === 0) return null;
    const next = remainingGaps[0];
    const nextTmpl = QUESTION_TEMPLATES[next.field];
    if (!nextTmpl) return null;
    const nextQ = nextTmpl.generateQuestion(knowledge);
    if (!nextQ) return null;
    return {
      targetField: next.field,
      question: nextQ,
      reason: next.reason,
      importance: nextTmpl.priority,
    };
  }

  return {
    targetField: topGap.field,
    question,
    reason: topGap.reason,
    importance: tmpl.priority,
  };
}

export function applyKnowledgeAnswer(
  knowledge: Record<string, unknown>,
  targetField: string,
  answer: string,
): CompletionResult {
  const tmpl = QUESTION_TEMPLATES[targetField];
  if (!tmpl) {
    return {
      updatedKnowledge: knowledge,
      confidenceDelta: {},
      overallConfidence: calculateOverallConfidence(knowledge),
      isComplete: true,
    };
  }

  const updatedKnowledge = tmpl.applyAnswer(knowledge, answer);
  const confidenceDelta: Record<string, number> = {};
  const oldConf = tmpl.calculateConfidence(knowledge);
  const newConf = tmpl.calculateConfidence(updatedKnowledge);
  confidenceDelta[targetField] = newConf - oldConf;

  const overallConfidence = calculateOverallConfidence(updatedKnowledge);
  const isComplete = shouldStopAsking(updatedKnowledge);

  return {
    updatedKnowledge,
    confidenceDelta,
    overallConfidence,
    isComplete,
  };
}

export function shouldStopAsking(knowledge: Record<string, unknown>): boolean {
  const gaps = calculateKnowledgeGaps(knowledge);
  if (gaps.length === 0) return true;

  // If all remaining gaps are low importance, still stop
  const importantGaps = gaps.filter(g => g.importance <= 5);
  return importantGaps.length === 0;
}

export function calculateOverallConfidence(knowledge: Record<string, unknown>): number {
  let totalConf = 0;
  let count = 0;

  for (const [, tmpl] of Object.entries(QUESTION_TEMPLATES)) {
    totalConf += tmpl.calculateConfidence(knowledge);
    count++;
  }

  return count > 0 ? Math.round(totalConf / count) : 0;
}

export function getConfidenceBreakdown(knowledge: Record<string, unknown>): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const [key, tmpl] of Object.entries(QUESTION_TEMPLATES)) {
    breakdown[tmpl.label.toLowerCase().replace(/\s+/g, "_")] = tmpl.calculateConfidence(knowledge);
  }
  breakdown.overall = calculateOverallConfidence(knowledge);
  return breakdown;
}
