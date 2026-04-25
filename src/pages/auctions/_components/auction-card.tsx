import { motion } from "motion/react";
import { Gavel, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import CountdownTimer from "./countdown-timer.tsx";
import { useNavigate } from "react-router-dom";

type AuctionData = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  city: string;
  startingPrice: number;
  currentPrice: number;
  bidCount: number;
  endTime: string;
  status: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorVerified: boolean;
};

type AuctionCardProps = {
  auction: AuctionData;
  index: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  camels: "إبل",
  sheep: "أغنام",
  goats: "ماعز",
  horses: "خيول",
  cattle: "أبقار",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1622043935694-6279a3a93323?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(amount);
}

export default function AuctionCard({ auction, index }: AuctionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      onClick={() => navigate(`/auctions/${auction._id}`)}
    >
      <Card className="pt-0 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={auction.images[0] ?? FALLBACK_IMAGE}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white border-0 text-[10px]">
            {CATEGORY_LABELS[auction.category] ?? auction.category}
          </Badge>

          {/* Countdown */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
              <p className="text-white/60 text-[9px] mb-0.5">ينتهي خلال</p>
              <CountdownTimer
                endsAt={auction.endTime}
                className="[&_span]:bg-white/20 [&_span]:text-white [&_.text-muted-foreground]:text-white/40"
              />
            </div>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white rounded-full px-2 py-1 text-[10px]">
            <Users className="h-3 w-3" />
            {auction.bidCount} مزايدة
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-card-foreground">
            {auction.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{auction.creatorName}</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {auction.city}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">المزايدة الحالية</p>
              <p className="text-primary text-lg font-bold tabular-nums">
                {formatPrice(auction.currentPrice)}
              </p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground">بدأت من</p>
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(auction.startingPrice)}
              </p>
            </div>
          </div>

          <Button
            onClick={(e) => { e.stopPropagation(); navigate(`/auctions/${auction._id}`); }}
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
