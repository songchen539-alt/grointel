import { SignalType, SignalPriority, getSignalTypeConfig } from "./SignalTypes";

const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
  emerald:  { bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  blue:     { bg: "bg-blue-500/15",    text: "text-blue-300",    dot: "bg-blue-400" },
  violet:   { bg: "bg-violet-500/15",  text: "text-violet-300",  dot: "bg-violet-400" },
  amber:    { bg: "bg-amber-500/15",   text: "text-amber-300",   dot: "bg-amber-400" },
  cyan:     { bg: "bg-cyan-500/15",    text: "text-cyan-300",    dot: "bg-cyan-400" },
  green:    { bg: "bg-green-500/15",   text: "text-green-300",   dot: "bg-green-400" },
  orange:   { bg: "bg-orange-500/15",  text: "text-orange-300",  dot: "bg-orange-400" },
  slate:    { bg: "bg-slate-500/15",   text: "text-slate-300",   dot: "bg-slate-400" },
  rose:     { bg: "bg-rose-500/15",    text: "text-rose-300",    dot: "bg-rose-400" },
  purple:   { bg: "bg-purple-500/15",  text: "text-purple-300",  dot: "bg-purple-400" },
  gray:     { bg: "bg-gray-500/15",    text: "text-gray-400",    dot: "bg-gray-400" },
};

const priorityBorder: Record<SignalPriority, string> = {
  High:   "border-l-2 border-l-rose-500/60",
  Medium: "border-l-2 border-l-amber-500/40",
  Low:    "border-l-2 border-l-gray-500/20",
};

export function SignalBadge({ type }: { type: SignalType }) {
  const config = getSignalTypeConfig(type);
  const c = colorMap[config.color] || colorMap.gray;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md ${c.bg} ${c.text} px-2 py-0.5 text-[11px] font-medium`}>
      <span className="text-xs">{config.icon}</span>
      {type}
    </span>
  );
}

export function SignalPriorityBadge({ priority }: { priority: SignalPriority }) {
  const colors: Record<SignalPriority, string> = {
    High:   "bg-rose-500/15 text-rose-300 border-rose-500/30",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Low:    "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return <span className={`border rounded-md px-2 py-0.5 text-[10px] font-medium ${colors[priority]}`}>{priority}</span>;
}

export function SignalCard({ signal, compact }: { signal: import("./SignalTypes").FeedSignal; compact?: boolean }) {
  const config = getSignalTypeConfig(signal.type);
  const c = colorMap[config.color] || colorMap.gray;
  const time = new Date(signal.publishedAt);
  const timeStr = time.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 ${priorityBorder[signal.priority]}`}>
        <span className="text-base">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{signal.companyName}</span>
            <SignalBadge type={signal.type} />
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{signal.summary}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SignalPriorityBadge priority={signal.priority} />
          <span className="text-[10px] text-gray-600">{timeStr}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-all ${priorityBorder[signal.priority]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>
            <span className="text-base">{config.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{signal.companyName}</h3>
              <SignalBadge type={signal.type} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{timeStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">{signal.confidence}%</span>
          <SignalPriorityBadge priority={signal.priority} />
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-400 leading-relaxed">{signal.summary}</p>
    </div>
  );
}

export function SignalFeed({ signals }: { signals: import("./SignalTypes").FeedSignal[] }) {
  return (
    <div className="space-y-2.5">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
      {signals.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">No signals found.</div>
      )}
    </div>
  );
}
