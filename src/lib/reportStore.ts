// GroIntel Report Store
// In-memory mock storage for Company MRI reports.
// Replace with database (Supabase) + AI engine in production.

import { CompanyMRIReport } from "@/types/company";
import { generateCompanyMRIReport } from "./analysisEngine";

const reportStore = new Map<string, CompanyMRIReport>();

// Pre-populate demo reports at module load time
const demos: Record<string, string> = {
  "stripe-demo": "https://stripe.com",
  "opengradient-demo": "https://opengradient.com",
  "monad-demo": "https://monad.xyz",
};

for (const [id, url] of Object.entries(demos)) {
  reportStore.set(id, generateCompanyMRIReport(url));
}

export function saveReport(report: CompanyMRIReport): string {
  const id = report.companySnapshot.company.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString(36);
  reportStore.set(id, report);
  return id;
}

export function saveReportWithId(id: string, report: CompanyMRIReport): void {
  reportStore.set(id, report);
}

export function getReport(id: string): CompanyMRIReport | undefined {
  return reportStore.get(id);
}

export function getAllReportIds(): string[] {
  return Array.from(reportStore.keys());
}
