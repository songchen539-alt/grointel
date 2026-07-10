import { getServerClient } from "@/lib/supabase/server";
import type { RealityWorldSnapshot } from "./worldRuntime";
import type { DailyIngestionBatch, DailyIngestionCandidate } from "./dailyIngestion";
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

export interface DailyIngestionSaveResult extends WorldMemorySaveResult {
  batchId: string;
  demand: number;
  supply: number;
  targetCount: number;
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

async function saveLegacyDailyIngestion(db: any, batch: DailyIngestionBatch): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const rawObservations = batch.targets.map((target) => ({
        url: target.identity,
        title: `${target.name} daily Web3 ${target.side} ingestion`,
        raw_text: JSON.stringify({
          target,
          batch_id: batch.id,
          ingestion_side: target.side,
          tags: target.tags,
          reason: target.ingestionReason,
        }),
        observed_at: now,
        content_hash: `${batch.id}_${target.id}`,
        language: "en",
        status: "ingested",
    }));

    const events = batch.targets.map((target) => ({
        event_type: `grointel_daily_${target.side}_ingestion`,
        event_title: `${target.name} entered GroIntel ${target.side} world`,
        event_summary: `${target.name} (${target.identity}) entered GroIntel as a Web3 ${target.side} entity for daily matching and future observation.`,
        event_date: batch.date,
        detected_at: now,
        source_url: target.identity,
        source_name: "GroIntel daily ingestion",
        confidence: Math.max(50, Math.min(92, target.priority)),
        importance: Math.max(50, Math.min(100, target.priority)),
        evidence_url: target.identity,
        evidence_title: target.ingestionReason,
        evidence_source_name: target.source,
        evidence_item_type: `daily_${target.side}_entity`,
        extraction_method: "grointel_daily_ingestion",
    }));

    const growthSignals = batch.targets.map((target) => ({
        signal_type: target.side === "demand" ? "web3_growth_demand_candidate" : "web3_growth_supply_candidate",
        signal_strength: target.priority,
        signal_reason: `${target.name} entered GroIntel daily Web3 ${target.side} pool with tags: ${target.tags.join(", ")}.`,
        inferred_growth_needs: target.side === "demand" ? target.tags : [],
        likely_buyers: target.side === "supply" ? target.tags : [],
        urgency: target.priority >= 85 ? "high" : target.priority >= 72 ? "medium" : "low",
        confidence: Math.max(50, Math.min(92, target.priority)),
    }));

    const rawResult = await db.from("world_raw_observations").insert(rawObservations);
    if (rawResult.error) throw rawResult.error;
    const eventResult = await db.from("world_events").insert(events);
    if (eventResult.error) throw eventResult.error;
    const signalResult = await db.from("world_growth_signals").insert(growthSignals);
    if (signalResult.error) throw signalResult.error;
    return true;
  } catch {
    return false;
  }
}

function entityMemoryPayload(target: DailyIngestionCandidate, now: string) {
  return {
    target_id: target.id,
    identity: target.identity,
    kind: target.kind,
    domain: target.domain,
    signal_count: 1,
    evidence_count: 1,
    confidence: Math.max(50, Math.min(92, target.priority)),
    profile: {
      name: target.name,
      side: target.side,
      source: target.source,
      tags: target.tags,
      ingestion_reason: target.ingestionReason,
      recent_signals: [
        {
          category: target.side === "demand" ? "web3_growth_demand_candidate" : "web3_growth_supply_candidate",
          summary: `${target.name} entered the GroIntel daily Web3 ${target.side} world.`,
          confidence: target.priority,
          source: "grointel_daily_ingestion",
          url: target.identity,
        },
      ],
      recent_evidence: [
        {
          connector: "grointel_daily_ingestion",
          summary: target.ingestionReason,
          confidence: target.priority,
          source: target.source,
          url: target.identity,
        },
      ],
    },
    first_observed_at: now,
    last_observed_at: now,
    updated_at: now,
  };
}

