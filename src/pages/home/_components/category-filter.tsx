import { cn } from "@/lib/utils.ts";
import { motion } from "motion/react";
import { CATEGORIES } from "@/lib/mock-data.ts";

type CategoryFilterProps = {
  selected: string;
  onSelect: (value: string) => void;
};

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-hide" dir="rtl">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground bg-secondary/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="category-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
