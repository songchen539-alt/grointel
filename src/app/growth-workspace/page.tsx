import { CompanyMemoryFlow } from "../../../apps/grointel/product/company_memory/company_memory_flow";
import { Knowledge2Flow } from "../../../apps/grointel/knowledge/reality_observation/knowledge2_flow";

const flow = new CompanyMemoryFlow();
const k2 = new Knowledge2Flow();

export default async function GrowthWorkspacePage({ searchParams }: { searchParams: Promise<{ id?: string; action?: string; observe?: string; simulate?: string }> }) {
  const params = await searchParams;
  let state = null;
  let error = null;

  if (params.id) {
    const mem = flow.store.get(params.id);
    if (params.observe === "1" && mem) {
      k2.observeAndUpdate(flow, params.id, mem.company_website);
    }
    if (params.simulate && mem) {
      const sigs: Record<string, string> = {};
      params.simulate.split(",").forEach(function(s: string) {
        const parts = s.split(":");
        if (parts.length >= 2) sigs[parts[0]] = parts[1];
      });
      k2.simulateAndUpdate(flow, params.id, sigs);
    }
    state = flow.getState(params.id);
    if (!state) error = "Memory not found";
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: "8px" }}>Growth Workspace</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>Living growth decision workspace — your company memory persists.</p>

      <div style={{ padding: "16px", background: "#f0f6ff", borderRadius: "8px", marginBottom: "24px" }}>
        <p>To create a new workspace: <code>POST /api/grointel/company-memory</code></p>
        <p>To view: <code>/growth-workspace?id=&lt;memoryId&gt;</code></p>
      </div>

      {error && <div style={{ padding: "16px", background: "#fff0f0", borderRadius: "8px", color: "#c00" }}>{error}</div>}

      {state && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>{state.memory.company_name}</h2>
            <p>Website: {state.memory.company_website} | Industry: {state.memory.current_profile.industry} | Region: {state.memory.current_profile.region}</p>
            <p>Stage: {state.memory.current_profile.stage} | Confidence: {state.memory.current_profile.confidence}%</p>
            <p>Decisions: {state.memory.decision_count} | Timeline events: {state.memory.update_count}</p>
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Current Reality Snapshot</h2>
            <p>Goal: {state.latest_snapshot.growth_goal}</p>
            <p>Market: {state.latest_snapshot.target_market} | Budget: {state.latest_snapshot.budget_range} | Timeline: {state.latest_snapshot.timeline}</p>
            <p>Signals: {state.latest_snapshot.signals.join(", ") || "None"}</p>
            <p>Known unknowns: {state.latest_snapshot.known_unknowns.join(", ") || "None"}</p>
          </div>

          {state.latest_decision && (
            <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Latest Decision</h2>
              <p>Status: <strong>{state.latest_decision.status}</strong> | Confidence: {state.latest_decision.current_confidence}% (was {state.latest_decision.confidence_at_creation}%)</p>
              <p>Summary: {state.latest_decision.summary}</p>
              <p>Patterns: {state.latest_decision.recommended_patterns.join(", ")}</p>
              <p>Supply: {state.latest_decision.supply_categories.join(", ")}</p>
              <p>Risks: {state.latest_decision.risks.join("; ")}</p>
              <p>Confidence history: {state.latest_decision.confidence_history.length} events</p>
            </div>
          )}

          <div style={{ padding: "20px", background: "#f0faff", borderRadius: "12px", border: "1px solid #b3d9ff" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Reality Observation</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&observe=1"} style={{ padding: "8px 16px", background:"#0066cc", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Run Observation</a>
              <a href={"/growth-workspace?id="+state.memory.id+"&simulate=hiring_increased:+20,funding_raised:Series+B"} style={{ padding: "8px 16px", background:"#666", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Simulate Reality Change</a>
            </div>
            <p style={{ fontSize:"0.9rem", color:"#555" }}>Run Observation to detect hiring, funding, pricing, product, and other signals.</p>
          </div>

          <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Timeline</h2>
            {state.timeline.events.slice(-10).reverse().map((ev, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px", margin: "4px 0", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>
                <span>[{ev.type}] {ev.details}</span>
                <span style={{ color: "#999", fontSize: "0.85rem" }}>{ev.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!state && !error && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          Enter a memory ID to view your workspace
        </div>
      )}
    </div>
  );
}
