import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexError } from "convex/values";
import {
  User,
  MapPin,
  FileText,
  Camera,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import { cn } from "@/lib/utils.ts";
import AccountLayout from "@/components/layout/account-layout.tsx";

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الأحساء", "الطائف", "بريدة", "تبوك", "القصيم",
  "خميس مشيط", "حائل", "نجران", "الجبيل", "أبها",
];

type Section = "profile" | "notifications" | "privacy";

function SettingsContent() {
  const navigate = useNavigate();
  const { removeUser } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);

  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Initialize form when user loads
  const [initialized, setInitialized] = useState(false);
  if (currentUser && !initialized) {
    setName(currentUser.name ?? "");
    setBio(currentUser.bio ?? "");
    setCity(currentUser.city ?? "");
    setPhone(currentUser.phone ?? "");
    setInitialized(true);
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        city: city || undefined,
      });
      setSaved(true);
      toast.success("تم حفظ التغييرات بنجاح");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { message: string };
        toast.error(message);
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await removeUser();
    navigate("/");
  };

  if (currentUser === undefined) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const menuItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "profile", icon: User, label: "الملف الشخصي" },
    { key: "notifications", icon: Bell, label: "الإشعارات" },
    { key: "privacy", icon: Shield, label: "الخصوصية والأمان" },
  ];

  return (
    <div className="bg-background" dir="rtl">
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 p-4 max-w-3xl mx-auto">
        {/* Sidebar nav */}
        <aside className="w-full md:w-56 shrink-0 mb-4 md:mb-0">
          <div className="bg-muted/30 rounded-2xl overflow-hidden border border-border">
            {/* Avatar summary */}
            <div className="p-4 flex items-center gap-3 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{currentUser?.name ?? "مستخدم"}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email ?? ""}</p>
              </div>
            </div>

            {/* Nav items */}
            <nav className="p-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-right",
                    activeSection === item.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {activeSection !== item.key && <ChevronRight className="h-3.5 w-3.5 mr-auto opacity-40" />}
                </button>
              ))}
            </nav>

            {/* Sign out */}
            <div className="p-2 border-t border-border mt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeSection === "profile" && (
              <div className="bg-muted/30 rounded-2xl border border-border p-5 space-y-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-base">الملف الشخصي</h2>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden relative shrink-0">
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">صورة الملف الشخصي</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      يمكن تغييرها عبر مزود الهوية
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      الاسم الكامل
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسمك"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      نبذة تعريفية
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="أخبر الآخرين عن نفسك وما تبيعه..."
                      className="text-right resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      المدينة
                    </Label>
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-right"
                    >
                      <option value="">اختر مدينتك</option>
                      {SAUDI_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="flex items-center gap-1.5 text-muted-foreground">
                      رقم الجوال
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">قريبًا</span>
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      disabled
                      placeholder="05xxxxxxxx"
                      className="text-right opacity-50"
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                {currentUser?.email && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني (غير قابل للتعديل)</p>
                    <p className="text-sm">{currentUser.email}</p>
                  </div>
                )}

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full gap-2"
                >
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" />
                      تم الحفظ
                    </>
                  ) : isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="bg-muted/30 rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-base">إعدادات الإشعارات</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  تحكم في أنواع الإشعارات التي تصلك من سوق الصفاة.
                </p>
                {[
                  { label: "إشعارات المزادات", desc: "عند إضافة عروض جديدة أو اقتراب انتهاء المزاد" },
                  { label: "إشعارات الرسائل", desc: "عند استلام رسالة جديدة" },
                  { label: "إشعارات البث المباشر", desc: "عند بدء بث من بائع تتابعه" },
                  { label: "إشعارات الإعلانات", desc: "تحديثات حول إعلاناتك" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-primary/20 flex items-center px-1 cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-primary mr-auto" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-2">
                  إدارة الإشعارات الكاملة قادمة قريبًا
                </p>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="bg-muted/30 rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-base">الخصوصية والأمان</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "إظهار رقم الجوال للمشترين", enabled: false },
                    { label: "إظهار الملف الشخصي للعامة", enabled: true },
                    { label: "السماح برسائل من الجميع", enabled: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <div
                        className={cn(
                          "w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors",
                          item.enabled ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white transition-all",
                          item.enabled ? "mr-auto" : ""
                        )} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-2 mt-2">
                  <p className="text-sm font-medium text-destructive">منطقة الخطر</p>
                  <p className="text-xs text-muted-foreground">
                    حذف الحساب سيؤدي إلى إزالة جميع إعلاناتك ومحادثاتك بشكل نهائي.
                  </p>
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => toast.error("لحذف الحساب يرجى التواصل مع الدعم")}>
                    طلب حذف الحساب
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  إعدادات الخصوصية الكاملة قادمة قريبًا
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AccountLayout title="الإعدادات">
      <AuthLoading>
        <div className="p-4 space-y-4" dir="rtl">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLoading>
      <Authenticated>
        <SettingsContent />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-[60vh] bg-background flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">الإعدادات</h2>
            <p className="text-muted-foreground">سجّل دخولك للوصول إلى إعدادات حسابك</p>
          </div>
          <SignInButton />
        </div>
      </Unauthenticated>
    </AccountLayout>
  );
}
