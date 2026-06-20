// REALITY-2 — Website Connector
import { BaseConnector } from "./base_connector";
import { ConnectorSignal, ConnectorEvidence, ConnectorResult } from "../reality_types";

export class WebsiteConnector extends BaseConnector {
  get id(): string { return "connector.website"; }
  get name(): string { return "Official Website Connector"; }
  get type(): string { return "website"; }

  async discover(entity: string): Promise<string[]> {
    const domain = entity.replace(/^https?:\/\//, "").split("/")[0];
    return [`https://${domain}`, `https://${domain}/blog`, `https://${domain}/pricing`, `https://${domain}/careers`, `https://${domain}/changelog`];
  }

  async fetch(url: string): Promise<any> { return { status: 200, url, content: `Mock website content for ${url}` }; }
  normalize(raw: any): any { return { ...raw, normalized: true }; }

  extractSignals(data: any, entity: string): ConnectorSignal[] {
    return [
      this.makeSignal(entity, "website_observed", "documentation", `Observed ${entity} website`, 70, "website", data.url, []),
      this.makeSignal(entity, "pricing_check", "pricing", `Checked pricing page`, 60, "website", data.url, []),
    ];
  }

  extractEvidence(data: any, url: string, entity: string): ConnectorEvidence[] {
    return [this.makeEvidence("website", url, this.id, `Website evidence for ${entity}`, 65, entity)];
  }

  estimateConfidence(raw: any): number { return raw.status === 200 ? 70 : 30; }

  async run(entity: string): Promise<ConnectorResult> {
    const start = Date.now();
    try {
      const urls = await this.discover(entity);
      const allSignals: ConnectorSignal[] = []; const allEvidence: ConnectorEvidence[] = [];
      for (const url of urls.slice(0, 3)) {
        const data = await this.fetch(url);
        const normalized = this.normalize(data);
        allSignals.push(...this.extractSignals(normalized, entity));
        allEvidence.push(...this.extractEvidence(normalized, url, entity));
      }
      this.totalSigs += allSignals.length;
      this.recordSuccess(Date.now() - start);
      return { signals: allSignals, evidence: allEvidence, health: this.health() };
    } catch (e: any) {
      this.recordError(e.message);
      return { signals: [], evidence: [], health: this.health() };
    }
  }
}
