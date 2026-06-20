// GroIntel CRS-2 — Contribution Trace
import { ContributionTrace } from "./contribution_types";

let tCounter = 0;
function genId(): string { return "ctb_" + (++tCounter).toString(16).padStart(6, "0"); }

export class ContributionTraceRecorder {
  private traces: ContributionTrace[] = [];

  record(action: string, artifactId: string | null, contributorId: string | null, details: string): ContributionTrace {
    const t: ContributionTrace = { id: genId(), action, artifact_id: artifactId, contributor_id: contributorId, details, timestamp: new Date().toISOString() };
    this.traces.push(t);
    return t;
  }

  getAll(): ContributionTrace[] { return this.traces; }
  findByAction(action: string): ContributionTrace[] { return this.traces.filter(t => t.action === action); }
  findByArtifact(artifactId: string): ContributionTrace[] { return this.traces.filter(t => t.artifact_id === artifactId); }
}
