import { motion } from "motion/react";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { type Listing, formatPrice } from "@/lib/mock-data.ts";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

type SellerListingCardProps = {
  listing: Listing;
  index: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  camels: "إبل",
  sheep: "أغنام",
  goats: "ماعز",
  horses: "خيول",
  cattle: "أبقار",
};

export default function SellerListingCard({ listing, index }: SellerListingCardProps) {
  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
    locale: ar,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card
        className="flex-row overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
        onClick={() => toast.info("Coming soon in a future milestone!")}
      >
        <div className="relative w-28 shrink-0">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-white border-0 text-[8px] px-1.5 py-0.5">
            {CATEGORY_LABELS[listing.category] ?? listing.category}
          </Badge>
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-bold text-xs leading-tight line-clamp-1 text-card-foreground">
              {listing.title}
            </h3>
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
              {listing.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-primary text-sm font-bold tabular-nums">
              {formatPrice(listing.price)}
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
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
