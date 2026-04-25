import { motion } from "motion/react";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { type Listing, formatPrice } from "@/lib/mock-data.ts";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

type ListingCardProps = {
  listing: Listing;
  index: number;
  view: "grid" | "list";
};

const CATEGORY_LABELS: Record<string, string> = {
  camels: "إبل",
  sheep: "أغنام",
  goats: "ماعز",
  horses: "خيول",
  cattle: "أبقار",
};

const TYPE_LABELS: Record<string, string> = {
  fixed: "سعر ثابت",
  auction: "مزاد",
};

export default function ListingCard({ listing, index, view }: ListingCardProps) {
  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
    locale: ar,
  });

  const handleClick = () => {
    toast.info("Coming soon in a future milestone!");
  };

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      >
        <Card
          className="flex-row overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
          onClick={handleClick}
        >
          {/* Image */}
          <div className="relative w-28 sm:w-36 shrink-0">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white border-0 text-[9px] px-1.5 py-0.5">
              {CATEGORY_LABELS[listing.category] ?? listing.category}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-bold text-sm leading-tight line-clamp-1 text-card-foreground">
                {listing.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {listing.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-primary text-base font-bold tabular-nums">
                {formatPrice(listing.price)}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  {listing.location}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card
        className="pt-0 overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0 text-[10px]">
            {CATEGORY_LABELS[listing.category] ?? listing.category}
          </Badge>

          <Badge
            className={`absolute top-3 left-3 border-0 text-[10px] ${
              listing.type === "auction"
                ? "bg-primary text-primary-foreground"
                : "bg-white/80 text-foreground backdrop-blur-sm"
            }`}
          >
            {TYPE_LABELS[listing.type]}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-card-foreground">
            {listing.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {listing.description}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-primary text-lg font-bold tabular-nums">
              {formatPrice(listing.price)}
            </p>
            <span className="text-muted-foreground text-[10px]">
              {listing.sellerName}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
