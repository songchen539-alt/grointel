// GroIntel AI Gateway - Cache

export class GatewayCache {
  private store = new Map<string, { value: unknown; expiresAt: number }>();
  private defaultTTL: number = 60_000;

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return undefined; }
    return entry.value as T;
  }

  set(key: string, value: unknown, ttlMs?: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + (ttlMs ?? this.defaultTTL) });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number { return this.store.size; }
}
