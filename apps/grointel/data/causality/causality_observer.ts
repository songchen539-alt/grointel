// GroIntel DATA-5 — Causality Observer
import { CauseNode, CauseEdge, CauseNodeType, CauseEdgeType, CauseChain, CauseValidation, CauseStrength } from "./cause_types";
import { CauseExtractor } from "./cause_extractor";
import { CauseGraph } from "./cause_graph";
import { CauseValidator } from "./cause_validator";
import { CauseStrengthCalculator } from "./cause_strength";
import { CauseChainBuilder } from "./cause_chain_builder";
import { CauseGeneralizer } from "./cause_generalizer";
import { CauseLibrary } from "./cause_library";
import { CauseTraceRecorder } from "./cause_trace";

export class CausalityObserver {
  public readonly extractor = new CauseExtractor();
  public readonly graph = new CauseGraph();
  public readonly validator = new CauseValidator();
  public readonly strength = new CauseStrengthCalculator();
  public readonly chainBuilder = new CauseChainBuilder();
  public readonly generalizer = new CauseGeneralizer();
  public readonly library = new CauseLibrary();
  public readonly traces = new CauseTraceRecorder();

  observeNode(type: CauseNodeType, name: string, confidence = 50): CauseNode {
    const node = this.extractor.createNode(type, name, confidence);
    this.graph.addNode(node);
    this.traces.record("node_created", node.id, `${type}: ${name}`);
    return node;
  }

  observeEdge(sourceId: string, targetId: string, type: CauseEdgeType, strength = 50, confidence = 50, evidence: string[] = []): CauseEdge {
    const edge = this.extractor.createEdge(sourceId, targetId, type, strength, confidence, evidence);
    this.graph.addEdge(edge);
    this.traces.record("edge_created", edge.id, `${type}: ${sourceId} → ${targetId}`);
    return edge;
  }

  validateEdge(edgeId: string): { edge: CauseEdge | null; validation: CauseValidation } {
    const edge = this.graph.getEdge(edgeId);
    if (!edge) return { edge: null, validation: null as any };
    const val = this.validator.validate(edge, edge.evidence.length);
    if (val.passed) edge.confidence = Math.min(100, edge.confidence + 10);
    return { edge, validation: val };
  }

  buildChain(name: string, nodes: CauseNode[], edges: CauseEdge[], patterns: string[] = [], companies: string[] = []): CauseChain {
    const chain = this.chainBuilder.build(name, nodes, edges, patterns, companies);
    this.graph.addChain(chain);
    this.traces.record("chain_built", chain.id, name);
    return chain;
  }

  inferChain(startNodeId: string, endNodeId: string): CauseChain | null {
    const chain = this.chainBuilder.inferChain(this.graph.getAllNodes(), this.graph.getAllEdges(), startNodeId, endNodeId);
    if (chain) this.graph.addChain(chain);
    return chain;
  }

  computeStrength(edgeId: string, crossCompany = 1, crossIndustry = 1): CauseStrength | null {
    const edge = this.graph.getEdge(edgeId);
    if (!edge) return null;
    return this.strength.compute(edge, crossCompany, crossIndustry);
  }

  getNode(id: string): CauseNode | null { return this.graph.getNode(id); }
  getEdge(id: string): CauseEdge | null { return this.graph.getEdge(id); }
  getAllNodes(): CauseNode[] { return this.graph.getAllNodes(); }
  getAllEdges(): CauseEdge[] { return this.graph.getAllEdges(); }
  getAllChains(): CauseChain[] { return this.graph.getAllChains(); }
  findPath(from: string, to: string): { path: CauseEdge[]; found: boolean } { return this.graph.findPath(from, to); }
}
