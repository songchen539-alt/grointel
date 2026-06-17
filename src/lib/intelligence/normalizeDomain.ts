// GroIntel Intelligence Engine - Domain Normalization
// Converts user input into a canonical domain and report ID.

export interface NormalizedDomain {
  domain: string;       // e.g. "stripe.com"
  hostname: string;     // e.g. "stripe"
  reportId: string;     // e.g. "stripe-com"
  companyName: string;  // e.g. "Stripe"
  url: string;          // e.g. "https://stripe.com"
}

export function normalizeDomain(input: string): NormalizedDomain {
  let raw = input.trim().toLowerCase();

  // Strip protocol, path, query, www
  raw = raw.replace(/^https?:\/\//, "");
  raw = raw.replace(/\/.*$/, "");
  raw = raw.replace(/^www\./, "");

  // If no dot, assume it's a raw company name and append .com
  if (!raw.includes(".")) {
    raw = raw + ".com";
  }

  const parts = raw.split(".");
  const hostname = parts[0];
  const domain = raw;
  const reportId = domain.replace(/\./g, "-");
  const companyName = hostname.charAt(0).toUpperCase() + hostname.slice(1);

  return {
    domain,
    hostname,
    reportId,
    companyName,
    url: "https://" + domain,
  };
}
