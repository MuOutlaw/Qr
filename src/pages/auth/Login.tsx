import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const sendOTP = useAction(api.auth.actions.sendLoginOTP);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const from = (location.state as { from?: string })?.from || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const formatPhoneDisplay = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 10 digits (05xxxxxxxx)
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneDisplay(e.target.value));
  };

  const isValidPhone = () => {
    const clean = phone.replace(/\D/g, "");
    return /^05\d{8}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidPhone()) {
      toast.error("يرجى إدخال رقم جوال صحيح يبدأ بـ 05");
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP({ phone });
      toast.success("تم إرسال رمز التحقق");
      navigate("/auth/verify", { state: { phone } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل إرسال رمز التحقق";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">سوق الصفاة</h1>
          <p className="mt-2 text-muted-foreground">سوق المواشي الإلكتروني</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-card-foreground">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل رقم جوالك لتلقي رمز التحقق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-card-foreground">رقم الجوال</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="pr-10 text-left"
                    dir="ltr"
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  سيتم إرسال رسالة نصية تحتوي على رمز التحقق
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isValidPhone()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال رمز التحقق"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          بالمتابعة، أنت توافق على{" "}
          <a href="/terms" className="text-primary hover:underline">
            شروط الاستخدام
          </a>{" "}
          و{" "}
          <a href="/privacy" className="text-primary hover:underline">
            سياسة الخصوصية
          </a>
        </p>
      </div>
    </div>
  );
}
