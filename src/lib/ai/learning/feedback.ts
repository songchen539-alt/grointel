// GroIntel AI Core v2 - Feedback Collection
// Abstraction for collecting and processing feedback on recommendations.

export interface FeedbackEvent {
  recommendationId: string;
  channelId: string;
  serviceId: string | null;
  type: "accepted" | "rejected" | "viewed" | "ignored";
  timestamp: string;
  note?: string;
}

export class FeedbackCollector {
  private feedback: FeedbackEvent[] = [];

  record(event: FeedbackEvent): void {
    this.feedback.push(event);
  }

  getByChannel(channelId: string): FeedbackEvent[] {
    return this.feedback.filter((f) => f.channelId === channelId);
  }

  getAccepted(): FeedbackEvent[] {
    return this.feedback.filter((f) => f.type === "accepted");
  }

  getRejected(): FeedbackEvent[] {
    return this.feedback.filter((f) => f.type === "rejected");
  }

  getAll(): FeedbackEvent[] {
    return [...this.feedback];
  }

  clear(): void {
    this.feedback = [];
  }

  get size(): number {
    return this.feedback.length;
  }
}
