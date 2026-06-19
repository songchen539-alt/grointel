// GroIntel Cognitive Kernel — Outcome Comparator
import { PredictionValidation, OutcomeComparison, ComparisonResult } from "./learning_types";

let compCounter = 0;
function genId(): string { return "comp_" + (++compCounter).toString(16).padStart(6, "0"); }

export class OutcomeComparator {
  compare(validation: PredictionValidation): OutcomeComparison {
    const expected = validation.expected_state as Record<string, unknown> || {};
    const observed = validation.observed_state as Record<string, unknown> || {};
    let comparison: ComparisonResult = "unknown";
    let description = "";

    if (!observed || Object.keys(observed).length === 0) {
      comparison = "unknown";
      description = "No observed data available for comparison";
    } else {
      const matchCount = Object.keys(expected).filter(k => {
        const ev = String(expected[k] || "").toLowerCase();
        const ov = String(observed[k] || "").toLowerCase();
        return ev === ov;
      }).length;

      const partialMatch = Object.keys(expected).filter(k => {
        const ev = String(expected[k] || "").toLowerCase();
        const ov = String(observed[k] || "").toLowerCase();
        return ev.includes(ov) || ov.includes(ev);
      }).length;

      const opposite = checkOpposite(expected, observed);

      if (matchCount >= Object.keys(expected).length && Object.keys(expected).length > 0) {
        comparison = "exact_match";
        description = "Predicted state matches observed state exactly";
      } else if (partialMatch > 0) {
        comparison = "partial_match";
        description = `Partially matched: ${partialMatch}/${Object.keys(expected).length} fields consistent`;
      } else if (opposite) {
        comparison = "opposite_outcome";
        description = "Observed outcome is opposite of prediction";
      } else if (validation.validation_result === "invalidated") {
        comparison = "miss";
        description = "Prediction did not match observed outcome";
      } else {
        comparison = "directional_match";
        description = "Some directional indicators align";
      }
    }

    return {
      id: genId(),
      prediction_id: validation.prediction_id,
      expected_state: expected,
      observed_state: observed,
      comparison,
      difference_description: description,
      confidence: validation.confidence_before,
      created_at: new Date().toISOString(),
    };
  }
}

function checkOpposite(expected: Record<string, unknown>, observed: Record<string, unknown>): boolean {
  const opposites: [string, string][] = [
    ["increased", "decreased"], ["expanding", "contracting"],
    ["positive", "negative"], ["growing", "declining"],
    ["strengthening", "weakening"], ["rising", "falling"],
  ];
  for (const [key, ev] of Object.entries(expected)) {
    const es = String(ev).toLowerCase();
    const os = String(observed[key] || "").toLowerCase();
    for (const [a, b] of opposites) {
      if ((es.includes(a) && os.includes(b)) || (es.includes(b) && os.includes(a))) return true;
    }
  }
  return false;
}
