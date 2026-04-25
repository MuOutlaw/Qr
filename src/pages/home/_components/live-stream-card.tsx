import { motion } from "motion/react";
import { Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useNavigate } from "react-router-dom";

type LiveStreamData = {
  _id: string;
  auctionId: string;
  hostId: string;
  channelName: string;
  status: string;
  viewerCount: number;
  startedAt: string;
  auctionTitle: string;
  auctionImage: string | null;
  hostName: string;
};

type LiveStreamCardProps = {
  stream: LiveStreamData;
  index: number;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1599475504246-11c1217748c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

function formatViewers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export default function LiveStreamCard({ stream, index }: LiveStreamCardProps) {
  const navigate = useNavigate();

  const handleJoinLive = () => {
    navigate(`/live/${stream.auctionId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="relative w-full aspect-[9/14] sm:aspect-[9/12] rounded-2xl overflow-hidden group cursor-pointer"
      onClick={handleJoinLive}
    >
      {/* Thumbnail */}
      <img
        src={stream.auctionImage ?? FALLBACK_IMAGE}
        alt={stream.auctionTitle}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <Badge className="bg-red-600 text-white border-0 gap-1 px-2.5 py-1 text-xs font-bold animate-pulse">
          <Radio className="h-3 w-3" />
          LIVE
        </Badge>
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white rounded-full px-2.5 py-1 text-xs">
          <Eye className="h-3 w-3" />
          {formatViewers(stream.viewerCount)}
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        {/* Host info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-white font-bold">
            {stream.hostName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {stream.hostName}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white text-base font-bold leading-tight line-clamp-2">
          {stream.auctionTitle}
        </h3>

        {/* CTA */}
        <Button
          size="sm"
          className="w-full rounded-full font-bold shadow-lg cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleJoinLive();
          }}
        >
          انضم للبث
        </Button>
      </div>
    </motion.div>
  );
}
