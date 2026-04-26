import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const phone = (location.state as { phone?: string })?.phone;
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const sendOTP = useAction(api.auth.actions.sendLoginOTP);
  const verifyOTP = useAction(api.auth.actions.verifyLoginOTP);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone) {
      navigate("/auth/login", { replace: true });
    }
  }, [phone, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    // Auto-submit when OTP is complete
    if (value.length === OTP_LENGTH) {
      handleVerify(value);
    }
  };

  const handleVerify = async (code: string = otp) => {
    if (code.length !== OTP_LENGTH || !phone) return;

    setIsLoading(true);
    try {
      const result = await verifyOTP({ phone, code });
      login(result.sessionToken);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "رمز التحقق غير صحيح";
      toast.error(message);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setIsResending(true);
    try {
      await sendOTP({ phone });
      toast.success("تم إرسال رمز تحقق جديد");
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);
      setOtp("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل إعادة إرسال الرمز";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const formatPhone = (p: string) => {
    // Format: 05XX XXX XXXX
    if (p.startsWith("+966")) {
      const local = "0" + p.slice(4);
      return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
    }
    return p;
  };

  if (!phone) {
    return null;
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
            <CardTitle className="text-xl text-card-foreground">التحقق من الرقم</CardTitle>
            <CardDescription>
              أدخل رمز التحقق المرسل إلى
              <br />
              <span className="font-medium text-foreground" dir="ltr">
                {formatPhone(phone)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center" dir="ltr">
                <InputOTP
                  maxLength={OTP_LENGTH}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} className="h-12 w-12 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={() => handleVerify()}
                className="w-full" 
                disabled={isLoading || otp.length !== OTP_LENGTH}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "تأكيد"
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm">
                {canResend ? (
                  <Button
                    variant="ghost"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="ml-2 h-4 w-4" />
                        إعادة إرسال الرمز
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-muted-foreground">
                    إعادة الإرسال بعد {resendTimer} ثانية
                  </p>
                )}

                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/auth/login")}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  تغيير رقم الجوال
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
