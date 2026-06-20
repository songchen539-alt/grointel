// GroIntel ROS-2 — SDK Result Wrapper
import { SDKResult, SDKTraceEntry, SDKError } from "./sdk_types";

let resCounter = 0;
function genId(): string { return "res_" + (++resCounter).toString(16).padStart(6, "0"); }

export class SDKResultFactory {
  static success<T>(data: T, trace: SDKTraceEntry, confidence = 80, rf = 70, evidence: string[] = [], warnings: string[] = []): SDKResult<T> {
    return { id: genId(), created_at: new Date().toISOString(), success: true, data, error: null, warnings, confidence, reality_fidelity: rf, evidence, trace };
  }
  static error<T>(error: SDKError, trace: SDKTraceEntry): SDKResult<T> {
    return { id: genId(), created_at: new Date().toISOString(), success: false, data: null, error, warnings: [], confidence: 0, reality_fidelity: 0, evidence: [], trace };
  }
  static fromError<T>(error: SDKError, context: { caller_id: string; caller_type: any; permissions: any }): SDKResult<T> {
    const t: SDKTraceEntry = { id: genId(), caller_id: context.caller_id, caller_type: context.caller_type, capability: error.code, input_summary: "", permission_check: { required: "read", granted: context.permissions, passed: false }, started_at: new Date().toISOString(), completed_at: new Date().toISOString(), duration_ms: 0, result_status: "error", warnings: [], evidence: [] };
    return { id: genId(), created_at: new Date().toISOString(), success: false, data: null, error, warnings: [], confidence: 0, reality_fidelity: 0, evidence: [], trace: t };
  }
}
