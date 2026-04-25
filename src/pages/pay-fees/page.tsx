import AccountLayout from "@/components/layout/account-layout.tsx";
import { CreditCard, Building2, CheckCircle, AlertCircle } from "lucide-react";

const FEES = [
  { label: "رسوم نشر الإعلان", amount: "مجانًا", note: "للمستخدمين العاديين" },
  { label: "رسوم المزاد", amount: "2%", note: "من قيمة البيع النهائية" },
  { label: "رسوم التوثيق", amount: "25 ر.س", note: "لمرة واحدة" },
  { label: "رسوم البث المباشر", amount: "مجانًا", note: "للمشتركين في الباقات" },
];

const BANK_INFO = {
  bank: "بنك الراجحي",
  iban: "SA12 3456 7890 1234 5678 9012",
  name: "سوق الصفاة للتجارة",
  swift: "RJHISARI",
};

export default function PayFeesPage() {
  return (
    <AccountLayout title="سداد الرسوم">
      <div className="max-w-xl mx-auto p-4 space-y-5" dir="rtl">
        <p className="text-sm text-muted-foreground">
          يمكنك سداد رسوم الخدمات عبر التحويل البنكي المباشر وإرسال الإيصال لفريقنا.
        </p>

        {/* Fee table */}
        <div className="bg-muted/30 border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-bold text-sm">جدول الرسوم</h2>
          </div>
          <div className="divide-y divide-border">
            {FEES.map((fee, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{fee.label}</p>
                  <p className="text-xs text-muted-foreground">{fee.note}</p>
                </div>
                <p className="font-bold text-primary">{fee.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bank info */}
        <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-sm">بيانات الحساب البنكي</h2>
          </div>
          <div className="space-y-3">
            {Object.entries({
              "البنك": BANK_INFO.bank,
              "رقم الآيبان": BANK_INFO.iban,
              "اسم المستفيد": BANK_INFO.name,
              "رمز SWIFT": BANK_INFO.swift,
            }).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2 bg-background rounded-xl px-3 py-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(value).catch(() => {});
                  }}
                  className="text-sm font-mono font-medium hover:text-primary transition-colors cursor-pointer"
                >
                  {value}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
          <h2 className="font-bold text-sm">خطوات السداد</h2>
          <ol className="space-y-3">
            {[
              "حوّل المبلغ المطلوب إلى الحساب البنكي أعلاه",
              "التقط صورة واضحة لإيصال التحويل",
              "أرسل الإيصال عبر صفحة الاشتراكات أو تواصل معنا مباشرة",
              "سيتم تفعيل الخدمة خلال 24 ساعة",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-green-600">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>جميع المدفوعات آمنة ومحمية</p>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>في حال وجود أي استفسار يرجى التواصل مع فريق الدعم</p>
          </div>
        </div>

        {/* CTA to subscriptions */}
        <a
          href="/subscriptions"
          className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">اشترك في إحدى الباقات</span>
          </div>
          <span className="text-xs text-primary">←</span>
        </a>
      </div>
    </AccountLayout>
  );
}
