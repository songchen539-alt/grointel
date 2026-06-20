// OPERATION-1 — Worker Types
import { WorkerServiceBase } from "./worker_base";

export class RealityWorker extends WorkerServiceBase { constructor() { super("reality"); } }
export class KnowledgeWorker extends WorkerServiceBase { constructor() { super("knowledge"); } }
export class DecisionWorker extends WorkerServiceBase { constructor() { super("decision"); } }
export class LifeWorker extends WorkerServiceBase { constructor() { super("life"); } }
