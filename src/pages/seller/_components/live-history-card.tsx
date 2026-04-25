import { motion } from "motion/react";
import { type LiveStream, formatPrice, formatViewers } from "@/lib/mock-data.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Eye, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LiveHistoryCardProps = {
  stream: LiveStream;
  index: number;
};

export default function LiveHistoryCard({ stream, index }: LiveHistoryCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      onClick={() => navigate(`/live/${stream._id}`)}
      className="relative w-40 sm:w-48 shrink-0 aspect-[9/14] rounded-xl overflow-hidden cursor-pointer group"
    >
      <img
        src={stream.thumbnailUrl}
        alt={stream.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Live / Replay badge */}
      <div className="absolute top-2 right-2">
        {stream.isLive ? (
          <Badge className="bg-red-600 text-white border-0 gap-1 px-2 py-0.5 text-[9px] font-bold animate-pulse">
            <Radio className="h-2.5 w-2.5" />
            LIVE
          </Badge>
        ) : (
          <Badge className="bg-black/50 backdrop-blur-sm text-white/80 border-0 text-[9px] px-2 py-0.5">
            إعادة
          </Badge>
        )}
      </div>

      {/* Viewers */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white rounded-full px-2 py-0.5 text-[9px]">
        <Eye className="h-2.5 w-2.5" />
        {formatViewers(stream.viewerCount)}
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-white text-xs font-bold line-clamp-2 leading-tight">
          {stream.title}
        </p>
        <p className="text-primary text-xs font-bold mt-1 tabular-nums">
          {formatPrice(stream.currentBid)}
        </p>
      </div>
    </motion.div>
  );
}
