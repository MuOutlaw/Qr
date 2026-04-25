import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Share2, Heart, Volume2, VolumeX, Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated } from "convex/react";
import LiveChat from "./_components/live-chat.tsx";
import BidOverlay from "./_components/bid-overlay.tsx";
import ViewerBadge from "./_components/viewer-badge.tsx";
import VideoPlayer from "./_components/video-player.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { useAgora } from "@/hooks/use-agora.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

interface WatchViewProps {
  channelName: string;
  token: string;
  appId: string;
  streamId: string;
}

function WatchView({ channelName, token, appId, streamId }: WatchViewProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const updateViewerCount = useMutation(api.livestream.mutations.updateViewerCount);

  const { connectionState, remoteUsers, isMuted, toggleMute } = useAgora({
    appId,
    channel: channelName,
    token,
    uid: Math.floor(Math.random() * 100000),
    role: "subscriber",
  });

  // Update viewer count
  useEffect(() => {
    updateViewerCount({ streamId: streamId as Id<"liveStreams">, delta: 1 }).catch(() => null);
    return () => {
      updateViewerCount({ streamId: streamId as Id<"liveStreams">, delta: -1 }).catch(() => null);
    };
  }, [streamId, updateViewerCount]);

  const remoteVideoTrack = remoteUsers[0]?.videoTrack;
  const viewerCount = remoteUsers.length;

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden" dir="rtl">
      {/* Video */}
      <div className="absolute inset-0">
        {remoteVideoTrack ? (
          <VideoPlayer track={remoteVideoTrack} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-4">
            {connectionState === "connecting" ? (
              <>
                <Skeleton className="w-full h-full absolute inset-0" />
                <p className="text-white/60 text-sm z-10 relative">جارٍ الاتصال بالبث...</p>
              </>
            ) : (
              <p className="text-white/40 text-sm">في انتظار البث...</p>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      </div>

      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <ViewerBadge viewerCount={viewerCount} isLive={connectionState === "connected"} />
      </motion.div>

      {/* Side Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3"
      >
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all"
        >
          <Heart className={`h-5 w-5 transition-colors ${isLiked ? "text-red-500 fill-red-500" : "text-white"}`} />
        </button>
        <button
          onClick={() => toast.success("تم نسخ رابط البث")}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-all"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          onClick={toggleMute}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-all"
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-red-400" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </motion.div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="flex flex-col md:flex-row md:items-end gap-0 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex-1 h-48 md:h-64"
          >
            <LiveChat messages={[]} className="h-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="md:w-80 px-3 pb-4 md:pb-6"
          >
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <BidOverlay currentBid={0} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StreamLoader({ streamId }: { streamId: string }) {
  const navigate = useNavigate();
  const generateToken = useAction(api.livestream.agoraToken.generateToken);
  const [config, setConfig] = useState<{ appId: string; token: string; channelName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get stream info from DB
  const streamInfo = useQuery(api.livestream.mutations.getActiveStreams);
  const stream = streamInfo?.find((s) => s._id === streamId);

  useEffect(() => {
    if (!stream?.channelName) return;

    generateToken({
      channelName: stream.channelName,
      uid: Math.floor(Math.random() * 100000),
      role: "subscriber",
    })
      .then(({ token, appId }) => {
        setConfig({ appId, token, channelName: stream.channelName });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "فشل الاتصال بالبث");
      });
  }, [stream?.channelName, generateToken]);

  if (error) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white" dir="rtl">
        <Radio className="h-10 w-10 text-red-500" />
        <p className="text-lg font-bold">تعذّر الاتصال بالبث</p>
        <p className="text-white/50 text-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm cursor-pointer hover:opacity-90"
        >
          العودة
        </button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <WatchView
      channelName={config.channelName}
      token={config.token}
      appId={config.appId}
      streamId={streamId}
    />
  );
}

export default function LiveStreamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (id === "new") {
    navigate("/live/start", { replace: true });
    return null;
  }

  if (!id) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <p>البث غير موجود</p>
      </div>
    );
  }

  return (
    <Authenticated>
      <StreamLoader streamId={id} />
    </Authenticated>
  );
}
