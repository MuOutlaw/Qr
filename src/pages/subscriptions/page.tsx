import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexError } from "convex/values";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Crown,
  Check,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Star,
  Zap,
  Shield,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

type PackageId = "weekly" | "biweekly" | "monthly";

const PACKAGES: {
  id: PackageId;
  name: string;
  price: number;
  duration: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  popular?: boolean;
}[] = [
  {
    id: "weekly",
    name: "الباقة الأسبوعية",
    price: 49,
    duration: "7 أيام",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    features: [
      "حتى 5 إعلانات مميزة",
      "ظهور في أعلى نتائج البحث",
      "شارة البائع المميز",
      "دعم عبر الواتساب",
    ],
  },
  {
    id: "biweekly",
    name: "الباقة نصف الشهرية",
    price: 89,
    duration: "14 يوم",
    icon: Star,
    color: "from-primary to-orange-400",
    popular: true,
    features: [
      "حتى 15 إعلاناً مميزاً",
      "ظهور في أعلى نتائج البحث",
      "شارة البائع المميز",
      "بث مباشر غير محدود",
      "إحصائيات الإعلانات",
      "دعم عبر الواتساب",
    ],
  },
  {
    id: "monthly",
    name: "الباقة الشهرية",
    price: 149,
    duration: "30 يوم",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    features: [
      "إعلانات مميزة غير محدودة",
      "أولوية قصوى في البحث",
      "شارة البائع الذهبية",
      "بث مباشر غير محدود",
      "إحصائيات وتحليلات متقدمة",
      "مدير حساب مخصص",
      "دعم أولوية 24/7",
    ],
  },
];

const BANK_INFO = {
  bank: "بنك الراجحي",
  iban: "SA12 3456 7890 1234 5678 9012",
  name: "سوق الصفاة للتجارة",
};

