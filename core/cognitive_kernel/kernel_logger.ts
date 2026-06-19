// GroIntel Cognitive Kernel — Logger
export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
}

export class KernelLogger {
  private entries: LogEntry[] = [];
  private maxEntries: number;
  private errorCount: number = 0;

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;
  }

  private log(level: LogLevel, module: string, message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    if (level === "error" || level === "critical") {
      this.errorCount++;
    }
    if (level === "error") console.error(`[${module}] ${message}`, data || "");
    else if (level === "warn") console.warn(`[${module}] ${message}`, data || "");
    else if (level === "critical") console.error(`[CRITICAL][${module}] ${message}`, data || "");
  }

  debug(module: string, message: string, data?: unknown): void {
    this.log("debug", module, message, data);
  }

  info(module: string, message: string, data?: unknown): void {
    this.log("info", module, message, data);
  }

  warn(module: string, message: string, data?: unknown): void {
    this.log("warn", module, message, data);
  }

  error(module: string, message: string, data?: unknown): void {
    this.log("error", module, message, data);
  }

  critical(module: string, message: string, data?: unknown): void {
    this.log("critical", module, message, data);
  }

  getEntries(level?: LogLevel, module?: string, limit?: number): LogEntry[] {
    let filtered = this.entries;
    if (level) filtered = filtered.filter(e => e.level === level);
    if (module) filtered = filtered.filter(e => e.module === module);
    if (limit) filtered = filtered.slice(-limit);
    return filtered;
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  getTotalEntries(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
    this.errorCount = 0;
  }
}
