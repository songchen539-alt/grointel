// GroIntel AI Core - Ranking History
// Tracks historical matching outcomes for learning-to-rank.

import { HistoricalOutcome } from "../recommendation/types";

export class RankingHistory {
  private outcomes: HistoricalOutcome[] = [];

  addOutcome(outcome: HistoricalOutcome): void {
    this.outcomes.push(outcome);
  }

  getOutcomes(channelId?: string): HistoricalOutcome[] {
    if (channelId) return this.outcomes.filter((o) => o.channelId === channelId);
    return [...this.outcomes];
  }

  getWinRate(channelId: string): number {
    const channelOutcomes = this.outcomes.filter((o) => o.channelId === channelId);
    if (channelOutcomes.length === 0) return 0;
    const wins = channelOutcomes.filter((o) => o.outcome === "won").length;
    return wins / channelOutcomes.length;
  }

  clear(): void {
    this.outcomes = [];
  }
}
