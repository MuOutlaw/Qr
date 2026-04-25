import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Share2, Heart, MoreVertical, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useLiveStream, useChatMessages } from "@/hooks/use-mock-data.ts";
import LiveChat from "./_components/live-chat.tsx";
import BidOverlay from "./_components/bid-overlay.tsx";
import ViewerBadge from "./_components/viewer-badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";

export default function LiveStreamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stream = useLiveStream(id === "new" ? "ls1" : (id ?? "ls1"));
  const chatMessages = useChatMessages(id === "new" ? "ls1" : (id ?? "ls1"));
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Handle "new" route — coming soon
  if (id === "new") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-4" dir="rtl">
        <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center">
          <Volume2 className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold">البث المباشر قريباً!</h2>
        <p className="text-sm text-white/60 text-center max-w-xs">
          خاصية البث المباشر قيد التطوير وستكون متاحة قريباً
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const handleShare = () => {
    toast.success("تم نسخ رابط البث");
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden" dir="rtl">
      {/* Video / Thumbnail Background */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </motion.div>

      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between"
      >
        {/* Right side - back + seller info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 cursor-pointer transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center text-white font-bold text-sm">
              {stream.sellerName.charAt(0)}
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">
                {stream.sellerName}
              </p>
              <p className="text-white/50 text-xs">{stream.location}</p>
            </div>
          </div>
        </div>

        {/* Left side - badges */}
        <ViewerBadge viewerCount={stream.viewerCount} isLive={stream.isLive} />
      </motion.div>

      {/* Side Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3"
      >
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all hover:bg-black/60"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isLiked ? "text-red-500 fill-red-500" : "text-white"
            }`}
          />
        </button>
        <button
          onClick={handleShare}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer transition-all hover:bg-black/60"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer transition-all hover:bg-black/60"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={() => toast.info("Coming soon in a future milestone!")}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer transition-all hover:bg-black/60"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Bottom Panel - Chat + Bid */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Stream title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
          className="px-4 mb-2"
        >
          <h1 className="text-white text-lg font-bold">{stream.title}</h1>
        </motion.div>

        {/* Two-column layout on desktop: chat left, bid right */}
        <div className="flex flex-col md:flex-row md:items-end gap-0 md:gap-4">
          {/* Live Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
            className="flex-1 h-48 md:h-64"
          >
            <LiveChat
              messages={chatMessages ?? []}
              className="h-full"
            />
          </motion.div>

          {/* Bid Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3, ease: "easeOut" }}
            className="md:w-80 px-3 pb-4 md:pb-6"
          >
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <BidOverlay currentBid={stream.currentBid} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
