// REALITY-2 — RSS/Atom Connector
import { BaseConnector } from "./base_connector";
import { ConnectorSignal, ConnectorEvidence, ConnectorResult } from "../reality_types";

export class RssConnector extends BaseConnector {
  get id(): string { return "connector.rss"; }
  get name(): string { return "RSS / Atom Connector"; }
  get type(): string { return "rss"; }

  async discover(entity: string): Promise<string[]> {
    const domain = entity.replace(/^https?:\/\//, "").split("/")[0];
    return [`https://${domain}/feed`, `https://${domain}/rss`, `https://${domain}/atom`];
  }

  async fetch(url: string): Promise<any> { return { status: 200, url, entries: [{ title: "Mock Entry", published: new Date().toISOString() }] }; }
  normalize(raw: any): any { return raw; }

  extractSignals(data: any, entity: string): ConnectorSignal[] {
    return [this.makeSignal(entity, "rss_entry", "community", `RSS entry from ${entity}`, 65, "rss", data.url, [])];
  }

  extractEvidence(data: any, url: string, entity: string): ConnectorEvidence[] {
    return [this.makeEvidence("rss", url, this.id, `RSS evidence for ${entity}`, 60, entity)];
  }

  estimateConfidence(raw: any): number { return raw.entries?.length > 0 ? 65 : 30; }

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
