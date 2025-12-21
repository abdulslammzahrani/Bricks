import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const params = new URLSearchParams(searchString);
  const token = params.get("token");

  const { data: tokenStatus, isLoading: verifyingToken } = useQuery<{ valid: boolean; error?: string }>({
    queryKey: ["/api/auth/verify-reset-token", token],
    queryFn: async () => {
      const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token || "")}`);
      return res.json();
    },
    enabled: !!token,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "تم تغيير كلمة المرور",
        description: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تغيير كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "جميع الحقول مطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "كلمة المرور قصيرة",
        description: "يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "كلمة المرور غير متطابقة",
        description: "تأكد من تطابق كلمتي المرور",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token: token!, newPassword: password });
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">جاري التحقق من الرابط...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || (tokenStatus && !tokenStatus.valid)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold" data-testid="text-invalid-token-title">
              رابط غير صالح
            </h2>
            <p className="text-muted-foreground" data-testid="text-invalid-token-message">
              {tokenStatus?.error || "رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية"}
            </p>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setLocation("/forgot-password")}
              data-testid="button-request-new-link"
            >
              طلب رابط جديد
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setLocation("/login")}
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="h-4 w-4 ml-1" />
              العودة لتسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold" data-testid="text-success-title">
              تم تغيير كلمة المرور
            </h2>
            <p className="text-muted-foreground" data-testid="text-success-message">
              يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
            </p>
            <Button 
              className="w-full mt-4"
              onClick={() => setLocation("/login")}
              data-testid="button-go-to-login"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" data-testid="text-reset-password-title">
            إعادة تعيين كلمة المرور
          </CardTitle>
          <CardDescription>
            أدخل كلمة المرور الجديدة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                كلمة المرور الجديدة
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                تأكيد كلمة المرور
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={resetPasswordMutation.isPending}
              data-testid="button-reset-password"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري التغيير...
                </>
              ) : (
                "تغيير كلمة المرور"
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="text-muted-foreground"
              data-testid="button-back-to-login-bottom"
            >
              <ArrowLeft className="h-4 w-4 ml-1" />
              العودة لتسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
