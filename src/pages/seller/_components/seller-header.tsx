import { motion } from "motion/react";
import { Star, MapPin, Calendar, ShieldCheck, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { type SellerProfile, formatPrice } from "@/lib/mock-data.ts";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type SellerHeaderProps = {
  seller: SellerProfile;
};

export default function SellerHeader({ seller }: SellerHeaderProps) {
  const joinedDate = format(new Date(seller.joinedAt), "MMMM yyyy", { locale: ar });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-bl from-primary/30 via-primary/10 to-background rounded-b-3xl" />

      {/* Profile content */}
      <div className="px-4 -mt-14">
        {/* Avatar */}
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-primary/20 border-4 border-background flex items-center justify-center text-3xl font-bold text-primary shadow-lg">
            {seller.name.charAt(0)}
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground truncate">
                {seller.name}
              </h1>
              {seller.isVerified && (
                <Badge className="bg-primary/10 text-primary border-0 gap-1 px-2 py-0.5 text-[10px] shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                  موثّق
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              {seller.location}
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {seller.bio}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(seller.rating)
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">{seller.rating}</span>
          </div>

          {/* Sales */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="font-bold text-foreground">{seller.totalSales}</span>
            <span>عملية بيع</span>
          </div>

          {/* Joined */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>عضو منذ {joinedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
