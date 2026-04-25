import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { CATEGORIES, LOCATIONS } from "@/lib/mock-data.ts";
import { cn } from "@/lib/utils.ts";

type AuctionFiltersProps = {
  category: string;
  onCategoryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
};

export default function AuctionFilters({
  category,
  onCategoryChange,
  location,
  onLocationChange,
}: AuctionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCount =
    (category !== "all" ? 1 : 0) + (location !== "" ? 1 : 0);

  const clearAll = () => {
    onCategoryChange("all");
    onLocationChange("");
  };

  return (
    <div className="space-y-3">
      {/* Toggle + Active Count */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 rounded-full cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          فلترة
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </Button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground cursor-pointer"
            onClick={clearAll}
          >
            <X className="h-3.5 w-3.5" />
            مسح الكل
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              {/* Category Filter */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground">النوع</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => onCategoryChange(cat.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                        category === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground">الموقع</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onLocationChange("")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                      location === ""
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    الكل
                  </button>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => onLocationChange(loc)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                        location === loc
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
