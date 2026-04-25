import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff, Radio, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useAgora } from "@/hooks/use-agora.ts";
import VideoPlayer from "./_components/video-player.tsx";
import LiveChat from "./_components/live-chat.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

interface StreamConfig {
  appId: string;
  token: string;
  channel: string;
  streamId: string;
}

function BroadcastView({ config, streamId }: { config: StreamConfig; streamId: string }) {
  const navigate = useNavigate();
  const endStream = useMutation(api.livestream.mutations.endStream);

  const { connectionState, localVideoTrack, remoteUsers, isMuted, isCameraOff, toggleMute, toggleCamera, leave } =
    useAgora({
      appId: config.appId,
      channel: config.channel,
      token: config.token,
      uid: Math.floor(Math.random() * 100000),
      role: "publisher",
    });

  const handleEndStream = async () => {
    try {
      await endStream({ streamId: streamId as Id<"liveStreams"> });
      await leave();
      toast.success("انتهى البث المباشر");
      navigate("/");
    } catch {
      toast.error("حدث خطأ أثناء إنهاء البث");
    }
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden" dir="rtl">
      {/* Local video feed */}
      <div className="absolute inset-0">
        {localVideoTrack && !isCameraOff ? (
          <VideoPlayer track={localVideoTrack} className="w-full h-full object-cover" mirror />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <VideoOff className="h-16 w-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      {/* Remote viewers count */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-red-600 text-white rounded-full px-3 py-1.5">
        <Radio className="h-3.5 w-3.5 animate-pulse" />
        <span className="text-xs font-bold">بث مباشر</span>
        <span className="text-xs">· {remoteUsers.length} مشاهد</span>
      </div>

      {/* Connection state */}
      {connectionState === "connecting" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          جارٍ الاتصال...
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-4 px-4">
        {/* Chat */}
        <div className="w-full max-w-sm h-48">
          <LiveChat messages={[]} className="h-full" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            {isMuted ? <MicOff className="h-6 w-6 text-red-400" /> : <Mic className="h-6 w-6" />}
          </button>
          <Button
            onClick={handleEndStream}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold text-base"
          >
            إنهاء البث
          </Button>
          <button
            onClick={toggleCamera}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            {isCameraOff ? <VideoOff className="h-6 w-6 text-red-400" /> : <Video className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function StartStreamForm() {
  const navigate = useNavigate();
  const [selectedAuction, setSelectedAuction] = useState<string>("");
  const [isStarting, setIsStarting] = useState(false);
  const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null);

  const canStream = useQuery(api.livestream.mutations.canStream);
  const myAuctions = useQuery(api.auctions.queries.listAll, {});
  const startStream = useMutation(api.livestream.mutations.startStream);
  const generateToken = useAction(api.livestream.agoraToken.generateToken);

  const handleStart = async () => {
    if (!selectedAuction) {
      toast.error("يرجى اختيار مزاد أولاً");
      return;
    }
    setIsStarting(true);
    try {
      const { streamId, channelName } = await startStream({
        auctionId: selectedAuction as Id<"auctions">,
      });

      const { token, appId } = await generateToken({
        channelName,
        uid: Math.floor(Math.random() * 100000),
        role: "publisher",
      });

      setStreamConfig({ appId, token, channel: channelName, streamId: streamId as string });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("حدث خطأ أثناء بدء البث");
      }
    } finally {
      setIsStarting(false);
    }
  };

  if (streamConfig) {
    return <BroadcastView config={streamConfig} streamId={streamConfig.streamId} />;
  }

  const activeAuctions = (myAuctions ?? []).filter(
    (a) => a.status === "active" || a.status === "scheduled"
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 gap-6" dir="rtl">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20 transition-colors"
      >
        <ArrowRight className="h-5 w-5" />
      </button>

      <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
        <Radio className="h-7 w-7 text-red-500" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1">بدء بث مباشر</h1>
        <p className="text-white/50 text-sm">أبدأ بيعك مباشرةً مع المزايدين</p>
      </div>

      {/* Check streaming eligibility */}
      {canStream === undefined ? (
        <Skeleton className="h-12 w-64 bg-white/10" />
      ) : !canStream.allowed ? (
        <div className="space-y-4 w-full max-w-sm">
          <div className="flex items-start gap-3 bg-red-600/20 border border-red-500/30 rounded-2xl p-4 text-right">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{canStream.reason}</p>
          </div>
          {/* Guide user to next step */}
          {(canStream.step === "phone" || canStream.step === "id" || canStream.step === "id_rejected") && (
            <Button
              onClick={() => navigate("/verification")}
              className="w-full bg-white text-black rounded-xl font-bold hover:bg-white/90"
            >
              توثيق الحساب الآن
            </Button>
          )}
          {canStream.step === "terms" && (
            <Button
              onClick={() => navigate("/stream-terms")}
              className="w-full bg-white text-black rounded-xl font-bold hover:bg-white/90"
            >
              قراءة وقبول الشروط
            </Button>
          )}
          {canStream.step === "id_pending" && (
            <p className="text-xs text-white/40 text-center">في انتظار مراجعة الإدارة...</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">اختر المزاد المرتبط بالبث</label>
            {myAuctions === undefined ? (
              <Skeleton className="h-12 w-full bg-white/10 rounded-xl" />
            ) : activeAuctions.length === 0 ? (
              <div className="text-sm text-white/40 text-center p-4 bg-white/5 rounded-xl">
                لا توجد مزادات نشطة. أنشئ مزاداً أولاً
              </div>
            ) : (
              <Select value={selectedAuction} onValueChange={setSelectedAuction}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-12">
                  <SelectValue placeholder="اختر مزاداً..." />
                </SelectTrigger>
                <SelectContent>
                  {activeAuctions.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            onClick={handleStart}
            disabled={isStarting || !selectedAuction}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold text-base"
          >
            {isStarting ? "جارٍ البدء..." : "ابدأ البث الآن"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StartLivePage() {
  return (
    <>
      <Authenticated>
        <StartStreamForm />
      </Authenticated>
      <Unauthenticated>
        <div className="h-screen bg-black flex items-center justify-center text-white" dir="rtl">
          <p>يجب تسجيل الدخول لبدء البث</p>
        </div>
      </Unauthenticated>
    </>
  );
}
