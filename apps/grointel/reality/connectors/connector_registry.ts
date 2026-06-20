// REALITY-2 — Connector Registry
import { IKConnector, ConnectorResult, ConnectorSignal, ConnectorEvidence } from "../reality_types";
import { WebsiteConnector } from "./website_connector";
import { RssConnector } from "./rss_connector";
import { GitHubConnector } from "./github_connector";
import { JobsConnector } from "./jobs_connector";
import { NewsConnector } from "./news_connector";

export class ConnectorRegistry {
  private connectors: Map<string, IKConnector> = new Map();

  constructor() { this.registerDefaults(); }

  private registerDefaults(): void {
    for (const c of [new WebsiteConnector(), new RssConnector(), new GitHubConnector(), new JobsConnector(), new NewsConnector()]) {
      this.connectors.set(c.id, c);
    }
  }

  get(id: string): IKConnector | null { return this.connectors.get(id) || null; }
  getAll(): IKConnector[] { return Array.from(this.connectors.values()); }
  register(c: IKConnector): void { this.connectors.set(c.id, c); }

  async runAll(entity: string): Promise<{ signals: ConnectorSignal[]; evidence: ConnectorEvidence[] }> {
    let allSignals: ConnectorSignal[] = []; let allEvidence: ConnectorEvidence[] = [];
    for (const c of this.connectors.values()) {
      try {
        const result = await c.run(entity);
        allSignals.push(...result.signals);
        allEvidence.push(...result.evidence);
      } catch { /* skip failed connectors */ }
    }
    return { signals: allSignals, evidence: allEvidence };
  }
}
