// REALITY-2 - Connector Registry
import { ConnectorEvidence, ConnectorHealth, ConnectorMetrics, ConnectorResult, ConnectorSignal } from "../reality_types";
import { RealWebsiteConnector } from "./website_connector";
import { RssConnector } from "./rss_connector";
import { GitHubConnector } from "./github_connector";
import { JobsConnector } from "./jobs_connector";
import { NewsConnector } from "./news_connector";
import { AgentReachConnector } from "./agent_reach_connector";

type RunnableConnector = {
  id: string;
  name: string;
  type: string;
  run(entity: string): Promise<ConnectorResult>;
  health(): ConnectorHealth;
  metrics(): ConnectorMetrics;
};

export class ConnectorRegistry {
  private connectors: Map<string, RunnableConnector> = new Map();

  constructor() { this.registerDefaults(); }

  private registerDefaults(): void {
    for (const connector of [new RealWebsiteConnector(), new RssConnector(), new GitHubConnector(), new JobsConnector(), new NewsConnector(), new AgentReachConnector()]) {
      this.connectors.set(connector.id || connector.constructor.name, connector);
    }
  }

  get(id: string): RunnableConnector | null { return this.connectors.get(id) || null; }
  getAll(): RunnableConnector[] { return Array.from(this.connectors.values()); }
  register(connector: RunnableConnector): void { this.connectors.set(connector.id || connector.constructor.name, connector); }

  async runAll(entity: string): Promise<{ signals: ConnectorSignal[]; evidence: ConnectorEvidence[] }> {
    const allSignals: ConnectorSignal[] = [];
    const allEvidence: ConnectorEvidence[] = [];
    for (const connector of this.connectors.values()) {
      try {
        const result = await connector.run(entity);
        allSignals.push(...result.signals);
        allEvidence.push(...result.evidence);
      } catch {
        // Individual connectors should not stop a world observation cycle.
      }
    }
    return { signals: allSignals, evidence: allEvidence };
  }
}
