import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Fingerprint, Eye, EyeOff, Phone, Lock, Loader2, ArrowLeft, Shield, Smartphone } from "lucide-react";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";

type LoginMode = "phone" | "biometric";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [webauthnSupported, setWebauthnSupported] = useState(false);

  useEffect(() => {
    setWebauthnSupported(browserSupportsWebAuthn());
  }, []);

  const { data: currentUser, isLoading: checkingAuth } = useQuery<{ user?: { id: string; name: string; phone: string; email: string; role: string; requiresPasswordReset?: boolean } }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (currentUser?.user) {
      if (currentUser.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [currentUser, setLocation]);

  const checkBiometricMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch(`/api/auth/webauthn/has-credentials?phone=${encodeURIComponent(phone)}`);
      return res.json();
    },
    onSuccess: (data) => {
      setHasBiometric(data.hasCredentials);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phone: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "تم تسجيل الدخول",
        description: `مرحباً ${data.user.name}`,
      });
      
      if (data.user.requiresPasswordReset) {
        setLocation("/setup-password");
      } else if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const biometricAuthMutation = useMutation({
    mutationFn: async () => {
      const optionsRes = await apiRequest("POST", "/api/auth/webauthn/auth-options", { phone: phone || undefined });
      const options = await optionsRes.json();
      
      const authResponse = await startAuthentication({ optionsJSON: options });
      
      const verifyRes = await apiRequest("POST", "/api/auth/webauthn/auth-verify", {
        response: authResponse,
        challenge: options.challenge,
      });
      return verifyRes.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "تم تسجيل الدخول",
        description: `مرحباً ${data.user.name}`,
      });
      
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "فشل التحقق البيومتري",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.length >= 10) {
      checkBiometricMutation.mutate(value);
    } else {
      setHasBiometric(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الجوال وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ phone, password });
  };

  const handleBiometricLogin = () => {
    biometricAuthMutation.mutate();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بياناتك للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {mode === "phone" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  رقم الجوال
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="text-right"
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>
          )}

          {webauthnSupported && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleBiometricLogin}
                disabled={biometricAuthMutation.isPending}
                data-testid="button-biometric-login"
              >
                {biometricAuthMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
                الدخول بالبصمة أو الوجه
              </Button>

              {hasBiometric && phone && (
                <p className="text-sm text-center text-green-600 flex items-center justify-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  لديك جهاز مسجل للدخول السريع
                </p>
              )}
            </>
          )}

          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-muted-foreground"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 ml-1" />
              العودة للرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
