import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { type ChatMessage } from "@/lib/mock-data.ts";
import { cn } from "@/lib/utils.ts";

type LiveChatProps = {
  messages: ChatMessage[];
  className?: string;
};

export default function LiveChat({ messages, className }: LiveChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      _id: `local-${Date.now()}`,
      streamId: "",
      userId: "me",
      userName: "أنت",
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 px-3 py-2 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {localMessages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-start gap-2 group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-[85%]">
                <span className="text-primary text-xs font-bold ml-1.5">
                  {msg.userName}
                </span>
                <span className="text-white/90 text-xs">{msg.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب تعليقاً..."
          className="bg-white/10 backdrop-blur-sm border-white/10 text-white placeholder:text-white/40 text-sm h-9 rounded-full"
          dir="rtl"
        />
        <Button
          size="icon"
          className="h-9 w-9 rounded-full shrink-0 cursor-pointer"
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    </div>
  );
}
