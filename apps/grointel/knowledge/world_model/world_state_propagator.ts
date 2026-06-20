// GroIntel KNOWLEDGE-1 — World State Propagator (incremental)
export class WorldStatePropagator {
  propagate(entityId: string, entityType: string): { affected: number; depth: number } {
    // In a full implementation, this would traverse the graph
    // For now, it's the abstraction
    return { affected: 5, depth: 1 };
  }
}
