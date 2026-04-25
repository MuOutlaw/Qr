import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck, Phone, CreditCard, ArrowRight, Upload,
  CheckCircle, Clock, XCircle, IdCard, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { toast } from "sonner";
import { useConvex } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

// ── Simulated OTP flow (real SMS requires Twilio/similar) ─────────────────
function PhoneVerificationStep({ onVerified }: { onVerified: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const markVerified = useMutation(api.verification.index.markPhoneVerified);

  const handleSendOtp = async () => {
    if (!phone.match(/^05\d{8}$/)) {
      toast.error("يرجى إدخال رقم جوال سعودي صحيح (05XXXXXXXX)");
      return;
    }
    setIsSending(true);
    // Simulate OTP generation — in production connect to SMS provider
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setIsSending(false);
    toast.success(`تم إرسال رمز التحقق (للتجربة: ${code})`, { duration: 10000 });
  };

  const handleVerify = async () => {
    if (otp !== generatedOtp) {
      toast.error("رمز التحقق غير صحيح");
      return;
    }
    try {
      await markVerified({ phone });
      toast.success("تم التحقق من الجوال بنجاح");
      onVerified();
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl">
        <Phone className="h-6 w-6 text-primary shrink-0" />
        <div>
          <p className="font-bold text-sm">التحقق من رقم الجوال</p>
          <p className="text-xs text-muted-foreground">سيتم إرسال رمز OTP لرقمك</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>رقم الجوال</Label>
        <div className="flex gap-2">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XXXXXXXX"
            dir="ltr"
            className="flex-1 rounded-xl h-11 text-left"
            disabled={otpSent}
          />
          <Button
            onClick={handleSendOtp}
            disabled={isSending || otpSent}
            className="rounded-xl px-4"
          >
            {otpSent ? "تم الإرسال" : "إرسال"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {otpSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label>رمز التحقق</Label>
            <div className="flex gap-2">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="XXXXXX"
                dir="ltr"
                className="flex-1 rounded-xl h-11 text-center tracking-widest text-xl font-bold"
                maxLength={6}
              />
              <Button onClick={handleVerify} className="rounded-xl px-4">
                تأكيد
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Identity document upload ─────────────────────────────────────────────
function IdentityUploadStep({ onSubmitted }: { onSubmitted: () => void }) {
  const [idType, setIdType] = useState<"national_id" | "residence">("national_id");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.listings.mutations.generateUploadUrl);
  const submitVerification = useMutation(api.verification.index.submitVerification);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("يرجى رفع صورة وثيقة الهوية");
      return;
    }
    setIsSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      const { storageId } = await res.json() as { storageId: Id<"_storage"> };

      await submitVerification({ idImageUrl: storageId, idType });
      toast.success("تم إرسال طلب التوثيق. سيتم مراجعته خلال 24 ساعة");
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-xl">
        <IdCard className="h-6 w-6 text-amber-500 shrink-0" />
        <div>
          <p className="font-bold text-sm">توثيق الهوية</p>
          <p className="text-xs text-muted-foreground">مطلوب لمرة واحدة فقط لحماية المجتمع من النصب</p>
        </div>
      </div>

      {/* ID Type */}
      <div className="space-y-2">
        <Label>نوع الوثيقة</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setIdType("national_id")}
            className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors cursor-pointer ${
              idType === "national_id"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            هوية وطنية
          </button>
          <button
            onClick={() => setIdType("residence")}
            className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors cursor-pointer ${
              idType === "residence"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            إقامة
          </button>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>صورة الوثيقة</Label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="ID" className="w-full h-48 object-cover rounded-xl border border-border" />
            <button
              onClick={() => { setImagePreview(null); setImageFile(null); }}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-primary/5"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">اضغط لرفع صورة واضحة</p>
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold">
        <Send className="h-4 w-4 ml-2" />
        {isSubmitting ? "جارٍ الإرسال..." : "إرسال طلب التوثيق"}
      </Button>
    </div>
  );
}

// ── Status display ───────────────────────────────────────────────────────
function VerificationStatus() {
  const navigate = useNavigate();
  const status = useQuery(api.verification.index.getVerificationStatus);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [showIdUpload, setShowIdUpload] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [idSubmitted, setIdSubmitted] = useState(false);

  if (!status) return null;

  const phoneOk = status.phoneOtpVerified || phoneVerified;
  const idOk = status.verificationStatus === "approved";
  const idPending = status.verificationStatus === "pending" || idSubmitted;
  const idRejected = status.verificationStatus === "rejected";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
          <ArrowRight className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">توثيق الحساب</h1>
          <p className="text-sm text-muted-foreground">مرة واحدة فقط للبث المباشر</p>
        </div>
      </div>

      {/* Benefits banner */}
      <div className="bg-gradient-to-l from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
        <p className="font-bold text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          مزايا التوثيق
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 pr-6 list-disc">
          <li>بث مباشر مجاني بدون اشتراك</li>
          <li>شارة الحساب الموثق</li>
          <li>حماية للمجتمع من عمليات النصب</li>
          <li>مصداقية أعلى للمشترين</li>
        </ul>
        <p className="text-xs font-bold text-primary">ملاحظة: باقة سنوية 1200 ريال تمنحك مزايا إضافية (إعلانات مميزة، أولوية العرض)</p>
      </div>

      {/* Step 1: Phone */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${phoneOk ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
              {phoneOk ? <CheckCircle className="h-4 w-4" /> : "1"}
            </div>
            <span className="font-bold text-sm">التحقق من الجوال</span>
          </div>
          {phoneOk && <span className="text-xs text-green-500 font-bold">مكتمل ✓</span>}
        </div>

        {phoneOk ? (
          <p className="text-xs text-muted-foreground pr-9">{status.phone ?? "تم التحقق"}</p>
        ) : showPhoneVerify ? (
          <PhoneVerificationStep onVerified={() => { setPhoneVerified(true); setShowPhoneVerify(false); }} />
        ) : (
          <Button onClick={() => setShowPhoneVerify(true)} variant="secondary" className="w-full rounded-xl">
            بدء التحقق من الجوال
          </Button>
        )}
      </div>

      {/* Step 2: Identity */}
      <div className={`bg-card border border-border rounded-2xl p-4 space-y-3 ${!phoneOk ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idOk ? "bg-green-500 text-white" : idPending ? "bg-amber-500 text-white" : idRejected ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"}`}>
              {idOk ? <CheckCircle className="h-4 w-4" /> : idPending ? <Clock className="h-4 w-4" /> : idRejected ? <XCircle className="h-4 w-4" /> : "2"}
            </div>
            <span className="font-bold text-sm">توثيق الهوية</span>
          </div>
          {idOk && <span className="text-xs text-green-500 font-bold">موثق ✓</span>}
          {idPending && <span className="text-xs text-amber-500 font-bold">قيد المراجعة</span>}
          {idRejected && <span className="text-xs text-red-500 font-bold">مرفوض</span>}
        </div>

        {idRejected && status.rejectionReason && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{status.rejectionReason}</p>
        )}

        {idOk ? (
          <p className="text-xs text-muted-foreground pr-9">تم قبول هويتك من قِبل الإدارة</p>
        ) : idPending ? (
          <p className="text-xs text-muted-foreground pr-9">طلبك قيد المراجعة. سيتم إشعارك خلال 24 ساعة.</p>
        ) : showIdUpload ? (
          <IdentityUploadStep onSubmitted={() => { setIdSubmitted(true); setShowIdUpload(false); }} />
        ) : (
          <Button
            onClick={() => setShowIdUpload(true)}
            variant="secondary"
            className="w-full rounded-xl"
            disabled={!phoneOk}
          >
            <CreditCard className="h-4 w-4 ml-2" />
            رفع صورة الهوية
          </Button>
        )}
      </div>

      {/* Final status */}
      {idOk && phoneOk && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center space-y-2"
        >
          <ShieldCheck className="h-10 w-10 text-green-500 mx-auto" />
          <p className="font-bold text-green-500">حسابك موثق بالكامل</p>
          <p className="text-xs text-muted-foreground">يمكنك الآن بدء البث المباشر</p>
          <Button onClick={() => navigate("/live/start")} className="mt-2">
            ابدأ البث الآن
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <>
      <Authenticated>
        <VerificationStatus />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" dir="rtl">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-bold">سجّل دخولك أولاً</h2>
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}
