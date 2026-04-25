import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import { AccountSidebarDesktop, AccountSidebarMobile } from "@/components/layout/account-sidebar.tsx";
import { Authenticated } from "convex/react";

export default function AccountLayout({
  title,
  children,
  showBack = true,
}: {
  title: string;
  children: ReactNode;
  showBack?: boolean;
}) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      {/* Desktop sidebar */}
      <AccountSidebarDesktop />

      {/* Mobile drawer */}
      <Authenticated>
        <AccountSidebarMobile open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </Authenticated>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-bold flex-1">{title}</h1>
          {/* Hamburger for mobile sidebar */}
          <Authenticated>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </Authenticated>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
