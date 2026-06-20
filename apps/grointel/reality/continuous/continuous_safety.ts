// REALITY-3 — Continuous Safety Guard
export class ContinuousSafetyGuard {
  private consecutiveErrors = 0;
  private lastErrorAt: string | null = null;

  check(errorsSinceLastCheck: number, queuePressure: number, recentJobs: number): { allowed: boolean; reason: string } {
    if (errorsSinceLastCheck > 10) {
      this.consecutiveErrors++;
      if (this.consecutiveErrors >= 3) {
        return { allowed: false, reason: `Too many errors (${this.consecutiveErrors} consecutive)` };
      }
    } else {
      this.consecutiveErrors = 0;
    }

    if (queuePressure > 100) {
      return { allowed: false, reason: `Queue pressure too high: ${queuePressure}` };
    }

    return { allowed: true, reason: "Safety check passed" };
  }

  recordError(): void { this.consecutiveErrors++; this.lastErrorAt = new Date().toISOString(); }
  getState(): { consecutiveErrors: number; lastErrorAt: string | null } {
    return { consecutiveErrors: this.consecutiveErrors, lastErrorAt: this.lastErrorAt };
  }
}
