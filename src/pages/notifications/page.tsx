import { motion } from "motion/react";
import { Bell, CheckCheck, Trash2, MessageCircle, Heart, Star, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, React.ElementType> = {
  new_message: MessageCircle,
  listing_inquiry: MessageCircle,
  listing_saved: Heart,
  new_rating: Star,
  listing_sold: Package,
  boost_expired: Bell,
};

function NotificationsContent() {
  const notifications = useQuery(api.notifications.queries.getMyNotifications, { limit: 50 });
  const markRead = useMutation(api.notifications.mutations.markRead);
  const markAllRead = useMutation(api.notifications.mutations.markAllRead);
  const deleteNotif = useMutation(api.notifications.mutations.deleteNotification);
  const clearAll = useMutation(api.notifications.mutations.clearAll);

  if (notifications === undefined) {
    return (
      <div className="px-4 py-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 min-h-[60vh]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Bell /></EmptyMedia>
            <EmptyTitle>لا توجد إشعارات</EmptyTitle>
            <EmptyDescription>ستظهر هنا إشعارات الرسائل والمزايدات والتقييمات.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Actions bar */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">{unreadCount} غير مقروء</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { markAllRead(); toast.success("تم تعليم الكل كمقروء"); }}
              className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              قراءة الكل
            </button>
            <button
              onClick={() => { clearAll(); toast.success("تم مسح الإشعارات"); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              مسح الكل
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border">
        {notifications.map((notif, i) => {
          const Icon = TYPE_ICONS[notif.type] ?? Bell;
          const timeAgo = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar });

          return (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                !notif.isRead ? "bg-primary/5" : "hover:bg-muted/30"
              )}
              onClick={() => { if (!notif.isRead) markRead({ notificationId: notif._id as Id<"notifications"> }); }}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                !notif.isRead ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold leading-tight", !notif.isRead && "text-foreground")}>{notif.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotif({ notificationId: notif._id as Id<"notifications"> }); }}
                className="p-1.5 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground">الإشعارات</h1>
        </div>
      </motion.header>

      <AuthLoading>
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </AuthLoading>
      <Authenticated>
        <NotificationsContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <Bell className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">سجّل دخولك لرؤية إشعاراتك</p>
          <SignInButton />
        </div>
      </Unauthenticated>
    </div>
  );
}
