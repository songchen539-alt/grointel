// AWAKENING-2 — Reality Diff Engine
import { RealityDiff, RealityChange, RealitySnapshot } from "./reality_engine_types";

export class RealityDiffEngine {
  private counter = 0;

  diff(targetId: string, before: RealitySnapshot, after: RealitySnapshot): RealityDiff {
    const changes: RealityChange[] = [];

    // Content hash changed = page changed
    if (before.content_hash !== after.content_hash) {
      // Extract specific changes from metadata
      const bMeta = before.extracted_metadata || {};
      const aMeta = after.extracted_metadata || {};
      const bFeat = before.extracted_features || [];
      const aFeat = after.extracted_features || [];

      // Title change
      if (bMeta.title !== aMeta.title) {
        changes.push({ type: "metadata", field: "title", before: String(bMeta.title || ""), after: String(aMeta.title || ""), confidence: 85, evidence: "HTML <title> changed", severity: "major" });
      }

      // Description change
      if (bMeta.description !== aMeta.description) {
        changes.push({ type: "metadata", field: "description", before: String(bMeta.description || "").substring(0, 100), after: String(aMeta.description || "").substring(0, 100), confidence: 75, evidence: "Meta description changed", severity: "minor" });
      }

      // Feature changes
      const gained = aFeat.filter(f => !bFeat.includes(f));
      const lost = bFeat.filter(f => !aFeat.includes(f));

      for (const f of gained) {
        const ct = this.categorizeFeature(f);
        changes.push({ type: ct, field: f, before: "", after: "detected", confidence: 70, evidence: `New feature detected: ${f}`, severity: "major" });
      }
      for (const f of lost) {
        changes.push({ type: this.categorizeFeature(f), field: f, before: "detected", after: "", confidence: 65, evidence: `Feature removed: ${f}`, severity: "minor" });
      }

      // HTTP status change
      if (before.http_status !== after.http_status) {
        changes.push({ type: "homepage", field: "http_status", before: String(before.http_status), after: String(after.http_status), confidence: 90, evidence: "HTTP status code changed", severity: "critical" });
      }
    }

    const sig = this.calculateSignificance(changes);
    return {
      id: "diff_" + (++this.counter).toString(16).padStart(6, "0"),
      target_id: targetId, snapshot_before_id: before.id, snapshot_after_id: after.id,
      changes, change_count: changes.length, significance: sig, computed_at: new Date().toISOString(),
    };
  }

  private categorizeFeature(feature: string): any {
    if (feature.includes("pricing") || feature.includes("price")) return "pricing";
    if (feature.includes("hiring") || feature.includes("career") || feature.includes("job")) return "hiring";
    if (feature.includes("blog") || feature.includes("news")) return "blog";
    if (feature.includes("doc") || feature.includes("docs")) return "documentation";
    if (feature.includes("product") || feature.includes("feature")) return "product";
    if (feature.includes("legal") || feature.includes("privacy") || feature.includes("terms")) return "legal";
    return "navigation";
  }

  private calculateSignificance(changes: RealityChange[]): "none"|"low"|"medium"|"high"|"critical" {
    if (changes.some(c => c.severity === "critical")) return "critical";
    if (changes.filter(c => c.severity === "major").length >= 2) return "high";
    if (changes.filter(c => c.severity === "major").length >= 1) return "medium";
    if (changes.length > 0) return "low";
    return "none";
  }
}
