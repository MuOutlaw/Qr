import { useState } from "react";
import { motion } from "motion/react";
import { Newspaper, LayoutGrid, List } from "lucide-react";
import ListingCard from "./_components/listing-card.tsx";
import ClassifiedFilters from "./_components/classified-filters.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";
import { cn } from "@/lib/utils.ts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { usePaginatedQuery } from "convex/react";
import { useNavigate } from "react-router-dom";

type CategoryFilter = "all" | "camels" | "sheep" | "goats" | "horses" | "cattle";
type ViewMode = "grid" | "list";

export default function ClassifiedsPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [location, setLocation] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const navigate = useNavigate();

  const { results: listings, status, loadMore } = usePaginatedQuery(
    api.listings.queries.list,
    {
      category: category !== "all" ? category : undefined,
      city: location || undefined,
      sortBy: "newest",
    },
    { initialNumItems: 12 }
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">الإعلانات</h1>
              <p className="text-[10px] text-muted-foreground leading-none">
                {status === "LoadingFirstPage" ? "..." : `${listings.length} إعلان`}
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md cursor-pointer", view === "grid" && "bg-background shadow-sm")}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md cursor-pointer", view === "list" && "bg-background shadow-sm")}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Filters */}
      <div className="px-4 pt-4">
        <ClassifiedFilters
          category={category}
          onCategoryChange={(v) => setCategory(v as CategoryFilter)}
          location={location}
          onLocationChange={setLocation}
          listingType=""
          onListingTypeChange={() => {}}
        />
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {status === "LoadingFirstPage" ? (
          <div className={cn(
            view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={view === "grid" ? "aspect-[3/4] rounded-xl" : "h-28 rounded-xl"} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Newspaper /></EmptyMedia>
              <EmptyTitle>لا توجد إعلانات</EmptyTitle>
              <EmptyDescription>لم يتم نشر أي إعلان بعد. كن أول من يضيف إعلاناً!</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => navigate("/create")}>أضف إعلان</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className={cn(
              view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"
            )}>
              {listings.map((listing, i) => (
                <ListingCard key={listing._id} listing={listing} index={i} view={view} />
              ))}
            </div>
            {status === "CanLoadMore" && (
              <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={() => loadMore(12)} className="cursor-pointer">
                  تحميل المزيد
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
