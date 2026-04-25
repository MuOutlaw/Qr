import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  SlidersHorizontal,
  Gavel,
  Newspaper,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce.ts";

const RECENT_KEY = "souq_recent_searches";

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const existing = getRecentSearches().filter((s) => s !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...existing].slice(0, 8)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

const TRENDING_SEARCHES = [
  "إبل مجاهيم",
  "خيول عربية",
  "أغنام نعيمي",
  "أبقار حلوب",
  "ماعز حجازي",
];

const CATEGORIES = [
  { value: "all", label: "الكل" },
  { value: "camels", label: "إبل" },
  { value: "sheep", label: "أغنام" },
  { value: "goats", label: "ماعز" },
  { value: "horses", label: "خيول" },
  { value: "cattle", label: "أبقار" },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);

  const [debouncedQuery] = useDebounce(query, 400);

  useEffect(() => {
    if (!initialQuery) {
      inputRef.current?.focus();
    }
  }, [initialQuery]);

  const searchResults = useQuery(
    api.listings.queries.search,
    debouncedQuery.trim()
      ? {
          query: debouncedQuery.trim(),
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        }
      : "skip"
  );

  const auctionResults = useQuery(
    api.auctions.queries.listAll,
    debouncedQuery.trim() ? {} : "skip"
  );

  const filteredAuctions = auctionResults?.filter((a) =>
    a.title.includes(debouncedQuery) ||
    a.title.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const handleSearch = (term: string) => {
    const t = term.trim();
    setQuery(t);
    if (t) {
      saveRecentSearch(t);
      setRecentSearches(getRecentSearches());
      setSearchParams({ q: t });
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setSearchParams({});
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (term: string) => {
    const updated = getRecentSearches().filter((s) => s !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const handleClearAll = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const isLoading = debouncedQuery.trim() && searchResults === undefined;
  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Search bar + filters - no duplicate header needed, AppLayout has top bar */}
      <div className="bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSearchParams({ q: e.target.value.trim() });
                } else {
                  setSearchParams({});
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(query);
              }}
              placeholder="ابحث عن مواشي، إبل، خيول..."
              className="w-full bg-muted rounded-xl pr-9 pl-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            {query && (
              <button
                onClick={handleClearQuery}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex-shrink-0 p-2 rounded-xl transition-colors cursor-pointer",
              showFilters || selectedCategory !== "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border"
            >
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">الفئة</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                        selectedCategory === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Body */}
      <div className="px-4 pb-8 pt-4">
        {/* No query: trending + recent */}
        {!hasQuery && (
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">الأكثر بحثاً</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2 rounded-full bg-muted text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">عمليات البحث الأخيرة</span>
                  </div>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                  >
                    مسح الكل
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-none group"
                    >
                      <button
                        onClick={() => handleSearch(term)}
                        className="flex items-center gap-3 flex-1 text-right cursor-pointer"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {term}
                        </span>
                      </button>
                      <button
                        onClick={() => handleRemoveRecent(term)}
                        className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Results */}
        {hasQuery && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Listings */}
            {searchResults && searchResults.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Newspaper className="h-3.5 w-3.5" />
                  {searchResults.length} إعلان
                </p>
                <div className="space-y-2">
                  {searchResults.map((listing) => (
                    <button
                      key={listing._id}
                      onClick={() => navigate(`/listing/${listing._id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-right group"
                    >
                      <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-muted">
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{listing.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{listing.city}</p>
                        <p className="text-xs text-primary font-semibold mt-1">{formatPrice(listing.price)}</p>
                      </div>
                      <Newspaper className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auctions */}
            {filteredAuctions && filteredAuctions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Gavel className="h-3.5 w-3.5" />
                  {filteredAuctions.length} مزاد
                </p>
                <div className="space-y-2">
                  {filteredAuctions.map((auction) => (
                    <button
                      key={auction._id}
                      onClick={() => navigate("/auctions")}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-right group"
                    >
                      <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-muted">
                        {auction.images?.[0] && (
                          <img
                            src={auction.images[0]}
                            alt={auction.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{auction.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{auction.city}</p>
                        <p className="text-xs text-primary font-semibold mt-1">
                          {formatPrice(auction.currentPrice)}
                        </p>
                      </div>
                      <Gavel className="h-4 w-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {searchResults?.length === 0 && (!filteredAuctions || filteredAuctions.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-3 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground">لا توجد نتائج</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  لم نجد نتائج لـ "{debouncedQuery}". جرب كلمات مختلفة.
                </p>
                <button
                  onClick={handleClearQuery}
                  className="mt-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
                >
                  بحث جديد
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
