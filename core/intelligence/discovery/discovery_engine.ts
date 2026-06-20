// GroIntel INT-4 — Discovery Engine (read-only)
import { Discovery, DiscoveryTrace } from "./discovery_types";
import { AnomalyDetector } from "./anomaly_detector";
import { PatternDiscoverer } from "./pattern_discoverer";
import { WeakSignalDetector } from "./weak_signal_detector";
import { OpportunityDiscoverer } from "./opportunity_discoverer";
import { RiskDiscoverer } from "./risk_discoverer";
import { GapDiscoverer } from "./gap_discoverer";

let dCounter = 0;
function genId(): string { return "disc_" + (++dCounter).toString(16).padStart(6, "0"); }
function trId(): string { return "dtrc_" + Math.random().toString(36).slice(2, 10); }

export class DiscoveryEngine {
  public readonly anomalyDetector = new AnomalyDetector();
  public readonly patternDiscoverer = new PatternDiscoverer();
  public readonly weakSignalDetector = new WeakSignalDetector();
  public readonly opportunityDiscoverer = new OpportunityDiscoverer();
  public readonly riskDiscoverer = new RiskDiscoverer();
  public readonly gapDiscoverer = new GapDiscoverer();

  run(): { discoveries: Discovery[]; traces: DiscoveryTrace[] } {
    const traces: DiscoveryTrace[] = [];
    const discoveries: Discovery[] = [];

    const addDisc = (type: Discovery["type"], title: string, desc: string, novelty: number, impact: number, conf: number, domain: string) => {
      const id = genId();
      discoveries.push({ id, type, title, description: desc, domain, target_entities: [], novelty_score: novelty, impact_score: impact, confidence: conf, uncertainty: 100 - conf, evidence: [], recommended_next_observation: "Investigate further", created_at: new Date().toISOString() });
      return id;
    };

    // 1. Detect anomalies
    for (const a of this.anomalyDetector.detect(80, 50, 12, 4, 85)) {
      const id = addDisc("anomaly", `Anomaly: ${a.type}`, a.description, a.severity, 70, a.confidence, a.affected_domain);
      traces.push({ id: trId(), discovery_id: id, sources: ["WorldState"], steps: [{ step: 1, detector: "anomaly_detector", output: a.description }], created_at: new Date().toISOString() });
    }

    // 2. Discover patterns
    for (const p of this.patternDiscoverer.discover(7, 4, 4, true, 3)) {
      const id = addDisc("pattern", `Pattern: ${p.type}`, p.description, 60, p.supporting_cases * 10, p.confidence, "General");
      traces.push({ id: trId(), discovery_id: id, sources: ["Memory"], steps: [{ step: 2, detector: "pattern_discoverer", output: p.description }], created_at: new Date().toISOString() });
    }

    // 3. Detect weak signals
    for (const ws of this.weakSignalDetector.detect(3, 1, 4, 5)) {
      const id = addDisc("weak_signal", `Weak signal: ${ws.description.slice(0, 50)}`, ws.description, ws.novelty, ws.upside_potential, ws.confidence, ws.domain);
      traces.push({ id: trId(), discovery_id: id, sources: ["RealityStream"], steps: [{ step: 3, detector: "weak_signal_detector", output: ws.description }], created_at: new Date().toISOString() });
    }

    // 4. Discover opportunities
    for (const o of this.opportunityDiscoverer.discover(true, true, 70, ["High customer acquisition cost", "Long sales cycle"], true)) {
      const id = addDisc("opportunity", `Opportunity: ${o.type}`, o.description, 70, o.potential_value, o.confidence, "General");
      traces.push({ id: trId(), discovery_id: id, sources: ["RealityStream", "Memory"], steps: [{ step: 4, detector: "opportunity_discoverer", output: o.description }], created_at: new Date().toISOString() });
    }

    // 5. Discover risks
    for (const r of this.riskDiscoverer.discover(true, true, 70, 4, true, 2, 55)) {
      const id = addDisc("risk", `Risk: ${r.type}`, r.description, r.severity, r.severity, r.confidence, "General");
      traces.push({ id: trId(), discovery_id: id, sources: ["WorldState", "Graph"], steps: [{ step: 5, detector: "risk_discoverer", output: r.description }], created_at: new Date().toISOString() });
    }

    // 6. Discover gaps
    for (const g of this.gapDiscoverer.discover(40, 35, 45, 30, 35, 40, 35)) {
      const id = addDisc("gap", `Gap: ${g.type}`, g.description, g.severity, g.severity, g.confidence, "General");
      traces.push({ id: trId(), discovery_id: id, sources: ["Metrics"], steps: [{ step: 6, detector: "gap_discoverer", output: g.description }], created_at: new Date().toISOString() });
    }

    return { discoveries, traces };
  }
}
