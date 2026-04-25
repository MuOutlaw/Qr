import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Send,
  MapPin,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { toast } from "sonner";
import { CATEGORIES, LOCATIONS } from "@/lib/mock-data.ts";
import MediaUploader from "./_components/media-uploader.tsx";
import PriceTypeSelector from "./_components/price-type-selector.tsx";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "auction">("fixed");
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الإعلان");
      return;
    }
    if (!category) {
      toast.error("يرجى اختيار النوع");
      return;
    }
    if (!location) {
      toast.error("يرجى اختيار الموقع");
      return;
    }
    if (priceType === "fixed" && !price) {
      toast.error("يرجى إدخال السعر");
      return;
    }
    if (priceType === "auction" && !startingBid) {
      toast.error("يرجى إدخال سعر البداية");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success("تم نشر الإعلان بنجاح!");
    navigate("/");
  };

  // Filter out "all" from categories for the select
  const selectCategories = CATEGORIES.filter((c) => c.value !== "all");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-bold text-foreground">إنشاء إعلان</h1>
          </div>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Media Upload */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
        >
          <MediaUploader images={images} onImagesChange={setImages} />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
          className="space-y-2"
        >
          <Label htmlFor="title" className="text-sm font-bold">عنوان الإعلان</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: ناقة مجاهيم عمر 4 سنوات"
            className="rounded-xl h-11"
            dir="rtl"
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          className="space-y-2"
        >
          <Label htmlFor="description" className="text-sm font-bold">الوصف</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصفاً تفصيلياً للإعلان..."
            className="rounded-xl min-h-[100px] resize-none"
            dir="rtl"
          />
        </motion.div>

        {/* Category + Location row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              النوع
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                {selectCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              الموقع
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="اختر الموقع" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Price Type */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        >
          <PriceTypeSelector type={priceType} onTypeChange={setPriceType} />
        </motion.div>

        {/* Price Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3, ease: "easeOut" }}
          className="space-y-2"
        >
          {priceType === "fixed" ? (
            <>
              <Label htmlFor="price" className="text-sm font-bold">السعر (ر.س)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="rounded-xl h-11 text-lg font-bold tabular-nums"
                dir="ltr"
              />
            </>
          ) : (
            <>
              <Label htmlFor="startingBid" className="text-sm font-bold">سعر البداية (ر.س)</Label>
              <Input
                id="startingBid"
                type="number"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                placeholder="0"
                className="rounded-xl h-11 text-lg font-bold tabular-nums"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground">
                المزاد يبدأ من هذا السعر ويمكن للمشترين المزايدة عليه
              </p>
            </>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
          className="space-y-3 pb-8"
        >
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl font-bold text-base gap-2 cursor-pointer"
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? "جاري النشر..." : "نشر الإعلان"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
