import AccountLayout from "@/components/layout/account-layout.tsx";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <AccountLayout title="اتصل بنا">
      <div className="max-w-xl mx-auto p-4 space-y-5" dir="rtl">
        <p className="text-sm text-muted-foreground">
          نحن هنا لمساعدتك في أي وقت. تواصل معنا عبر أي من القنوات التالية.
        </p>

        {/* Contact cards */}
        <div className="space-y-3">
          {[
            {
              icon: Phone,
              label: "هاتف الدعم",
              value: "+966 50 000 0000",
              sub: "السبت – الخميس، 9 ص – 9 م",
              href: "tel:+966500000000",
              color: "bg-green-500/10 text-green-600",
            },
            {
              icon: MessageCircle,
              label: "واتساب",
              value: "+966 50 000 0001",
              sub: "رد خلال دقائق",
              href: "https://wa.me/966500000001",
              color: "bg-emerald-500/10 text-emerald-600",
            },
            {
              icon: Mail,
              label: "البريد الإلكتروني",
              value: "support@souq-alsafat.com",
              sub: "رد خلال 24 ساعة",
              href: "mailto:support@souq-alsafat.com",
              color: "bg-blue-500/10 text-blue-600",
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 bg-muted/30 border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-sm">{item.value}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> {item.sub}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Location */}
        <div className="bg-muted/30 border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">موقعنا</p>
              <p className="text-xs text-muted-foreground">الرياض، المملكة العربية السعودية</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          سوق الصفاة — منصة بيع وشراء المواشي
        </p>
      </div>
    </AccountLayout>
  );
}
