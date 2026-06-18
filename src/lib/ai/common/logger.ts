// GroIntel AI Core - Logger
// Lightweight structured logger for AI pipeline observability.

export type LogLevel = "debug" | "info" | "warn" | "error";

export class AILogger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry = `[AI:${this.module}] ${level.toUpperCase()}: ${message}`;
    if (data) {
      console.log(entry, JSON.stringify(data));
    } else {
      console.log(entry);
    }
  }
}
