import { useState } from "react";
import { motion } from "motion/react";
import { Gavel } from "lucide-react";
import AuctionCard from "./_components/auction-card.tsx";
import AuctionFilters from "./_components/auction-filters.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

type CategoryFilter = "all" | "camels" | "sheep" | "goats" | "horses" | "cattle";

export default function AuctionsPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [location, setLocation] = useState("");

  const allAuctions = useQuery(api.auctions.queries.listAll);

  const auctions = allAuctions === undefined
    ? undefined
    : allAuctions.filter((a) => {
        if (category !== "all" && a.category !== category) return false;
        if (location && a.city !== location) return false;
        return true;
      });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Page Title */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gavel className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">المزادات</h1>
            <p className="text-[10px] text-muted-foreground leading-none">
              {auctions === undefined ? "..." : `${auctions.length} مزاد`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-4">
        <AuctionFilters
          category={category}
          onCategoryChange={(v) => setCategory(v as CategoryFilter)}
          location={location}
          onLocationChange={setLocation}
        />
      </div>

      {/* Grid */}
      <div className="px-4 py-4">
        {auctions === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Gavel /></EmptyMedia>
              <EmptyTitle>لا توجد مزادات</EmptyTitle>
              <EmptyDescription>
                لا توجد مزادات نشطة حالياً. تحقق لاحقاً.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auctions.map((auction, i) => (
              <AuctionCard key={auction._id} auction={auction} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
