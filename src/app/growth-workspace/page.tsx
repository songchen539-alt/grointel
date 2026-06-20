import { CompanyMemoryFlow } from "../../../apps/grointel/product/company_memory/company_memory_flow";
import { Knowledge2Flow } from "../../../apps/grointel/knowledge/reality_observation/knowledge2_flow";
import { AlwaysOnRuntime } from "../../../apps/grointel/ops/always_on_runtime/always_on_runtime";
import { AutonomousLearningLoop } from "../../../apps/grointel/life/autonomous_learning_loop";
import { LivingKernel } from "../../../apps/grointel/genesis/living_kernel";
import { GenesisFlow } from "../../../apps/grointel/genesis/genesis_flow";
import { Genesis2Flow } from "../../../apps/grointel/genesis/public_exploration/genesis2_flow";
import { ConnectorRegistry } from "../../../apps/grointel/reality/connectors/connector_registry";
import { LivingLoopFlow } from "../../../apps/grointel/reality/continuous/living_loop_flow";


const flow = new CompanyMemoryFlow();
const k2 = new Knowledge2Flow();
const runtime = new AlwaysOnRuntime();


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
    if (params.action === "start_runtime" && mem) { runtime.createRuntime("simulated"); runtime.start(); }
    if (params.action === "stop_runtime" && mem) { runtime.stop(); }
    if (params.action === "resume_runtime" && mem) { runtime.createRuntime("simulated"); runtime.start(); }
    if (params.action === "life_iteration" && mem) { (new AutonomousLearningLoop()).runIteration(); }
    if (params.action === "life_batch" && mem) { (new AutonomousLearningLoop()).runBatch(3); }
    if (params.action === "kernel_start" && mem) { const k=new LivingKernel(); k.startKernel(); }
    if (params.action === "kernel_stop" && mem) { const k=new LivingKernel(); k.stopKernel(); }
    if (params.action === "loop_tick" && mem) { const loop=new LivingLoopFlow(); loop.runIteration([{id:mem.id,name:mem.company_name||mem.company_website,freshness:50,knowledge_uncertainty:30,confidence:70,hypothesis_count:0,emerging_industry:false,rapid_change:false,high_impact:false}]); }
    if (params.action === "run_all_connectors" && mem) { new ConnectorRegistry().runAll(mem.company_website); }
    if (params.action === "explore" && mem) { new Genesis2Flow().explore(mem.company_website, "company"); }
    if (params.action === "kernel_full_cycle" && mem) { new GenesisFlow().runFullCycle([{id:mem.id,changes:1,confidence:70,hypotheses:1,freshness:50,volatility:30}]); }
    if (params.action === "tick_runtime" && mem) {
      runtime.enqueueObservationJob(params.id, ["observe_website","observe_linkedin","observe_news","observe_funding"]);
      runtime.tick();
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

          <div style={{ padding: "20px", background: "#fff8f0", borderRadius: "12px", border: "1px solid #ffd9a8" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Always-On Reality Runtime</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=start_runtime"} style={{ padding: "8px 16px", background:"#cc6", color:"black", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Start Runtime</a>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=stop_runtime"} style={{ padding: "8px 16px", background:"#c66", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Stop Runtime</a>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=tick_runtime"} style={{ padding: "8px 16px", background:"#6c6", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Runtime Tick</a>
            </div>
          </div>

          <div style={{ padding: "20px", background: "#f0fff0", borderRadius: "12px", border: "1px solid #a8d8a8" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Persistence Status</h2>
            <p>Store mode: in-memory</p>
            <p>Health: healthy</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=resume_runtime"} style={{ padding: "8px 16px", background:"#396", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Resume Runtime</a>
            </div>
          </div>

          <div style={{ padding: "20px", background: "#f0f0ff", borderRadius: "12px", border: "1px solid #c8c8ff" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Autonomous Intelligence</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=life_iteration"} style={{ padding: "8px 16px", background:"#66c", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Run Life Iteration</a>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=life_batch"} style={{ padding: "8px 16px", background:"#969", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Run Batch</a>
            </div>
          </div>

          <div style={{ padding: "20px", background: "#e8f0ff", borderRadius: "12px", border: "2px solid #6688cc" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Living Kernel</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=kernel_start"} style={{ padding: "8px 16px", background:"#336", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Start Kernel</a>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=kernel_stop"} style={{ padding: "8px 16px", background:"#633", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Stop Kernel</a>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=kernel_full_cycle"} style={{ padding: "8px 16px", background:"#363", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Full Cycle</a>
            </div>
          </div>

          <div style={{ padding: "20px", background: "#e0ffe0", borderRadius: "12px", border: "2px solid #66aa66" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Public Exploration</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=explore"} style={{ padding: "8px 16px", background:"#383", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Explore Company</a>
            </div>
          </div>

          <div style={{ padding: "20px", background: "#e0f0ff", borderRadius: "12px", border: "2px solid #4488cc", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px", color: "#226" }}>Living Reality Monitor</h2>
            <p>Continuous Living Mode — Reality Time</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=loop_tick"} style={{ padding: "8px 16px", background:"#226", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Living Tick</a>
            </div>
          </div>          <div style={{ padding: "20px", background: "#fff0e0", borderRadius: "12px", border: "2px solid #cc8844" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>Live Reality</h2>
            <p>5 connectors: Website · RSS · GitHub · Jobs · News</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <a href={"/growth-workspace?id="+state.memory.id+"&action=run_all_connectors"} style={{ padding: "8px 16px", background:"#c84", color:"white", borderRadius:"6px", textDecoration:"none", fontSize:"0.9rem" }}>Run All Connectors</a>
            </div>
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
