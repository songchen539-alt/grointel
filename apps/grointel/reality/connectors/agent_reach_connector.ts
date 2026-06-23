// REALITY-2 - Agent Reach social/web source connector
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { BaseConnector } from "./base_connector";
import { ConnectorEvidence, ConnectorHealth, ConnectorResult, ConnectorSignal, SignalCategory } from "../reality_types";

const execFileAsync = promisify(execFile);

type AgentReachPlatform = {
  id: string;
  label: string;
  domains: string[];
  category: SignalCategory;
  confidence: number;
  routes: AgentReachRoute[];
};

type AgentReachRoute = {
  id: string;
  label: string;
  tier: "primary" | "fallback" | "last_resort";
  command: string;
  healthArgs: string[];
  queryArgs: (query: string) => string[];
  timeoutMs: number;
  needsLocalAuth: boolean;
  privacy: "local_cookie" | "no_cookie" | "local_service";
};

type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
};

type ResolvedCommand = {
  file: string;
  argsPrefix: string[];
};

type RouteDoctor = {
  id: string;
  label: string;
  tier: AgentReachRoute["tier"];
  state: "ok" | "needs_auth" | "unavailable";
  needsLocalAuth: boolean;
  privacy: AgentReachRoute["privacy"];
  detail: string;
};

type PlatformDoctor = {
  id: string;
  label: string;
  state: "ok" | "degraded" | "unavailable";
  activeRoute: string | null;
  routes: RouteDoctor[];
};

type PublicPlatform = Omit<AgentReachPlatform, "routes"> & {
  routeCount: number;
};

const exaRoute = (domains: string[]): AgentReachRoute => ({
  id: "exa-domain-search",
  label: `Exa semantic search (${domains.join(", ")})`,
  tier: "last_resort",
  command: "mcporter",
  healthArgs: ["list", "exa", "--schema"],
  queryArgs: (query) => ["call", "exa.web_search_exa", `query=${query}`, "numResults=1"],
  timeoutMs: 25000,
  needsLocalAuth: false,
  privacy: "no_cookie",
});

