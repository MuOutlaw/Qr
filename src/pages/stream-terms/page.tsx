import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ScrollText, CheckCircle, AlertTriangle, ArrowRight,
  Gavel, HandshakeIcon, BadgeDollarSign, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { toast } from "sonner";

const STREAM_TERMS = [
  {
    icon: ScrollText,
    title: "شروط البث المباشر",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      "يجب أن يكون البائع مالكاً فعلياً للحيوان المعروض للبيع",
      "يُحظر عرض حيوانات مريضة أو غير مطابقة للوصف",
      "يُحظر الإيهام بالمزايدة أو التلاعب بالأسعار",
      "يجب إظهار الحيوان بشكل واضح وكامل أثناء البث",
      "يُحظر البث لأي محتوى مخالف للشريعة الإسلامية والنظام السعودي",
      "للمنصة الحق في إيقاف البث فوراً عند الاشتباه بالمخالفة",
    ],
  },
  {
    icon: Gavel,
    title: "شروط المزايدة",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    items: [
      "المزايدة عقد ملزم — لا يحق للمشتري التراجع بعد الإرساء",
      "عند الإرساء على المشتري يُحوَّل العربون فوراً إلى حساب المنصة",
      "قيمة العربون 10% من سعر الإرساء أو 500 ريال كحد أدنى",
      "يُمنح المشتري 48 ساعة لاستلام السلعة",
      "إذا لم يستلم المشتري خلال 48 ساعة بدون عذر مقبول يُصادر العربون",
      "لا يحق للبائع سحب السلعة بعد الإرساء إلا بموافقة المنصة",
    ],
  },
  {
    icon: BadgeDollarSign,
    title: "العمولة والتزام الدفع",
    color: "text-green-500",
    bg: "bg-green-500/10",
    items: [
      "عمولة المنصة 2.5% من قيمة البيع النهائية",
      "يلتزم البائع بدفع العمولة خلال 72 ساعة من اكتمال الصفقة",
      "التهرب من دفع العمولة يستوجب إيقاف الحساب نهائياً",
      "يُقسم البائع بالله العظيم على دفع العمولة وعدم التحايل",
      "في حال النزاع تتولى المنصة التحكيم ويُعدّ قرارها نهائياً",
    ],
  },
  {
    icon: HandshakeIcon,
    title: "عقد الالتزام بين الطرفين",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: [
      "يلتزم البائع بتسليم الحيوان وفق الوصف المُعلن بدون تغيير",
      "يلتزم المشتري بالدفع الكامل بعد استلام السلعة",
      "أي نزاع يُرفع للمنصة أولاً قبل اللجوء للجهات الرسمية",
      "البيانات الشخصية محفوظة وفق أنظمة حماية البيانات السعودية",
      "يخضع هذا العقد لأحكام الشريعة الإسلامية والنظام السعودي",
    ],
  },
];

function StreamTermsContent({ onAgree }: { onAgree: () => void }) {
  const navigate = useNavigate();
  const [allRead, setAllRead] = useState(false);
  const [isAgreeing, setIsAgreeing] = useState(false);
  const [sworn, setSworn] = useState(false);
  const agreeToTerms = useMutation(api.verification.index.agreeToStreamTerms);
  const status = useQuery(api.verification.index.getVerificationStatus);

  const alreadyAgreed = status?.agreedToStreamTerms === true;

  const handleAgree = async () => {
    if (!sworn) {
      toast.error("يجب التأكيد على القسم بالله أولاً");
      return;
    }
    setIsAgreeing(true);
    try {
      await agreeToTerms({});
      toast.success("تم قبول الشروط والأحكام");
      onAgree();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setIsAgreeing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted cursor-pointer">
          <ArrowRight className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">شروط البث والمزايدة</h1>
          <p className="text-sm text-muted-foreground">اقرأ بعناية قبل البث</p>
        </div>
      </div>

      {alreadyAgreed && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-sm font-bold text-green-500">وافقت على جميع الشروط مسبقاً</p>
        </div>
      )}

      {/* Terms sections */}
      <div className="space-y-4">
        {STREAM_TERMS.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className={`flex items-center gap-3 p-4 ${section.bg}`}>
              <section.icon className={`h-5 w-5 ${section.color} shrink-0`} />
              <h2 className={`font-bold text-sm ${section.color}`}>{section.title}</h2>
            </div>
            <ul className="p-4 space-y-2.5">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Earnest money notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="font-bold text-sm text-amber-500">نظام العربون</p>
        </div>
        <p className="text-xs text-foreground/70 leading-relaxed">
          عند الإرساء على المشتري يُحجز العربون فوراً من حسابه.
          يُمنح <strong>48 ساعة</strong> لاستلام السلعة.
          في حال التخلف بدون عذر مشروع <strong>لن يُسترد العربون</strong> ويُوزع بين البائع والمنصة.
        </p>
      </div>

      {/* Warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-red-400">
          أي تلاعب أو نصب أو تحايل سيُبلَّغ عنه للجهات الأمنية السعودية. المنصة تحتفظ بجميع بيانات المستخدمين والمعاملات.
        </p>
      </div>

      {/* Oath / Sworn */}
      {!alreadyAgreed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onViewportEnter={() => setAllRead(true)}
          className="bg-card border-2 border-primary/30 rounded-2xl p-4 space-y-4"
        >
          <p className="font-bold text-center text-base">
            أُقسم بالله العظيم
          </p>
          <p className="text-sm text-center text-muted-foreground leading-relaxed">
            أن أُوفي بجميع الشروط والالتزامات المذكورة أعلاه،
            وأن أدفع العمولة المستحقة للمنصة بعد كل صفقة ناجحة،
            وإلا فأنا أُقرّ بعواقب ذلك قانونياً وشرعياً.
          </p>

          <button
            onClick={() => setSworn(!sworn)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted"
            style={{ borderColor: sworn ? "var(--primary)" : "var(--border)" }}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${sworn ? "bg-primary border-primary" : "border-muted-foreground"}`}>
              {sworn && <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />}
            </div>
            <span className="text-sm font-bold">أقبل وأُقرّ بجميع الشروط والأحكام</span>
          </button>

          <Button
            onClick={handleAgree}
            disabled={!sworn || isAgreeing || !allRead}
            className="w-full h-12 rounded-xl font-bold text-base"
          >
            {isAgreeing ? "جارٍ الحفظ..." : "تأكيد الموافقة والمضي للبث"}
          </Button>
        </motion.div>
      )}

      {alreadyAgreed && (
        <Button onClick={() => navigate("/live/start")} className="w-full h-12 rounded-xl font-bold">
          انتقل للبث المباشر
        </Button>
      )}
    </div>
  );
}

export default function StreamTermsPage() {
  const navigate = useNavigate();

  return (
    <>
      <Authenticated>
        <StreamTermsContent onAgree={() => navigate("/live/start")} />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" dir="rtl">
          <ScrollText className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-bold">سجّل دخولك أولاً</h2>
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}
