// GroIntel INT-4 — Anomaly Detector
import { Anomaly } from "./discovery_types";

let aCounter = 0;
function genId(): string { return "anom_" + (++aCounter).toString(16).padStart(6, "0"); }

export class AnomalyDetector {
  detect(currentVelocity: number, expectedVelocity: number, contradictionCount: number, predictionFailures: number, attentionScore: number): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Trend deviation
    if (currentVelocity > expectedVelocity * 1.5 || currentVelocity < expectedVelocity * 0.5) {
      anomalies.push({
        id: genId(), type: "trend_deviation",
        description: `Velocity ${currentVelocity} deviates from expected ${expectedVelocity} (${Math.round((currentVelocity - expectedVelocity) / expectedVelocity * 100)}%)`,
        severity: Math.round(Math.abs(currentVelocity - expectedVelocity) / expectedVelocity * 100),
        affected_domain: "General", current_value: currentVelocity, expected_value: expectedVelocity,
        deviation: Math.round((currentVelocity - expectedVelocity) / expectedVelocity * 100),
        confidence: 70,
      });
    }

    // Contradiction spike
    if (contradictionCount > 10) {
      anomalies.push({
        id: genId(), type: "contradiction_spike",
        description: `High contradiction density: ${contradictionCount} contradictions detected`,
        severity: Math.min(100, contradictionCount * 8), affected_domain: "General",
        current_value: contradictionCount, expected_value: 5, deviation: contradictionCount - 5, confidence: 75,
      });
    }

    // Prediction failure spike
    if (predictionFailures > 3) {
      anomalies.push({
        id: genId(), type: "prediction_failure_spike",
        description: `Elevated prediction failures: ${predictionFailures} in current window`,
        severity: Math.min(100, predictionFailures * 15), affected_domain: "General",
        current_value: predictionFailures, expected_value: 2, deviation: predictionFailures - 2, confidence: 80,
      });
    }

    // Attention spike
    if (attentionScore > 80) {
      anomalies.push({
        id: genId(), type: "attention_spike",
        description: `Attention score spike: ${attentionScore}/100 requires investigation`,
        severity: attentionScore, affected_domain: "General",
        current_value: attentionScore, expected_value: 50, deviation: attentionScore - 50, confidence: 65,
      });
    }

    return anomalies;
  }
}
