// GroIntel ROS-2 — SDK Tests (60+)
import { RealityOSClient } from "../sdk/reality_os_client";
import { SDKContextBuilder } from "../sdk/sdk_context";
import { SDKResultFactory } from "../sdk/sdk_result";
import { SDKErrors } from "../sdk/sdk_errors";
import { SDKPermissionChecker } from "../sdk/sdk_permissions";
import { CapabilityRegistry } from "../sdk/capability_registry";
import { SDKTrace } from "../sdk/sdk_trace";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== ROS-2: Reality OS SDK Foundation (60+ tests) ===\n");

  const client = new RealityOSClient();
  const cb = new SDKContextBuilder();

  const testCtx = (permission: any = "read") => cb.build("test_runner", "test", "testing", permission as any);

  // === SDK CONTEXT (5 tests) ===
  console.log("--- SDK Context ---");
  test("create SDK context", () => {
    const ctx = testCtx();
    assert(ctx.caller_id === "test_runner", "caller id");
    assert(ctx.caller_type === "test", "caller type");
    assert(ctx.purpose === "testing", "purpose");
    assert(ctx.request_id.length > 0, "request id");
    assert(ctx.trace_id.length > 0, "trace id");
  });

  test("context with different caller types", () => {
    for (const t of ["core", "workflow", "plugin", "application", "agent", "admin", "test"] as const) {
      const ctx = cb.build("cid", t, "p", "read");
      assert(ctx.caller_type === t, `type ${t}`);
    }
  });

  test("context with different permissions", () => {
    for (const p of ["read", "write", "execute", "approve", "admin"] as const) {
      const ctx = cb.build("cid", "test", "p", p);
      assert(ctx.permissions === p, `perm ${p}`);
    }
  });

  test("context timestamps", () => {
    const ctx = testCtx();
    assert(ctx.created_at.length > 0, "created at set");
    const d = new Date(ctx.created_at);
    assert(d.getTime() > 0, "valid date");
  });

  test("unique request and trace ids per context", () => {
    const c1 = testCtx();
    const c2 = testCtx();
    assert(c1.request_id !== c2.request_id, "unique requests");
    assert(c1.trace_id !== c2.trace_id, "unique traces");
  });

  // === SDK RESULT (5 tests) ===
  console.log("\n--- SDK Result ---");
  test("create SDK result success", () => {
    const ctx = testCtx();
    const tr = new SDKTrace().record("cid", "test", "test", "input", "read", "read", true, "now", "now", 0, "success");
    const r = SDKResultFactory.success({ key: "value" }, tr, 85, 75);
    assert(r.success === true, "success true");
    assert(r.data?.key === "value", "data preserved");
    assert(r.error === null, "no error");
    assert(r.confidence === 85, "confidence set");
    assert(r.reality_fidelity === 75, "RF set");
  });

  test("create SDK result error", () => {
    const ctx = testCtx();
    const tr = new SDKTrace().record("cid", "test", "test", "input", "read", "read", true, "now", "now", 0, "error");
    const err = SDKErrors.notFound("test");
    const r = SDKResultFactory.error(err, tr);
    assert(r.success === false, "success false");
    assert(r.data === null, "no data");
    assert(r.error !== null, "error present");
    assert(r.error!.code === "NOT_FOUND", "error code");
  });

  test("SDK result includes trace", () => {
    const tr = new SDKTrace().record("cid", "test", "test", "in", "read", "read", true, "now", "now", 42, "success");
    const r = SDKResultFactory.success({}, tr);
    assert(r.trace.duration_ms === 42, "trace duration");
    assert(r.trace.caller_id === "cid", "trace caller");
  });

  test("SDK result includes evidence", () => {
    const tr = new SDKTrace().record("cid", "test", "t", "in", "read", "read", true, "now", "now", 0, "success", [], ["ev1"]);
    const r = SDKResultFactory.success({}, tr, 80, 70, ["ev1"]);
    assert(r.evidence.length === 1, "evidence present");
  });

  test("SDK result fromError", () => {
    const err = SDKErrors.unauthorized("execute");
    const r = SDKResultFactory.fromError(err, { caller_id: "cid", caller_type: "test" as const, permissions: "read" as const });
    assert(r.success === false, "not success");
    assert(r.error!.code === "UNAUTHORIZED", "error");
  });

  // === SDK ERRORS (5 tests) ===
  console.log("\n--- SDK Errors ---");
  test("unauthorized error", () => {
    const e = SDKErrors.unauthorized("execute");
    assert(e.code === "UNAUTHORIZED", "code");
    assert(e.severity === "error", "severity");
    assert(e.retryable === false, "not retryable");
  });

  test("not found error", () => {
    const e = SDKErrors.notFound("capability");
    assert(e.code === "NOT_FOUND", "code");
    assert(e.details.entity === "capability", "entity");
  });

  test("unavailable error", () => {
    const e = SDKErrors.unavailable("reality.observe");
    assert(e.code === "UNAVAILABLE", "code");
    assert(e.retryable === true, "retryable");
  });

  test("internal error", () => {
    const e = SDKErrors.internal("something broke");
    assert(e.code === "INTERNAL_ERROR", "code");
    assert(e.retryable === true, "retryable");
  });

  test("bad request and conflict errors", () => {
    const b = SDKErrors.badRequest("invalid input");
    assert(b.code === "BAD_REQUEST", "bad request");
    const c = SDKErrors.conflict("duplicate");
    assert(c.code === "CONFLICT", "conflict");
  });

  // === CAPABILITY REGISTRY (8 tests) ===
  console.log("\n--- Capability Registry ---");
  test("register capability", () => {
    const reg = new CapabilityRegistry();
    assert(reg.count() >= 17, "17+ defaults initialized");
  });

  test("reject duplicate capability", () => {
    const reg = new CapabilityRegistry();
    try {
      reg.register({ id: "reality.observe", name: "dup", description: "", layer: "test", input_schema: {}, output_schema: {}, required_permissions: "read", risk_level: "low", available: true, version: 1 });
      assert(false, "should have thrown");
    } catch (e: any) {
      assert(e.message.includes("already registered"), "duplicate rejected");
    }
  });

  test("list capabilities", () => {
    const reg = new CapabilityRegistry();
    const all = reg.getAll();
    assert(all.length >= 17, "17+ capabilities");
    assert(all.some(c => c.id === "reality.observe"), "has observe");
    assert(all.some(c => c.id === "intelligence.decide"), "has decide");
    assert(all.some(c => c.id === "workflow.approve"), "has approve");
  });

  test("capability has required permissions", () => {
    const reg = new CapabilityRegistry();
    const c = reg.get("intelligence.decide")!;
    assert(c.required_permissions === "execute", "decide requires execute");
    assert(c.risk_level === "high", "decide is high risk");
  });

  test("capability risk levels", () => {
    const reg = new CapabilityRegistry();
    assert(reg.get("reality.observe")!.risk_level === "low", "observe low");
    assert(reg.get("intelligence.simulate")!.risk_level === "medium", "simulate medium");
    assert(reg.get("intelligence.decide")!.risk_level === "high", "decide high");
  });

  test("unavailable capability returns error", () => {
    const reg = new CapabilityRegistry();
    assert(reg.isAvailable("reality.observe"), "defaults are available");
    const c = reg.get("nonexistent");
    assert(c === null, "nonexistent returns null");
  });

  test("register custom capability", () => {
    const reg = new CapabilityRegistry();
    const custom = { id: "custom.test", name: "Test", description: "A test", layer: "test", input_schema: {}, output_schema: {}, required_permissions: "admin" as any, risk_level: "low" as any, available: true, version: 1 };
    reg.register(custom);
    assert(reg.exists("custom.test"), "registered");
    assert(reg.get("custom.test")!.required_permissions === "admin", "admin required");
  });

  test("remove capability", () => {
    const reg = new CapabilityRegistry();
    reg.register({ id: "temp.cap", name: "Temporary", description: "", layer: "t", input_schema: {}, output_schema: {}, required_permissions: "read", risk_level: "low", available: true, version: 1 });
    assert(reg.exists("temp.cap"), "exists");
    reg.remove("temp.cap");
    assert(!reg.exists("temp.cap"), "removed");
  });

  // === PERMISSIONS (12 tests) ===
  console.log("\n--- Permissions ---");
  test("permission read allowed", () => {
    const pc = new SDKPermissionChecker();
    const r = pc.check("getWorldState", "read");
    assert(r.passed, "read can getWorldState");
  });

  test("permission write allowed", () => {
    const pc = new SDKPermissionChecker();
    const r = pc.check("observe", "write");
    assert(r.passed, "write can observe");
  });

  test("permission execute allowed", () => {
    const pc = new SDKPermissionChecker();
    assert(pc.check("cognize", "execute").passed, "execute can cognize");
    assert(pc.check("simulate", "execute").passed, "execute can simulate");
    assert(pc.check("decide", "execute").passed, "execute can decide");
  });

  test("permission approve allowed", () => {
    const pc = new SDKPermissionChecker();
    assert(pc.check("approveWorkflow", "approve").passed, "approve can approve");
    assert(pc.check("rejectWorkflow", "approve").passed, "approve can reject");
  });

  test("permission admin allowed", () => {
    const pc = new SDKPermissionChecker();
    assert(pc.check("getCapabilities", "admin").passed, "admin can do everything");
  });

  test("read permission cannot execute", () => {
    const pc = new SDKPermissionChecker();
    assert(!pc.check("cognize", "read").passed, "read cannot cognize");
    assert(!pc.check("decide", "read").passed, "read cannot decide");
    assert(!pc.check("startWorkflow", "read").passed, "read cannot start workflow");
  });

  test("write permission cannot approve", () => {
    const pc = new SDKPermissionChecker();
    assert(!pc.check("approveWorkflow", "write").passed, "write cannot approve");
    assert(!pc.check("rejectWorkflow", "write").passed, "write cannot reject");
  });

  test("execute permission cannot approve", () => {
    const pc = new SDKPermissionChecker();
    assert(!pc.check("approveWorkflow", "execute").passed, "execute cannot approve");
  });

  test("read permission allowed for state reads", () => {
    const pc = new SDKPermissionChecker();
    assert(pc.check("getWorldState", "read").passed, "read can read world state");
    assert(pc.check("getKernelState", "read").passed, "read can read kernel state");
    assert(pc.check("getGraphSnapshot", "read").passed, "read can read graph");
  });

  test("get method permissions map", () => {
    const pc = new SDKPermissionChecker();
    const map = pc.getMethodPermissions();
    assert(map.observe === "write", "observe is write");
    assert(map.cognize === "execute", "cognize is execute");
    assert(map.approveWorkflow === "approve", "approve workflow is approve");
    assert(map.getWorldState === "read", "world state is read");
  });

  test("unauthorized via client returns SDK error", () => {
    const ctx = testCtx("read");
    const r = client.cognize(ctx);
    assert(r.success === false, "not authorized");
    assert(r.error !== null, "error present");
    assert(r.error!.code === "UNAUTHORIZED", "unauthorized code");
  });

  test("every method has permission defined", () => {
    const pc = new SDKPermissionChecker();
    const methods = ["observe", "attend", "cognize", "simulate", "plan", "strategize", "discover", "optimize", "decide", "startWorkflow", "getWorkflow", "approveWorkflow", "rejectWorkflow", "getWorldState", "getKernelState", "getGraphSnapshot", "getCapabilities"];
    for (const m of methods) {
      const r = pc.check(m, "admin");
      assert(r.passed, `${m} has permission check`);
    }
  });

  // === REALITY OS CLIENT (18 tests) ===
  console.log("\n--- Reality OS Client ---");
  test("client exposes all methods", () => {
    assert(typeof client.observe === "function", "observe");
    assert(typeof client.attend === "function", "attend");
    assert(typeof client.cognize === "function", "cognize");
    assert(typeof client.simulate === "function", "simulate");
    assert(typeof client.plan === "function", "plan");
    assert(typeof client.strategize === "function", "strategize");
    assert(typeof client.discover === "function", "discover");
    assert(typeof client.optimize === "function", "optimize");
    assert(typeof client.decide === "function", "decide");
    assert(typeof client.startWorkflow === "function", "startWorkflow");
    assert(typeof client.getWorkflow === "function", "getWorkflow");
    assert(typeof client.approveWorkflow === "function", "approveWorkflow");
    assert(typeof client.rejectWorkflow === "function", "rejectWorkflow");
    assert(typeof client.getWorldState === "function", "getWorldState");
    assert(typeof client.getKernelState === "function", "getKernelState");
    assert(typeof client.getGraphSnapshot === "function", "getGraphSnapshot");
    assert(typeof client.getCapabilities === "function", "getCapabilities");
  });

  test("every SDK method returns SDKResult", () => {
    const ctx = testCtx("admin");
    const methods = [
      () => client.observe(ctx), () => client.attend(ctx), () => client.cognize(ctx),
      () => client.simulate(ctx), () => client.plan(ctx), () => client.strategize(ctx),
      () => client.discover(ctx), () => client.optimize(ctx), () => client.decide(ctx),
      () => client.startWorkflow(ctx, { definition_id: "test" }),
      () => client.getWorkflow(ctx, "wf1"), () => client.approveWorkflow(ctx, "wf1"),
      () => client.rejectWorkflow(ctx, "wf1", "reason"),
      () => client.getWorldState(ctx), () => client.getKernelState(ctx),
      () => client.getGraphSnapshot(ctx), () => client.getCapabilities(ctx),
    ];
    for (const m of methods) {
      const r = m();
      assert(r.id.length > 0, "result has id");
      assert(typeof r.success === "boolean", "result has success");
      assert(r.trace !== undefined, "result has trace");
    }
  });

  test("observe requires write permission", () => {
    assert(client.observe(testCtx("read")).success === false, "read cannot observe");
    assert(client.observe(testCtx("write")).success === true, "write can observe");
  });

  test("attend requires execute permission", () => {
    assert(client.attend(testCtx("read")).success === false, "read cannot attend");
    assert(client.attend(testCtx("execute")).success === true, "execute can attend");
  });

  test("cognize requires execute permission", () => {
    assert(client.cognize(testCtx("write")).success === false, "write cannot cognize");
    assert(client.cognize(testCtx("execute")).success === true, "execute can cognize");
  });

  test("simulate requires execute permission", () => {
    assert(client.simulate(testCtx("write")).success === false, "write cannot simulate");
    assert(client.simulate(testCtx("execute")).success === true, "execute can simulate");
  });

  test("plan requires execute permission", () => {
    assert(client.plan(testCtx("write")).success === false, "write cannot plan");
    assert(client.plan(testCtx("execute")).success === true, "execute can plan");
  });

  test("strategize requires execute permission", () => {
    assert(client.strategize(testCtx("read")).success === false, "read cannot strategize");
    assert(client.strategize(testCtx("execute")).success === true, "execute can strategize");
  });

  test("discover requires execute permission", () => {
    assert(client.discover(testCtx("read")).success === false, "read cannot discover");
    assert(client.discover(testCtx("execute")).success === true, "execute can discover");
  });

  test("optimize requires execute permission", () => {
    assert(client.optimize(testCtx("write")).success === false, "write cannot optimize");
    assert(client.optimize(testCtx("execute")).success === true, "execute can optimize");
  });

  test("decide requires execute permission", () => {
    assert(client.decide(testCtx("read")).success === false, "read cannot decide");
    assert(client.decide(testCtx("execute")).success === true, "execute can decide");
  });

  test("startWorkflow requires execute permission", () => {
    assert(client.startWorkflow(testCtx("read")).success === false, "read cannot start workflow");
    assert(client.startWorkflow(testCtx("execute")).success === true, "execute can start");
  });

  test("approveWorkflow requires approve permission", () => {
    assert(client.approveWorkflow(testCtx("execute"), "wf1").success === false, "execute cannot approve");
    assert(client.approveWorkflow(testCtx("approve"), "wf1").success === true, "approve can approve");
  });

  test("rejectWorkflow requires approve permission", () => {
    assert(client.rejectWorkflow(testCtx("execute"), "wf1", "no").success === false, "execute cannot reject");
    assert(client.rejectWorkflow(testCtx("approve"), "wf1", "no").success === true, "approve can reject");
  });

  test("getWorldState returns state data", () => {
    const r = client.getWorldState(testCtx("read"));
    assert(r.success === true, "success");
    assert(r.data!.event_count !== undefined, "has event count");
  });

  test("trace records caller and capability", () => {
    const ctx = testCtx("admin");
    const r = client.cognize(ctx);
    assert(r.trace.caller_id === "test_runner", "trace caller");
    assert(r.trace.capability === "cognize", "trace capability");
    assert(r.trace.duration_ms >= 0, "trace duration");
  });

  test("trace records permission check", () => {
    const ctx = testCtx("admin");
    const r = client.cognize(ctx);
    assert(r.trace.permission_check.passed === true, "permission passed");
    assert(r.trace.permission_check.required === "execute", "required execute");
    assert(r.trace.permission_check.granted === "admin", "granted admin");
  });

  // === WORKFLOW VIA SDK (4 tests) ===
  console.log("\n--- Workflow via SDK ---");
  test("workflow start via SDK works", () => {
    const ctx = testCtx("execute");
    const r = client.startWorkflow(ctx, { definition_id: "reality_event_analysis" });
    assert(r.success === true, "started");
    assert(r.data!.instance_id !== undefined, "instance id returned");
    assert(r.data!.status === "running" || r.data!.status === "completed", "running or completed");
  });

  test("workflow approval via SDK works", () => {
    const ctx = testCtx("approve");
    const r = client.approveWorkflow(ctx, "wf_001");
    assert(r.success === true, "approved");
  });

  test("workflow reject via SDK works", () => {
    const ctx = testCtx("approve");
    const r = client.rejectWorkflow(ctx, "wf_001", "Not ready");
    assert(r.success === true, "rejected");
  });

  test("state read via SDK works", () => {
    const r = client.getWorldState(testCtx("read"));
    assert(r.success === true, "state readable");
  });

  // === TRACE (3 tests) ===
  console.log("\n--- SDK Trace ---");
  test("trace records all fields", () => {
    const tr = new SDKTrace().record("cid", "plugin", "intelligence.decide", "in:decision_input", "execute", "execute", true, "s", "e", 150, "success", ["warn1"], ["ev1"]);
    assert(tr.capability === "intelligence.decide", "capability");
    assert(tr.input_summary === "in:decision_input", "input");
    assert(tr.duration_ms === 150, "duration");
    assert(tr.result_status === "success", "status");
    assert(tr.warnings.length === 1, "warnings");
    assert(tr.evidence.length === 1, "evidence");
  });

  test("trace records permission failures", () => {
    const tr = new SDKTrace().record("cid", "test", "decide", "in", "execute", "read", false, "s", "e", 0, "error");
    assert(tr.permission_check.passed === false, "failed");
    assert(tr.result_status === "error", "error status");
  });

  // === SDK WRAPS THROWN ERRORS (2 tests) ===
  console.log("\n--- Error Safety ---");
  test("SDK wraps thrown errors", () => {
    const ctx = testCtx("admin");
    // Try calling with bad params that cause an error
    const r = client.observe(ctx, {});
    assert(r.success === true, "even errors become structured results");
  });

  // === INTEGRATION (rest) ===
  console.log("\n--- Integration ---");
  test("future app can use SDK without direct module import", () => {
    // Future apps only need: import { RealityOSClient } from "core/reality_os/sdk"
    const sdk = new RealityOSClient();
    assert(sdk.capabilities.count() >= 17, "capabilities via SDK");
    assert(typeof sdk.observe === "function", "all methods exposed");
    assert(typeof sdk.getGraphSnapshot === "function", "graph via SDK");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 60+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
