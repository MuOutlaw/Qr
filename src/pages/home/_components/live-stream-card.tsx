import { motion } from "motion/react";
import { Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { type LiveStream, formatPrice, formatViewers } from "@/lib/mock-data.ts";
import { useNavigate } from "react-router-dom";

type LiveStreamCardProps = {
  stream: LiveStream;
  index: number;
};

export default function LiveStreamCard({ stream, index }: LiveStreamCardProps) {
  const navigate = useNavigate();

  const handleJoinLive = () => {
    navigate(`/live/${stream._id}`);
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
        src={stream.thumbnailUrl}
        alt={stream.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        {stream.isLive && (
          <Badge className="bg-red-600 text-white border-0 gap-1 px-2.5 py-1 text-xs font-bold animate-pulse">
            <Radio className="h-3 w-3" />
            LIVE
          </Badge>
        )}
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white rounded-full px-2.5 py-1 text-xs">
          <Eye className="h-3 w-3" />
          {formatViewers(stream.viewerCount)}
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        {/* Seller info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-white font-bold">
            {stream.sellerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {stream.sellerName}
            </p>
            <p className="text-white/60 text-xs">{stream.location}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white text-base font-bold leading-tight line-clamp-2">
          {stream.title}
        </h3>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-white/50 text-xs">السعر الحالي</p>
            <p className="text-primary text-lg font-bold tabular-nums">
              {formatPrice(stream.currentBid)}
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full px-5 font-bold shadow-lg cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleJoinLive();
            }}
          >
            انضم للبث
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
