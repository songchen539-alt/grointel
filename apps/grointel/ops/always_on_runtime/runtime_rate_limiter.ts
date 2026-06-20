// OPS-1 — Runtime Rate Limiter
import { RuntimeRateLimitPolicy } from "./always_on_types";

export class RuntimeRateLimiter {
  private minuteTimestamps: number[] = [];
  private companyDaily: Map<string, number> = new Map();
  private connectorHourly: Map<string, number> = new Map();

  constructor(private policy: RuntimeRateLimitPolicy = { per_minute: 10, per_company_per_day: 50, per_connector_per_hour: 30 }) {}

  canProceed(companyId: string, connectorId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();

    // Per-minute
    this.minuteTimestamps = this.minuteTimestamps.filter(t => now - t < 60000);
    if (this.minuteTimestamps.length >= this.policy.per_minute) return { allowed: false, reason: "Per-minute limit exceeded" };

    // Per company per day
    const companyCount = this.companyDaily.get(companyId) || 0;
    if (companyCount >= this.policy.per_company_per_day) return { allowed: false, reason: "Per-company daily limit exceeded" };

    // Per connector per hour
    const connectorKey = `${companyId}_${connectorId}`;
    this.connectorHourly.forEach((v, k) => {
      // Simplified: just track connector runs
    });
    const connectorCount = this.connectorHourly.get(connectorKey) || 0;
    if (connectorCount >= this.policy.per_connector_per_hour) return { allowed: false, reason: "Per-connector hourly limit exceeded" };

    return { allowed: true };
  }

  recordRun(companyId: string, connectorId: string): void {
    this.minuteTimestamps.push(Date.now());
    this.companyDaily.set(companyId, (this.companyDaily.get(companyId) || 0) + 1);
    const key = `${companyId}_${connectorId}`;
    this.connectorHourly.set(key, (this.connectorHourly.get(key) || 0) + 1);
  }

  resetDaily(): void { this.companyDaily.clear(); }
  reset(): void { this.minuteTimestamps = []; this.companyDaily.clear(); this.connectorHourly.clear(); }
}
