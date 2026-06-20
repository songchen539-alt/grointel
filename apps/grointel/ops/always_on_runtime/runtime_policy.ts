// OPS-1 — Runtime Policy & Backoff
import { RuntimePolicy, SAFE_POLICY } from "./always_on_types";

export class RuntimePolicyManager {
  private policy: RuntimePolicy = { ...SAFE_POLICY };

  get(): RuntimePolicy { return this.policy; }
  set(p: Partial<RuntimePolicy>): void { this.policy = { ...this.policy, ...p }; }
  reset(): void { this.policy = { ...SAFE_POLICY }; }
  isConnectorAllowed(cap: string): boolean { return !this.policy.disabledConnectors.includes(cap as any) && this.policy.allowedConnectors.includes(cap as any); }
  isNetworkAllowed(): boolean { return this.policy.allowNetworkFetch; }
}

export class RuntimeBackoff {
  private attempts: Map<string, number> = new Map();
  private readonly baseMs: number; private readonly maxMs: number;

  constructor(baseMs = 1000, maxMs = 60000) { this.baseMs = baseMs; this.maxMs = maxMs; }

  record(key: string): void { this.attempts.set(key, (this.attempts.get(key) || 0) + 1); }
  reset(key: string): void { this.attempts.delete(key); }
  getDelay(key: string): number {
    const attempt = this.attempts.get(key) || 0;
    const delay = Math.min(this.baseMs * Math.pow(2, attempt), this.maxMs);
    return delay;
  }
  getAttempt(key: string): number { return this.attempts.get(key) || 0; }
}
