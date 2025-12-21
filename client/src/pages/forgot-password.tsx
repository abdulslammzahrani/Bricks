import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", { email });
      return res.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "البريد الإلكتروني مطلوب",
        description: "يرجى إدخال بريدك الإلكتروني",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold" data-testid="text-email-sent-title">تم إرسال الرابط</h2>
            <p className="text-muted-foreground" data-testid="text-email-sent-message">
              إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة تحتوي على رابط لاستعادة كلمة المرور.
            </p>
            <p className="text-sm text-muted-foreground">
              تحقق من صندوق الوارد والبريد غير المرغوب فيه
            </p>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setLocation("/login")}
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة لتسجيل الدخول
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
          <CardTitle className="text-2xl font-bold" data-testid="text-forgot-password-title">
            نسيت كلمة المرور
          </CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابط لاستعادة كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-left"
                dir="ltr"
                data-testid="input-email"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={forgotPasswordMutation.isPending}
              data-testid="button-send-reset-link"
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال رابط الاستعادة"
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
