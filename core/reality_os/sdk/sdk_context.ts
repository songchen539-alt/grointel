// GroIntel ROS-2 — SDK Context Builder
import { SDKContext, CallerType, PermissionLevel } from "./sdk_types";

let reqCounter = 0;
function genReqId(): string { return "sdk_" + (++reqCounter).toString(16).padStart(6, "0"); }
function genTraceId(): string { return "trc_" + Math.random().toString(36).slice(2, 10); }

export class SDKContextBuilder {
  build(callerId: string, callerType: CallerType, purpose: string, permissions: PermissionLevel): SDKContext {
    return {
      caller_id: callerId,
      caller_type: callerType,
      purpose,
      permissions,
      request_id: genReqId(),
      trace_id: genTraceId(),
      created_at: new Date().toISOString(),
    };
  }
}
