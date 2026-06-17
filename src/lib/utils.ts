export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-blue-400";
  if (score >= 70) return "text-amber-400";
  return "text-gray-400";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 80) return "bg-blue-500/10 border-blue-500/30";
  if (score >= 70) return "bg-amber-500/10 border-amber-500/30";
  return "bg-gray-500/10 border-gray-500/30";
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "High": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "Low": return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    default: return "text-gray-400 bg-gray-500/10 border-gray-500/30";
  }
}
