// GroIntel CRS-1 — Civilization Memory
import { CivilizationMemory } from "./civilization_types";

export class CivilizationMemoryStore {
  private memory: CivilizationMemory = { shared_truths: [], shared_lessons: [], shared_failures: [], shared_strategies: [], shared_evidence: [] };

  addTruth(statement: string, confidence: number, source: string): void {
    this.memory.shared_truths.push({ statement, confidence, source, timestamp: new Date().toISOString() });
  }
  addLesson(lesson: string, context: string, source: string): void {
    this.memory.shared_lessons.push({ lesson, context, source, timestamp: new Date().toISOString() });
  }
  addFailure(failure: string, cause: string, source: string): void {
    this.memory.shared_failures.push({ failure, cause, source, timestamp: new Date().toISOString() });
  }
  addStrategy(strategy: string, effectiveness: number, source: string): void {
    this.memory.shared_strategies.push({ strategy, effectiveness, source, timestamp: new Date().toISOString() });
  }
  addEvidence(claim: string, evidence: string, source: string, confidence: number): void {
    this.memory.shared_evidence.push({ claim, evidence, source, confidence, timestamp: new Date().toISOString() });
  }

  getMemory(): CivilizationMemory { return this.memory; }
  getTruthCount(): number { return this.memory.shared_truths.length; }
  getLessonCount(): number { return this.memory.shared_lessons.length; }
}