const PLATFORMS: AgentReachPlatform[] = [
  {
    id: "reddit",
    label: "Reddit",
    domains: ["reddit.com"],
    category: "community",
    confidence: 68,
    routes: [
      { id: "opencli-reddit", label: "OpenCLI browser session", tier: "primary", command: "opencli", healthArgs: ["doctor"], queryArgs: (query) => ["reddit", "search", query, "-f", "yaml"], timeoutMs: 12000, needsLocalAuth: true, privacy: "local_cookie" },
      { id: "rdt-cli", label: "rdt-cli local cookie session", tier: "fallback", command: "rdt", healthArgs: ["status", "--json"], queryArgs: (query) => ["search", query], timeoutMs: 12000, needsLocalAuth: true, privacy: "local_cookie" },
      exaRoute(["reddit.com"]),
    ],
  },
  {
    id: "twitter",
    label: "Twitter/X",
    domains: ["x.com", "twitter.com"],
    category: "community",
    confidence: 64,
    routes: [
      { id: "twitter-cli", label: "twitter-cli local browser cookies", tier: "primary", command: "twitter", healthArgs: ["status"], queryArgs: (query) => ["search", query, "-n", "3"], timeoutMs: 12000, needsLocalAuth: true, privacy: "local_cookie" },
      { id: "opencli-twitter", label: "OpenCLI browser session", tier: "fallback", command: "opencli", healthArgs: ["doctor"], queryArgs: (query) => ["twitter", "search", query, "-f", "yaml"], timeoutMs: 12000, needsLocalAuth: true, privacy: "local_cookie" },
      exaRoute(["x.com", "twitter.com"]),
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    domains: ["youtube.com"],
    category: "customer",
    confidence: 66,
    routes: [
      { id: "yt-dlp-search", label: "yt-dlp public metadata", tier: "primary", command: "yt-dlp", healthArgs: ["--version"], queryArgs: (query) => [`ytsearch3:${query}`, "--dump-single-json", "--skip-download"], timeoutMs: 18000, needsLocalAuth: false, privacy: "no_cookie" },
      exaRoute(["youtube.com"]),
    ],
  },
  {
    id: "bilibili",
    label: "Bilibili",
    domains: ["bilibili.com"],
    category: "community",
    confidence: 62,
    routes: [
      { id: "bili-cli", label: "bili-cli public search", tier: "primary", command: "bili", healthArgs: ["--help"], queryArgs: (query) => ["search", query], timeoutMs: 12000, needsLocalAuth: false, privacy: "no_cookie" },
      { id: "opencli-bilibili", label: "OpenCLI subtitles/session", tier: "fallback", command: "opencli", healthArgs: ["doctor"], queryArgs: (query) => ["bilibili", "search", query, "-f", "yaml"], timeoutMs: 12000, needsLocalAuth: true, privacy: "local_cookie" },
      exaRoute(["bilibili.com"]),
    ],
  },
  {
    id: "xiaohongshu",
    label: "XiaoHongShu",
    domains: ["xiaohongshu.com"],
    category: "customer",
    confidence: 58,
    routes: [
      { id: "opencli-xiaohongshu", label: "OpenCLI browser session", tier: "primary", command: "opencli", healthArgs: ["doctor"], queryArgs: (query) => ["xiaohongshu", "search", query, "-f", "yaml"], timeoutMs: 12000, needsLocalAuth: true, privacy: "local_cookie" },
      { id: "xiaohongshu-mcp", label: "Local xiaohongshu MCP service", tier: "fallback", command: "mcporter", healthArgs: ["list", "xiaohongshu", "--schema"], queryArgs: (query) => ["call", "xiaohongshu.search_feeds", `keyword=${query}`], timeoutMs: 25000, needsLocalAuth: true, privacy: "local_service" },
      exaRoute(["xiaohongshu.com"]),
    ],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    domains: ["linkedin.com"],
    category: "hiring",
    confidence: 60,
    routes: [
      { id: "linkedin-mcp", label: "Local LinkedIn MCP session", tier: "primary", command: "mcporter", healthArgs: ["list", "linkedin", "--schema"], queryArgs: (query) => ["call", "linkedin.search_people", `keyword=${query}`, "limit=3"], timeoutMs: 25000, needsLocalAuth: true, privacy: "local_service" },
      exaRoute(["linkedin.com"]),
    ],
  },
  {
    id: "github",
    label: "GitHub",
    domains: ["github.com"],
    category: "engineering",
    confidence: 70,
    routes: [
      { id: "gh-search", label: "GitHub CLI public search", tier: "primary", command: "gh", healthArgs: ["--version"], queryArgs: (query) => ["search", "repos", query, "--limit", "3"], timeoutMs: 12000, needsLocalAuth: false, privacy: "no_cookie" },
      exaRoute(["github.com"]),
    ],
  },
];

function commandPathEnv(): string {
  const additions = [
    process.env.AGENT_REACH_BIN,
    `${process.env.USERPROFILE || ""}\\.agent-reach-venv\\Scripts`,
    `${process.env.USERPROFILE || ""}\\.agent-reach\\bin`,
    `${process.env.APPDATA || ""}\\npm`,
  ].filter(Boolean);

  return [...additions, process.env.PATH || ""].join(process.platform === "win32" ? ";" : ":");
}

function resolveCommand(command: string): ResolvedCommand {
  if (command === "mcporter" && process.env.APPDATA) {
    const cli = path.join(process.env.APPDATA, "npm", "node_modules", "mcporter", "dist", "cli.js");
    if (existsSync(cli)) return { file: process.execPath, argsPrefix: [cli] };
  }
  if (command === "opencli" && process.env.APPDATA) {
    const cli = path.join(process.env.APPDATA, "npm", "node_modules", "@jackwener", "opencli", "dist", "src", "main.js");
    if (existsSync(cli)) return { file: process.execPath, argsPrefix: [cli] };
  }

  const separator = process.platform === "win32" ? ";" : ":";
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  const paths = commandPathEnv().split(separator).filter(Boolean);

  for (const directory of paths) {
    for (const extension of extensions) {
      const candidate = path.join(directory, command.endsWith(extension) ? command : `${command}${extension}`);
      if (existsSync(candidate)) return { file: candidate, argsPrefix: [] };
    }
  }

  return { file: command, argsPrefix: [] };
}

function trimOutput(value: string, maxLength = 1200): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function resultUrl(output: string, platform: AgentReachPlatform): string {
  const match = output.match(/URL:\s*(https?:\/\/\S+)/i) || output.match(/https?:\/\/\S+/i);
  if (match?.[1]) return match[1].replace(/[),.]+$/, "");
  if (match?.[0]) return match[0].replace(/[),.]+$/, "");
  return `https://${platform.domains[0]}/search?q=grointel`;
}

