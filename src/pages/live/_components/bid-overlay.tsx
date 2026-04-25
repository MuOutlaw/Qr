import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gavel, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { formatPrice } from "@/lib/mock-data.ts";
import { toast } from "sonner";

type BidOverlayProps = {
  currentBid: number;
  className?: string;
};

const BID_INCREMENTS = [500, 1000, 5000, 10000];

export default function BidOverlay({ currentBid, className }: BidOverlayProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + 1000);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBid = () => {
    setIsAnimating(true);
    toast.success(`تم تقديم مزايدة بمبلغ ${formatPrice(bidAmount)}`);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleBuyNow = () => {
    toast.info("Coming soon in a future milestone!");
  };

  const adjustBid = (delta: number) => {
    setBidAmount((prev) => Math.max(currentBid + 500, prev + delta));
  };

  return (
    <div className={className}>
      {/* Current bid display */}
      <motion.div
        className="flex items-center justify-between mb-3"
        animate={isAnimating ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
            المزايدة الحالية
          </p>
          <p className="text-primary text-2xl font-bold tabular-nums">
            {formatPrice(currentBid)}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
      </motion.div>

      {/* Expanded bid controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Quick bid amounts */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {BID_INCREMENTS.map((inc) => (
                <button
                  key={inc}
                  onClick={() => setBidAmount(currentBid + inc)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    bidAmount === currentBid + inc
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  +{inc >= 1000 ? `${inc / 1000}K` : inc}
                </button>
              ))}
            </div>

            {/* Custom bid input */}
            <div className="flex items-center gap-2 mb-3 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => adjustBid(-500)}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center">
                <p className="text-white font-bold text-lg tabular-nums">
                  {formatPrice(bidAmount)}
                </p>
              </div>
              <button
                onClick={() => adjustBid(500)}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleBid}
          className="flex-1 h-12 rounded-xl font-bold text-base gap-2 cursor-pointer shadow-lg"
        >
          <Gavel className="h-5 w-5" />
          زايد {formatPrice(bidAmount)}
        </Button>
        <Button
          onClick={handleBuyNow}
          variant="secondary"
          className="h-12 rounded-xl px-4 font-bold cursor-pointer bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-0"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
