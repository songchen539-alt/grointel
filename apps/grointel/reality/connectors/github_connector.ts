// REALITY-2 — GitHub Public Connector
import { BaseConnector } from "./base_connector";
import { ConnectorSignal, ConnectorEvidence, ConnectorResult } from "../reality_types";

export class GitHubConnector extends BaseConnector {
  get id(): string { return "connector.github"; }
  get name(): string { return "GitHub Public Connector"; }
  get type(): string { return "github"; }

  async discover(entity: string): Promise<string[]> {
    const org = entity.replace(/^https?:\/\//, "").split("/")[0];
    return [`https://api.github.com/orgs/${org}/repos`, `https://api.github.com/orgs/${org}/events`];
  }

  async fetch(url: string): Promise<any> { return { status: 200, url, repos: [{ name: "test-repo", stars: 42, forks: 10 }], events: [] }; }

  normalize(raw: any): any { return raw; }

  extractSignals(data: any, entity: string): ConnectorSignal[] {
    return [
      this.makeSignal(entity, "github_activity", "engineering", `GitHub activity for ${entity}`, 70, "github", data.url, []),
      this.makeSignal(entity, "open_source", "engineering", `Open source repositories: ${(data.repos?.length || 0)}`, 65, "github", data.url, []),
    ];
  }

  extractEvidence(data: any, url: string, entity: string): ConnectorEvidence[] {
    return [this.makeEvidence("github", url, this.id, `GitHub evidence for ${entity}`, 68, entity)];
  }

  estimateConfidence(raw: any): number { return raw.status === 200 ? 75 : 25; }

  async run(entity: string): Promise<ConnectorResult> {
    const start = Date.now();
    try {
      const urls = await this.discover(entity);
      const allSignals: ConnectorSignal[] = []; const allEvidence: ConnectorEvidence[] = [];
      for (const url of urls) {
        const data = await this.fetch(url);
        allSignals.push(...this.extractSignals(data, entity));
        allEvidence.push(...this.extractEvidence(data, url, entity));
      }
      this.totalSigs += allSignals.length;
      this.recordSuccess(Date.now() - start);
      return { signals: allSignals, evidence: allEvidence, health: this.health() };
    } catch (e: any) { this.recordError(e.message); return { signals: [], evidence: [], health: this.health() }; }
  }
}
