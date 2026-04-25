import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexError } from "convex/values";
import { motion } from "motion/react";
import {
  Users,
  ShoppingBag,
  AlertTriangle,
  Shield,
  BarChart3,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronRight,
  ArrowRight,
  Receipt,
  BadgeCheck,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

type Tab = "stats" | "users" | "listings" | "reports" | "verifications" | "receipts";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/40 border border-border rounded-2xl p-4 flex items-center gap-4"
    >
      <div className={cn("p-3 rounded-xl", accent ?? "bg-primary/10")}>
        <Icon className={cn("h-5 w-5", accent ? "text-white" : "text-primary")} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function StatsTab() {
  const stats = useQuery(api.admin.queries.getStats);
  if (!stats) return <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <StatCard icon={Users} label="إجمالي المستخدمين" value={stats.totalUsers} />
      <StatCard icon={ShoppingBag} label="إجمالي الإعلانات" value={stats.totalListings} />
      <StatCard icon={CheckCircle} label="إعلانات نشطة" value={stats.activeListings} accent="bg-green-500" />
      <StatCard icon={BadgeCheck} label="مباعة" value={stats.soldListings} accent="bg-blue-500" />
      <StatCard icon={AlertTriangle} label="إجمالي البلاغات" value={stats.totalReports} accent="bg-orange-500" />
      <StatCard icon={Clock} label="بلاغات معلقة" value={stats.pendingReports} accent="bg-red-500" />
    </div>
  );
}

