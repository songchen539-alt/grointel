// GroIntel ROS-2 — Capability Registry
import { CapabilityDefinition, PermissionLevel } from "./sdk_types";
import { SDKErrors } from "./sdk_errors";

export class CapabilityRegistry {
  private caps: Map<string, CapabilityDefinition> = new Map();

  constructor() { this.initDefaults(); }

  private initDefaults(): void {
    const now = new Date().toISOString();
    const LOW: PermissionLevel = "read";
    const defs: CapabilityDefinition[] = [
      { id: "reality.observe", name: "Observe Reality", description: "Observe reality events", layer: "reality", input_schema: {}, output_schema: {}, required_permissions: "write", risk_level: "low", available: true, version: 1 },
      { id: "reality.attend", name: "Attend to Reality", description: "Score and filter events", layer: "reality", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "low", available: true, version: 1 },
      { id: "cognition.cognize", name: "Cognize", description: "Run cognitive kernel", layer: "cognition", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "low", available: true, version: 1 },
      { id: "cognition.graph.query", name: "Query Graph", description: "Query the reality graph", layer: "cognition", input_schema: {}, output_schema: {}, required_permissions: LOW, risk_level: "low", available: true, version: 1 },
      { id: "cognition.memory.read", name: "Read Memory", description: "Read kernel memory", layer: "cognition", input_schema: {}, output_schema: {}, required_permissions: LOW, risk_level: "low", available: true, version: 1 },
      { id: "intelligence.simulate", name: "Simulate", description: "Run simulation engine", layer: "intelligence", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "medium", available: true, version: 1 },
      { id: "intelligence.plan", name: "Plan", description: "Run planning engine", layer: "intelligence", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "medium", available: true, version: 1 },
      { id: "intelligence.strategize", name: "Strategize", description: "Run strategy engine", layer: "intelligence", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "medium", available: true, version: 1 },
      { id: "intelligence.discover", name: "Discover", description: "Run discovery engine", layer: "intelligence", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "low", available: true, version: 1 },
      { id: "intelligence.optimize", name: "Optimize", description: "Run optimization engine", layer: "intelligence", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "medium", available: true, version: 1 },
      { id: "intelligence.decide", name: "Decide", description: "Run decision engine", layer: "intelligence", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "high", available: true, version: 1 },
      { id: "workflow.start", name: "Start Workflow", description: "Start a workflow instance", layer: "workflow", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "medium", available: true, version: 1 },
      { id: "workflow.approve", name: "Approve Workflow", description: "Approve a workflow approval request", layer: "workflow", input_schema: {}, output_schema: {}, required_permissions: "approve", risk_level: "high", available: true, version: 1 },
      { id: "workflow.reject", name: "Reject Workflow", description: "Reject a workflow approval request", layer: "workflow", input_schema: {}, output_schema: {}, required_permissions: "approve", risk_level: "high", available: true, version: 1 },
      { id: "state.world.read", name: "Read World State", description: "Read current world state", layer: "state", input_schema: {}, output_schema: {}, required_permissions: LOW, risk_level: "low", available: true, version: 1 },
      { id: "state.kernel.read", name: "Read Kernel State", description: "Read current kernel state", layer: "state", input_schema: {}, output_schema: {}, required_permissions: LOW, risk_level: "low", available: true, version: 1 },
      { id: "graph.snapshot.read", name: "Read Graph Snapshot", description: "Read current graph snapshot", layer: "graph", input_schema: {}, output_schema: {}, required_permissions: LOW, risk_level: "low", available: true, version: 1 },
      { id: "knowledge.query", name: "Query Knowledge", description: "Query the knowledge runtime", layer: "knowledge", input_schema: {}, output_schema: {}, required_permissions: LOW, risk_level: "low", available: true, version: 1 },
      { id: "knowledge.validate", name: "Validate Knowledge", description: "Validate a knowledge fact", layer: "knowledge", input_schema: {}, output_schema: {}, required_permissions: "execute", risk_level: "medium", available: true, version: 1 },
    ];
    for (const d of defs) this.caps.set(d.id, d);
  }

  register(def: CapabilityDefinition): void {
    if (this.caps.has(def.id)) throw new Error(`Capability '${def.id}' already registered`);
    this.caps.set(def.id, def);
  }

  get(id: string): CapabilityDefinition | null { return this.caps.get(id) || null; }
  getAll(): CapabilityDefinition[] { return Array.from(this.caps.values()); }
  exists(id: string): boolean { return this.caps.has(id); }
  isAvailable(id: string): boolean { return this.caps.get(id)?.available || false; }
  remove(id: string): void { this.caps.delete(id); }
  count(): number { return this.caps.size; }
}
