import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  SlidersHorizontal,
  Radio,
  Gavel,
  Newspaper,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  MOCK_LIVE_STREAMS,
  MOCK_AUCTIONS,
  MOCK_LISTINGS,
  CATEGORIES,
  LOCATIONS,
  formatPrice,
  type LiveStream,
  type Auction,
  type Listing,
} from "@/lib/mock-data.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

// ─── Local Storage for recent searches ──────────────────────────────────────
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

// ─── Result type union ────────────────────────────────────────────────────────
type ResultItem =
  | { kind: "stream"; data: LiveStream }
  | { kind: "auction"; data: Auction }
  | { kind: "listing"; data: Listing };

type ContentTab = "all" | "streams" | "auctions" | "listings";

const TRENDING_SEARCHES = [
  "إبل مجاهيم",
  "خيول عربية",
  "أغنام نعيمي",
  "أبقار حلوب",
  "ماعز حجازي",
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [committed, setCommitted] = useState(initialQuery);
  const [tab, setTab] = useState<ContentTab>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);
  const [isSearching, setIsSearching] = useState(false);

  // Focus input on mount
  useEffect(() => {
    if (!initialQuery) {
      inputRef.current?.focus();
    }
  }, [initialQuery]);

  // Simulate search latency
  useEffect(() => {
    if (!committed) return;
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 350);
    return () => clearTimeout(t);
  }, [committed]);

  const handleSearch = (term: string) => {
    const t = term.trim();
    setQuery(t);
    setCommitted(t);
    if (t) {
      saveRecentSearch(t);
      setRecentSearches(getRecentSearches());
      setSearchParams({ q: t });
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setCommitted("");
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

  // ── Search logic ────────────────────────────────────────────────────────────
  const results = useMemo<ResultItem[]>(() => {
    if (!committed) return [];
    const q = committed.toLowerCase();

    const catMatch = (c: string) => selectedCategory === "all" || c === selectedCategory;
    const locMatch = (l: string) => selectedLocation === "all" || l === selectedLocation;

    const streams: ResultItem[] = MOCK_LIVE_STREAMS.filter(
      (s) =>
        (s.title.includes(committed) || s.sellerName.includes(committed) || s.title.toLowerCase().includes(q)) &&
        catMatch(s.category) &&
        locMatch(s.location)
    ).map((s) => ({ kind: "stream" as const, data: s }));

    const auctions: ResultItem[] = MOCK_AUCTIONS.filter(
      (a) =>
        (a.title.includes(committed) || a.sellerName.includes(committed) || a.title.toLowerCase().includes(q)) &&
        catMatch(a.category) &&
        locMatch(a.location)
    ).map((a) => ({ kind: "auction" as const, data: a }));

    const listings: ResultItem[] = MOCK_LISTINGS.filter(
      (l) =>
        (l.title.includes(committed) || l.sellerName.includes(committed) || l.description.includes(committed) || l.title.toLowerCase().includes(q)) &&
        catMatch(l.category) &&
        locMatch(l.location)
    ).map((l) => ({ kind: "listing" as const, data: l }));

    if (tab === "streams") return streams;
    if (tab === "auctions") return auctions;
    if (tab === "listings") return listings;
    return [...streams, ...auctions, ...listings];
  }, [committed, tab, selectedCategory, selectedLocation]);

  const streamCount = useMemo(
    () => results.filter((r) => r.kind === "stream").length,
    [results]
  );
  const auctionCount = useMemo(
    () => results.filter((r) => r.kind === "auction").length,
    [results]
  );
  const listingCount = useMemo(
    () => results.filter((r) => r.kind === "listing").length,
    [results]
  );

  const activeFilters =
    (selectedCategory !== "all" ? 1 : 0) + (selectedLocation !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* ── Search Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

          {/* Filters button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "relative flex-shrink-0 p-2 rounded-xl transition-colors cursor-pointer",
              showFilters || activeFilters > 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
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
              <div className="px-4 py-3 space-y-3">
                {/* Category filter */}
                <div>
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
                {/* Location filter */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">المنطقة</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedLocation("all")}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                        selectedLocation === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      الكل
                    </button>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                          selectedLocation === loc
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedLocation("all");
                    }}
                    className="text-xs text-red-500 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs — only when results exist */}
        {committed && !isSearching && results.length > 0 && (
          <div className="flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
            {(
              [
                { key: "all", label: "الكل", count: results.length },
                { key: "streams", label: "بث مباشر", count: streamCount },
                { key: "auctions", label: "مزادات", count: auctionCount },
                { key: "listings", label: "إعلانات", count: listingCount },
              ] as { key: ContentTab; label: string; count: number }[]
            ).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                  tab === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                {count > 0 && (
                  <span className="mr-1 opacity-70">({count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-8 pt-4">
        {/* Empty state — no query yet */}
        {!committed && (
          <div className="space-y-6">
            {/* Trending */}
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

            {/* Recent searches */}
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

        {/* Searching skeleton */}
        {committed && isSearching && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* No results */}
        {committed && !isSearching && results.length === 0 && (
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
              لم نجد نتائج لـ "{committed}". جرب كلمات مختلفة أو تغيير الفلاتر.
            </p>
            <button
              onClick={handleClearQuery}
              className="mt-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
            >
              بحث جديد
            </button>
          </motion.div>
        )}

        {/* Results list */}
        {committed && !isSearching && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground mb-1">
              {results.length} نتيجة لـ "{committed}"
            </p>
            {results.map((item, i) => (
              <motion.div
                key={`${item.kind}-${item.data._id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                {item.kind === "stream" && (
                  <StreamResultCard stream={item.data} />
                )}
                {item.kind === "auction" && (
                  <AuctionResultCard auction={item.data} />
                )}
                {item.kind === "listing" && (
                  <ListingResultCard listing={item.data} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Stream Result Card ──────────────────────────────────────────────────────
function StreamResultCard({ stream }: { stream: LiveStream }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/live/${stream._id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-right group"
    >
      <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden">
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {stream.isLive && (
          <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-red-600 rounded-full px-1.5 py-0.5">
            <Radio className="h-2.5 w-2.5 text-white animate-pulse" />
            <span className="text-[9px] text-white font-bold">مباشر</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{stream.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{stream.sellerName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-primary font-semibold">{formatPrice(stream.currentBid)}</span>
          <span className="text-xs text-muted-foreground">{stream.location}</span>
        </div>
      </div>
      <Radio className="h-4 w-4 text-red-500 flex-shrink-0" />
    </button>
  );
}

// ─── Auction Result Card ─────────────────────────────────────────────────────
function AuctionResultCard({ auction }: { auction: Auction }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/auctions")}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-right group"
    >
      <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{auction.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{auction.sellerName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-primary font-semibold">{formatPrice(auction.currentBid)}</span>
          <span className="text-xs text-muted-foreground">{auction.location}</span>
        </div>
      </div>
      <Gavel className="h-4 w-4 text-primary flex-shrink-0" />
    </button>
  );
}

// ─── Listing Result Card ─────────────────────────────────────────────────────
function ListingResultCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/classifieds")}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-right group"
    >
      <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{listing.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{listing.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-primary font-semibold">{formatPrice(listing.price)}</span>
          <span className="text-xs text-muted-foreground">{listing.location}</span>
        </div>
      </div>
      <Newspaper className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
