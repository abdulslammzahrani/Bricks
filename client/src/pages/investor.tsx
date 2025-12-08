import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Building2, MapPin, Wallet, Send, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function InvestorPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cities: "",
    investmentTypes: "",
    budgetMin: "",
    budgetMax: "",
    returnPreference: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const investorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/investors/register", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "تم تسجيل اهتمامك بنجاح!",
        description: "سنتواصل معك عند توفر فرص استثمارية مناسبة",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.cities) {
      toast({
        title: "يرجى تعبئة الحقول المطلوبة",
        description: "الاسم ورقم الجوال والمدن المستهدفة مطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    investorMutation.mutate({
      name: formData.name,
      phone: formData.phone,
      cities: formData.cities,
      investmentTypes: formData.investmentTypes,
      budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : undefined,
      budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
      returnPreference: formData.returnPreference,
      notes: formData.notes,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">تم التسجيل بنجاح!</h2>
            <p className="text-muted-foreground">
              سنتواصل معك عند توفر فرص استثمارية تناسب معاييرك
            </p>
          </div>
          <Button onClick={() => window.location.href = "/"} className="w-full">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-background to-background dark:from-amber-950/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Sparkles className="h-3 w-3 ml-1" />
              فرص استثمارية حصرية
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              استثمر بذكاء في العقارات السعودية
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              سجل اهتمامك وسنرسل لك أفضل الفرص الاستثمارية التي تناسب ميزانيتك وأهدافك
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">تغطية شاملة</h3>
              <p className="text-sm text-muted-foreground">جميع المدن الرئيسية</p>
            </Card>
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">فرص متنوعة</h3>
              <p className="text-sm text-muted-foreground">سكني، تجاري، أراضي</p>
            </Card>
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">عوائد مجزية</h3>
              <p className="text-sm text-muted-foreground">تحليل دقيق للعائد</p>
            </Card>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-600" />
                سجل اهتمامك الاستثماري
              </CardTitle>
              <CardDescription>
                أخبرنا عن أهدافك الاستثمارية وسنجد لك الفرص المناسبة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم *</label>
                    <Input
                      placeholder="الاسم الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-investor-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الجوال *</label>
                    <Input
                      placeholder="05xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      dir="ltr"
                      data-testid="input-investor-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">المدن المستهدفة *</label>
                  <Input
                    placeholder="مثال: الرياض، جدة، الدمام"
                    value={formData.cities}
                    onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                    data-testid="input-investor-cities"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع الاستثمار المفضل</label>
                  <Input
                    placeholder="مثال: سكني، تجاري، أراضي"
                    value={formData.investmentTypes}
                    onChange={(e) => setFormData({ ...formData, investmentTypes: e.target.value })}
                    data-testid="input-investor-types"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الميزانية من (ريال)</label>
                    <Input
                      type="number"
                      placeholder="500000"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                      dir="ltr"
                      data-testid="input-investor-budget-min"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الميزانية إلى (ريال)</label>
                    <Input
                      type="number"
                      placeholder="5000000"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      dir="ltr"
                      data-testid="input-investor-budget-max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">هدف الاستثمار</label>
                  <Input
                    placeholder="مثال: عائد مرتفع، نمو رأس المال، دخل شهري"
                    value={formData.returnPreference}
                    onChange={(e) => setFormData({ ...formData, returnPreference: e.target.value })}
                    data-testid="input-investor-return"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ملاحظات إضافية</label>
                  <Textarea
                    placeholder="أي معلومات أخرى تود مشاركتها..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[100px]"
                    data-testid="input-investor-notes"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700" 
                  disabled={investorMutation.isPending}
                  data-testid="button-submit-investor"
                >
                  {investorMutation.isPending ? (
                    "جاري التسجيل..."
                  ) : (
                    <>
                      <Send className="ml-2 h-4 w-4" />
                      سجل اهتمامك
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
