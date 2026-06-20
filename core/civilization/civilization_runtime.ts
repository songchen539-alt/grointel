// GroIntel CRS-1 — Civilization Runtime (connects intelligence)
import { CivilizationNode, CivilizationIdentity, KnowledgeExchange, ConsensusProposal, ConflictRecord, ReputationScore, CollectiveDecision, CivilizationTrace } from "./civilization_types";
import { CivilizationRegistry } from "./civilization_registry";
import { CivilizationIdentityFactory } from "./civilization_identity";
import { CivilizationMemoryStore } from "./civilization_memory";
import { KnowledgeExchangeLedger } from "./civilization_exchange";
import { ConsensusEngine } from "./civilization_consensus";
import { ConflictEngine } from "./civilization_conflict";
import { ReputationEngine } from "./civilization_reputation";
import { CivilizationTraceRecorder } from "./civilization_trace";

export class CivilizationRuntime {
  public readonly registry = new CivilizationRegistry();
  public readonly factory = new CivilizationIdentityFactory();
  public readonly memory = new CivilizationMemoryStore();
  public readonly exchange = new KnowledgeExchangeLedger();
  public readonly consensus = new ConsensusEngine();
  public readonly conflicts = new ConflictEngine();
  public readonly reputation = new ReputationEngine();
  public readonly traces = new CivilizationTraceRecorder();

  registerNode(name: string, capabilities: string[], domains: string[]): CivilizationNode {
    const identity = this.factory.create(name, capabilities, domains);
    const node = this.registry.register(identity);
    this.traces.record("node_registered", node.identity.id, `Registered node: ${name}`);
    return node;
  }

  getNode(id: string): CivilizationNode | null { return this.registry.get(id); }
  getAllNodes(): CivilizationNode[] { return this.registry.getAll(); }

  exchangeKnowledge(fromNode: string, toNode: string | null, exchangeType: any, content: string, evidence: string[] = [], confidence = 70): KnowledgeExchange {
    const ex = this.exchange.record(fromNode, toNode, exchangeType, content, evidence, confidence);
    this.traces.record("knowledge_exchanged", fromNode, `${exchangeType}: ${content.substring(0, 40)}`);

    if (!toNode) {
      this.memory.addTruth(content, confidence, fromNode);
    }
    return ex;
  }

  createConsensus(topic: string, mode: any): ConsensusProposal {
    const p = this.consensus.create(topic, mode);
    this.traces.record("consensus_created", null, `Topic: ${topic}, Mode: ${mode}`);
    return p;
  }

  voteOnConsensus(proposal: ConsensusProposal, nodeId: string, support: boolean, weight: number, reason: string): void {
    this.consensus.vote(proposal, nodeId, support, weight, reason);
    this.traces.record("consensus_vote", nodeId, `${support ? "Supports" : "Opposes"}: ${proposal.topic}`);
  }

  concludeConsensus(proposal: ConsensusProposal): ConsensusProposal {
    const concluded = this.consensus.conclude(proposal);
    this.traces.record("consensus_concluded", null, `Result: ${concluded.result}, Confidence: ${concluded.confidence}`);
    if (concluded.result) {
      this.memory.addTruth(proposal.topic, concluded.confidence, "consensus");
    }
    return concluded;
  }

  detectConflict(type: any, nodeAId: string, nodeBId: string, description: string, evidence: string[], severity: any): ConflictRecord {
    const c = this.conflicts.detect(type, nodeAId, nodeBId, description, evidence, severity);
    this.traces.record("conflict_detected", nodeAId, `${type}: ${description.substring(0, 40)}`);
    return c;
  }

  resolveConflict(conflictId: string, resolution: string): ConflictRecord | null {
    const c = this.conflicts.resolve(conflictId, resolution);
    if (c) {
      this.memory.addLesson(`Conflict resolved: ${c.description}`, `Resolution: ${resolution}`, "conflict_engine");
      this.traces.record("conflict_resolved", null, resolution.substring(0, 40));
    }
    return c;
  }

  updateReputation(node: CivilizationNode, deltas: Partial<{ accuracy: number; truth: number; quality: number; contribution: number; trust: number; learning: number }>): ReputationScore {
    const result = this.reputation.update(node, deltas.accuracy || 0, deltas.truth || 0, deltas.quality || 0, deltas.contribution || 0, deltas.trust || 0, deltas.learning || 0);
    this.traces.record("reputation_updated", node.identity.id, `New composite: ${result.composite}`);
    return result;
  }

  compareReputation(a: CivilizationNode, b: CivilizationNode): { higher: string; lower: string; delta: number } {
    return this.reputation.compare(a.reputation, b.reputation);
  }
}
