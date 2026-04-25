import { motion } from "motion/react";
import { cn } from "@/lib/utils.ts";

type PriceTypeSelectorProps = {
  type: "fixed" | "auction";
  onTypeChange: (type: "fixed" | "auction") => void;
};

export default function PriceTypeSelector({ type, onTypeChange }: PriceTypeSelectorProps) {
  const options = [
    {
      value: "fixed" as const,
      label: "سعر ثابت",
      description: "حدد سعراً ثابتاً للبيع المباشر",
    },
    {
      value: "auction" as const,
      label: "مزاد",
      description: "دع المشترين يتنافسون بالمزايدة",
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-foreground">نوع البيع</label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTypeChange(opt.value)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-right cursor-pointer transition-all",
              type === opt.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            )}
          >
            {type === opt.value && (
              <motion.div
                layoutId="price-type-indicator"
                className="absolute top-2 left-2 w-3 h-3 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <p className="text-sm font-bold text-foreground">{opt.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
