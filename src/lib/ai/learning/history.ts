// GroIntel AI Core v2 - Learning History
// Tracks historical outcomes for learning-to-rank and confidence computation.

export interface OutcomeRecord {
  channelId: string;
  serviceId: string | null;
  growthNeedId: string;
  ruleScore: number;
  embeddingScore: number | null;
  hybridScore: number;
  outcome: "accepted" | "rejected" | "won" | "lost" | "viewed" | "ignored";
  timestamp: string;
}

export class LearningHistory {
  private records: OutcomeRecord[] = [];

  add(record: OutcomeRecord): void {
    this.records.push(record);
  }

  getByChannel(channelId: string): OutcomeRecord[] {
    return this.records.filter((r) => r.channelId === channelId);
  }

  getByService(serviceId: string): OutcomeRecord[] {
    return this.records.filter((r) => r.serviceId === serviceId);
  }

  getAccepted(): OutcomeRecord[] {
    return this.records.filter((r) => r.outcome === "accepted" || r.outcome === "won");
  }

  getRejected(): OutcomeRecord[] {
    return this.records.filter((r) => r.outcome === "rejected" || r.outcome === "lost");
  }

  getAll(): OutcomeRecord[] {
    return [...this.records];
  }

  clear(): void {
    this.records = [];
  }

  get size(): number {
    return this.records.length;
  }
}
