// GroIntel ROS-2 — SDK Trace Recorder
import { SDKTraceEntry, CallerType, PermissionLevel } from "./sdk_types";

let tCounter = 0;
function genId(): string { return "trc_" + (++tCounter).toString(16).padStart(6, "0"); }

export class SDKTrace {
  record(callerId: string, callerType: CallerType, capability: string, inputSummary: string,
    requiredPerm: PermissionLevel, grantedPerm: PermissionLevel, passed: boolean,
    startedAt: string, completedAt: string, durationMs: number,
    status: "success" | "error" | "blocked", warnings: string[] = [], evidence: string[] = []): SDKTraceEntry {
    return {
      id: genId(), caller_id: callerId, caller_type: callerType, capability,
      input_summary: inputSummary,
      permission_check: { required: requiredPerm, granted: grantedPerm, passed },
      started_at: startedAt, completed_at: completedAt, duration_ms: durationMs,
      result_status: status, warnings, evidence,
    };
  }
}
