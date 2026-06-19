// GroIntel Reality World — Reality Scheduler
import { RealityStream } from "../reality_stream/reality_stream";
import { RealityRouter } from "../event_router/reality_router";
import { WorldStateManager } from "../world_state/world_state";
import { DomainRegistry } from "../reality_domains/domain_registry";
import { DomainMemoryStore } from "../reality_domains/domain_memory";
import { DomainGraph } from "../reality_domains/domain_graph";
import { WorldEvent, DomainName } from "../reality_stream/world_types";

export class RealityScheduler {
  private stream: RealityStream;
  private router: RealityRouter;
  private worldState: WorldStateManager;
  private domainRegistry: DomainRegistry;
  private domainMemories: Map<DomainName, DomainMemoryStore> = new Map();
  private domainGraphs: Map<DomainName, DomainGraph> = new Map();
  private kernelCallback: ((event: WorldEvent) => void) | null = null;
  private cycleCount: number = 0;
  private running: boolean = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.stream = new RealityStream();
    this.router = new RealityRouter();
    this.worldState = new WorldStateManager();
    this.domainRegistry = new DomainRegistry();
  }

  start(intervalMs = 1000): void {
    if (this.running) return;
    this.running = true;

    // Subscribe to stream
    this.stream.subscribe("scheduler", (event) => {
      this.processEvent(event);
    });

    // Run continuous cycle
    this.intervalId = setInterval(() => this.cycle(), intervalMs);
  }

  stop(): void {
    this.running = false;
    this.stream.unsubscribe("scheduler");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private processEvent(event: WorldEvent): void {
    // 1. Route to domains
    const domains = this.router.routeEvent(event);

    // 2. Store in domain memories
    for (const domain of domains) {
      if (!this.domainMemories.has(domain)) {
        this.domainMemories.set(domain, new DomainMemoryStore());
        this.domainGraphs.set(domain, new DomainGraph());
      }
      this.domainMemories.get(domain)!.addEvent(domain, event);
      this.domainGraphs.get(domain)!.addNode(event.id, event.event_type);

      // Link entities
      for (const entity of event.entities) {
        this.domainGraphs.get(domain)!.addEdge(event.id, entity);
      }

      // 3. Update domain registry
      this.domainRegistry.updateDomain(domain, {
        confidence: event.confidence,
        velocity: event.importance,
      });

      // 4. Update world state
      this.worldState.recordEvent(domain, event.importance, event.confidence);
    }

    // 5. Notify kernel
    if (this.kernelCallback) {
      this.kernelCallback(event);
    }
  }

  private cycle(): void {
    this.cycleCount++;
    // Periodic maintenance
    if (this.cycleCount % 10 === 0) {
      this.worldState.snapshot();
    }
  }

  onKernelEvent(callback: (event: WorldEvent) => void): void {
    this.kernelCallback = callback;
  }

  publishEvent(
    domain: DomainName,
    eventType: string,
    payload: Record<string, unknown>,
    importance = 50, confidence = 70,
    entities: string[] = [],
  ): WorldEvent {
    return this.stream.publish(domain, eventType, payload, "web_scan", importance, confidence, [], entities);
  }

  getStream(): RealityStream { return this.stream; }
  getRouter(): RealityRouter { return this.router; }
  getWorldState(): WorldStateManager { return this.worldState; }
  getDomainRegistry(): DomainRegistry { return this.domainRegistry; }

  getDomainMemory(domain: DomainName): DomainMemoryStore | null {
    return this.domainMemories.get(domain) || null;
  }

  getDomainGraph(domain: DomainName): DomainGraph | null {
    return this.domainGraphs.get(domain) || null;
  }

  getCycleCount(): number { return this.cycleCount; }
}
