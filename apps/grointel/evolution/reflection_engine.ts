// EVOLUTION-1 — Reflection Engine
import { ReflectionResult, ReflectionDomain } from "./evolution_types";

export class ReflectionEngine {
  private counter = 0;

  analyze(domain: ReflectionDomain, predicted: number[], observed: number[]): ReflectionResult {
    const differences = predicted.map((p, i) => Math.abs(p - observed[i]));
    const avgError = differences.length > 0 ? differences.reduce((s, d) => s + d, 0) / differences.length : 0;
    const score = Math.max(0, Math.min(100, 100 - avgError * 2));

    const findings: string[] = [];
    const recommendations: string[] = [];

    if (avgError > 20) findings.push(`High prediction error (${Math.round(avgError)}%) in ${domain}`);
    else findings.push(`Acceptable prediction accuracy in ${domain}`);

    if (domain === "prediction" && avgError > 15) recommendations.push("Review prediction assumptions and update models");
    if (domain === "attention") recommendations.push("Recalibrate attention scoring weights");
    if (domain === "hypothesis") recommendations.push("Review hypothesis validation criteria");

    return { id: "ref_" + (++this.counter).toString(16).padStart(6, "0"), domain, score: Math.round(score), findings, recommendations, timestamp: new Date().toISOString() };
  }

  detectBias(confidenceScores: number[], accuracyScores: number[]): { overconfident: boolean; underconfident: boolean; calibration: number } {
    const avgConf = confidenceScores.reduce((s, c) => s + c, 0) / Math.max(1, confidenceScores.length);
    const avgAcc = accuracyScores.reduce((s, a) => s + a, 0) / Math.max(1, accuracyScores.length);
    return { overconfident: avgConf > avgAcc + 15, underconfident: avgAcc > avgConf + 15, calibration: Math.round(100 - Math.abs(avgConf - avgAcc)) };
  }
}
