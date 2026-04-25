import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Home,
  User,
  Crown,
  CreditCard,
  Video,
  Newspaper,
  Phone,
  FileText,
  Shield,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useAuth } from "@/hooks/use-auth.ts";
import { Authenticated } from "convex/react";

const SIDEBAR_ITEMS = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/profile", icon: User, label: "ملفي الشخصي" },
  { path: "/verification", icon: ShieldCheck, label: "توثيق الحساب" },
  { path: "/subscriptions", icon: Crown, label: "الاشتراكات" },
  { path: "/pay-fees", icon: CreditCard, label: "سداد الرسوم" },
  { path: "/classifieds", icon: Newspaper, label: "الإعلانات" },
  { path: "/auctions", icon: Video, label: "المزادات" },
  { path: "/contact", icon: Phone, label: "اتصل بنا" },
  { path: "/terms", icon: FileText, label: "الشروط والأحكام" },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { removeUser } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdmin = useQuery(api.admin.queries.isAdmin);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{currentUser?.name ?? "مستخدم"}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.email ?? ""}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-right",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}

        {/* Admin link — only if admin */}
        {isAdmin && (
          <button
            onClick={() => go("/admin")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-right",
              location.pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "text-primary hover:bg-primary/10"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            لوحة التحكم
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => go("/settings")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-right",
            location.pathname === "/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          الإعدادات
        </button>
      </nav>

      {/* Sign out */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => removeUser()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

// Desktop sidebar (always visible on md+)
export function AccountSidebarDesktop() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-l border-border bg-background/50 h-full">
      <SidebarContent />
    </aside>
  );
}

// Mobile drawer sidebar
export function AccountSidebarMobile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[90] w-64 bg-background border-l border-border transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        dir="rtl"
      >
        <SidebarContent onNavigate={onClose} />
      </div>
    </>
  );
}
