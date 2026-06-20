import { WorldBuildingFlow } from "../../../apps/grointel/world/world_building_flow";

const flow = new WorldBuildingFlow();
const result = flow.runFullUpdate();

export default function WorldPage() {
  const { score, topGaps, topPriorities, progress } = result;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "4px" }}>The Living World</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>GroIntel&apos;s understanding of reality — continuous, measurable, evolving.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", background: "#e8f0ff", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.85rem", color: "#558" }}>Reality Coverage</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#226" }}>{score.reality_coverage}%</div>
        </div>
        <div style={{ padding: "16px", background: "#e8ffe8", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.85rem", color: "#558" }}>Knowledge Quality</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#262" }}>{score.knowledge_quality}%</div>
        </div>
        <div style={{ padding: "16px", background: "#fff8e8", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.85rem", color: "#558" }}>Decision Accuracy</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#862" }}>{score.decision_accuracy}%</div>
        </div>
        <div style={{ padding: "16px", background: "#ffe8e8", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.85rem", color: "#558" }}>Business Outcomes</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#822" }}>{score.business_outcomes}%</div>
        </div>
      </div>

      <div style={{ padding: "16px", background: "#f0f0ff", borderRadius: "8px", marginBottom: "24px" }}>
        <div style={{ fontSize: "0.85rem", color: "#558" }}>Overall Intelligence Index</div>
        <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#228" }}>{score.overall}<span style={{ fontSize: "1rem", color: "#666" }}>/100</span></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>Top Gaps</h2>
          {topGaps.map((g: any, i: number) => (
            <div key={i} style={{ padding: "8px", margin: "4px 0", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>
              <span style={{ color: g.severity === "critical" ? "#c00" : g.severity === "high" ? "#c60" : "#880" }}>●</span> {g.description}
            </div>
          ))}
          {topGaps.length === 0 && <p style={{ color: "#999" }}>No significant gaps detected</p>}
        </div>
        <div style={{ padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>Next Priorities</h2>
          {topPriorities.map((p: any, i: number) => (
            <div key={i} style={{ padding: "8px", margin: "4px 0", background: "white", borderRadius: "6px", border: "1px solid #eee" }}>
              <strong>#{i + 1}</strong> {p.priority}
            </div>
          ))}
          {topPriorities.length === 0 && <p style={{ color: "#999" }}>No priorities calculated</p>}
        </div>
      </div>

      <div style={{ padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>Operational Progress</h2>
        <p>New reality covered: {progress.reality_covered_new} | Knowledge improved: {progress.knowledge_improved}</p>
        <p>Decisions improved: {progress.decisions_improved} | Outcomes improved: {progress.outcomes_improved}</p>
        <p>Gaps discovered: {progress.gaps_discovered}</p>
      </div>
    </div>
  );
}
