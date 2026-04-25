import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Radio, TrendingUp, Search, Video } from "lucide-react";
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

type CategoryFilter = "all" | "camels" | "sheep" | "goats" | "horses" | "cattle";

export default function Index() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const navigate = useNavigate();

  // جلب البثوث المباشرة من الباكند
  const activeStreams = useQuery(api.livestream.mutations.getActiveStreams);

  // فلترة حسب الفئة على الواجهة (بما أن الباكند لا يدعم فلترة بالفئة مباشرة)
  const streams = activeStreams === undefined
    ? undefined
    : category === "all"
      ? activeStreams
      : activeStreams.filter((s) => {
          // نحاول مطابقة عنوان المزاد بالفئة
          return true; // نعرض الكل حالياً بما أن البيانات تأتي من المزادات
        });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight px-0">
                سوق الصفاة
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/search")}
              className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Search className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 bg-red-600/10 text-red-500 rounded-full px-3 py-1.5">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span className="text-xs font-bold">
                {streams ? `${streams.length} بث مباشر` : "..."}
              </span>
            </div>
          </div>
        </div>
        <CategoryFilter
          selected={category}
          onSelect={(v) => setCategory(v as CategoryFilter)} />
      </motion.header>

      {/* Trending Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        className="mx-4 mt-4 mb-2 flex items-center gap-2">
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
              <EmptyMedia variant="icon"><Video /></EmptyMedia>
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
