import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexError } from "convex/values";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  MapPin,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Star,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Tag,
  Scale,
  Calendar,
  Users,
  Dna,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

// ── Image Gallery ──────────────────────────────────────────────
function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="w-full aspect-[4/3] bg-muted rounded-2xl flex items-center justify-center">
        <Tag className="h-12 w-12 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div className="relative w-full aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((p) => (p - 1 + images.length) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrent((p) => (p + 1) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all cursor-pointer",
                i === current ? "bg-white scale-125" : "bg-white/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer",
                i === current ? "border-primary" : "border-transparent"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <img
              src={images[current]}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={() => setLightbox(false)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Similar Listings ───────────────────────────────────────────
function SimilarListings({ listingId, category }: { listingId: Id<"listings">; category: string }) {
  const navigate = useNavigate();
  const similar = useQuery(api.listings.queries.getSimilar, { listingId, category });

  if (!similar || similar.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold">إعلانات مشابهة</h3>
      <div className="grid grid-cols-2 gap-3">
        {similar.map((item) => (
          <button
            key={item._id}
            onClick={() => navigate(`/listing/${item._id}`)}
            className="text-right bg-muted/30 border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors cursor-pointer"
          >
            {item.images[0] ? (
              <img src={item.images[0]} alt={item.title} className="w-full aspect-[4/3] object-cover" />
            ) : (
              <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                <Tag className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs font-medium line-clamp-1">{item.title}</p>
              <p className="text-xs text-primary font-bold mt-0.5">{item.price.toLocaleString("ar-SA")} ر.س</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main listing detail ────────────────────────────────────────
function ListingDetail({ id }: { id: Id<"listings"> }) {
  const navigate = useNavigate();
  const listing = useQuery(api.listings.queries.getById, { id });
  const currentUser = useQuery(api.users.getCurrentUser);
  const isSaved = useQuery(api.favorites.index.isSaved, { listingId: id });
  const toggleSave = useMutation(api.favorites.index.toggleSave);
  const incrementViews = useMutation(api.listings.mutations.incrementViews);
  const markAsSold = useMutation(api.listings.mutations.markAsSold);
  const removeListing = useMutation(api.listings.mutations.remove);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Increment views once on load
  useEffect(() => {
    incrementViews({ id }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (listing === undefined) {
    return (
      <div className="p-4 space-y-4" dir="rtl">
        <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (listing === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6" dir="rtl">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">الإعلان غير موجود</h2>
        <p className="text-muted-foreground text-sm text-center">ربما تم حذفه أو لم يعد متاحاً</p>
        <Button onClick={() => navigate("/classifieds")}>تصفح الإعلانات</Button>
      </div>
    );
  }

  const isOwner = currentUser && listing.userId === currentUser._id;
  const seller = listing.seller;

  const handleToggleSave = async () => {
    try {
      await toggleSave({ listingId: id });
      toast.success(isSaved ? "تم الإزالة من المفضلة" : "تم الحفظ في المفضلة");
    } catch { toast.error("يجب تسجيل الدخول"); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ الرابط");
    }
  };

  const handleMarkSold = async () => {
    setActionLoading(true);
    try {
      await markAsSold({ id });
      toast.success("تم تحديد الإعلان كمباع");
    } catch (e) {
      const msg = e instanceof ConvexError ? (e.data as { message: string }).message : "خطأ";
      toast.error(msg);
    } finally {
      setActionLoading(false);
      setShowOwnerMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف الإعلان؟")) return;
    setActionLoading(true);
    try {
      await removeListing({ id });
      toast.success("تم حذف الإعلان");
      navigate("/classifieds");
    } catch (e) {
      const msg = e instanceof ConvexError ? (e.data as { message: string }).message : "خطأ";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const livestockDetails = [
    listing.age && { icon: Calendar, label: "العمر", value: listing.age },
    listing.gender && { icon: Users, label: "الجنس", value: listing.gender === "male" ? "ذكر" : listing.gender === "female" ? "أنثى" : "مختلط" },
    listing.weight && { icon: Scale, label: "الوزن", value: listing.weight },
    listing.breed && { icon: Dna, label: "السلالة", value: listing.breed },
    listing.quantity && { icon: Users, label: "الكمية", value: String(listing.quantity) },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <Authenticated>
            <button
              onClick={handleToggleSave}
              className={cn(
                "p-2 rounded-xl transition-colors cursor-pointer",
                isSaved ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            </button>
          </Authenticated>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showOwnerMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute left-0 top-full mt-1 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[150px]"
                  >
                    <button
                      onClick={() => { setShowOwnerMenu(false); navigate(`/create?edit=${id}`); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors cursor-pointer text-right"
                    >
                      <Edit className="h-4 w-4" /> تعديل
                    </button>
                    {listing.status !== "sold" && (
                      <button
                        onClick={handleMarkSold}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors cursor-pointer text-right"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" /> تحديد كمباع
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-right"
                    >
                      <Trash2 className="h-4 w-4" /> حذف الإعلان
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* Status badge for sold */}
        {listing.status === "sold" && (
          <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">هذا الإعلان مباع</p>
          </div>
        )}

        {/* Image Gallery */}
        <ImageGallery images={listing.images} title={listing.title} />

        {/* Title & Price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold leading-snug flex-1">{listing.title}</h1>
            {listing.isFeatured && (
              <span className="shrink-0 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">مميز</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-primary">
              {listing.price.toLocaleString("ar-SA")} <span className="text-base font-normal text-muted-foreground">ر.س</span>
            </p>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              listing.priceType === "negotiable" ? "bg-orange-500/10 text-orange-600" : "bg-green-500/10 text-green-600"
            )}>
              {listing.priceType === "negotiable" ? "قابل للتفاوض" : "سعر ثابت"}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs bg-muted px-2.5 py-1.5 rounded-full">
            <Tag className="h-3 w-3" /> {listing.category}
          </span>
          <span className="flex items-center gap-1 text-xs bg-muted px-2.5 py-1.5 rounded-full">
            <MapPin className="h-3 w-3" /> {listing.city}
          </span>
          <span className="flex items-center gap-1 text-xs bg-muted px-2.5 py-1.5 rounded-full">
            <Eye className="h-3 w-3" /> {listing.views} مشاهدة
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground text-xs">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(listing.createdAt), { locale: ar, addSuffix: true })}
          </span>
        </div>

        {/* Description */}
        <div className="bg-muted/30 border border-border rounded-2xl p-4">
          <h2 className="font-bold mb-2 text-sm">الوصف</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
        </div>

        {/* Livestock details */}
        {livestockDetails.length > 0 && (
          <div className="bg-muted/30 border border-border rounded-2xl p-4">
            <h2 className="font-bold mb-3 text-sm">تفاصيل الحيوان</h2>
            <div className="grid grid-cols-2 gap-3">
              {livestockDetails.map((detail, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <detail.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{detail.label}</p>
                    <p className="text-sm font-medium">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller */}
        {seller && (
          <div
            className="bg-muted/30 border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => navigate(`/seller/${seller._id}`)}
          >
            <h2 className="font-bold mb-3 text-sm">البائع</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {seller.avatarUrl ? (
                  <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {(seller.name ?? "؟")[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm truncate">{seller.name ?? "بائع"}</p>
                  {seller.isVerified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
                </div>
                {seller.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {seller.city}
                  </p>
                )}
                {(seller.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{(seller.rating ?? 0).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({seller.ratingCount ?? 0})</span>
                  </div>
                )}
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Similar */}
        <SimilarListings listingId={id} category={listing.category} />
      </div>

      {/* Fixed CTA bar */}
      {listing.status === "active" && !isOwner && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border z-30">
          <div className="max-w-xl mx-auto flex gap-3">
            <Authenticated>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  if (seller) navigate(`/messages?userId=${seller._id}`);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                تواصل مع البائع
              </Button>
              {seller?.phone && (
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => window.open(`tel:${seller.phone}`, "_self")}
                >
                  اتصل
                </Button>
              )}
            </Authenticated>
            <Unauthenticated>
              <Button className="flex-1 gap-2" onClick={() => navigate("/profile")}>
                <MessageCircle className="h-4 w-4" />
                سجّل الدخول للتواصل
              </Button>
            </Unauthenticated>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <>
      <AuthLoading>
        <div className="p-4 space-y-4" dir="rtl">
          <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AuthLoading>
      <Authenticated>
        <ListingDetail id={id as Id<"listings">} />
      </Authenticated>
      <Unauthenticated>
        <ListingDetail id={id as Id<"listings">} />
      </Unauthenticated>
    </>
  );
}
