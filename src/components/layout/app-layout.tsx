import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, Plus, X, Video, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { motion, AnimatePresence } from "motion/react";
import { Authenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { AccountSidebarDesktop, AccountSidebarMobile } from "@/components/layout/account-sidebar.tsx";

function UnreadBadge() {
  const unread = useQuery(api.notifications.queries.getUnreadCount);
  if (!unread || unread === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center px-0.5">
      {unread > 9 ? "9+" : unread}
    </span>
  );
}

function ProfileNavButton({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-0.5 px-3 py-2 cursor-pointer transition-colors relative",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">حسابي</span>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
          />
        )}
      </button>
      <Authenticated>
        <UnreadBadge />
      </Authenticated>
    </div>
  );
}

function ProfileNavButtonDesktop({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all relative group",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">حسابي</span>
        {isActive && (
          <motion.div
            layoutId="nav-indicator-desktop"
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
          />
        )}
      </button>
      <Authenticated>
        <UnreadBadge />
      </Authenticated>
    </div>
  );
}

import { Home, Gavel, Newspaper } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/auctions", icon: Gavel, label: "المزادات" },
  { path: "/classifieds", icon: Newspaper, label: "الإعلانات" },
  { path: "/profile", icon: User, label: "حسابي" },
] as const;

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
  };

  const handleCreateOption = (path: string) => {
    setShowCreateMenu(false);
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* Desktop Sidebar */}
      <AccountSidebarDesktop />

      {/* Mobile Drawer */}
      <Authenticated>
        <AccountSidebarMobile open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </Authenticated>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Search Bar */}
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => navigate("/search")}
            className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm text-right"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>ابحث في سوق الصفاة...</span>
          </button>
          {/* Mobile hamburger */}
          <Authenticated>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer md:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </Authenticated>
        </header>

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* ── Create Menu Overlay (mobile) ───────────────────────────────── */}
        <AnimatePresence>
          {showCreateMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setShowCreateMenu(false)}
              />
              {/* Action buttons */}
              <div className="fixed bottom-20 left-0 right-0 z-[70] flex flex-col items-center gap-3 pb-4 md:hidden">
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  onClick={() => handleCreateOption("/create")}
                  className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl shadow-xl cursor-pointer"
                >
                  <FileText className="h-5 w-5" />
                  <span className="font-bold text-sm">إضافة إعلان</span>
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleCreateOption("/live/start")}
                  className="flex items-center gap-3 bg-red-600 text-white px-6 py-3.5 rounded-2xl shadow-xl cursor-pointer"
                >
                  <Video className="h-5 w-5" />
                  <span className="font-bold text-sm">بدء بث مباشر</span>
                </motion.button>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Bottom Nav (mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center border-t border-border bg-background/90 backdrop-blur-xl h-16 md:hidden">
          {/* First two nav items */}
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 cursor-pointer transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}

          {/* Center Create button */}
          <button
            onClick={() => setShowCreateMenu((v) => !v)}
            className="relative cursor-pointer"
          >
            <motion.div
              animate={{ rotate: showCreateMenu ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg transition-colors",
                showCreateMenu ? "bg-muted" : "bg-primary"
              )}
            >
              {showCreateMenu ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Plus className="h-6 w-6 text-primary-foreground" />
              )}
            </motion.div>
          </button>

          {/* Last two nav items */}
          {NAV_ITEMS.slice(2, 3).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 cursor-pointer transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
          <ProfileNavButton
            isActive={location.pathname === "/profile"}
            onClick={() => handleNav("/profile")}
          />
        </nav>

      </div>
    </div>
  );
}
