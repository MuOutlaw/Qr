import { motion } from "motion/react";
import { MapPin, Clock, Heart } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Authenticated } from "convex/react";
import { cn } from "@/lib/utils.ts";

type ListingData = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  priceType: string;
  category: string;
  city: string;
  createdAt: string;
  isFeatured?: boolean;
  seller?: { name?: string; isVerified?: boolean } | null;
};

type ListingCardProps = {
  listing: ListingData;
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
  negotiable: "قابل للتفاوض",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1599475504246-11c1217748c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(amount);
}

function SaveButton({ listingId }: { listingId: string }) {
  const isSaved = useQuery(api.favorites.index.isSaved, { listingId: listingId as Id<"listings"> });
  const toggleSave = useMutation(api.favorites.index.toggleSave);

  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        await toggleSave({ listingId: listingId as Id<"listings"> });
      }}
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors",
        isSaved ? "bg-red-500 text-white" : "bg-black/40 backdrop-blur-sm text-white hover:bg-red-500"
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
    </button>
  );
}

export default function ListingCard({ listing, index, view }: ListingCardProps) {
  const navigate = useNavigate();
  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: ar });
  const image = listing.images[0] ?? FALLBACK_IMAGE;

  const handleClick = () => navigate(`/listings/${listing._id}`);

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
          <div className="relative w-28 sm:w-36 shrink-0">
            <img src={image} alt={listing.title} className="w-full h-full object-cover" />
            <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white border-0 text-[9px] px-1.5 py-0.5">
              {CATEGORY_LABELS[listing.category] ?? listing.category}
            </Badge>
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-bold text-sm leading-tight line-clamp-1 text-card-foreground">{listing.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{listing.description}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-primary text-base font-bold tabular-nums">{formatPrice(listing.price)}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{listing.city}</span>
                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{timeAgo}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="pt-0 overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow" onClick={handleClick}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0 text-[10px]">
            {CATEGORY_LABELS[listing.category] ?? listing.category}
          </Badge>

          <Badge className={`absolute top-3 left-3 border-0 text-[10px] bg-white/80 text-foreground backdrop-blur-sm`}>
            {TYPE_LABELS[listing.priceType] ?? listing.priceType}
          </Badge>

          {listing.isFeatured && (
            <Badge className="absolute bottom-3 right-3 bg-primary text-primary-foreground border-0 text-[9px]">
              مميز
            </Badge>
          )}

          <div className="absolute bottom-3 left-3">
            <Authenticated>
              <SaveButton listingId={listing._id} />
            </Authenticated>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-card-foreground">{listing.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>
          <div className="flex items-center justify-between">
            <p className="text-primary text-lg font-bold tabular-nums">{formatPrice(listing.price)}</p>
            <span className="text-muted-foreground text-[10px]">{listing.seller?.name ?? ""}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.city}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
