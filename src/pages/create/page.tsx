import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Send, MapPin, Tag, LogIn, ImagePlus, X } from "lucide-react";
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
import PriceTypeSelector from "./_components/price-type-selector.tsx";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useConvex } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel.js";
import { AnimatePresence } from "motion/react";
import LocationSelector from "@/components/ui/location-selector.tsx";

function CreateListingPage() {
  const navigate = useNavigate();
  const convex = useConvex();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "auction">("fixed");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.listings.mutations.generateUploadUrl);
  const createListing = useMutation(api.listings.mutations.create);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (imageFiles.length + files.length > 10) {
      toast.error("الحد الأقصى 10 صور");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("يرجى إدخال عنوان الإعلان"); return; }
    if (!category) { toast.error("يرجى اختيار النوع"); return; }
    if (!region) { toast.error("يرجى اختيار المنطقة"); return; }
    if (!location) { toast.error("يرجى اختيار المدينة"); return; }
    if (!price) { toast.error("يرجى إدخال السعر"); return; }

    setIsSubmitting(true);
    try {
      // رفع الصور إلى Convex Storage
      const storageIds: Id<"_storage">[] = [];
      for (const file of imageFiles) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("فشل رفع الصورة");
        const { storageId } = await res.json() as { storageId: Id<"_storage"> };
        storageIds.push(storageId);
      }

      await createListing({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        priceType: "fixed",
        category,
        city: location,
        imageStorageIds: storageIds,
      });

      toast.success("تم نشر الإعلان بنجاح!");
      navigate("/classifieds");
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCategories = CATEGORIES.filter((c) => c.value !== "all");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold text-foreground">إنشاء إعلان</h1>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Media Upload */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-sm font-bold text-foreground block mb-3">الصور</label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">اضغط لرفع الصور</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP — حتى 10 صور</p>
            </div>
          </div>
          <AnimatePresence>
            {imagePreviews.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex gap-2 overflow-x-auto pb-1 mt-3"
              >
                {imagePreviews.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded">رئيسية</span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
          <Label htmlFor="title" className="text-sm font-bold">عنوان الإعلان</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: ناقة مجاهيم عمر 4 سنوات" className="rounded-xl h-11" dir="rtl" />
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <Label htmlFor="description" className="text-sm font-bold">الوصف</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اكتب وصفاً تفصيلياً..." className="rounded-xl min-h-[100px] resize-none" dir="rtl" />
        </motion.div>

        {/* Category & Location */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-muted-foreground" />النوع</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="اختر النوع" /></SelectTrigger>
              <SelectContent>
                {selectCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold">الموقع</Label>
            <LocationSelector
              region={region}
              city={location}
              onRegionChange={(r) => { setRegion(r); setLocation(""); }}
              onCityChange={setLocation}
              required
            />
          </div>
        </motion.div>

        {/* Price */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
          <Label htmlFor="price" className="text-sm font-bold">السعر (ر.س)</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="rounded-xl h-11 text-lg font-bold tabular-nums" dir="ltr" />
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="pb-8">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-base gap-2 cursor-pointer">
            <Send className="h-5 w-5" />
            {isSubmitting ? "جاري النشر..." : "نشر الإعلان"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function CreateListingAuth() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
        <LogIn className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">سجّل دخولك أولاً</h2>
        <p className="text-muted-foreground">يجب تسجيل الدخول لإضافة إعلان جديد</p>
      </div>
      <SignInButton />
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
        العودة للخلف
      </button>
    </div>
  );
}

export default function CreateListingPageWrapper() {
  return (
    <>
      <AuthLoading>
        <div className="p-4 space-y-4" dir="rtl">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </AuthLoading>
      <Authenticated>
        <CreateListingPage />
      </Authenticated>
      <Unauthenticated>
        <CreateListingAuth />
      </Unauthenticated>
    </>
  );
}
