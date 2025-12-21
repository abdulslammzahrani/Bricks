import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lock, Eye, EyeOff, Loader2, Shield, Check, X, Fingerprint } from "lucide-react";
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";

export default function SetupPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<"password" | "biometric">("password");

  const { data: currentUser, isLoading } = useQuery<{ user?: { id: string; name: string; phone: string; email: string; role: string; requiresPasswordReset?: boolean } }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      const res = await apiRequest("POST", "/api/auth/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "تم تعيين كلمة المرور",
        description: "كلمة المرور الجديدة فعالة الآن",
      });
      
      if (browserSupportsWebAuthn()) {
        setStep("biometric");
      } else {
        redirectToDashboard();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerBiometricMutation = useMutation({
    mutationFn: async () => {
      const optionsRes = await apiRequest("POST", "/api/auth/webauthn/register-options", {});
      const options = await optionsRes.json();
      
      const regResponse = await startRegistration({ optionsJSON: options });
      
      const verifyRes = await apiRequest("POST", "/api/auth/webauthn/register-verify", {
        response: regResponse,
        deviceName: getDeviceName(),
      });
      return verifyRes.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تسجيل البصمة/الوجه",
        description: "يمكنك الآن تسجيل الدخول باستخدام البصمة أو الوجه",
      });
      redirectToDashboard();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل البصمة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Mac/i.test(ua)) return "Mac";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows";
    return "جهاز غير معروف";
  };

  const redirectToDashboard = () => {
    if (currentUser?.user?.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({ newPassword });
  };

  const passwordValidations = [
    { label: "6 أحرف على الأقل", valid: newPassword.length >= 6 },
    { label: "متطابقة", valid: newPassword === confirmPassword && newPassword.length > 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser?.user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {step === "password" ? (
              <Shield className="h-8 w-8 text-primary" />
            ) : (
              <Fingerprint className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "password" ? "إعداد كلمة المرور" : "تفعيل البصمة/الوجه"}
          </CardTitle>
          <CardDescription>
            {step === "password" 
              ? `مرحباً ${currentUser.user.name}، يرجى إنشاء كلمة مرور جديدة`
              : "هل تريد تفعيل الدخول السريع بالبصمة أو الوجه؟"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === "password" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  كلمة المرور الجديدة
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {passwordValidations.map((v, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm ${v.valid ? "text-green-600" : "text-muted-foreground"}`}>
                    {v.valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {v.label}
                  </div>
                ))}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={changePasswordMutation.isPending || !passwordValidations.every(v => v.valid)}
                data-testid="button-set-password"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ كلمة المرور"
                )}
              </Button>
            </form>
          )}

          {step === "biometric" && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-4 text-muted-foreground">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <Fingerprint className="h-6 w-6" />
                    </div>
                    <span className="text-xs">البصمة</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                      </svg>
                    </div>
                    <span className="text-xs">الوجه</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  سجّل دخولك بشكل أسرع باستخدام Face ID أو Touch ID أو بصمة الإصبع
                </p>
              </div>

              <Button 
                className="w-full" 
                onClick={() => registerBiometricMutation.mutate()}
                disabled={registerBiometricMutation.isPending}
                data-testid="button-enable-biometric"
              >
                {registerBiometricMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 ml-2" />
                    تفعيل الدخول السريع
                  </>
                )}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={redirectToDashboard}
                data-testid="button-skip-biometric"
              >
                تخطي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
