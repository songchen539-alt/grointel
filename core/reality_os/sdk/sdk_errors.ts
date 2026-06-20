// GroIntel ROS-2 — SDK Error Factory
import { SDKError } from "./sdk_types";

export class SDKErrors {
  static unauthorized(permission: string): SDKError {
    return { code: "UNAUTHORIZED", message: `Permission '${permission}' required`, severity: "error", retryable: false, details: { required: permission } };
  }
  static notFound(entity: string): SDKError {
    return { code: "NOT_FOUND", message: `${entity} not found`, severity: "error", retryable: false, details: { entity } };
  }
  static unavailable(capability: string): SDKError {
    return { code: "UNAVAILABLE", message: `Capability '${capability}' not available`, severity: "warning", retryable: true, details: { capability } };
  }
  static internal(message: string): SDKError {
    return { code: "INTERNAL_ERROR", message, severity: "error", retryable: true, details: {} };
  }
  static badRequest(message: string): SDKError {
    return { code: "BAD_REQUEST", message, severity: "warning", retryable: false, details: {} };
  }
  static conflict(message: string): SDKError {
    return { code: "CONFLICT", message, severity: "warning", retryable: false, details: {} };
  }
}
