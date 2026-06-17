// Deprecated - MRI report now renders inline in /analyze page.
// This component is kept for reference, not used by any active page.
import GrowthScore from "./GrowthScore";
import ChannelBadge from "./ChannelBadge";
import { Globe, MapPin, Target, Calendar, ArrowRight } from "lucide-react";

export default function AnalysisSection({ score = 73 }: { score?: number }) {
  return (
    <div className="space-y-8 text-center py-12">
      <GrowthScore score={score} size="lg" />
      <p className="text-gray-500 text-sm">MRI report will render here in the full version.</p>
    </div>
  );
}
