// GroIntel Cognitive Kernel — Memory Integrator
// Appends observations and signals into permanent memory
import { Observation, Signal, Entity, MemoryRecord, MemoryOperation } from "../kernel_types";
import { KernelMemory } from "../kernel_memory";

let memCounter = 0;
function genId(): string { return "mem_" + (++memCounter).toString(16).padStart(6, "0"); }

export async function integrateObservation(memory: KernelMemory, observation: Observation, entities: Entity[], existingEntities: Entity[]): Promise<MemoryRecord[]> {
  const records: MemoryRecord[] = [];

  // Memory for the observation itself
  const obsRecord: MemoryRecord = {
    id: genId(),
    entity_id: observation.entity_id,
    observation_id: observation.id,
    event_type: "OBSERVATION_RECEIVED",
    content: { type: "observation", source: observation.source, data: observation.extracted_data },
    evidence_links: [],
    contradiction_links: [],
    confidence_before: 0,
    confidence_after: observation.confidence,
    version: 0,
    operation: "create",
    created_at: new Date().toISOString(),
  };
  await memory.store(obsRecord);
  records.push(obsRecord);

  // Memory for each entity
  for (const entity of entities) {
    const isNew = !existingEntities.find(e => e.id === entity.id);
    const entityRecord: MemoryRecord = {
      id: genId(),
      entity_id: entity.id,
      observation_id: observation.id,
      event_type: "MEMORY_UPDATED",
      content: { type: "entity_state", entity_name: entity.name, entity_type: entity.type, is_new: isNew, attributes: entity.attributes },
      evidence_links: [observation.id],
      contradiction_links: [],
      confidence_before: isNew ? 0 : entity.confidence,
      confidence_after: entity.confidence,
      version: 0,
      operation: isNew ? "create" : "update",
      created_at: new Date().toISOString(),
    };
    await memory.store(entityRecord);
    records.push(entityRecord);
  }

  return records;
}

export async function integrateSignals(memory: KernelMemory, signals: Signal[]): Promise<MemoryRecord[]> {
  const records: MemoryRecord[] = [];

  for (const signal of signals) {
    const signalRecord: MemoryRecord = {
      id: genId(),
      entity_id: signal.entity_id,
      observation_id: signal.observation_id,
      event_type: "MEMORY_UPDATED",
      content: { type: "signal", signal_type: signal.signal_type, strength: signal.strength, payload: signal.payload },
      evidence_links: [signal.observation_id],
      contradiction_links: [],
      confidence_before: 0,
      confidence_after: signal.strength,
      version: 0,
      operation: "create",
      created_at: new Date().toISOString(),
    };
    await memory.store(signalRecord);
    records.push(signalRecord);
  }

  return records;
}
