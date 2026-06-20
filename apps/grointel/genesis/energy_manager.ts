// GENESIS-1 — Energy Manager
import { EnergyBudget } from "./genesis_types";

export class EnergyManager {
  private remaining = 100;
  private total = 100;

  consume(amount: number): boolean {
    if (this.remaining < amount) return false;
    this.remaining -= amount;
    return true;
  }

  restore(amount: number): void { this.remaining = Math.min(this.total, this.remaining + amount); }
  getBudget(): EnergyBudget {
    const utilization = Math.round((1 - this.remaining / this.total) * 100);
    const pressure = utilization > 80 ? "critical" : utilization > 60 ? "high" : utilization > 40 ? "medium" : "low";
    return { remaining: this.remaining, total: this.total, utilization, pressure };
  }
  isLow(): boolean { return this.remaining < 20; }
  reset(): void { this.remaining = this.total; }
}
