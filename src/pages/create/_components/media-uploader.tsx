import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImagePlus, X, Video } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type MediaUploaderProps = {
  images: string[];
  onImagesChange: (images: string[]) => void;
};

// Placeholder thumbnails for demo purposes
const PLACEHOLDER_THUMBS = [
  "https://images.unsplash.com/photo-1599475504246-11c1217748c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1622043935694-6279a3a93323?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1645767006495-0136265e26c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=200",
];

export default function MediaUploader({ images, onImagesChange }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleAddPlaceholder = useCallback(() => {
    // In a real app, this would open a file picker
    const nextPlaceholder = PLACEHOLDER_THUMBS[images.length % PLACEHOLDER_THUMBS.length];
    if (nextPlaceholder) {
      onImagesChange([...images, nextPlaceholder]);
    }
  }, [images, onImagesChange]);

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-foreground">الصور والفيديو</label>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleAddPlaceholder(); }}
        onClick={handleAddPlaceholder}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <ImagePlus className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">اضغط لرفع الصور</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            أو اسحب وأفلت الملفات هنا
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>JPG, PNG, WEBP</span>
          <span>حتى 10 صور</span>
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            MP4
          </span>
        </div>
      </div>

      {/* Image previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            {images.map((img, i) => (
              <motion.div
                key={`${img}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group"
              >
                <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded">
                    رئيسية
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
