// GroIntel AI Core v2 - Dataset
// Represents a training dataset for learning-to-rank.

import { OutcomeRecord } from "./history";

export interface TrainingExample {
  features: number[];
  label: number; // 1 = positive, 0 = negative
  weight: number;
  channelId: string;
  growthNeedId: string;
}

export class Dataset {
  private examples: TrainingExample[] = [];

  fromOutcomes(records: OutcomeRecord[]): void {
    this.examples = records.map((r) => ({
      features: [r.ruleScore, r.embeddingScore || 0, r.hybridScore],
      label: r.outcome === "accepted" || r.outcome === "won" ? 1 : 0,
      weight: 1.0,
      channelId: r.channelId,
      growthNeedId: r.growthNeedId,
    }));
  }

  addExample(example: TrainingExample): void {
    this.examples.push(example);
  }

  getExamples(): TrainingExample[] {
    return [...this.examples];
  }

  split(trainRatio: number): { train: TrainingExample[]; test: TrainingExample[] } {
    const shuffled = [...this.examples].sort(() => Math.random() - 0.5);
    const splitIdx = Math.floor(shuffled.length * trainRatio);
    return {
      train: shuffled.slice(0, splitIdx),
      test: shuffled.slice(splitIdx),
    };
  }

  clear(): void {
    this.examples = [];
  }

  get size(): number {
    return this.examples.length;
  }
}
