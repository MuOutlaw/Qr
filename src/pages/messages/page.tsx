import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { MessageCircle, Send, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
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
import { ConvexError } from "convex/values";

// ── Conversation list ────────────────────────────────────────────────────────
function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const conversations = useQuery(api.messages.queries.listConversations);

  if (conversations === undefined) {
    return (
      <div className="space-y-3 px-4 py-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><MessageCircle /></EmptyMedia>
          <EmptyTitle>لا توجد محادثات</EmptyTitle>
          <EmptyDescription>تواصل مع البائعين عبر صفحات الإعلانات.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv, i) => {
        const other = conv.otherUser;
        const timeAgo = formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: ar });
        return (
          <motion.button
            key={conv._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(conv._id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors text-right"
          >
            <Avatar className="w-11 h-11 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {(other?.name ?? "؟").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm truncate">{other?.name ?? "مستخدم"}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessageText}</p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="min-w-[20px] h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold px-1">
                {conv.unreadCount}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Conversation view ────────────────────────────────────────────────────────
function ConversationView({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const data = useQuery(api.messages.queries.getMessages, {
    conversationId: conversationId as Id<"conversations">
  });
  const sendMessage = useMutation(api.messages.mutations.sendMessage);
  const markRead = useMutation(api.messages.mutations.markConversationRead);

  useEffect(() => {
    if (data) {
      markRead({ conversationId: conversationId as Id<"conversations"> });
    }
  }, [data, conversationId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text;
    setText("");
    try {
      await sendMessage({ conversationId: conversationId as Id<"conversations">, text: msg });
    } catch (err) {
      if (err instanceof ConvexError) {
        const e = err.data as { message: string };
        toast.error(e.message);
      } else {
        toast.error("فشل إرسال الرسالة");
      }
      setText(msg);
    }
  };

  if (data === undefined) {
    return <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>;
  }

  const otherParticipantId = data.conversation.participantIds.find(id => id !== data.currentUserId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">م</AvatarFallback>
        </Avatar>
        <p className="font-bold text-sm">محادثة</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {data.messages.map((msg) => {
          const isMe = msg.senderId === data.currentUserId;
          return (
            <div key={msg._id} className={cn("flex", isMe ? "justify-start" : "justify-end")}>
              <div className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
              )}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالة..."
            className="rounded-xl flex-1"
            dir="rtl"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim()} className="rounded-xl cursor-pointer">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessagesContent() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);

  if (selectedConv) {
    return <ConversationView conversationId={selectedConv} onBack={() => setSelectedConv(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground">الرسائل</h1>
        </div>
      </div>
      <ConversationList onSelect={setSelectedConv} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <>
      <AuthLoading>
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </AuthLoading>
      <Authenticated>
        <MessagesContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4" dir="rtl">
          <MessageCircle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">سجّل دخولك لرؤية رسائلك</p>
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}
