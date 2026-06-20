// GroIntel CRS-1 — Consensus Engine
import { ConsensusProposal, ConsensusMode } from "./civilization_types";

export class ConsensusEngine {
  private proposals: Map<string, ConsensusProposal> = new Map();

  create(topic: string, mode: ConsensusMode): ConsensusProposal {
    const p: ConsensusProposal = {
      id: "cs_" + (++ConsensusEngine.counter).toString(16).padStart(6, "0"),
      topic, mode, votes: [], result: null, confidence: 0,
      reasoning: "", created_at: new Date().toISOString(), concluded_at: null,
    };
    this.proposals.set(p.id, p);
    return p;
  }

  vote(proposal: ConsensusProposal, nodeId: string, support: boolean, weight: number, reason: string): void {
    proposal.votes.push({ node_id: nodeId, support, weight, reason });
  }

  conclude(proposal: ConsensusProposal): ConsensusProposal {
    if (proposal.votes.length === 0) {
      proposal.result = false;
      proposal.confidence = 0;
      proposal.reasoning = "No votes cast";
      proposal.concluded_at = new Date().toISOString();
      return proposal;
    }

    const totalWeight = proposal.votes.reduce((s, v) => s + v.weight, 0);
    let forWeight = 0, againstWeight = 0;

    switch (proposal.mode) {
      case "agreement":
        forWeight = proposal.votes.filter(v => v.support).reduce((s, v) => s + v.weight, 0);
        proposal.result = forWeight === totalWeight;
        proposal.reasoning = proposal.result ? "Unanimous agreement" : "Not unanimous";
        break;
      case "majority":
        forWeight = proposal.votes.filter(v => v.support).reduce((s, v) => s + v.weight, 0);
        proposal.result = forWeight > totalWeight / 2;
        proposal.reasoning = proposal.result ? "Majority supports" : "Majority opposes";
        break;
      case "weighted_trust":
        forWeight = proposal.votes.filter(v => v.support).reduce((s, v) => s + v.weight, 0);
        againstWeight = proposal.votes.filter(v => !v.support).reduce((s, v) => s + v.weight, 0);
        proposal.result = forWeight > againstWeight;
        proposal.reasoning = proposal.result ? "Weighted trust supports" : "Weighted trust opposes";
        break;
      case "evidence_based":
        const evidenceVotes = proposal.votes.filter(v => v.reason.includes("evidence"));
        forWeight = evidenceVotes.filter(v => v.support).reduce((s, v) => s + v.weight, 0);
        againstWeight = evidenceVotes.filter(v => !v.support).reduce((s, v) => s + v.weight, 0);
        proposal.result = forWeight >= againstWeight;
        proposal.reasoning = proposal.result ? "Evidence supports" : "Evidence insufficient";
        break;
    }

    proposal.confidence = totalWeight > 0 ? Math.round(Math.abs(forWeight - (totalWeight - forWeight)) / totalWeight * 100) : 0;
    proposal.concluded_at = new Date().toISOString();
    return proposal;
  }

  get(id: string): ConsensusProposal | null { return this.proposals.get(id) || null; }
  getAll(): ConsensusProposal[] { return Array.from(this.proposals.values()); }

  private static counter = 0;
}
