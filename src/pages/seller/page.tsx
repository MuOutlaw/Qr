import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Newspaper, Video, LogIn, User, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { useSellerProfile, useLiveStreams, useListings } from "@/hooks/use-mock-data.ts";
import SellerHeader from "./_components/seller-header.tsx";
import LiveHistoryCard from "./_components/live-history-card.tsx";
import SellerListingCard from "./_components/seller-listing-card.tsx";
import { cn } from "@/lib/utils.ts";

type Tab = "listings" | "live";

function MyProfileContent() {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.getCurrentUser);
  const notifications = useQuery(api.notifications.queries.getMyNotifications, { limit: 5 });

  const TABS = [
    { key: "listings" as Tab, label: "إعلاناتي", icon: Newspaper },
    { key: "live" as Tab, label: "البث المباشر", icon: Video },
  ] as const;

  if (currentUser === undefined) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">حسابي</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{currentUser?.name ?? "مستخدم"}</h2>
            {currentUser?.email && (
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            )}
            {currentUser?.city && (
              <p className="text-sm text-muted-foreground">{currentUser.city}</p>
            )}
            {currentUser?.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 mt-1">
                موثق
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{currentUser?.rating?.toFixed(1) ?? "0.0"}</p>
            <p className="text-xs text-muted-foreground">التقييم</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{currentUser?.ratingCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">التقييمات</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">
              {currentUser?.subscriptionPackage ? "مشترك" : "مجاني"}
            </p>
            <p className="text-xs text-muted-foreground">الباقة</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => navigate("/create")}
          >
            إضافة إعلان
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate("/settings")}
          >
            تعديل الملف
          </Button>
        </div>

        {/* Recent notifications */}
        {notifications && notifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">آخر الإشعارات</h3>
              <button
                onClick={() => navigate("/notifications")}
                className="text-xs text-primary cursor-pointer"
              >
                عرض الكل
              </button>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "p-3 rounded-xl border border-border",
                    !n.isRead && "bg-primary/5 border-primary/20"
                  )}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-border">
        <div className="flex gap-1 relative">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer",
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator-profile"
                  className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                  style={{ width: "60px", right: activeTab === "listings" ? "auto" : "auto" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper />
            </EmptyMedia>
            <EmptyTitle>لا يوجد محتوى بعد</EmptyTitle>
            <EmptyDescription>
              {activeTab === "listings" ? "لم تضف أي إعلانات بعد" : "لم تبدأ أي بث مباشر بعد"}
            </EmptyDescription>
          </EmptyHeader>
          {activeTab === "listings" && (
            <EmptyContent>
              <Button size="sm" onClick={() => navigate("/create")}>
                إضافة إعلان
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    </div>
  );
}

function PublicSellerProfile({ id }: { id: string }) {
  const navigate = useNavigate();
  const seller = useSellerProfile(id);
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

  const sellerStreams = streams?.filter((s) => s.sellerId === id) ?? [];
  const sellerListings = listings?.filter((l) => l.sellerId === id) ?? [];

  const TABS = [
    { key: "listings" as Tab, label: "الإعلانات", icon: Newspaper, count: sellerListings.length },
    { key: "live" as Tab, label: "البث المباشر", icon: Video, count: sellerStreams.length },
  ] as const;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
          <span>رجوع</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <SellerHeader seller={seller} />
      </motion.div>

      <div className="px-4 border-b border-border">
        <div className="flex gap-1 relative">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer",
                activeTab === tab.key ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "listings" && (
          sellerListings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Newspaper /></EmptyMedia>
                <EmptyTitle>لا توجد إعلانات</EmptyTitle>
                <EmptyDescription>لم يضف هذا البائع أي إعلانات بعد</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sellerListings.map((listing, index) => (
                <SellerListingCard key={listing._id} listing={listing} index={index} />
              ))}
            </div>
          )
        )}
        {activeTab === "live" && (
          sellerStreams.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Video /></EmptyMedia>
                <EmptyTitle>لا يوجد بث مسبق</EmptyTitle>
                <EmptyDescription>لم يبدأ هذا البائع أي بث مباشر بعد</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {sellerStreams.map((stream, index) => (
                <LiveHistoryCard key={stream._id} stream={stream} index={index} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();

  // If no id param, show current user's profile
  if (!id) {
    return (
      <>
        <AuthLoading>
          <div className="p-4 space-y-4" dir="rtl">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </AuthLoading>
        <Authenticated>
          <MyProfileContent />
        </Authenticated>
        <Unauthenticated>
          <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">مرحباً بك في سوق الصفاة</h2>
              <p className="text-muted-foreground">سجّل دخولك لعرض ملفك الشخصي وإدارة إعلاناتك</p>
            </div>
            <SignInButton />
          </div>
        </Unauthenticated>
      </>
    );
  }

  return <PublicSellerProfile id={id} />;
}
