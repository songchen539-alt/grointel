// GroIntel CRS-1 — Knowledge Exchange (append-only)
import { KnowledgeExchange } from "./civilization_types";

export class KnowledgeExchangeLedger {
  private exchanges: KnowledgeExchange[] = [];

  record(fromNode: string, toNode: string | null, exchangeType: any, content: string, evidence: string[], confidence: number): KnowledgeExchange {
    const ex: KnowledgeExchange = {
      id: "kx_" + (++KnowledgeExchangeLedger.counter).toString(16).padStart(6, "0"),
      from_node: fromNode, to_node: toNode,
      exchange_type: exchangeType, content, evidence, confidence,
      timestamp: new Date().toISOString(),
    };
    this.exchanges.push(ex);
    return ex;
  }

  getAll(): KnowledgeExchange[] { return this.exchanges; }
  getByNode(nodeId: string): KnowledgeExchange[] { return this.exchanges.filter(e => e.from_node === nodeId || e.to_node === nodeId); }
  getByType(type: string): KnowledgeExchange[] { return this.exchanges.filter(e => e.exchange_type === type); }
  count(): number { return this.exchanges.length; }

  private static counter = 0;
}
