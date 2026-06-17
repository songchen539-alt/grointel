import { getScoreColor, getScoreBg } from "@/lib/utils";

export default function GrowthScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-16 w-16 text-lg",
    md: "h-24 w-24 text-3xl",
    lg: "h-32 w-32 text-4xl",
  };

  const labelSizes = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl border ${getScoreBg(score)} ${sizeClasses[size]}`}>
      <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
      <span className={`text-gray-500 ${labelSizes[size]}`}>/100</span>
    </div>
  );
}
