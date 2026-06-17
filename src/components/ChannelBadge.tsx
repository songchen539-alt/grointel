import { Globe, Radio, BookOpen, Code2, Trophy, MessageCircle, Star } from "lucide-react";

const channelIcons: Record<string, React.ReactNode> = {
  "Developer Communities": <Code2 className="h-3.5 w-3.5" />,
  "AI Newsletters": <BookOpen className="h-3.5 w-3.5" />,
  "Web3 Podcasts": <Radio className="h-3.5 w-3.5" />,
  "X Spaces": <Radio className="h-3.5 w-3.5" />,
  "Code2 Ecosystem & Hackathons": <Trophy className="h-3.5 w-3.5" />,
  "Telegram & Discord Communities": <MessageCircle className="h-3.5 w-3.5" />,
  "Influencer Partnerships": <Star className="h-3.5 w-3.5" />,
  "Crypto Newsletters & Research": <BookOpen className="h-3.5 w-3.5" />,
};

export default function ChannelBadge({ channel }: { channel: string }) {
  const icon = channelIcons[channel] || <Globe className="h-3.5 w-3.5" />;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300 transition-all hover:border-white/20 hover:bg-white/[0.08]">
      {icon}
      {channel}
    </span>
  );
}