function PackageCard({
  pkg,
  selected,
  onSelect,
  currentPackage,
}: {
  pkg: (typeof PACKAGES)[0];
  selected: boolean;
  onSelect: () => void;
  currentPackage?: string | null;
}) {
  const Icon = pkg.icon;
  const isActive = currentPackage === pkg.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative rounded-2xl border-2 p-5 cursor-pointer transition-all",
        selected ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/40",
        pkg.popular && !selected && "border-primary/30"
      )}
    >
      {pkg.popular && (
        <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          الأكثر طلباً
        </div>
      )}
      {isActive && (
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          باقتك الحالية
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2", pkg.color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-base">{pkg.name}</h3>
          <p className="text-xs text-muted-foreground">{pkg.duration}</p>
        </div>
        <div className="text-left">
          <p className="text-2xl font-bold">{pkg.price}</p>
          <p className="text-xs text-muted-foreground">ر.س</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-4">
        {pkg.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {/* Select indicator */}
      <div className={cn(
        "w-full py-2 rounded-xl text-sm font-medium text-center transition-colors",
        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {selected ? "محدد ✓" : "اختر هذه الباقة"}
      </div>
    </motion.div>
  );
}

function ReceiptHistory() {
  const receipts = useQuery(api.subscriptions.queries.getMyReceipts);
  const [open, setOpen] = useState(false);

  if (!receipts || receipts.length === 0) return null;

  const statusInfo = (status: string) => {
    if (status === "pending") return { icon: Clock, color: "text-orange-500", label: "قيد المراجعة", bg: "bg-orange-500/10" };
    if (status === "approved") return { icon: CheckCircle, color: "text-green-500", label: "مقبول", bg: "bg-green-500/10" };
    return { icon: XCircle, color: "text-destructive", label: "مرفوض", bg: "bg-destructive/10" };
  };

  return (
    <div className="mt-6 border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <span>سجل الإيصالات ({receipts.length})</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border divide-y divide-border">
              {receipts.map((receipt) => {
                const info = statusInfo(receipt.status);
                const Icon = info.icon;
                const pkg = PACKAGES.find((p) => p.id === receipt.packageId);
                return (
                  <div key={receipt._id} className="px-4 py-3 flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", info.bg)}>
                      <Icon className={cn("h-4 w-4", info.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{pkg?.name ?? receipt.packageId}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(receipt.createdAt), { locale: ar, addSuffix: true })}
                      </p>
                      {receipt.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{receipt.notes}</p>
                      )}
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", info.bg, info.color)}>
                      {info.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubscriptionContent() {
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.getCurrentUser);
  const receipts = useQuery(api.subscriptions.queries.getMyReceipts);
  const generateUploadUrl = useMutation(api.subscriptions.mutations.generateUploadUrl);
  const submitReceipt = useMutation(api.subscriptions.mutations.submitReceipt);

  const [selectedPackage, setSelectedPackage] = useState<PackageId>("biweekly");
  const [step, setStep] = useState<"packages" | "payment" | "upload">("packages");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPending = receipts?.some((r) => r.status === "pending") ?? false;
  const selectedPkg = PACKAGES.find((p) => p.id === selectedPackage)!;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى رفع صورة فقط");
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast.error("يرجى رفع صورة الإيصال أولاً");
      return;
    }
    setIsSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": receiptFile.type },
        body: receiptFile,
      });
      if (!res.ok) throw new Error("فشل الرفع");
      const { storageId } = await res.json() as { storageId: Id<"_storage"> };
      await submitReceipt({ receiptStorageId: storageId, packageId: selectedPackage });
      toast.success("تم إرسال الإيصال بنجاح، سيتم مراجعته خلال 24 ساعة");
      setStep("packages");
      setReceiptFile(null);
      setReceiptPreview(null);
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { message: string };
        toast.error(message);
      } else {
        toast.error("حدث خطأ أثناء الإرسال");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser === undefined || receipts === undefined) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step !== "packages" ? setStep("packages") : navigate(-1)}
          className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold">باقات الاشتراك</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Package selection ── */}
          {step === "packages" && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Current subscription status */}
              {currentUser?.subscriptionPackage && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-600">اشتراكك فعّال</p>
                    <p className="text-xs text-muted-foreground">
                      {PACKAGES.find((p) => p.id === currentUser.subscriptionPackage)?.name ?? currentUser.subscriptionPackage}
                      {currentUser.subscriptionExpiresAt &&
                        ` · ينتهي ${formatDistanceToNow(new Date(currentUser.subscriptionExpiresAt), { locale: ar, addSuffix: true })}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Pending notice */}
              {hasPending && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">إيصالك قيد المراجعة</p>
                    <p className="text-xs text-muted-foreground">سيتم تفعيل باقتك خلال 24 ساعة بعد التحقق</p>
                  </div>
                </div>
              )}

              {/* Packages grid */}
              <div className="space-y-4">
                {PACKAGES.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selectedPackage === pkg.id}
                    onSelect={() => setSelectedPackage(pkg.id)}
                    currentPackage={currentUser?.subscriptionPackage}
                  />
                ))}
              </div>

              <Button
                className="w-full gap-2 h-12 text-base"
                disabled={hasPending}
                onClick={() => setStep("payment")}
              >
                <Crown className="h-4 w-4" />
                المتابعة — {selectedPkg.name} ({selectedPkg.price} ر.س)
              </Button>

              <ReceiptHistory />
            </motion.div>
          )}

          {/* ── Step 2: Payment instructions ── */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Selected package summary */}
              <div className={cn("rounded-2xl bg-gradient-to-br p-5 text-white", selectedPkg.color)}>
                <div className="flex items-center gap-3 mb-3">
                  <selectedPkg.icon className="h-6 w-6" />
                  <div>
                    <p className="font-bold text-lg">{selectedPkg.name}</p>
                    <p className="text-white/80 text-sm">{selectedPkg.duration}</p>
                  </div>
                  <p className="mr-auto text-3xl font-bold">{selectedPkg.price} <span className="text-base font-normal">ر.س</span></p>
                </div>
              </div>

              {/* Bank transfer instructions */}
              <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  تعليمات التحويل البنكي
                </h3>

                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                    <span>افتح تطبيق البنك وانتقل لخدمة التحويل</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                    <span>حوّل المبلغ إلى الحساب أدناه</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                    <span>التقط صورة لإيصال التحويل وارفعها في الخطوة التالية</span>
                  </li>
                </ol>

                {/* Bank details */}
                <div className="bg-background rounded-xl p-4 space-y-3 border border-border">
                  {[
                    { label: "البنك", value: BANK_INFO.bank },
                    { label: "رقم الآيبان", value: BANK_INFO.iban },
                    { label: "اسم المستفيد", value: BANK_INFO.name },
                    { label: "المبلغ", value: `${selectedPkg.price} ريال سعودي` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.value).catch(() => {});
                          toast.success("تم النسخ");
                        }}
                        className="text-sm font-mono font-medium text-right hover:text-primary transition-colors cursor-pointer"
                      >
                        {item.value}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full h-12 gap-2 text-base" onClick={() => setStep("upload")}>
                <Upload className="h-4 w-4" />
                لقد حولت المبلغ، ارفع الإيصال
              </Button>
            </motion.div>
          )}

          {/* ── Step 3: Upload receipt ── */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold">ارفع إيصال التحويل</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  ارفع صورة واضحة لإيصال التحويل البنكي
                </p>
              </div>

              {/* Upload area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
                  receiptPreview ? "border-primary" : "border-border hover:border-primary/50"
                )}
              >
                {receiptPreview ? (
                  <div className="relative">
                    <img src={receiptPreview} alt="receipt" className="w-full max-h-64 object-contain bg-muted" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">انقر للتغيير</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <Image className="h-8 w-8" />
                    </div>
                    <p className="font-medium">انقر لرفع الإيصال</p>
                    <p className="text-xs">JPG, PNG حتى 10MB</p>
                  </div>
                )}
              </motion.button>

              {/* Package confirmation */}
              <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{selectedPkg.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPkg.duration}</p>
                </div>
                <p className="font-bold text-lg">{selectedPkg.price} ر.س</p>
              </div>

              <Button
                className="w-full h-12 gap-2 text-base"
                disabled={!receiptFile || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  "جارٍ الإرسال..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    إرسال الإيصال للمراجعة
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                سيتم تفعيل اشتراكك خلال 24 ساعة من مراجعة الإيصال
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <>
      <AuthLoading>
        <div className="p-4 space-y-4" dir="rtl">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLoading>
      <Authenticated>
        <SubscriptionContent />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">باقات الاشتراك</h2>
            <p className="text-muted-foreground text-sm mt-1">سجّل دخولك للاشتراك في إحدى الباقات</p>
          </div>
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}
