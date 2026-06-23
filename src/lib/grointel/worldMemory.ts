import { getServerClient } from "@/lib/supabase/server";
import type { RealityWorldSnapshot } from "./worldRuntime";
import { WEB3_GROWTH_EVENTS, type Web3GrowthEvent } from "./web3World";

export interface WorldMemorySaveResult {
  configured: boolean;
  saved: boolean;
  runId: string | null;
  error: string | null;
}

export interface WorldMemorySummary {
  configured: boolean;
  latestRun: Record<string, any> | null;
  recentObservations: Record<string, any>[];
  recentSignals: Record<string, any>[];
  recentEvidence: Record<string, any>[];
  entityMemories: Record<string, any>[];
  decisionMemories: Record<string, any>[];
  evolutionMemories: Record<string, any>[];
  growthEvents: Record<string, any>[];
  error: string | null;
}

function memoryId(prefix: string, observedAt: string, id: string) {
  return `${prefix}_${new Date(observedAt).getTime()}_${id}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function averageConfidence(items: { confidence: number }[]) {
  if (items.length === 0) return 0;
  return Math.round(items.reduce((sum, item) => sum + item.confidence, 0) / items.length);
}

function buildEntityProfile(world: RealityWorldSnapshot, targetId: string) {
  const target = world.targets.find((item) => item.id === targetId);
  const observations = world.observations.filter((observation) => observation.target.id === targetId);
  const signals = observations.flatMap((observation) => observation.signals);
  const evidence = observations.flatMap((observation) => observation.evidence);
  const categories = [...new Set(signals.map((signal) => signal.category))];
  const connectors = [...new Set(observations.flatMap((observation) => observation.connectors_used))];

  return {
    target,
    categories,
    connectors,
    recent_signals: signals.slice(-8).map((signal) => ({
      category: signal.category,
      summary: signal.summary,
      confidence: signal.confidence,
      source: signal.source,
      url: signal.url,
    })),
    recent_evidence: evidence.slice(-8).map((item) => ({
      connector: item.connector,
      summary: item.evidence_summary,
      confidence: item.confidence,
      source: item.source,
      url: item.url,
    })),
  };
}

async function saveLegacyWorldMemory(db: any, world: RealityWorldSnapshot, source: string): Promise<boolean> {
  try {
    const observations = world.observations.slice(0, 10);
    for (const observation of observations) {
      const firstEvidence = observation.evidence[0];
      await db.from("world_raw_observations").insert({
        url: firstEvidence?.url || observation.target.identity,
        title: `${observation.target.name} ${source} observation`,
        raw_text: JSON.stringify({
          target: observation.target,
          signals: observation.signals.slice(0, 12),
          evidence: observation.evidence.slice(0, 12),
        }),
        observed_at: observation.observed_at,
        content_hash: `${observation.id}_${observation.observed_at}`,
        language: "en",
        status: "observed",
      });

      await db.from("world_events").insert({
        event_type: "grointel_reality_observation",
        event_title: `${observation.target.name} observed by GroIntel`,
        event_summary: `Observed ${observation.signal_count} signals and ${observation.evidence_count} evidence items for ${observation.target.identity}.`,
        event_date: observation.observed_at,
        detected_at: observation.observed_at,
        source_url: firstEvidence?.url || observation.target.identity,
        source_name: "GroIntel heartbeat",
        confidence: Math.min(95, Math.max(30, observation.evidence_count * 8)),
        importance: Math.min(100, observation.signal_count + observation.evidence_count),
        evidence_url: firstEvidence?.url || observation.target.identity,
        evidence_title: firstEvidence?.evidence_summary || observation.target.name,
        evidence_source_name: firstEvidence?.source || "GroIntel",
        evidence_item_type: "reality_observation",
        extraction_method: "grointel_world_runtime",
      });
    }

    for (const signal of world.signals.slice(0, 20)) {
      await db.from("world_growth_signals").insert({
        signal_type: signal.category || signal.type,
        signal_strength: signal.confidence,
        signal_reason: signal.summary,
        inferred_growth_needs: [signal.type, signal.category].filter(Boolean),
        likely_buyers: [],
        urgency: signal.confidence >= 70 ? "medium" : "low",
        confidence: signal.confidence,
      });
    }
    return true;
  } catch {
    return false;
  }
}

async function saveLegacyGrowthEvents(db: any, events: Web3GrowthEvent[]): Promise<boolean> {
  try {
    for (const event of events.slice(0, 20)) {
      await db.from("world_events").insert({
        event_type: `web3_growth_${event.outcome}`,
        event_title: `${event.project} x ${event.partner}`,
        event_summary: event.observedResult,
        event_date: event.eventDate,
        detected_at: new Date().toISOString(),
        source_url: event.evidenceUrls[0] || event.projectIdentity,
        source_name: "GroIntel Web3 growth event memory",
        confidence: event.outcome === "success" ? 78 : event.outcome === "failure" ? 74 : 68,
        importance: event.outcome === "success" ? 80 : event.outcome === "failure" ? 85 : 70,
        evidence_url: event.evidenceUrls[0] || event.projectIdentity,
        evidence_title: event.reusablePattern,
        evidence_source_name: "GroIntel Web3 memory",
        evidence_item_type: "growth_event",
        extraction_method: "curated_event_seed",
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function saveWorldMemory(world: RealityWorldSnapshot, source = "heartbeat"): Promise<WorldMemorySaveResult> {
  const supabase = getServerClient();
  if (!supabase) return { configured: false, saved: false, runId: null, error: "Supabase is not configured" };
  const db = supabase as any;

  try {
    for (const target of world.targets) {
      const lastObservation = world.observations.find((observation) => observation.target.id === target.id);
      const { error } = await db.from("world_targets").upsert({
        id: target.id,
        name: target.name,
        identity: target.identity,
        kind: target.kind,
        domain: target.domain,
        metadata: target,
        last_observed_at: lastObservation?.observed_at || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    const { data: run, error: runError } = await db
      .from("world_heartbeat_runs")
      .insert({
        status: "alive",
        source,
        tick_count: world.tickCount,
        target_count: world.targets.length,
        observation_count: world.observations.length,
        signal_count: world.signals.length,
        evidence_count: world.evidence.length,
        intelligence_index: world.score.overall,
        snapshot: world,
      })
      .select("id")
      .single();
    if (runError) throw runError;

    const runId = run?.id as string;
    const observedTargetIds = new Set<string>();

    for (const observation of world.observations) {
      observedTargetIds.add(observation.target.id);
      const observationId = memoryId("obs", observation.observed_at, observation.id);
      const { error: observationError } = await db.from("world_observations").upsert({
        id: observationId,
        run_id: runId,
        target_id: observation.target.id,
        target: observation.target,
        signal_count: observation.signal_count,
        evidence_count: observation.evidence_count,
        connectors_used: observation.connectors_used,
        observed_at: observation.observed_at,
        raw: observation,
      });
      if (observationError) throw observationError;

      if (observation.signals.length > 0) {
        const { error: signalError } = await db.from("world_signals").upsert(
          observation.signals.map((signal) => ({
            id: memoryId("sig", observation.observed_at, signal.id),
            run_id: runId,
            observation_id: observationId,
            target_id: observation.target.id,
            entity: signal.entity,
            type: signal.type,
            category: signal.category,
            summary: signal.summary,
            confidence: signal.confidence,
            source: signal.source,
            url: signal.url,
            raw: signal,
            observed_at: signal.timestamp || observation.observed_at,
          })),
        );
        if (signalError) throw signalError;
      }

      if (observation.evidence.length > 0) {
        const { error: evidenceError } = await db.from("world_evidence").upsert(
          observation.evidence.map((evidence) => ({
            id: memoryId("ev", observation.observed_at, evidence.id),
            run_id: runId,
            observation_id: observationId,
            target_id: observation.target.id,
            entity: evidence.entity,
            connector: evidence.connector,
            source: evidence.source,
            url: evidence.url,
            evidence_summary: evidence.evidence_summary,
            confidence: evidence.confidence,
            raw: evidence,
            observed_at: evidence.observed_at || observation.observed_at,
          })),
        );
        if (evidenceError) throw evidenceError;
      }
    }

    for (const targetId of observedTargetIds) {
      const target = world.targets.find((item) => item.id === targetId);
      if (!target) continue;

      const targetObservations = world.observations.filter((observation) => observation.target.id === targetId);
      const targetSignals = targetObservations.flatMap((observation) => observation.signals);
      const targetEvidence = targetObservations.flatMap((observation) => observation.evidence);
      const lastObservedAt = targetObservations[0]?.observed_at || new Date().toISOString();
      const confidence = averageConfidence([...targetSignals, ...targetEvidence]);

      const { error: entityMemoryError } = await db.from("world_entity_memories").upsert({
        target_id: target.id,
        identity: target.identity,
        kind: target.kind,
        domain: target.domain,
        signal_count: targetSignals.length,
        evidence_count: targetEvidence.length,
        confidence,
        profile: buildEntityProfile(world, target.id),
        last_observed_at: lastObservedAt,
        updated_at: new Date().toISOString(),
      });
      if (entityMemoryError) throw entityMemoryError;
    }

    const { error: decisionError } = await db.from("world_decision_memories").insert({
      run_id: runId,
      decision_type: "world_gap_and_priority_update",
      confidence: Math.round((world.score.reality_coverage + world.score.knowledge_quality) / 2),
      reasoning: "GroIntel updated world gaps and next observation priorities from the latest reality heartbeat.",
      gaps: world.topGaps,
      priorities: world.topPriorities,
    });
    if (decisionError) throw decisionError;

    const { error: evolutionError } = await db.from("world_evolution_memories").insert({
      run_id: runId,
      intelligence_index: world.score.overall,
      reality_coverage: world.score.reality_coverage,
      knowledge_quality: world.score.knowledge_quality,
      decision_accuracy: world.score.decision_accuracy,
      business_outcomes: world.score.business_outcomes,
      progress: world.progress,
      lesson: `Observed ${observedTargetIds.size} entities with ${world.signals.length} signals and ${world.evidence.length} evidence items.`,
    });
    if (evolutionError) throw evolutionError;

    return { configured: true, saved: true, runId, error: null };
  } catch (error: any) {
    const legacySaved = await saveLegacyWorldMemory(db, world, source);
    if (legacySaved) {
      return { configured: true, saved: true, runId: null, error: `Saved to legacy world tables because primary world memory is unavailable: ${error.message}` };
    }
    return { configured: true, saved: false, runId: null, error: error.message || "Failed to save world memory" };
  }
}

export async function seedGrowthEvents(events: Web3GrowthEvent[] = WEB3_GROWTH_EVENTS): Promise<WorldMemorySaveResult> {
  const supabase = getServerClient();
  if (!supabase) return { configured: false, saved: false, runId: null, error: "Supabase is not configured" };
  const db = supabase as any;

  try {
    const { error } = await db.from("world_growth_events").upsert(events.map((event) => ({
      id: event.id,
      industry: "web3",
      project: event.project,
      project_identity: event.projectIdentity,
      partner: event.partner,
      partner_identity: event.partnerIdentity,
      partner_type: event.partnerType,
      chain_or_sector: event.chainOrSector,
      event_date: event.eventDate,
      outcome: event.outcome,
      growth_goal: event.growthGoal,
      collaboration_format: event.collaborationFormat,
      observed_result: event.observedResult,
      why_it_worked_or_failed: event.whyItWorkedOrFailed,
      reusable_pattern: event.reusablePattern,
      risks: event.risks,
      evidence_urls: event.evidenceUrls,
      confidence: event.outcome === "success" ? 78 : event.outcome === "failure" ? 74 : 68,
      raw: event,
      updated_at: new Date().toISOString(),
    })));
    if (error) throw error;
    return { configured: true, saved: true, runId: null, error: null };
  } catch (error: any) {
    const legacySaved = await saveLegacyGrowthEvents(db, events);
    if (legacySaved) {
      return { configured: true, saved: true, runId: null, error: `Saved to legacy world_events because world_growth_events is unavailable: ${error.message}` };
    }
    return { configured: true, saved: false, runId: null, error: error.message || "Failed to seed growth events" };
  }
}

export async function loadGrowthEvents(limit = 50): Promise<{ configured: boolean; events: Record<string, any>[]; error: string | null }> {
  const supabase = getServerClient();
  if (!supabase) return { configured: false, events: WEB3_GROWTH_EVENTS, error: "Supabase is not configured" };
  const db = supabase as any;

  try {
    const { data, error } = await db
      .from("world_growth_events")
      .select("*")
      .order("event_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return { configured: true, events: data?.length ? data : WEB3_GROWTH_EVENTS, error: null };
  } catch (error: any) {
    return { configured: true, events: WEB3_GROWTH_EVENTS, error: error.message || "Failed to load growth events" };
  }
}

export async function loadWorldMemorySummary(limit = 20): Promise<WorldMemorySummary> {
  const supabase = getServerClient();
  if (!supabase) {
    return {
      configured: false,
      latestRun: null,
      recentObservations: [],
      recentSignals: [],
      recentEvidence: [],
      entityMemories: [],
      decisionMemories: [],
      evolutionMemories: [],
      growthEvents: WEB3_GROWTH_EVENTS,
      error: "Supabase is not configured",
    };
  }
  const db = supabase as any;

  try {
    const [runResult, observationResult, signalResult, evidenceResult, entityResult, decisionResult, evolutionResult, growthEventResult] = await Promise.all([
      db.from("world_heartbeat_runs").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("world_observations").select("*").order("observed_at", { ascending: false }).limit(limit),
      db.from("world_signals").select("*").order("observed_at", { ascending: false }).limit(limit),
      db.from("world_evidence").select("*").order("observed_at", { ascending: false }).limit(limit),
      db.from("world_entity_memories").select("*").order("updated_at", { ascending: false }).limit(limit),
      db.from("world_decision_memories").select("*").order("created_at", { ascending: false }).limit(limit),
      db.from("world_evolution_memories").select("*").order("created_at", { ascending: false }).limit(limit),
      db.from("world_growth_events").select("*").order("event_date", { ascending: false }).limit(limit),
    ]);

    const error = runResult.error || observationResult.error || signalResult.error || evidenceResult.error || entityResult.error || decisionResult.error || evolutionResult.error || growthEventResult.error;
    if (error) throw error;

    return {
      configured: true,
      latestRun: runResult.data || null,
      recentObservations: observationResult.data || [],
      recentSignals: signalResult.data || [],
      recentEvidence: evidenceResult.data || [],
      entityMemories: entityResult.data || [],
      decisionMemories: decisionResult.data || [],
      evolutionMemories: evolutionResult.data || [],
      growthEvents: growthEventResult.data?.length ? growthEventResult.data : WEB3_GROWTH_EVENTS,
      error: null,
    };
  } catch (error: any) {
    return {
      configured: true,
      latestRun: null,
      recentObservations: [],
      recentSignals: [],
      recentEvidence: [],
      entityMemories: [],
      decisionMemories: [],
      evolutionMemories: [],
      growthEvents: WEB3_GROWTH_EVENTS,
      error: error.message || "Failed to load world memory",
    };
  }
}
