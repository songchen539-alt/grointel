// GroIntel KNOWLEDGE-2 — Observation Scheduler (trigger/simulate only)
import { ObservationBatch, ObservationJob, ObservationSignal } from "./reality_observation_types";
import { CompanyObserver } from "./company_observer";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";

export class ObservationScheduler {
  private counter = 0;
  private jobs: ObservationJob[] = [];

  trigger(flow: CompanyMemoryFlow, memoryId: string, companyWebsite: string, observer: CompanyObserver): { batch: ObservationBatch; job: ObservationJob } {
    const job: ObservationJob = {
      id: "job_" + (++this.counter).toString(16).padStart(6, "0"),
      company_memory_id: memoryId, status: "running",
      sources_used: observer.sources.getEnabled().map(s => s.id),
      signals_found: 0, started_at: new Date().toISOString(), completed_at: null,
    };
    this.jobs.push(job);

    const batch = observer.observe(memoryId, companyWebsite);
    job.status = "completed";
    job.signals_found = batch.signal_count;
    job.completed_at = new Date().toISOString();

    return { batch, job };
  }

  simulateObservation(flow: CompanyMemoryFlow, memoryId: string, signals: Record<string, string>): ObservationBatch {
    const mem = flow.store.get(memoryId);
    if (!mem) throw new Error("Memory not found");

    const batch: ObservationBatch = {
      batch_id: "sim_" + (++this.counter).toString(16).padStart(6, "0"),
      company_memory_id: memoryId,
      observations: [{
        id: "sim_obs_" + (++this.counter).toString(16).padStart(6, "0"),
        company_memory_id: memoryId, source: "simulation", timestamp: new Date().toISOString(),
        signals: Object.entries(signals).map(([type, val]) => ({
          type: type as any, label: type, value: val,
          strength: 70, confidence: 60, evidence: [`Simulated: ${type}=${val}`], source: "simulation",
        })),
        evidence: [], confidence: 60, status: "normalized",
      }],
      collected_at: new Date().toISOString(), source_count: 1, signal_count: Object.keys(signals).length,
    };
    return batch;
  }

  getJobs(): ObservationJob[] { return this.jobs; }
}
