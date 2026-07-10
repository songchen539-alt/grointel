import { ConnectorRegistry } from "../../../apps/grointel/reality/connectors/connector_registry";
import { AgentReachConnector } from "../../../apps/grointel/reality/connectors/agent_reach_connector";
import type { ConnectorEvidence, ConnectorSignal } from "../../../apps/grointel/reality/reality_types";
import { WorldBuildingFlow } from "../../../apps/grointel/world/world_building_flow";
import { WEB3_TARGETS } from "./web3World";
import { getWeb3DiscoveryTargets, web3DiscoveryStats } from "./web3Discovery";

export type RealityTargetKind = "company" | "kol" | "partner";

export interface RealityTarget {
  id: string;
  name: string;
  identity: string;
  kind: RealityTargetKind;
  domain: string;
}

export interface RealityObservation {
  id: string;
  target: RealityTarget;
  signal_count: number;
  evidence_count: number;
  connectors_used: string[];
  observed_at: string;
  signals: ConnectorSignal[];
  evidence: ConnectorEvidence[];
}

export interface RealityWorldSnapshot {
  score: ReturnType<WorldBuildingFlow["runFullUpdate"]>["score"];
  topGaps: ReturnType<WorldBuildingFlow["runFullUpdate"]>["topGaps"];
  topPriorities: ReturnType<WorldBuildingFlow["runFullUpdate"]>["topPriorities"];
  progress: ReturnType<WorldBuildingFlow["runFullUpdate"]>["progress"];
  targets: RealityTarget[];
  observations: RealityObservation[];
  signals: ConnectorSignal[];
  evidence: ConnectorEvidence[];
  connectorHealth: { id: string; name: string; type: string; health: unknown; metrics: unknown }[];
  discovery: ReturnType<typeof web3DiscoveryStats> & {
    autoExpanded: boolean;
    lastExpandedAt: string | null;
  };
  lastObservedAt: string | null;
  tickCount: number;
}

const GENERAL_TARGETS: RealityTarget[] = [
  { id: "company.openai", name: "OpenAI", identity: "openai.com", kind: "company", domain: "AI / frontier model company" },
  { id: "company.stripe", name: "Stripe", identity: "stripe.com", kind: "company", domain: "Fintech / payments infrastructure" },
  { id: "company.clay", name: "Clay", identity: "clay.com", kind: "company", domain: "B2B GTM data platform" },
  { id: "company.perplexity", name: "Perplexity", identity: "perplexity.ai", kind: "company", domain: "AI search / answer engine" },
  { id: "kol.mkbhd", name: "MKBHD", identity: "youtube.com/@mkbhd", kind: "kol", domain: "Tech creator / consumer technology audience" },
  { id: "kol.lennysnewsletter", name: "Lenny's Newsletter", identity: "lennysnewsletter.com", kind: "kol", domain: "Product and growth operator audience" },
];

const SEED_TARGETS: RealityTarget[] = [...WEB3_TARGETS, ...GENERAL_TARGETS];

class GroIntelWorldRuntime {
  private readonly flow = new WorldBuildingFlow();
  private readonly registry = new ConnectorRegistry();
  private readonly targets = [...SEED_TARGETS];
  private observations: RealityObservation[] = [];
  private signals: ConnectorSignal[] = [];
  private evidence: ConnectorEvidence[] = [];
  private lastObservedAt: string | null = null;
  private lastExpandedAt: string | null = null;
  private tickCount = 0;
  private observationCounter = 0;
  private observing = false;

