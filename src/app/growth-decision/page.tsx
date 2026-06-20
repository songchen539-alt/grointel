import { GrowthDecisionFlow } from "../../../apps/grointel/product/growth_decision_flow";

const flow = new GrowthDecisionFlow();

export default async function GrowthDecisionPage({ searchParams }: { searchParams: Promise<{ website?: string; goal?: string; market?: string; budget?: string; timeline?: string }> }) {
  const params = await searchParams;
  let report = null;
  let error = null;

  if (params.website && params.goal) {
    try {
      report = flow.run({
        company_website: params.website,
        growth_goal: params.goal,
        target_market: params.market || "unknown",
        budget_range: params.budget || "unknown",
        timeline: params.timeline || "unknown",
        constraints: [],
      });
    } catch (e: any) {
      error = e.message;
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: "8px" }}>GroIntel Growth Decision</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>Enter your company and growth goal to get a data-driven growth decision report.</p>

      <form method="GET" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <input name="website" placeholder="Company website (e.g. grointel.io)" defaultValue={params.website || ""} required style={inputStyle} />
          <input name="goal" placeholder="Growth goal (e.g. increase leads)" defaultValue={params.goal || ""} required style={inputStyle} />
          <input name="market" placeholder="Target market (e.g. US)" defaultValue={params.market || ""} style={inputStyle} />
          <input name="budget" placeholder="Budget range (e.g. 10k-50k)" defaultValue={params.budget || ""} style={inputStyle} />
        </div>
        <input name="timeline" placeholder="Timeline (e.g. 90 days)" defaultValue={params.timeline || ""} style={inputStyle} />
        <button type="submit" style={{ padding: "12px 24px", background: "#0066cc", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", cursor: "pointer", fontWeight: 500 }}>Generate Growth Decision Report</button>
      </form>

      {error && <div style={{ padding: "16px", background: "#fff0f0", borderRadius: "8px", color: "#c00" }}>{error}</div>}

      {report && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Executive Summary</h2>
            <p>{report.summary}</p>
            <p style={{ color: "#666", marginTop: "8px" }}>Confidence: {report.confidence}% | Risk: {report.diagnosis.risk_level}</p>
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Company Snapshot</h2>
            <p>Domain: {report.company.company_domain} | Industry: {report.company.industry} | Region: {report.company.region}</p>
            <p style={{ color: "#666" }}>Status: {report.diagnosis.current_state}</p>
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Growth Diagnosis</h2>
            <p>Bottleneck: {report.diagnosis.bottleneck}</p>
            <p>Missing Capability: {report.diagnosis.missing_capability}</p>
            <p>Market Opportunity: {report.diagnosis.market_opportunity}</p>
          </div>

          {report.recommended_patterns.length > 0 && (
            <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Recommended Patterns</h2>
              {report.recommended_patterns.map((p, i) => (
                <div key={i} style={{ padding: "12px", margin: "8px 0", background: "white", borderRadius: "8px", border: "1px solid #eee" }}>
                  <strong>{p.pattern_name}</strong> (Cluster: {p.pattern_cluster})
                  <p style={{ color: "#444" }}>Fit: {p.fit_score}% | Evidence: {p.evidence_count} cases | Confidence: {p.confidence}%</p>
                  <p style={{ color: "#666" }}>{p.expected_impact}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Causal Explanation</h2>
            <p>{report.causal_explanation}</p>
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Supply Categories</h2>
            {report.supply_categories.map((s, i) => (
              <div key={i} style={{ padding: "8px", margin: "4px 0", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>
                <strong>{s.category}</strong> — {s.reason}
              </div>
            ))}
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Risks & Unknowns</h2>
            {report.risks.map((r, i) => <div key={i} style={{ padding: "8px", margin: "4px 0", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>{r.severity.toUpperCase()}: {r.risk} — {r.mitigation}</div>)}
            <p style={{ marginTop: "8px" }}>Unknowns: {report.unknowns.join(", ") || "None identified"}</p>
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>90-Day Action Plan</h2>
            {report.next_actions.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px", margin: "4px 0", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>
                <span>#{a.priority} {a.action}</span>
                <span style={{ color: "#666" }}>{a.timeframe}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.95rem", width: "100%", boxSizing: "border-box",
};
