// REALITY-2 — Public News Connector
import { BaseConnector } from "./base_connector";
import { ConnectorSignal, ConnectorEvidence, ConnectorResult } from "../reality_types";

export class NewsConnector extends BaseConnector {
  get id(): string { return "connector.news"; }
  get name(): string { return "Public News Connector"; }
  get type(): string { return "news"; }

  async discover(entity: string): Promise<string[]> {
    const domain = entity.replace(/^https?:\/\//, "").split("/")[0];
    return [`https://news.google.com/search?q=${domain}`, `https://newsapi.org/v2/everything?q=${domain}`];
  }

  async fetch(url: string): Promise<any> { return { status: 200, url, articles: [{ title: "Company announces expansion", source: "Mock News", publishedAt: new Date().toISOString() }] }; }

  normalize(raw: any): any { return raw; }

  extractSignals(data: any, entity: string): ConnectorSignal[] {
    return [
      this.makeSignal(entity, "news_mention", "traffic", `News mention for ${entity}: ${(data.articles?.[0]?.title || "")}`, 55, "news", data.url, []),
    ];
  }

  extractEvidence(data: any, url: string, entity: string): ConnectorEvidence[] {
    return [this.makeEvidence("news", url, this.id, `News evidence for ${entity}`, 55, entity)];
  }

  estimateConfidence(raw: any): number { return raw.articles?.length > 0 ? 55 : 20; }

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
