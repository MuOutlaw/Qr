import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Gavel, Newspaper, Plus, User, Search } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/auctions", icon: Gavel, label: "المزادات" },
  { path: "/search", icon: Search, label: "بحث" },
  { path: "/classifieds", icon: Newspaper, label: "الإعلانات" },
  { path: "/create", icon: Plus, label: "أضف" },
  { path: "/profile", icon: User, label: "حسابي" },
] as const;

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-screen bg-background" dir="rtl">
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 md:pr-20">
        <Outlet />
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center border-t border-border bg-background/90 backdrop-blur-xl h-16 md:hidden">
        {NAV_ITEMS.map((item) => {
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
              {item.path === "/create" ? (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center -mt-3 shadow-lg">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Side Nav (desktop) */}
      <nav className="hidden md:flex fixed right-0 top-0 bottom-0 z-50 w-20 flex-col items-center justify-center gap-2 border-l border-border bg-background/90 backdrop-blur-xl">
        {/* Logo */}
        <div className="absolute top-4">
          <img
            src="https://hercules-cdn.com/file_oyhFdDX6joNW35upRckbQN0V"
            alt="سوق الصفاة"
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all relative group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.path === "/create" ? (
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-desktop"
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