function UsersTab() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.getAllUsers,
    {},
    { initialNumItems: 20 }
  );
  const setRole = useMutation(api.admin.mutations.setUserRole);
  const setVerified = useMutation(api.admin.mutations.setUserVerified);
  const deleteUser = useMutation(api.admin.mutations.deleteUser);

  const handleRoleToggle = async (userId: Id<"users">, currentRole: string | undefined) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await setRole({ userId, role: newRole });
      toast.success(`تم تغيير الدور إلى ${newRole === "admin" ? "مشرف" : "مستخدم"}`);
    } catch (e) {
      const msg = e instanceof ConvexError ? (e.data as { message: string }).message : "خطأ";
      toast.error(msg);
    }
  };

  const handleVerify = async (userId: Id<"users">, current: boolean | undefined) => {
    try {
      await setVerified({ userId, isVerified: !current });
      toast.success(!current ? "تم التوثيق" : "تم إلغاء التوثيق");
    } catch { toast.error("خطأ"); }
  };

  const handleDelete = async (userId: Id<"users">) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await deleteUser({ userId });
      toast.success("تم الحذف");
    } catch (e) {
      const msg = e instanceof ConvexError ? (e.data as { message: string }).message : "خطأ";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-3">
      {results.map((user) => (
        <div key={user._id} className="bg-muted/30 border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{user.name ?? "بدون اسم"}</p>
              {user.isVerified && <span className="text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">موثق</span>}
              {user.role === "admin" && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">مشرف</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{user.city ?? ""}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleVerify(user._id, user.isVerified)}
              className={cn("text-xs px-2 py-1 rounded-lg border transition-colors cursor-pointer",
                user.isVerified ? "border-green-500/30 text-green-600 hover:bg-green-500/10" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {user.isVerified ? "إلغاء التوثيق" : "توثيق"}
            </button>
            <button
              onClick={() => handleRoleToggle(user._id, user.role)}
              className="text-xs px-2 py-1 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {user.role === "admin" ? "إزالة الإدارة" : "تعيين مشرف"}
            </button>
            <button
              onClick={() => handleDelete(user._id)}
              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      {status === "CanLoadMore" && (
        <Button variant="secondary" className="w-full" onClick={() => loadMore(20)}>تحميل المزيد</Button>
      )}
      {results.length === 0 && status !== "LoadingFirstPage" && (
        <p className="text-center text-muted-foreground py-8 text-sm">لا يوجد مستخدمون</p>
      )}
    </div>
  );
}

function ListingsTab() {
  const [filter, setFilter] = useState<string>("all");
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.getAllListings,
    { status: filter === "all" ? undefined : filter },
    { initialNumItems: 20 }
  );
  const updateStatus = useMutation(api.admin.mutations.updateListingStatus);
  const deleteListing = useMutation(api.admin.mutations.deleteListing);

  const handleStatus = async (listingId: Id<"listings">, newStatus: "active" | "sold" | "draft") => {
    try {
      await updateStatus({ listingId, status: newStatus });
      toast.success("تم التحديث");
    } catch { toast.error("خطأ"); }
  };

  const handleDelete = async (listingId: Id<"listings">) => {
    if (!confirm("حذف الإعلان نهائياً؟")) return;
    try {
      await deleteListing({ listingId });
      toast.success("تم الحذف");
    } catch { toast.error("خطأ"); }
  };

  const filters = [
    { key: "all", label: "الكل" },
    { key: "active", label: "نشط" },
    { key: "sold", label: "مباع" },
    { key: "draft", label: "مسودة" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer",
              filter === f.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {results.map((listing) => (
        <div key={listing._id} className="bg-muted/30 border border-border rounded-xl p-4 flex gap-3 items-start">
          {listing.images?.[0] && (
            <img src={listing.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{listing.title}</p>
            <p className="text-xs text-muted-foreground">
              {listing.userName} · {listing.city} · {listing.price.toLocaleString("ar-SA")} ر.س
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(["active", "sold", "draft"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(listing._id, s)}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-lg border transition-colors cursor-pointer",
                    listing.status === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s === "active" ? "نشط" : s === "sold" ? "مباع" : "مسودة"}
                </button>
              ))}
              <button
                onClick={() => handleDelete(listing._id)}
                className="text-xs px-2 py-0.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      ))}
      {status === "CanLoadMore" && (
        <Button variant="secondary" className="w-full" onClick={() => loadMore(20)}>تحميل المزيد</Button>
      )}
    </div>
  );
}

function ReportsTab() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.getAllReports,
    {},
    { initialNumItems: 20 }
  );
  const reviewReport = useMutation(api.admin.mutations.reviewReport);

  const handleReview = async (reportId: Id<"reports">, action: "resolved" | "dismissed") => {
    try {
      await reviewReport({ reportId, status: action });
      toast.success(action === "resolved" ? "تم الحل" : "تم الرفض");
    } catch { toast.error("خطأ"); }
  };

  const statusBadge = (status: string) => {
    if (status === "pending") return <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">معلق</span>;
    if (status === "resolved") return <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">محلول</span>;
    return <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">مرفوض</span>;
  };

  return (
    <div className="space-y-3">
      {results.map((report) => (
        <div key={report._id} className="bg-muted/30 border border-border rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {statusBadge(report.status)}
                <span className="text-xs text-muted-foreground">{report.reason}</span>
              </div>
              <p className="text-sm font-medium mt-1">
                من: {report.reporterName}
                {report.targetListingTitle && ` · إعلان: ${report.targetListingTitle}`}
                {report.targetUserName && ` · مستخدم: ${report.targetUserName}`}
              </p>
              {report.details && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.details}</p>
              )}
            </div>
          </div>
          {report.status === "pending" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleReview(report._id, "resolved")}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors cursor-pointer"
              >
                <CheckCircle className="h-3 w-3" /> حل
              </button>
              <button
                onClick={() => handleReview(report._id, "dismissed")}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <XCircle className="h-3 w-3" /> رفض
              </button>
            </div>
          )}
        </div>
      ))}
      {status === "CanLoadMore" && (
        <Button variant="secondary" className="w-full" onClick={() => loadMore(20)}>تحميل المزيد</Button>
      )}
      {results.length === 0 && status !== "LoadingFirstPage" && (
        <p className="text-center text-muted-foreground py-8 text-sm">لا توجد بلاغات</p>
      )}
    </div>
  );
}

function VerificationsTab() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.getAllVerificationRequests,
    { status: "pending" },
    { initialNumItems: 20 }
  );
  const review = useMutation(api.admin.mutations.reviewVerificationRequest);

  const handleReview = async (requestId: Id<"verificationRequests">, action: "approved" | "rejected") => {
    try {
      await review({ requestId, status: action });
      toast.success(action === "approved" ? "تم القبول وتوثيق الحساب" : "تم الرفض");
    } catch { toast.error("خطأ"); }
  };

  return (
    <div className="space-y-3">
      {results.map((req) => (
        <div key={req._id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{req.userName}</p>
              <p className="text-xs text-muted-foreground">{req.userPhone ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req.idType} · {req.idNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(req.createdAt), { locale: ar, addSuffix: true })}
              </p>
            </div>
            {req.idImageUrl && (
              <a href={req.idImageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={req.idImageUrl} alt="ID" className="w-16 h-12 rounded-lg object-cover border border-border" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReview(req._id as Id<"verificationRequests">, "approved")}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-3 w-3" /> قبول وتوثيق
            </button>
            <button
              onClick={() => handleReview(req._id as Id<"verificationRequests">, "rejected")}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <XCircle className="h-3 w-3" /> رفض
            </button>
          </div>
        </div>
      ))}
      {status === "CanLoadMore" && (
        <Button variant="secondary" className="w-full" onClick={() => loadMore(20)}>تحميل المزيد</Button>
      )}
      {results.length === 0 && status !== "LoadingFirstPage" && (
        <p className="text-center text-muted-foreground py-8 text-sm">لا توجد طلبات توثيق معلقة</p>
      )}
    </div>
  );
}

function ReceiptsTab() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.getAllReceipts,
    { status: "pending" },
    { initialNumItems: 20 }
  );
  const review = useMutation(api.admin.mutations.reviewReceipt);

  const handleReview = async (receiptId: Id<"subscriptionReceipts">, action: "approved" | "rejected") => {
    try {
      await review({ receiptId, status: action });
      toast.success(action === "approved" ? "تم قبول الاشتراك" : "تم الرفض");
    } catch { toast.error("خطأ"); }
  };

  return (
    <div className="space-y-3">
      {results.map((receipt) => (
        <div key={receipt._id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{receipt.userName}</p>
              <p className="text-xs text-muted-foreground">{receipt.userPhone ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">باقة: {receipt.packageId}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(receipt.createdAt), { locale: ar, addSuffix: true })}
              </p>
            </div>
            {receipt.imageUrl && (
              <a href={receipt.imageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <div className="relative">
                  <img src={receipt.imageUrl} alt="receipt" className="w-16 h-12 rounded-lg object-cover border border-border" />
                  <Eye className="absolute bottom-1 right-1 h-3 w-3 text-white drop-shadow" />
                </div>
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReview(receipt._id as Id<"subscriptionReceipts">, "approved")}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-3 w-3" /> قبول
            </button>
            <button
              onClick={() => handleReview(receipt._id as Id<"subscriptionReceipts">, "rejected")}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <XCircle className="h-3 w-3" /> رفض
            </button>
          </div>
        </div>
      ))}
      {status === "CanLoadMore" && (
        <Button variant="secondary" className="w-full" onClick={() => loadMore(20)}>تحميل المزيد</Button>
      )}
      {results.length === 0 && status !== "LoadingFirstPage" && (
        <p className="text-center text-muted-foreground py-8 text-sm">لا توجد إيصالات معلقة</p>
      )}
    </div>
  );
}

function AdminDashboardContent() {
  const navigate = useNavigate();
  const isAdmin = useQuery(api.admin.queries.isAdmin);
  const [activeTab, setActiveTab] = useState<Tab>("stats");

  if (isAdmin === undefined) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6" dir="rtl">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <Shield className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">غير مصرح</h2>
        <p className="text-muted-foreground text-center text-sm">هذه الصفحة للمشرفين فقط</p>
        <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "stats", label: "الإحصائيات", icon: BarChart3 },
    { key: "users", label: "المستخدمون", icon: Users },
    { key: "listings", label: "الإعلانات", icon: ShoppingBag },
    { key: "reports", label: "البلاغات", icon: AlertTriangle },
    { key: "verifications", label: "التوثيق", icon: BadgeCheck },
    { key: "receipts", label: "الإيصالات", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold">لوحة تحكم المشرف</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex min-w-max px-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2",
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-3xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "listings" && <ListingsTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "verifications" && <VerificationsTab />}
          {activeTab === "receipts" && <ReceiptsTab />}
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <>
      <AuthLoading>
        <div className="p-4 space-y-4" dir="rtl">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLoading>
      <Authenticated>
        <AdminDashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">لوحة التحكم</h2>
            <p className="text-muted-foreground text-sm mt-1">سجّل دخولك للوصول</p>
          </div>
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}
