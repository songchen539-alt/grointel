// GroIntel Report Lead Validation
// Server-side validation for report lead submissions.

export interface ReportLeadInput {
  reportId: string;
  companyName: string;
  workEmail: string;
  role: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const knownReportIds = ["stripe-demo", "opengradient-demo", "monad-demo"];

export function validateReportLead(input: ReportLeadInput): ValidationResult {
  const errors: string[] = [];

  // reportId
  if (!input.reportId || typeof input.reportId !== "string") {
    errors.push("reportId is required");
  } else if (!knownReportIds.includes(input.reportId)) {
    errors.push("Invalid report ID");
  }

  // workEmail
  if (!input.workEmail || typeof input.workEmail !== "string") {
    errors.push("Work email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.workEmail.trim())) {
      errors.push("Invalid email format");
    }
    if (input.workEmail.trim().length > 254) {
      errors.push("Email too long");
    }
  }

  // companyName
  if (input.companyName && typeof input.companyName === "string") {
    if (input.companyName.trim().length > 200) {
      errors.push("Company name too long (max 200 characters)");
    }
  }

  // role
  if (input.role && typeof input.role === "string") {
    if (input.role.trim().length > 200) {
      errors.push("Role too long (max 200 characters)");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
