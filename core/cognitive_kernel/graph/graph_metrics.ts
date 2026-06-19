// GroIntel Cognitive Kernel — Graph Metrics
import { GraphEngine } from "./graph_engine";
import { GraphMetrics } from "./graph_types";

export class GraphMetricsCollector {
  private history: GraphMetrics[] = [];
  private maxHistory = 1000;

  collect(engine: GraphEngine): GraphMetrics {
    const metrics = engine.getMetrics();
    this.history.push(metrics);
    if (this.history.length > this.maxHistory) this.history.shift();
    return metrics;
  }

  getLatest(): GraphMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  getHistory(limit?: number): GraphMetrics[] {
    if (limit) return this.history.slice(-limit);
    return [...this.history];
  }
}
