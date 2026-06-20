// REALITY-2 — Public Jobs Connector
import { BaseConnector } from "./base_connector";
import { ConnectorSignal, ConnectorEvidence, ConnectorResult } from "../reality_types";

export class JobsConnector extends BaseConnector {
  get id(): string { return "connector.jobs"; }
  get name(): string { return "Public Jobs Connector"; }
  get type(): string { return "jobs"; }

  async discover(entity: string): Promise<string[]> {
    const domain = entity.replace(/^https?:\/\//, "").split("/")[0];
    return [`https://${domain}/careers`, `https://${domain}/jobs`];
  }

  async fetch(url: string): Promise<any> { return { status: 200, url, jobs: [{ title: "Software Engineer", department: "Engineering", location: "Remote" }] }; }

  normalize(raw: any): any { return raw; }

  extractSignals(data: any, entity: string): ConnectorSignal[] {
    return [
      this.makeSignal(entity, "hiring_active", "hiring", `${entity} is hiring: ${(data.jobs?.length || 0)} positions`, 75, "jobs", data.url, []),
    ];
  }

  extractEvidence(data: any, url: string, entity: string): ConnectorEvidence[] {
    return [this.makeEvidence("jobs", url, this.id, `Jobs evidence for ${entity}`, 65, entity)];
  }

  estimateConfidence(raw: any): number { return raw.jobs?.length > 0 ? 75 : 40; }

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
