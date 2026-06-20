// REALITY-2 — Connector Registry
import { ConnectorResult, ConnectorSignal, ConnectorEvidence } from "../reality_types";
import { RealWebsiteConnector } from "./website_connector";
import { RssConnector } from "./rss_connector";
import { GitHubConnector } from "./github_connector";
import { JobsConnector } from "./jobs_connector";
import { NewsConnector } from "./news_connector";

export class ConnectorRegistry {
  private connectors: Map<string, any> = new Map();

  constructor() { this.registerDefaults(); }

  private registerDefaults(): void {
    for (const c of [new RealWebsiteConnector(), new RssConnector(), new GitHubConnector(), new JobsConnector(), new NewsConnector()]) {
      this.connectors.set((c as any).id || c.constructor.name, c);
    }
  }

  get(id: string): any { return this.connectors.get(id) || null; }
  getAll(): any[] { return Array.from(this.connectors.values()); }
  register(c: any): void { this.connectors.set(c.id || c.constructor.name, c); }

  async runAll(entity: string): Promise<{ signals: ConnectorSignal[]; evidence: ConnectorEvidence[] }> {
    let allSignals: ConnectorSignal[] = []; let allEvidence: ConnectorEvidence[] = [];
    for (const c of this.connectors.values()) {
      try { const result = await c.run(entity); allSignals.push(...result.signals); allEvidence.push(...result.evidence); }
      catch { /* skip */ }
    }
    return { signals: allSignals, evidence: allEvidence };
  }
}