export class AgentReachConnector extends BaseConnector {
  private lastProbe: { ready: boolean; checkedAt: string | null; channels: string[]; error: string | null; platforms: PlatformDoctor[] } = {
    ready: false,
    checkedAt: null,
    channels: [],
    error: null,
    platforms: [],
  };

  get id(): string { return "connector.agent_reach"; }
  get name(): string { return "Agent Reach Social Source Mesh"; }
  get type(): string { return "agent-reach"; }

  get platforms(): AgentReachPlatform[] {
    return PLATFORMS;
  }

  async discover(entity: string): Promise<string[]> {
    const normalized = entity.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return PLATFORMS.map((platform) => {
      const domainQuery = platform.domains.map((domain) => `site:${domain}`).join(" OR ");
      return `${normalized} ${domainQuery} growth signals customer discussion hiring product launch`;
    });
  }

  async fetch(query: string): Promise<{ query: string; output: string; ok: boolean }> {
    const route = exaRoute(["web"]);
    const result = await this.runCommand(route.command, route.queryArgs(query), route.timeoutMs);

    return { query, output: result.stdout || result.stderr, ok: result.ok };
  }

  normalize(raw: { query: string; output: string; ok: boolean; platform: AgentReachPlatform }): {
    query: string;
    output: string;
    platform: AgentReachPlatform;
    url: string;
    summary: string;
  } {
    return {
      query: raw.query,
      output: raw.output,
      platform: raw.platform,
      url: resultUrl(raw.output, raw.platform),
      summary: trimOutput(raw.output, 1000),
    };
  }

  extractSignals(data: ReturnType<AgentReachConnector["normalize"]>, entity: string): ConnectorSignal[] {
    if (!data.summary) return [];
    const evidence = this.extractEvidence(data, data.url, entity);
    return [
      this.makeSignal(
        entity,
        `agent_reach_${data.platform.id}`,
        data.platform.category,
        `${data.platform.label} surface for ${entity}: ${data.summary}`,
        data.platform.confidence,
        data.platform.id,
        data.url,
        evidence,
      ),
    ];
  }

  extractEvidence(data: ReturnType<AgentReachConnector["normalize"]>, url: string, entity: string): ConnectorEvidence[] {
    if (!data.summary) return [];
    return [
      this.makeEvidence(
        data.platform.id,
        url,
        this.id,
        `${data.platform.label} evidence via Agent Reach: ${data.summary}`,
        data.platform.confidence,
        entity,
      ),
    ];
  }

  estimateConfidence(raw: { ok: boolean; output: string; platform: AgentReachPlatform }): number {
    if (!raw.ok || !raw.output.trim()) return 0;
    return raw.platform.confidence;
  }

  async run(entity: string): Promise<ConnectorResult> {
    const start = Date.now();
    const queries = await this.discover(entity);
    const allSignals: ConnectorSignal[] = [];
    const allEvidence: ConnectorEvidence[] = [];

    try {
      await this.probe();

      const rawResults = await Promise.all(PLATFORMS.map((platform, index) => {
        return this.fetchPlatform(platform, queries[index]).then((raw) => ({ platform, raw }));
      }));

      for (const { platform, raw } of rawResults) {
        if (!raw.ok || !raw.output.trim()) continue;

        const data = this.normalize({ ...raw, platform });
        const evidence = this.extractEvidence(data, data.url, entity);
        const signals = evidence.length > 0
          ? [this.makeSignal(
              entity,
              `agent_reach_${platform.id}`,
              platform.category,
              `${platform.label} surface for ${entity}: ${data.summary}`,
              platform.confidence,
              platform.id,
              data.url,
              evidence,
            )]
          : [];

        allEvidence.push(...evidence);
        allSignals.push(...signals);
      }

      this.totalSigs += allSignals.length;
      this.recordSuccess(Date.now() - start);
      return { signals: allSignals, evidence: allEvidence, health: this.health() };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.recordError(message);
      return { signals: allSignals, evidence: allEvidence, health: this.health() };
    }
  }

