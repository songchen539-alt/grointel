// GroIntel AWAKENING-1 — Real Website Connector (production default)
// Actual HTTPS fetching, HTML parsing, signal extraction, evidence generation
import * as https from "node:https";
import * as http from "node:http";
import { ConnectorSignal, ConnectorEvidence, ConnectorHealth, ConnectorMetrics, ConnectorResult, SignalCategory } from "../reality_types";

export class RealWebsiteConnector {
  public totalFetches = 0; public totalErrors = 0; public totalSignals = 0;
  public lastSuccess: string | null = null; public lastError: string | null = null;
  public latencies: number[] = [];

  get id(): string { return "connector.website.real"; }
  get name(): string { return "Real Website Connector"; }
  get type(): string { return "website"; }

  async discover(entity: string): Promise<string[]> {
    const domain = entity.replace(/^https?:\/\//, "").split("/")[0].split("?")[0];
    const urls = [`https://${domain}`, `https://${domain}/`];
    for (const p of ["/blog","/about","/pricing","/careers","/jobs","/docs","/changelog","/product","/features","/news","/contact"]) {
      urls.push(`https://${domain}${p}`);
    }
    return [...new Set(urls)];
  }

  async fetch(targetUrl: string, maxRetries = 2): Promise<{ url: string; status: number; headers: Record<string, string>; body: string; fetchTimeMs: number; etag: string | null; lastModified: string | null }> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt));
      const start = Date.now();
      try {
        const parsed = new URL(targetUrl);
        const fetcher = parsed.protocol === "https:" ? https : http;
        const result = await new Promise<any>((resolve, reject) => {
          const req = fetcher.request(targetUrl, {
            method: "GET",
            headers: { "User-Agent": "GroIntel/1.0 (Reality Intelligence)", "Accept": "text/html,*/*", "Accept-Encoding": "gzip, deflate" },
            timeout: 10000, rejectUnauthorized: false,
          }, (res) => {
            const chunks: Buffer[] = [];
            const headers: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.headers)) if (v) headers[k] = Array.isArray(v) ? v.join(",") : v;
            res.on("data", (c: Buffer) => chunks.push(c));
            res.on("end", () => {
              const body = Buffer.concat(chunks).toString("utf-8");
              if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve({ url: res.headers.location as string, status: res.statusCode, headers, body: "", fetchTimeMs: Date.now() - start, etag: null, lastModified: null }); return;
              }
              resolve({ url: targetUrl, status: res.statusCode || 0, headers, body, fetchTimeMs: Date.now() - start, etag: headers["etag"] || null, lastModified: headers["last-modified"] || null });
            });
          });
          req.on("error", reject); req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); }); req.end();
        });
        this.totalFetches++; this.latencies.push(result.fetchTimeMs); if (this.latencies.length > 100) this.latencies.shift(); this.lastSuccess = new Date().toISOString();
        return result;
      } catch (e: any) { this.totalErrors++; this.lastError = e.message; if (attempt === maxRetries) throw e; }
    }
    throw new Error("Fetch failed after retries");
  }

  extractSignals(page: { url: string; status: number; body: string }, entity: string): ConnectorSignal[] {
    const signals: ConnectorSignal[] = [];
    const body = page.body;
    const evidence: ConnectorEvidence[] = [{ id:"ev_"+Math.random().toString(36).slice(2,10), source:"website", url:page.url, connector:this.id, evidence_summary:`HTTP ${page.status}, ${body.length} bytes`, confidence:80, entity, observed_at:new Date().toISOString() }];

    // Title
    const t = body.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"website_title", category:"documentation" as SignalCategory, entity, summary:`Title: ${t[1].trim().substring(0,200)}`, confidence:85, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });

    // Description
    const d = body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || body.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (d) signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"website_description", category:"documentation" as SignalCategory, entity, summary:`Description: ${d[1].trim().substring(0,200)}`, confidence:75, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });

    // OpenGraph
    const og = body.match(/<meta[^>]*property=["']og:(\w+)["'][^>]*content=["']([^"']+)["']/g);
    if (og) signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"opengraph_data", category:"documentation" as SignalCategory, entity, summary:`${og.length} OpenGraph tags`, confidence:80, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });

    // JSON-LD
    const jl = body.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/g);
    if (jl) signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"structured_data", category:"documentation" as SignalCategory, entity, summary:`${jl.length} JSON-LD blocks`, confidence:85, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });

    // Hiring signals
    if (body.toLowerCase().includes("/careers") || body.toLowerCase().includes("/jobs") || body.toLowerCase().includes("hiring") || body.toLowerCase().includes("we're hiring")) {
      signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"hiring_signal", category:"hiring" as SignalCategory, entity, summary:"Hiring or careers page detected", confidence:70, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });
    }

    // Pricing
    if (body.toLowerCase().includes("/pricing") || body.toLowerCase().includes("class=\"pricing") || body.toLowerCase().includes("id=\"pricing") || body.toLowerCase().includes("price")) {
      signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"pricing_page", category:"pricing" as SignalCategory, entity, summary:"Pricing-related content detected", confidence:65, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });
    }

    // Blog
    if (body.toLowerCase().includes("/blog") || body.toLowerCase().includes("class=\"blog") || body.toLowerCase().includes("blog-posts")) {
      signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"blog_detected", category:"traffic" as SignalCategory, entity, summary:"Blog detected", confidence:60, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });
    }

    // Documentation
    if (body.toLowerCase().includes("/docs") || body.toLowerCase().includes("/documentation")) {
      signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"documentation_detected", category:"documentation" as SignalCategory, entity, summary:"Documentation detected", confidence:60, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });
    }

    // RSS
    if (body.toLowerCase().includes("type=\"application/rss+xml\"") || body.toLowerCase().includes("type=\"application/atom+xml\"")) {
      signals.push({ id:"sig_"+Math.random().toString(36).slice(2,10), type:"rss_detected", category:"community" as SignalCategory, entity, summary:"RSS/Atom feed detected", confidence:70, source:"website", url:page.url, evidence, timestamp:new Date().toISOString() });
    }

    this.totalSignals += signals.length;
    return signals;
  }

  async run(entity: string): Promise<ConnectorResult> {
    const allSignals: ConnectorSignal[] = []; const allEvidence: ConnectorEvidence[] = [];
    try {
      const urls = await this.discover(entity);
      const maxPages = Math.min(urls.length, 5);
      const results = await Promise.allSettled(urls.slice(0, maxPages).map(u => this.fetch(u).catch(() => null)));
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          const page = r.value;
          allEvidence.push({ id:"ev_"+Math.random().toString(36).slice(2,10), source:"website", url:page.url, connector:this.id, evidence_summary:`Fetched ${page.url} (HTTP ${page.status}, ${page.fetchTimeMs}ms, ${page.body.length} bytes)`, confidence:page.status===200?80:20, entity, observed_at:new Date().toISOString() });
          if (page.body) allSignals.push(...this.extractSignals(page, entity));
        }
      }
    } catch (e: any) { this.totalErrors++; this.lastError = e.message; }
    return { signals: allSignals, evidence: allEvidence, health: this.health() };
  }

  health(): ConnectorHealth {
    const avgLat = this.latencies.length > 0 ? Math.round(this.latencies.reduce((s,l)=>s+l,0)/this.latencies.length) : 0;
    const total = this.totalFetches + this.totalErrors;
    return { connector_id:this.id, state:this.totalErrors>5?"degraded":"healthy", availability:total>0?Math.round(this.totalFetches/total*100):100, latency_ms:avgLat, success_rate:total>0?Math.round(this.totalFetches/total*100):100, error_rate:total>0?Math.round(this.totalErrors/total*100):0, freshness_hours:0, last_successful_fetch:this.lastSuccess, last_error:this.lastError };
  }

  metrics(): ConnectorMetrics {
    const avgLat = this.latencies.length>0?Math.round(this.latencies.reduce((s,l)=>s+l,0)/this.latencies.length):0;
    return { total_observations:this.totalFetches, total_signals:this.totalSignals, total_errors:this.totalErrors, uptime_percentage:95, avg_latency_ms:avgLat };
  }
}
