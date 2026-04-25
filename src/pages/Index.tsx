import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { TrendingUp, Video, Plus, Video as VideoIcon, FileText } from "lucide-react";
import LiveStreamCard from "./home/_components/live-stream-card.tsx";
import CategoryFilter from "./home/_components/category-filter.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import { Authenticated } from "convex/react";

type CategoryFilter = "all" | "camels" | "sheep" | "goats" | "horses" | "cattle";

export default function Index() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const navigate = useNavigate();

  const activeStreams = useQuery(api.livestream.mutations.getActiveStreams);

  const streams =
    activeStreams === undefined
      ? undefined
      : category === "all"
        ? activeStreams
        : activeStreams;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Logo + Category bar */}
      <div className="bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <VideoIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">سوق الصفاة</h1>
          </div>
          {/* Quick action buttons */}
          <Authenticated>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" />
                إعلان
              </button>
              <button
                onClick={() => navigate("/live/start")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                <VideoIcon className="h-3.5 w-3.5" />
                بث
              </button>
            </div>
          </Authenticated>
        </div>
        <CategoryFilter
          selected={category}
          onSelect={(v) => setCategory(v as CategoryFilter)}
        />
      </div>

      {/* Trending Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        className="mx-4 mt-4 mb-2 flex items-center gap-2"
      >
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-foreground">البث المباشر</span>
        <span className="text-xs text-muted-foreground">الأكثر مشاهدة الآن</span>
      </motion.div>

      {/* Live Stream Grid */}
      <div className="px-4 pb-6">
        {streams === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[9/14] sm:aspect-[9/12] rounded-2xl" />
            ))}
          </div>
        ) : streams.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Video />
              </EmptyMedia>
              <EmptyTitle>لا توجد بثوث مباشرة الآن</EmptyTitle>
              <EmptyDescription>
                لا يوجد بث مباشر حالياً. تحقق لاحقاً أو تصفح الإعلانات والمزادات.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((stream, i) => (
              <LiveStreamCard key={stream._id} stream={stream} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
