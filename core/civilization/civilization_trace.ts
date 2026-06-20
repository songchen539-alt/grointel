// GroIntel CRS-1 — Civilization Trace
import { CivilizationTrace } from "./civilization_types";

let tCounter = 0;
function genId(): string { return "ctr_" + (++tCounter).toString(16).padStart(6, "0"); }

export class CivilizationTraceRecorder {
  private traces: CivilizationTrace[] = [];

  record(action: string, nodeId: string | null, details: string): CivilizationTrace {
    const t: CivilizationTrace = { id: genId(), action, node_id: nodeId, details, timestamp: new Date().toISOString() };
    this.traces.push(t);
    return t;
  }

  getAll(): CivilizationTrace[] { return this.traces; }
  findByAction(action: string): CivilizationTrace[] { return this.traces.filter(t => t.action === action); }
  findByNode(nodeId: string): CivilizationTrace[] { return this.traces.filter(t => t.node_id === nodeId); }
}
