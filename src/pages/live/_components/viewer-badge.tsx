import { Eye, Radio } from "lucide-react";
import { formatViewers } from "@/lib/mock-data.ts";
import { motion } from "motion/react";

type ViewerBadgeProps = {
  viewerCount: number;
  isLive: boolean;
};

export default function ViewerBadge({ viewerCount, isLive }: ViewerBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {isLive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 bg-red-600 text-white rounded-full px-3 py-1.5 shadow-lg"
        >
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span className="text-xs font-bold">LIVE</span>
        </motion.div>
      )}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full px-3 py-1.5"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="text-xs font-bold">{formatViewers(viewerCount)}</span>
      </motion.div>
    </div>
  );
}
