// GroIntel Cognitive Kernel — Kernel Pipeline
// End-to-end cognitive processing pipeline
import { CognitiveKernel } from "./kernel";
import { RealityEvent, Observation, Signal, Entity, Prediction, ContradictionRecord, RealityFidelityScore } from "./kernel_types";
import { processObservation } from "./processors/observation_processor";
import { extractSignals } from "./processors/signal_extractor";
import { resolveEntities } from "./processors/entity_resolver";
import { integrateObservation, integrateSignals } from "./processors/memory_integrator";
import { detectContradictions } from "./processors/contradiction_detector";
import { calculateFidelity } from "./processors/reality_fidelity_processor";
import { generatePredictions } from "./processors/prediction_generator";

export interface PipelineResult {
  observation: Observation;
  signals: Signal[];
  entities: Entity[];
  contradictions: ContradictionRecord[];
  fidelity: RealityFidelityScore;
  predictions: Prediction[];
  memoryRecordCount: number;
}

export async function processRealityEvent(kernel: CognitiveKernel, event: RealityEvent): Promise<PipelineResult> {
  const logger = kernel.logger;

  // 1. Convert event to observation
  const observation = processObservation(event);
  logger.debug("Pipeline", "Observation created", { id: observation.id, source: observation.source });

  // 2. Extract signals
  const signals = extractSignals(observation);
  logger.debug("Pipeline", `Signals extracted: ${signals.length}`);

  // 3. Resolve entities
  const existingEntities: Entity[] = [];
  const entityResult = resolveEntities(observation, signals, existingEntities);
  logger.debug("Pipeline", `Entities resolved: ${entityResult.entities.length} (${entityResult.newEntityIds.length} new)`);

  // 4. Integrate into memory
  const memRecords = await integrateObservation(kernel.memory, observation, entityResult.entities, existingEntities);
  const sigRecords = await integrateSignals(kernel.memory, signals);
  logger.debug("Pipeline", `Memory updated: ${memRecords.length + sigRecords.length} records`);

  // 5. Detect contradictions
  const contradictionResult = await detectContradictions(observation, kernel.memory, [], entityResult.entities);
  if (contradictionResult.hasContradictions) {
    logger.info("Pipeline", `Contradictions detected: ${contradictionResult.contradictions.length}`);
  }

  // 6. Calculate reality fidelity
  const fidelity = calculateFidelity({
    observation,
    signals,
    memory: kernel.memory,
  });
  kernel.state.updateRealityFidelity(fidelity);
  logger.debug("Pipeline", `Reality fidelity: ${fidelity.overall}`);

  // 7. Generate predictions
  const predictions = generatePredictions(signals, entityResult.entities);
  for (const pred of predictions) {
    kernel.state.addPrediction(pred.id);
  }
  if (predictions.length > 0) {
    logger.info("Pipeline", `Predictions generated: ${predictions.length}`);
  }

  // 8. Build graph
  kernel.graphBuilder.buildFromPipeline({
    observation, signals, entities: entityResult.entities,
    contradictions: contradictionResult.contradictions,
    fidelity, predictions,
    memoryRecordCount: kernel.memory.getRecordCount(),
  });

  // 9. Reason about affected entities
  for (const entity of entityResult.entities) {
    const result = kernel.reasoner.reasonAboutEntity(entity.id);
    if (result.risks.length > 0 || result.opportunities.length > 0) {
      logger.info("Pipeline", `Reasoning for ${entity.name}: ${result.risks.length} risks, ${result.opportunities.length} opportunities`);
      // Store reasoning outputs as graph nodes
      for (const risk of result.risks) {
        kernel.graph.addNode("Risk", `${risk.type}: ${risk.description.slice(0, 50)}`, null, risk.confidence, fidelity.overall, { risk_type: risk.type });
        // Tracking via state
      }
      for (const opp of result.opportunities) {
        kernel.graph.addNode("Opportunity", `${opp.type}: ${opp.description.slice(0, 50)}`, null, opp.confidence, fidelity.overall, { opp_type: opp.type });
        // Tracking via state
      }
      // Tracking via state
    }
  }

  // 10. Update graph metrics
  const graphMetrics = kernel.graphMetrics.collect(kernel.graph);

  // 11. Update kernel state
  kernel.state.updateMemoryIndexSize(kernel.memory.getRecordCount());
  kernel.state.addEntity(observation.entity_id || "global");
  for (const sig of signals) {
    kernel.state.addSignal(sig.id);
  }

  return {
    observation,
    signals,
    entities: entityResult.entities,
    contradictions: contradictionResult.contradictions,
    fidelity,
    predictions,
    memoryRecordCount: kernel.memory.getRecordCount(),
  };
}
