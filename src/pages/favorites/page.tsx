import { motion } from "motion/react";
import { Heart, MapPin, Clock, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";
import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1599475504246-11c1217748c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(amount);
}

function FavoritesContent() {
  const navigate = useNavigate();
  const saved = useQuery(api.favorites.index.getMySaved);
  const toggleSave = useMutation(api.favorites.index.toggleSave);

  const handleRemove = async (listingId: string) => {
    await toggleSave({ listingId: listingId as Id<"listings"> });
    toast.success("تم الحذف من المفضلة");
  };

  if (saved === undefined) {
    return (
      <div className="px-4 py-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Heart /></EmptyMedia>
            <EmptyTitle>قائمة المفضلة فارغة</EmptyTitle>
            <EmptyDescription>احفظ الإعلانات التي تعجبك لمتابعتها لاحقاً.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => navigate("/classifieds")}>تصفح الإعلانات</Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {saved.map((item: typeof saved[number], i: number) => {
        const listing = item.listing;
        const timeAgo = formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: ar });
        const image = listing.images[0] ?? FALLBACK_IMAGE;

        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card
              className="flex-row overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
              onClick={() => navigate(`/listings/${listing._id}`)}
            >
              <div className="relative w-28 sm:w-36 shrink-0">
                <img src={image} alt={listing.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-1">{listing.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{listing.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-primary text-base font-bold tabular-nums">{formatPrice(listing.price)}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" />{listing.city}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(listing._id); }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-1">
                  <Clock className="h-2.5 w-2.5" />{timeAgo}
                </span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground">المفضلة</h1>
        </div>
      </div>

      <AuthLoading>
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </AuthLoading>
      <Authenticated>
        <FavoritesContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">سجّل دخولك لرؤية مفضلتك</p>
          <SignInButton />
        </div>
      </Unauthenticated>
    </div>
  );
}