  snapshot(): RealityWorldSnapshot {
    this.ensureAgentReachConnector();
    this.expandWeb3DiscoveryTargets();
    this.updateMetrics();
    const update = this.flow.runFullUpdate();
    return {
      ...update,
      targets: this.targets,
      observations: this.observations.slice(-12).reverse(),
      signals: this.signals.slice(-30).reverse(),
      evidence: this.evidence.slice(-30).reverse(),
      connectorHealth: this.registry.getAll().map((connector) => ({
        id: connector.id,
        name: connector.name,
        type: connector.type,
        health: connector.health(),
        metrics: connector.metrics(),
      })),
      discovery: {
        ...web3DiscoveryStats(this.targets),
        autoExpanded: true,
        lastExpandedAt: this.lastExpandedAt,
      },
      lastObservedAt: this.lastObservedAt,
      tickCount: this.tickCount,
    };
  }

  async observeTargets(limit = 3): Promise<RealityWorldSnapshot> {
    this.ensureAgentReachConnector();
    this.expandWeb3DiscoveryTargets();
    if (this.observing) return this.snapshot();
    this.observing = true;
    try {
      const selected = this.selectObservationTargets(limit);

      for (const target of selected) {
        await this.observeTarget(target);
      }

      this.tickCount++;
      this.lastObservedAt = new Date().toISOString();
      this.updateMetrics();
      return this.snapshot();
    } finally {
      this.observing = false;
    }
  }

  ingestTargets(targets: RealityTarget[], source = "manual_ingestion"): { added: number; skipped: number; total: number } {
    this.ensureAgentReachConnector();
    const existing = new Set(this.targets.map((target) => target.id));
    const existingIdentities = new Set(this.targets.map((target) => target.identity.toLowerCase()));
    let added = 0;
    let skipped = 0;

    for (const target of targets) {
      const identityKey = target.identity.toLowerCase();
      if (existing.has(target.id) || existingIdentities.has(identityKey)) {
        skipped++;
        continue;
      }
      this.targets.push(target);
      existing.add(target.id);
      existingIdentities.add(identityKey);
      added++;
    }

    if (added > 0) {
      this.lastExpandedAt = new Date().toISOString();
      this.flow.recordEvent(
        "coverage",
        "Web3 / daily ingestion",
        `Ingested ${added} new reality targets from ${source}`,
        Math.min(100, added),
      );
      this.updateMetrics();
    }

    return { added, skipped, total: this.targets.length };
  }

  private selectObservationTargets(limit: number): RealityTarget[] {
    const safeLimit = Math.max(1, Math.min(limit, this.targets.length));
    const demandTargets = this.targets.filter((target) => target.kind === "company");
    const supplyTargets = this.targets.filter((target) => target.kind !== "company");
    const selected: RealityTarget[] = [];

    const takeRotating = (pool: RealityTarget[], count: number, offset: number) => {
      if (pool.length === 0 || count <= 0) return;
      for (let index = 0; index < count; index++) {
        const target = pool[(offset + index) % pool.length];
        if (!selected.some((item) => item.id === target.id)) selected.push(target);
      }
    };

    const supplyCount = supplyTargets.length > 0 ? Math.max(1, Math.floor(safeLimit / 2)) : 0;
    const demandCount = safeLimit - supplyCount;
    takeRotating(demandTargets, demandCount, this.tickCount % Math.max(1, demandTargets.length));
    takeRotating(supplyTargets, supplyCount, this.tickCount % Math.max(1, supplyTargets.length));

    let fallbackIndex = this.tickCount % this.targets.length;
    while (selected.length < safeLimit) {
      const target = this.targets[fallbackIndex % this.targets.length];
      if (!selected.some((item) => item.id === target.id)) selected.push(target);
      fallbackIndex++;
    }

    return selected;
  }

