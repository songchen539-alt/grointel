// AWAKENING-2 — Reality Engine (continuous reality worker)
import { RealWebsiteConnector } from "../connectors/website_connector";
import { RealityTargetRegistry } from "./reality_target_registry";
import { SnapshotEngine } from "./snapshot_engine";
import { RealityDiffEngine } from "./reality_diff_engine";
import { RealitySignal, WorldCoverage, RealityTarget } from "./reality_engine_types";

export class RealityEngine {
  public readonly targets = new RealityTargetRegistry();
  public readonly snapshots = new SnapshotEngine();
  public readonly diffEngine = new RealityDiffEngine();
  public readonly connector = new RealWebsiteConnector();

  public signals: RealitySignal[] = [];
  public cycleCount = 0;
  public isRunning = false;

  // Register initial targets
  constructor() { this.registerKnownCompanies(); }

  private registerKnownCompanies(): void {
    const companies = [
      { name: "OpenAI", website: "openai.com", industry: "ai", country: "US" },
      { name: "Stripe", website: "stripe.com", industry: "fintech", country: "US" },
      { name: "GitHub", website: "github.com", industry: "developer", country: "US" },
      { name: "Vercel", website: "vercel.com", industry: "developer", country: "US" },
      { name: "Shopify", website: "shopify.com", industry: "ecommerce", country: "CA" },
      { name: "Cloudflare", website: "cloudflare.com", industry: "infrastructure", country: "US" },
      { name: "Notion", website: "notion.so", industry: "productivity", country: "US" },
      { name: "HubSpot", website: "hubspot.com", industry: "marketing", country: "US" },
      { name: "Canva", website: "canva.com", industry: "design", country: "AU" },
      { name: "Anthropic", website: "anthropic.com", industry: "ai", country: "US" },
    ];
    for (const c of companies) {
      this.targets.register(c.name, c.website, "company", c.industry, c.country, 70);
    }
  }

  async cycle(): Promise<{ target: RealityTarget | null; signals: number; snapshots: number; diffs: number }> {
    this.cycleCount++;

    // 1. Select next target
    const target = this.targets.getNextTarget();
    if (!target) return { target: null, signals: 0, snapshots: 0, diffs: 0 };

    // 2. Fetch
    let html = ""; let status = 0; let headers: Record<string, string> = {}; let fetchTime = 0;
    try {
      // Try homepage first
      const page = await this.connector.fetch(`https://${target.website}`);
      html = page.body; status = page.status; headers = page.headers; fetchTime = page.fetchTimeMs;
    } catch (e: any) {
      this.targets.recordObservation(target, false);
      return { target, signals: 0, snapshots: 0, diffs: 0 };
    }

    if (status !== 200) {
      this.targets.recordObservation(target, false);
      return { target, signals: 0, snapshots: 0, diffs: 0 };
    }

    // 3. Extract metadata and features
    const signals = this.connector.extractSignals({ url: `https://${target.website}`, status, body: html }, target.name);
    const features = signals.map(s => s.type);
    const metadata: Record<string, unknown> = { title: "", description: "" };
    for (const s of signals) {
      if (s.type === "website_title") metadata.title = s.summary.replace("Title: ", "");
      if (s.type === "website_description") metadata.description = s.summary.replace("Description: ", "");
    }

    // 4. Create snapshot
    const snapshot = await this.snapshots.create(target, html, status, headers, fetchTime, metadata, features);
    this.targets.recordObservation(target, true);

    // 5. Diff against previous
    const prev = this.snapshots.getPrevious(target.id);
    let newSignals: RealitySignal[] = [];
    if (prev && prev.content_hash !== snapshot.content_hash) {
      const diff = this.diffEngine.diff(target.id, prev, snapshot);
      newSignals = diff.changes.map(c => ({
        id: "rsig_" + Math.random().toString(36).slice(2, 10),
        target_id: target.id, diff_id: diff.id, type: c.type,
        label: `${c.field}: ${c.before} → ${c.after}`.substring(0, 100),
        confidence: c.confidence, severity: c.severity, evidence: c.evidence, timestamp: new Date().toISOString(),
      }));
    } else if (!prev && signals.length > 0) {
      // First observation — generate initial signals
      newSignals = signals.map(s => ({
        id: "rsig_" + Math.random().toString(36).slice(2, 10),
        target_id: target.id, diff_id: "initial", type: s.type,
        label: s.summary.substring(0, 100), confidence: s.confidence,
        severity: "info", evidence: "Initial observation", timestamp: new Date().toISOString(),
      }));
    }

    // 6. Update attention based on changes
    const changeScore = newSignals.length * 10;
    const currentScore = target.attention_score;
    this.targets.updateAttention(target, Math.min(100, Math.max(10, currentScore + changeScore)));

    // 7. Store signals
    this.signals.push(...newSignals);

    return { target, signals: newSignals.length, snapshots: 1, diffs: prev ? 1 : 0 };
  }

  getCoverage(): WorldCoverage {
    const targets = this.targets.getAll();
    const countries = new Set(targets.map(t => t.country));
    const industries = new Set(targets.map(t => t.industry));
    return {
      companies_observed: targets.length, countries_observed: countries.size, industries_covered: industries.size,
      pages_crawled: this.connector.totalFetches, snapshots_stored: this.snapshots.count(),
      diffs_detected: this.signals.filter(s => s.type !== "initial").length,
      signals_extracted: this.connector.totalSignals, evidence_generated: this.connector.totalFetches,
      knowledge_revisions: 0, decision_updates: 0, reality_coverage_pct: Math.round(targets.length / 100 * 100),
      average_knowledge_age_hours: 0,
    };
  }
}
