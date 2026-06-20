// AWAKENING-2 — Snapshot Engine (immutable snapshots)
import { RealitySnapshot, RealityTarget } from "./reality_engine_types";
import * as crypto from "node:crypto";

export class SnapshotEngine {
  private snapshots: Map<string, RealitySnapshot> = new Map();
  private counter = 0;

  async create(target: RealityTarget, rawHtml: string, httpStatus: number, headers: Record<string, string>, fetchTimeMs: number, metadata: Record<string, unknown>, features: string[]): Promise<RealitySnapshot> {
    const contentHash = crypto.createHash("sha256").update(rawHtml).digest("hex").substring(0, 16);
    const snapshot: RealitySnapshot = {
      id: "snap_" + (++this.counter).toString(16).padStart(6, "0"),
      target_id: target.id, raw_html: rawHtml, http_status: httpStatus,
      headers, content_hash: contentHash, extracted_metadata: metadata,
      extracted_features: features, fetched_at: new Date().toISOString(), fetch_time_ms: fetchTimeMs,
    };
    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  getLatest(targetId: string): RealitySnapshot | null {
    const all = this.getByTarget(targetId);
    return all.length > 0 ? all[all.length - 1] : null;
  }

  getPrevious(targetId: string): RealitySnapshot | null {
    const all = this.getByTarget(targetId);
    return all.length > 1 ? all[all.length - 2] : null;
  }

  getByTarget(targetId: string): RealitySnapshot[] {
    return Array.from(this.snapshots.values()).filter(s => s.target_id === targetId);
  }

  get(id: string): RealitySnapshot | null { return this.snapshots.get(id) || null; }
  count(): number { return this.snapshots.size; }
}
