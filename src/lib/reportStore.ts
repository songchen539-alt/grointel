// GroIntel Report Store
// Bridges the intelligence engine with the report view UI.
// Reports are generated deterministically by the engine.

import type { CompanyMRIReport } from "@/types/company";
import { generateReport, getReportById } from "./intelligence/reportGenerator";
import { convertToReportFormat } from "./intelligence/supabaseAdapter";

const reportStore = new Map<string, CompanyMRIReport>();

export function saveReport(input: string | CompanyMRIReport): string {
  if (typeof input === "string") {
    // Generate report from domain
    const mri = generateReport(input);
    const converted = convertToReportFormat(mri);
    reportStore.set(mri.reportId, converted);
    return mri.reportId;
  }
  // Legacy: store a pre-built report
  const id = input.companySnapshot.company.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString(36);
  reportStore.set(id, input);
  return id;
}

export function getReport(id: string): CompanyMRIReport | undefined {
  // Check store first
  const existing = reportStore.get(id);
  if (existing) return existing;

  // Try engine
  const mri = getReportById(id);
  if (mri) {
    const converted = convertToReportFormat(mri);
    reportStore.set(id, converted);
    return converted;
  }

  // Try generating from domain in ID
  const domainFromId = id.replace(/-/g, ".");
  try {
    const mri = generateReport(domainFromId);
    const converted = convertToReportFormat(mri);
    reportStore.set(id, converted);
    return converted;
  } catch {
    return undefined;
  }
}

export function getAllReportIds(): string[] {
  return Array.from(reportStore.keys());
}