function legacyEventToGrowthEvent(event: Record<string, any>): Web3GrowthEvent {
  const title = String(event.event_title || "");
  const [project, partner] = title.includes(" x ") ? title.split(" x ", 2) : [title || "Unknown Web3 project", "Unknown partner"];
  const outcome = String(event.event_type || "").replace("web3_growth_", "") as Web3GrowthEvent["outcome"];

  return {
    id: String(event.id || event.event_title || event.source_url || `legacy_${Date.now()}`),
    project,
    projectIdentity: String(event.source_url || ""),
    partner,
    partnerIdentity: String(event.source_url || ""),
    partnerType: "kol",
    chainOrSector: "Web3",
    eventDate: String(event.event_date || event.detected_at || ""),
    outcome: ["success", "failure", "mixed", "risk"].includes(outcome) ? outcome : "mixed",
    growthGoal: "Legacy growth memory imported from world_events.",
    collaborationFormat: String(event.evidence_item_type || "growth_event"),
    observedResult: String(event.event_summary || ""),
    whyItWorkedOrFailed: [String(event.evidence_title || event.event_summary || "")].filter(Boolean),
    reusablePattern: String(event.evidence_title || event.event_summary || "Use as weak legacy evidence until primary memory is migrated."),
    risks: [],
    evidenceUrls: [String(event.source_url || event.evidence_url || "")].filter(Boolean),
  };
}

function growthEventKey(event: Record<string, any>) {
  return [
    event.project,
    event.partner,
    event.eventDate || event.event_date,
    event.outcome,
  ].map((item) => String(item || "").toLowerCase().trim()).join("|");
}

function mergeWithSeedGrowthEvents(events: Record<string, any>[]) {
  const merged: Record<string, any>[] = [];
  const seen = new Set<string>();
  for (const event of [...events, ...WEB3_GROWTH_EVENTS]) {
    const key = growthEventKey(event) || String(event.id || "");
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(event);
  }
  return merged;
}