  override health(): ConnectorHealth {
    const base = super.health();
    if (this.lastProbe.ready) {
      return { ...base, state: base.state === "error" ? "degraded" : base.state, last_error: this.lastError };
    }
    return {
      ...base,
      state: this.lastProbe.checkedAt ? "degraded" : base.state,
      last_error: this.lastProbe.error || this.lastError,
    };
  }

  async status(): Promise<{
    ready: boolean;
    checkedAt: string | null;
    channels: string[];
    platforms: PublicPlatform[];
    doctor: PlatformDoctor[];
    error: string | null;
  }> {
    await this.probe();
    const platforms = PLATFORMS.map(({ routes, ...platform }) => ({ ...platform, routeCount: routes.length }));
    return { ...this.lastProbe, platforms, doctor: this.lastProbe.platforms };
  }

  private async probe(): Promise<void> {
    const result = await this.runCommand("agent-reach", ["doctor"], 80000);
    const output = result.stdout || result.stderr;
    const platformDoctors = await Promise.all(PLATFORMS.map((platform) => this.doctorPlatform(platform)));
    this.lastProbe = {
      ready: result.ok && output.includes("Agent Reach"),
      checkedAt: new Date().toISOString(),
      channels: platformDoctors.filter((platform) => platform.state !== "unavailable").map((platform) => platform.id),
      error: result.ok ? null : trimOutput(output, 500) || "agent-reach doctor failed",
      platforms: platformDoctors,
    };
  }

  private async fetchPlatform(platform: AgentReachPlatform, query: string): Promise<{ query: string; output: string; ok: boolean; routeId: string | null }> {
    for (const route of platform.routes) {
      const result = await this.runCommand(route.command, route.queryArgs(query), route.timeoutMs);
      const output = result.stdout || result.stderr;
      if (result.ok && output.trim()) return { query, output, ok: true, routeId: route.id };
    }

    return { query, output: "", ok: false, routeId: null };
  }

  private async doctorPlatform(platform: AgentReachPlatform): Promise<PlatformDoctor> {
    const routes = await Promise.all(platform.routes.map((route) => this.doctorRoute(route)));
    const active = routes.find((route) => route.state === "ok") || null;
    const authBlocked = routes.some((route) => route.state === "needs_auth");

    return {
      id: platform.id,
      label: platform.label,
      state: active ? "ok" : authBlocked ? "degraded" : "unavailable",
      activeRoute: active?.id || null,
      routes,
    };
  }

  private async doctorRoute(route: AgentReachRoute): Promise<RouteDoctor> {
    const result = await this.runCommand(route.command, route.healthArgs, Math.min(route.timeoutMs, 12000));
    const output = trimOutput(result.stdout || result.stderr, 600);
    const lower = output.toLowerCase();
    const needsAuth = route.needsLocalAuth && (
      lower.includes("not_authenticated") ||
      lower.includes("no credential") ||
      lower.includes("cookie") ||
      lower.includes("extension") ||
      lower.includes("login") ||
      lower.includes("connection closed")
    );
    const unavailable = (
      lower.includes("unknown mcp server") ||
      lower.includes("tools unavailable") ||
      lower.includes("command unavailable") ||
      lower.includes("spawn einval") ||
      lower.includes("not recognized")
    );

    return {
      id: route.id,
      label: route.label,
      tier: route.tier,
      state: needsAuth ? "needs_auth" : result.ok && !unavailable ? "ok" : "unavailable",
      needsLocalAuth: route.needsLocalAuth,
      privacy: route.privacy,
      detail: output || (result.ok ? "ok" : "command unavailable"),
    };
  }

  private async runCommand(command: string, args: string[], timeout: number): Promise<CommandResult> {
    try {
      const resolved = resolveCommand(command);
      const result = await execFileAsync(resolved.file, [...resolved.argsPrefix, ...args], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: commandPathEnv(),
          PYTHONUTF8: "1",
        },
        timeout,
        windowsHide: true,
        maxBuffer: 1024 * 1024,
      });

      return { ok: true, stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      const maybeError = error as { stdout?: string; stderr?: string; message?: string };
      const stderr = [maybeError.stderr, maybeError.stdout, maybeError.message].filter(Boolean).join("\n");
      return {
        ok: false,
        stdout: maybeError.stdout || "",
        stderr,
      };
    }
  }
}