  private async observeTarget(target: RealityTarget): Promise<void> {
    this.ensureAgentReachConnector();
    const result = await this.registry.runAll(target.identity);
    const observedAt = new Date().toISOString();
    const observation: RealityObservation = {
      id: `obs_${(++this.observationCounter).toString(16).padStart(6, "0")}`,
      target,
      signal_count: result.signals.length,
      evidence_count: result.evidence.length,
      connectors_used: [...new Set(result.evidence.map((item) => item.connector))],
      observed_at: observedAt,
      signals: result.signals,
      evidence: result.evidence,
    };

    this.observations.push(observation);
    this.signals.push(...result.signals);
    this.evidence.push(...result.evidence);
    this.observations = this.observations.slice(-60);
    this.signals = this.signals.slice(-240);
    this.evidence = this.evidence.slice(-240);

    this.flow.recordEvent(
      "coverage",
      target.domain,
      `Observed ${target.name}: ${result.signals.length} signals and ${result.evidence.length} evidence items`,
      result.evidence.length > 0 ? 1 : 0,
    );
    if (result.signals.length > 0 || result.evidence.length > 0) {
      this.flow.recordEvent("knowledge", target.domain, `Reality updated for ${target.name}`, result.signals.length);
    }
  }

  private updateMetrics(): void {
    const byDomain = new Map<string, RealityTarget[]>();
    for (const target of this.targets) {
      const list = byDomain.get(target.domain) || [];
      list.push(target);
      byDomain.set(target.domain, list);
    }

    for (const [domain, targets] of byDomain) {
      const observedTargets = new Set(
        this.observations
          .filter((observation) => observation.target.domain === domain && observation.evidence_count > 0)
          .map((observation) => observation.target.id),
      );
      const domainEvidence = this.evidence.filter((item) => {
        const target = this.targets.find((candidate) => candidate.identity === item.entity);
        return target?.domain === domain;
      });
      const domainSignals = this.signals.filter((item) => {
        const target = this.targets.find((candidate) => candidate.identity === item.entity);
        return target?.domain === domain;
      });
      const avgEvidenceConfidence = domainEvidence.length > 0
        ? Math.round(domainEvidence.reduce((sum, item) => sum + item.confidence, 0) / domainEvidence.length)
        : 0;
      const avgSignalConfidence = domainSignals.length > 0
        ? Math.round(domainSignals.reduce((sum, item) => sum + item.confidence, 0) / domainSignals.length)
        : 0;
      const evidenceDensity = Math.min(100, domainEvidence.length * 8);
      const sourceReputation = Math.min(100, Math.max(avgEvidenceConfidence, 30));
      const freshness = observedTargets.size > 0 ? 90 : 0;
      const calibration = Math.min(100, Math.max(avgSignalConfidence, avgEvidenceConfidence));

      this.flow.coverage.update(domain, targets.length, observedTargets.size, sourceReputation);
      this.flow.quality.update(
        domain,
        evidenceDensity,
        sourceReputation,
        0,
        freshness,
        calibration,
        domainSignals.length,
        0,
        observedTargets.size > 0 ? 10 : 100,
      );
    }
  }

  private ensureAgentReachConnector(): void {
    if (!this.registry.get("connector.agent_reach")) {
      this.registry.register(new AgentReachConnector());
    }
  }

  private expandWeb3DiscoveryTargets(): void {
    const existing = new Set(this.targets.map((target) => target.id));
    const discovered = getWeb3DiscoveryTargets(undefined, this.tickCount);
    let added = 0;
    for (const target of discovered) {
      if (existing.has(target.id)) continue;
      this.targets.push(target);
      existing.add(target.id);
      added++;
    }
    if (added > 0) {
      this.lastExpandedAt = new Date().toISOString();
      this.flow.recordEvent(
        "coverage",
        "Web3 / discovery registry",
        `Expanded Web3 world target pool by ${added} demand/supply entities`,
        Math.min(100, added),
      );
    }
  }
}

const globalWorld = globalThis as typeof globalThis & {
  __grointelWorldRuntime?: GroIntelWorldRuntime;
};

export function getGroIntelWorldRuntime(): GroIntelWorldRuntime {
  if (!globalWorld.__grointelWorldRuntime) {
    globalWorld.__grointelWorldRuntime = new GroIntelWorldRuntime();
  }
  return globalWorld.__grointelWorldRuntime;
}