function buildLegacyEntityMemories(recentObservations: Record<string, any>[], recentEvidence: Record<string, any>[]) {
  const groups = new Map<string, Record<string, any>>();
  for (const item of [...recentObservations, ...recentEvidence]) {
    const identity = String(item.target?.identity || item.url || item.entity || "unknown");
    const name = String(item.target?.name || item.entity || identity);
    const current = groups.get(identity) || {
      target_id: `legacy_${identity}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
      identity,
      kind: identity.includes("x.com") || identity.includes("youtube") ? "kol" : "company",
      domain: "legacy world memory",
      signal_count: 0,
      evidence_count: 0,
      confidence: 0,
      profile: {
        name,
        recent_evidence: [],
      },
      updated_at: item.observed_at,
    };
    current.evidence_count += item.evidence_summary || item.raw ? 1 : 0;
    current.signal_count += item.signal_count || 0;
    current.confidence = Math.max(current.confidence || 0, Number(item.confidence || 0));
    current.updated_at = item.observed_at || current.updated_at;
    current.profile.recent_evidence = [
      ...(current.profile.recent_evidence || []),
      {
        summary: item.evidence_summary || item.raw?.title || item.target?.name || name,
        source: item.source || item.connector || "legacy_world_memory",
        url: item.url || identity,
      },
    ].slice(0, 5);
    groups.set(identity, current);
  }
  return Array.from(groups.values()).slice(0, 12);
}

function buildLegacyDecisionMemories(recentSignals: Record<string, any>[], growthEvents: Record<string, any>[]) {
  const topSignals = recentSignals.slice(0, 5).map((signal) => signal.summary || signal.category).filter(Boolean);
  const successEvents = growthEvents.filter((event) => String(event.outcome || "").toLowerCase() === "success").slice(0, 5);
  return [
    {
      id: "legacy_decision_world_gap_and_priority_update",
      decision_type: "legacy_world_gap_and_priority_update",
      confidence: topSignals.length > 0 ? 68 : 52,
      reasoning: topSignals.length > 0
        ? "GroIntel projected decision memory from legacy growth signals and world events while primary decision memory tables are pending."
        : "GroIntel is using curated Web3 growth events as decision memory until primary tables are migrated.",
      gaps: topSignals.map((signal) => ({ description: signal })),
      priorities: successEvents.map((event) => ({ priority: `Reuse pattern: ${event.project} x ${event.partner}` })),
      created_at: new Date().toISOString(),
    },
  ];
}

function buildLegacyEvolutionMemories(recentObservations: Record<string, any>[], recentSignals: Record<string, any>[], growthEvents: Record<string, any>[]) {
  const coverage = Math.min(100, recentObservations.length * 10);
  const quality = Math.min(100, Math.max(40, recentSignals.length * 8));
  const outcomes = Math.min(100, growthEvents.length * 8);
  return [
    {
      id: "legacy_evolution_world_memory_projection",
      intelligence_index: Math.round((coverage + quality + outcomes) / 3),
      reality_coverage: coverage,
      knowledge_quality: quality,
      decision_accuracy: growthEvents.length > 0 ? 62 : 40,
      business_outcomes: outcomes,
      progress: {
        legacy_observations: recentObservations.length,
        legacy_signals: recentSignals.length,
        growth_events: growthEvents.length,
      },
      lesson: "Primary four-layer memory tables are pending; GroIntel is projecting L2/L3/L4 memory from legacy world tables so the living loop remains inspectable.",
      created_at: new Date().toISOString(),
    },
  ];
}

async function loadLegacyGrowthEvents(db: any, limit: number): Promise<Web3GrowthEvent[]> {
  const { data, error } = await db
    .from("world_events")
    .select("*")
    .like("event_type", "web3_growth_%")
    .order("event_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(legacyEventToGrowthEvent);
}

async function loadLegacyWorldMemorySummary(db: any, limit: number, primaryError: string): Promise<WorldMemorySummary> {
  const [observationResult, signalResult, eventResult, growthEventResult] = await Promise.all([
    db.from("world_raw_observations").select("*").order("observed_at", { ascending: false }).limit(limit),
    db.from("world_growth_signals").select("*").order("created_at", { ascending: false }).limit(limit),
    db.from("world_events").select("*").order("detected_at", { ascending: false }).limit(limit * 2),
    db.from("world_events").select("*").like("event_type", "web3_growth_%").order("event_date", { ascending: false }).limit(limit),
  ]);

  const error = observationResult.error || signalResult.error || eventResult.error || growthEventResult.error;
  if (error) throw error;

  const recentObservations = (observationResult.data || []).map((item: Record<string, any>) => ({
    id: item.id,
    target: { name: item.title || item.url, identity: item.url },
    observed_at: item.observed_at,
    signal_count: 0,
    evidence_count: 1,
    connectors_used: ["legacy_world_raw_observations"],
    raw: item,
  }));

  const recentSignals = (signalResult.data || []).map((item: Record<string, any>) => ({
    id: item.id,
    entity: item.signal_type || "legacy signal",
    type: item.signal_type,
    category: item.signal_type,
    summary: item.signal_reason,
    confidence: item.confidence || item.signal_strength || 0,
    source: "legacy_world_growth_signals",
    url: null,
    raw: item,
    observed_at: item.created_at,
  }));

  const recentEvidence = (eventResult.data || []).map((item: Record<string, any>) => ({
    id: item.id,
    entity: item.event_title,
    connector: "legacy_world_events",
    source: item.source_name,
    url: item.source_url || item.evidence_url,
    evidence_summary: item.event_summary,
    confidence: item.confidence || 0,
    raw: item,
    observed_at: item.detected_at || item.event_date,
  }));

  const growthEvents = mergeWithSeedGrowthEvents((growthEventResult.data || []).map(legacyEventToGrowthEvent));
  const entityMemories = buildLegacyEntityMemories(recentObservations, recentEvidence);
  const decisionMemories = buildLegacyDecisionMemories(recentSignals, growthEvents);
  const evolutionMemories = buildLegacyEvolutionMemories(recentObservations, recentSignals, growthEvents);

  return {
    configured: true,
    latestRun: recentObservations[0] ? { created_at: recentObservations[0].observed_at, source: "legacy_world_memory" } : null,
    recentObservations,
    recentSignals,
    recentEvidence,
    entityMemories,
    decisionMemories,
    evolutionMemories,
    growthEvents,
    error: `Reading legacy world memory because primary world memory is unavailable: ${primaryError}`,
  };
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

export async function saveDailyIngestionBatch(batch: DailyIngestionBatch): Promise<DailyIngestionSaveResult> {
  const supabase = getServerClient();
  const base = {
    batchId: batch.id,
    demand: batch.demand.length,
    supply: batch.supply.length,
    targetCount: batch.targets.length,
  };
  if (!supabase) {
    return { ...base, configured: false, saved: false, runId: null, error: "Supabase is not configured" };
  }
  const db = supabase as any;
  const now = new Date().toISOString();

  try {
    const { data: run, error: runError } = await db
      .from("world_heartbeat_runs")
      .insert({
        status: "alive",
        source: "daily_ingestion",
        tick_count: 0,
        target_count: batch.targets.length,
        observation_count: batch.targets.length,
        signal_count: batch.targets.length,
        evidence_count: batch.targets.length,
        intelligence_index: 70,
        snapshot: {
          batch_id: batch.id,
          date: batch.date,
          demand: batch.demand.length,
          supply: batch.supply.length,
        },
      })
      .select("id")
      .single();
    if (runError) throw runError;
    const runId = run?.id as string;

    const { error: targetError } = await db.from("world_targets").upsert(batch.targets.map((target) => ({
      id: target.id,
      name: target.name,
      identity: target.identity,
      kind: target.kind,
      domain: target.domain,
      metadata: target,
      last_observed_at: now,
      updated_at: now,
    })));
    if (targetError) throw targetError;

    const observations = batch.targets.map((target) => ({
      id: memoryId("daily_obs", now, target.id),
      run_id: runId,
      target_id: target.id,
      target,
      signal_count: 1,
      evidence_count: 1,
      connectors_used: ["grointel_daily_ingestion"],
      observed_at: now,
      raw: target,
    }));
    const { error: observationError } = await db.from("world_observations").upsert(observations);
    if (observationError) throw observationError;

    const { error: signalError } = await db.from("world_signals").upsert(batch.targets.map((target) => ({
      id: memoryId("daily_sig", now, target.id),
      run_id: runId,
      observation_id: memoryId("daily_obs", now, target.id),
      target_id: target.id,
      entity: target.identity,
      type: "daily_ingestion",
      category: target.side === "demand" ? "web3_growth_demand_candidate" : "web3_growth_supply_candidate",
      summary: `${target.name} entered GroIntel as a Web3 ${target.side} entity.`,
      confidence: Math.max(50, Math.min(92, target.priority)),
      source: "grointel_daily_ingestion",
      url: target.identity,
      raw: target,
      observed_at: now,
    })));
    if (signalError) throw signalError;

    const { error: evidenceError } = await db.from("world_evidence").upsert(batch.targets.map((target) => ({
      id: memoryId("daily_ev", now, target.id),
      run_id: runId,
      observation_id: memoryId("daily_obs", now, target.id),
      target_id: target.id,
      entity: target.identity,
      connector: "grointel_daily_ingestion",
      source: target.source,
      url: target.identity,
      evidence_summary: target.ingestionReason,
      confidence: Math.max(50, Math.min(92, target.priority)),
      raw: target,
      observed_at: now,
    })));
    if (evidenceError) throw evidenceError;

    const { error: entityError } = await db.from("world_entity_memories").upsert(batch.targets.map((target) => entityMemoryPayload(target, now)));
    if (entityError) throw entityError;

    const { error: decisionError } = await db.from("world_decision_memories").insert({
      run_id: runId,
      decision_type: "daily_web3_ingestion_update",
      confidence: 76,
      reasoning: `GroIntel ingested ${batch.demand.length} Web3 demand entities and ${batch.supply.length} Web3 supply entities for future matching.`,
      gaps: [],
      priorities: [
        { priority: "Observe high-priority newly ingested demand entities." },
        { priority: "Match high-priority newly ingested KOL/supply entities against company growth needs." },
      ],
    });
    if (decisionError) throw decisionError;

    const { error: evolutionError } = await db.from("world_evolution_memories").insert({
      run_id: runId,
      intelligence_index: 76,
      reality_coverage: 72,
      knowledge_quality: 68,
      decision_accuracy: 62,
      business_outcomes: 60,
      progress: {
        batch_id: batch.id,
        demand_ingested: batch.demand.length,
        supply_ingested: batch.supply.length,
      },
      lesson: "Daily ingestion expands GroIntel from bootstrap matching into a compounding Web3 world memory.",
    });
    if (evolutionError) throw evolutionError;

    return { ...base, configured: true, saved: true, runId, error: null };
  } catch (error: any) {
    const legacySaved = await saveLegacyDailyIngestion(db, batch);
    if (legacySaved) {
      return {
        ...base,
        configured: true,
        saved: true,
        runId: null,
        error: `Saved daily ingestion to legacy world tables because primary world memory is unavailable: ${error.message}`,
      };
    }
    return { ...base, configured: true, saved: false, runId: null, error: error.message || "Failed to save daily ingestion" };
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
    return { configured: true, events: mergeWithSeedGrowthEvents(data || []), error: null };
  } catch (error: any) {
    try {
      const legacyEvents = await loadLegacyGrowthEvents(db, limit);
      return {
        configured: true,
        events: mergeWithSeedGrowthEvents(legacyEvents),
        error: `Loaded legacy world_events because world_growth_events is unavailable: ${error.message || "Failed to load growth events"}`,
      };
    } catch (legacyError: any) {
      return { configured: true, events: WEB3_GROWTH_EVENTS, error: legacyError.message || error.message || "Failed to load growth events" };
    }
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
    try {
      return await loadLegacyWorldMemorySummary(db, limit, error.message || "Failed to load world memory");
    } catch (legacyError: any) {
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
        error: legacyError.message || error.message || "Failed to load world memory",
      };
    }
  }
}
