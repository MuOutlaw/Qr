import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ShoppingBag, Video, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import { useSellerProfile, useLiveStreams, useListings } from "@/hooks/use-mock-data.ts";
import SellerHeader from "./_components/seller-header.tsx";
import LiveHistoryCard from "./_components/live-history-card.tsx";
import SellerListingCard from "./_components/seller-listing-card.tsx";
import { cn } from "@/lib/utils.ts";

type Tab = "listings" | "live";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const seller = useSellerProfile(id ?? "s1");
  const streams = useLiveStreams();
  const listings = useListings();
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  if (!seller) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4" dir="rtl">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // Filter streams/listings belonging to this seller
  const sellerStreams = streams?.filter((s) => s.sellerId === (id ?? "s1")) ?? [];
  const sellerListings = listings?.filter((l) => l.sellerId === (id ?? "s1")) ?? [];

  const TABS = [
    { key: "listings" as Tab, label: "الإعلانات", icon: Newspaper, count: sellerListings.length },
    { key: "live" as Tab, label: "البث المباشر", icon: Video, count: sellerStreams.length },
  ] as const;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-2"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع
        </button>
      </motion.div>

      {/* Seller header */}
      <SellerHeader seller={seller} />

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        className="px-4 mt-5 flex gap-2"
      >
        <Button className="flex-1 rounded-xl font-bold gap-2 cursor-pointer">
          <ShoppingBag className="h-4 w-4" />
          تواصل مع البائع
        </Button>
        <Button
          variant="secondary"
          className="rounded-xl font-bold cursor-pointer"
        >
          متابعة
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <div className="flex px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition-colors relative",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={cn(
                "text-[10px] rounded-full px-1.5 py-0.5",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground"
              )}>
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="seller-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === "listings" && (
          <>
            {sellerListings.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Newspaper /></EmptyMedia>
                  <EmptyTitle>لا توجد إعلانات</EmptyTitle>
                  <EmptyDescription>لم يقم هذا البائع بنشر أي إعلانات بعد.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-3">
                {sellerListings.map((listing, i) => (
                  <SellerListingCard key={listing._id} listing={listing} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "live" && (
          <>
            {sellerStreams.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Video /></EmptyMedia>
                  <EmptyTitle>لا يوجد بث</EmptyTitle>
                  <EmptyDescription>لم يقم هذا البائع بأي بث مباشر بعد.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {sellerStreams.map((stream, i) => (
                  <LiveHistoryCard key={stream._id} stream={stream} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
