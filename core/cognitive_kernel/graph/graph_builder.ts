// GroIntel Cognitive Kernel — Graph Builder
// After every pipeline result, builds graph links
import { GraphEngine } from "./graph_engine";
import { PipelineResult } from "../kernel_pipeline";
import { Observation, Signal, Entity, Prediction, ContradictionRecord } from "../kernel_types";

export class GraphBuilder {
  constructor(private engine: GraphEngine) {}

  buildFromPipeline(result: PipelineResult): void {
    // 1. Event -> Observation nodes
    const obsNode = this.engine.addNode("Observation", `Observation: ${result.observation.source}`, result.observation.id, result.observation.confidence, result.fidelity.overall, { source: result.observation.source });

    // 2. Signal nodes + edges from Observation
    const signalNodes: string[] = [];
    for (const sig of result.signals) {
      const node = this.engine.addNode("Signal", `Signal: ${sig.signal_type}`, sig.id, sig.strength, result.fidelity.overall, { signal_type: sig.signal_type, strength: sig.strength });
      this.engine.addEdge("mentions", obsNode.id, node.id, sig.strength, [sig.observation_id]);
      signalNodes.push(node.id);
    }

    // 3. Entity nodes + edges from Observation and Signals
    for (const entity of result.entities) {
      const entNode = this.engine.addNode("Entity", entity.name, entity.id, entity.confidence, result.fidelity.overall, { entity_type: entity.type });
      this.engine.addEdge("describes", obsNode.id, entNode.id, entity.confidence, [result.observation.event_id]);
      for (const sigId of signalNodes) {
        this.engine.addEdge("mentions", sigId, entNode.id, entity.confidence, []);
      }
    }

    // 4. MemoryRecord nodes + edges
    // Memory is already linked via the observation+entity nodes

    // 5. Prediction nodes + edges from entities
    for (const pred of result.predictions) {
      const predNode = this.engine.addNode("Prediction", `Prediction: ${pred.target_field}`, pred.id, pred.confidence, result.fidelity.overall, { target_field: pred.target_field, probability: pred.probability });
      // Link to target entity
      const targetEntity = result.entities.find(e => e.id === pred.target_entity_id || e.id);
      if (targetEntity) {
        const entNode = this.engine.findByExternalId(targetEntity.id);
        if (entNode) this.engine.addEdge("predicts", predNode.id, entNode.id, pred.confidence, pred.evidence);
      }
    }

    // 6. Contradiction nodes + edges
    for (const con of result.contradictions) {
      const conNode = this.engine.addNode("Contradiction", `Contradiction: ${con.id.slice(0, 12)}`, con.id, con.severity, result.fidelity.overall, { severity: con.severity, status: con.status });
      // Link to conflicting observations via external IDs
      for (const evId of con.evidence_a) {
        const evNode = this.engine.findByExternalId(evId);
        if (evNode) this.engine.addEdge("contradicts", conNode.id, evNode.id, con.severity, [con.id]);
      }
      for (const evId of con.evidence_b) {
        const evNode = this.engine.findByExternalId(evId);
        if (evNode) this.engine.addEdge("contradicts", conNode.id, evNode.id, con.severity, [con.id]);
      }
    }
  }
}
