import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Building2, MapPin, Home, Wallet, CreditCard, Target, Phone, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cities = ["جدة", "الرياض", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر"];
const jeddahDistricts = ["الحمراء", "الروضة", "الزهراء", "السليمانية", "النسيم", "البوادي", "المروة", "الصفا", "الفيصلية"];
const propertyTypes = [
  { value: "apartment", label: "شقة", icon: Building2 },
  { value: "villa", label: "فيلا", icon: Home },
  { value: "building", label: "عمارة", icon: Building2 },
  { value: "land", label: "أرض", icon: MapPin },
];
const purposes = [
  { value: "residence", label: "سكن" },
  { value: "investment", label: "استثمار" },
];
const paymentMethods = [
  { value: "cash", label: "كاش" },
  { value: "bank", label: "تمويل بنكي" },
];

const TOTAL_STEPS = 5;

export default function BuyerWishForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    city: "جدة",
    districts: [] as string[],
    propertyType: "",
    rooms: "",
    area: "",
    budgetMin: "",
    budgetMax: "",
    paymentMethod: "",
    purpose: "",
    name: "",
    phone: "",
    email: "",
  });

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDistrict = (district: string) => {
    const newDistricts = formData.districts.includes(district)
      ? formData.districts.filter((d) => d !== district)
      : [...formData.districts, district];
    updateFormData("districts", newDistricts);
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    toast({
      title: "تم تسجيل رغبتك بنجاح!",
      description: "سنبدأ بالبحث عن العقارات المناسبة لك وسنرسل لك العروض قريباً",
    });
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-form-title">سجل رغبتك لشراء عقار</h1>
          <p className="text-muted-foreground" data-testid="text-form-subtitle">أخبرنا بما تبحث عنه وسنجد لك الأفضل</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>الخطوة {currentStep} من {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-form" />
        </div>

        <Card className="p-6 md:p-8">
          {currentStep === 1 && (
            <div className="space-y-6" data-testid="step-1">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">أين تريد العقار؟</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  مثال: <span className="text-primary">اسمي عبدالسلام محمد</span> من مدينة <span className="text-primary">جدة</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Select value={formData.city} onValueChange={(v) => updateFormData("city", v)}>
                    <SelectTrigger id="city" data-testid="select-city">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الأحياء المفضلة (اختر واحداً أو أكثر)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {jeddahDistricts.map((district) => (
                      <Button
                        key={district}
                        type="button"
                        variant={formData.districts.includes(district) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDistrict(district)}
                        className="justify-start"
                        data-testid={`button-district-${district}`}
                      >
                        {formData.districts.includes(district) && <Check className="ml-2 h-4 w-4" />}
                        {district}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6" data-testid="step-2">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">ما نوع العقار؟</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  مثال: أرغب بشراء <span className="text-primary">شقة</span>
                </p>
              </div>

              <RadioGroup
                value={formData.propertyType}
                onValueChange={(v) => updateFormData("propertyType", v)}
                className="grid grid-cols-2 gap-4"
              >
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.propertyType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`radio-property-${type.value}`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <Icon className={`h-8 w-8 mb-2 ${formData.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">{type.label}</span>
                    </Label>
                  );
                })}
              </RadioGroup>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="rooms">عدد الغرف</Label>
                  <Select value={formData.rooms} onValueChange={(v) => updateFormData("rooms", v)}>
                    <SelectTrigger id="rooms" data-testid="select-rooms">
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6+"].map((num) => (
                        <SelectItem key={num} value={num}>{num} غرف</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="area">المساحة (م²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="مثال: 200"
                    value={formData.area}
                    onChange={(e) => updateFormData("area", e.target.value)}
                    data-testid="input-area"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6" data-testid="step-3">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">ما ميزانيتك؟</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  حدد نطاق الميزانية المتوقعة بالريال السعودي
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">من</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="500,000"
                    value={formData.budgetMin}
                    onChange={(e) => updateFormData("budgetMin", e.target.value)}
                    data-testid="input-budget-min"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">إلى</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="1,000,000"
                    value={formData.budgetMax}
                    onChange={(e) => updateFormData("budgetMax", e.target.value)}
                    data-testid="input-budget-max"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label>طريقة الدفع</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(v) => updateFormData("paymentMethod", v)}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {paymentMethods.map((method) => (
                    <Label
                      key={method.value}
                      htmlFor={`payment-${method.value}`}
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.paymentMethod === method.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`radio-payment-${method.value}`}
                    >
                      <RadioGroupItem value={method.value} id={`payment-${method.value}`} className="sr-only" />
                      <CreditCard className={`h-5 w-5 ${formData.paymentMethod === method.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">{method.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6" data-testid="step-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">ما الغرض من الشراء؟</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  هل تشتري للسكن أم للاستثمار؟
                </p>
              </div>

              <RadioGroup
                value={formData.purpose}
                onValueChange={(v) => updateFormData("purpose", v)}
                className="grid grid-cols-2 gap-4"
              >
                {purposes.map((purpose) => (
                  <Label
                    key={purpose.value}
                    htmlFor={`purpose-${purpose.value}`}
                    className={`flex items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.purpose === purpose.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`radio-purpose-${purpose.value}`}
                  >
                    <RadioGroupItem value={purpose.value} id={`purpose-${purpose.value}`} className="sr-only" />
                    <span className="font-medium text-lg">{purpose.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6" data-testid="step-5">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">معلومات التواصل</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  سنرسل لك العروض المناسبة عبر واتساب والإيميل
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    placeholder="مثال: عبدالسلام محمد"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الجوال (واتساب)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    dir="ltr"
                    className="text-right"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    dir="ltr"
                    className="text-right"
                    data-testid="input-email"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t gap-4">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep} data-testid="button-prev">
                <ArrowRight className="ml-2 h-4 w-4" />
                السابق
              </Button>
            ) : (
              <div />
            )}
            
            {currentStep < TOTAL_STEPS ? (
              <Button onClick={nextStep} data-testid="button-next">
                التالي
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} data-testid="button-submit">
                <Check className="ml-2 h-4 w-4" />
                حفظ الرغبة
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
