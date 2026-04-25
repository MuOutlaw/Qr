import { motion } from "motion/react";
import { Gavel, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { type Auction, formatPrice } from "@/lib/mock-data.ts";
import CountdownTimer from "./countdown-timer.tsx";
import { toast } from "sonner";

type AuctionCardProps = {
  auction: Auction;
  index: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  camels: "إبل",
  sheep: "أغنام",
  goats: "ماعز",
  horses: "خيول",
  cattle: "أبقار",
};

export default function AuctionCard({ auction, index }: AuctionCardProps) {
  const handleBid = () => {
    toast.info("Coming soon in a future milestone!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="pt-0 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Category badge */}
          <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0 text-[10px]">
            {CATEGORY_LABELS[auction.category] ?? auction.category}
          </Badge>

          {/* Countdown */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
              <p className="text-white/60 text-[9px] mb-0.5">ينتهي خلال</p>
              <CountdownTimer
                endsAt={auction.endsAt}
                className="[&_span]:bg-white/20 [&_span]:text-white [&_.text-muted-foreground]:text-white/40"
              />
            </div>
          </div>

          {/* Bid count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white rounded-full px-2 py-1 text-[10px]">
            <Users className="h-3 w-3" />
            {auction.bidCount} مزايدة
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-card-foreground">
            {auction.title}
          </h3>

          {/* Seller + Location */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{auction.sellerName}</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {auction.location}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">المزايدة الحالية</p>
              <p className="text-primary text-lg font-bold tabular-nums">
                {formatPrice(auction.currentBid)}
              </p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground">بدأت من</p>
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(auction.startingBid)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleBid}
            className="w-full rounded-xl font-bold gap-2 cursor-pointer"
          >
            <Gavel className="h-4 w-4" />
            زايد الآن
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
