// GroIntel Signal Types
// Independent module — replace with real data sources later.

export type SignalType =
  | "Funding"
  | "Hiring"
  | "Expansion"
  | "Product Launch"
  | "Partnership"
  | "Community Growth"
  | "SEO Growth"
  | "GitHub Activity"
  | "Media Coverage"
  | "Conference";

export type SignalPriority = "High" | "Medium" | "Low";

export interface FeedSignal {
  id: string;
  companyName: string;
  companyUrl: string;
  type: SignalType;
  priority: SignalPriority;
  confidence: number;   // 0-100
  publishedAt: string;  // ISO date
  summary: string;
}

export interface SignalFeed {
  date: string;
  signals: FeedSignal[];
}

export const SIGNAL_TYPE_CONFIG: Record<SignalType, { icon: string; color: string; description: string }> = {
  "Funding":           { icon: "💰", color: "emerald",  description: "New funding round raised" },
  "Hiring":            { icon: "👥", color: "blue",     description: "Active hiring across departments" },
  "Expansion":         { icon: "🌍", color: "violet",   description: "Geographic or vertical expansion" },
  "Product Launch":    { icon: "🚀", color: "amber",    description: "New product or major feature release" },
  "Partnership":       { icon: "🤝", color: "cyan",     description: "Strategic partnership or integration" },
  "Community Growth":  { icon: "📈", color: "green",    description: "Community size or engagement growth" },
  "SEO Growth":        { icon: "🔍", color: "orange",   description: "Organic search visibility increase" },
  "GitHub Activity":   { icon: "📦", color: "slate",    description: "Open-source contributions or stars" },
  "Media Coverage":    { icon: "📰", color: "rose",     description: "Major press or analyst coverage" },
  "Conference":        { icon: "🎤", color: "purple",   description: "Speaking at or hosting events" },
};

export function getSignalTypeConfig(type: SignalType) {
  return SIGNAL_TYPE_CONFIG[type] || { icon: "📌", color: "gray", description: "Signal" };
}
