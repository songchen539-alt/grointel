// GroIntel Cognitive Kernel — Policy
// Immutable rules that govern all kernel operations

export const KERNEL_POLICY = {
  rules: [
    {
      id: "truth-over-convenience",
      description: "Truth over convenience. Never distort reality for ease of processing.",
      violation_penalty: "critical",
    },
    {
      id: "reality-fidelity-over-speed",
      description: "Reality fidelity over speed. Accuracy is more important than throughput.",
      violation_penalty: "high",
    },
    {
      id: "evidence-over-confidence",
      description: "Evidence over confidence. Confidence without evidence is invalid.",
      violation_penalty: "critical",
    },
    {
      id: "learning-over-output",
      description: "Learning over output. Every event should produce learning.",
      violation_penalty: "medium",
    },
    {
      id: "memory-over-deletion",
      description: "Memory over deletion. Nothing is deleted. New versions supersede old ones.",
      violation_penalty: "critical",
    },
    {
      id: "uncertainty-must-be-explicit",
      description: "Uncertainty must be explicit. Never present uncertainty as certainty.",
      violation_penalty: "high",
    },
    {
      id: "prediction-must-be-validated",
      description: "Prediction must be validated. Every prediction requires later validation.",
      violation_penalty: "medium",
    },
    {
      id: "civilization-health",
      description: "Growth must not damage civilization health.",
      violation_penalty: "critical",
    },
  ],

  thresholds: {
    minimum_reality_fidelity: 30,
    maximum_contradiction_severity: 80,
    prediction_validation_window: 30 * 24 * 60 * 60, // 30 days in seconds
    max_confidence_without_evidence: 20,
  },

  validate(eventType: string): string[] {
    const violations: string[] = [];
    // Core validation rules
    if (eventType.includes("PREDICTION")) {
      // Predictions require later validation
    }
    return violations;
  },

  getRule(id: string) {
    return this.rules.find(r => r.id === id);
  },
};

export type KernelPolicy = typeof KERNEL_POLICY;
