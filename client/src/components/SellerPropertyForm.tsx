import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Building2, MapPin, User, ImagePlus, Home, Wallet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const cities = ["جدة", "الرياض", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر"];
const jeddahDistricts = ["الحمراء", "الروضة", "الزهراء", "السليمانية", "النسيم", "البوادي", "المروة", "الصفا", "الفيصلية"];
const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "building", label: "عمارة" },
  { value: "land", label: "أرض" },
];
const accountTypes = [
  { value: "individual", label: "فرد" },
  { value: "developer", label: "مطور عقاري" },
  { value: "office", label: "مكتب عقاري" },
];
const propertyStatuses = [
  { value: "ready", label: "جاهز للسكن" },
  { value: "under_construction", label: "تحت الإنشاء" },
];

const TOTAL_STEPS = 4;

export default function SellerPropertyForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: "",
    entityName: "",
    contactName: "",
    phone: "",
    email: "",
    propertyType: "",
    city: "جدة",
    district: "",
    price: "",
    area: "",
    rooms: "",
    description: "",
    status: "",
    images: [] as string[],
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sellers/register", {
        name: formData.contactName,
        email: formData.email || `${formData.phone}@seller.tatabuq.sa`,
        phone: formData.phone,
        accountType: formData.accountType,
        entityName: formData.entityName,
        propertyType: formData.propertyType,
        city: formData.city,
        district: formData.district,
        price: formData.price,
        area: formData.area,
        rooms: formData.rooms,
        description: formData.description,
        status: formData.status,
        images: formData.images,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة العقار بنجاح!",
        description: "سيتم مراجعة العقار ونشره قريباً وإشعار المشترين المهتمين",
      });
      setCurrentStep(5); // Success state
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    registerMutation.mutate();
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">تم إضافة العقار بنجاح!</h2>
            <p className="text-muted-foreground mb-6">
              سيتم مراجعة العقار ونشره قريباً. سنقوم بإشعار المشترين المهتمين بعقارك.
            </p>
            <Button onClick={() => { setCurrentStep(1); setFormData({ ...formData, propertyType: "", district: "", price: "", area: "", rooms: "", description: "", status: "" }); }}>
              إضافة عقار آخر
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-seller-form-title">اعرض عقارك الآن</h1>
          <p className="text-muted-foreground" data-testid="text-seller-form-subtitle">أضف تفاصيل عقارك وسنوصله للمشترين المناسبين</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>الخطوة {currentStep} من {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-seller-form" />
        </div>

        <Card className="p-6 md:p-8">
          {currentStep === 1 && (
            <div className="space-y-6" data-testid="seller-step-1">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">معلومات البائع</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  أخبرنا عن نفسك أو شركتك
                </p>
              </div>

              <div>
                <Label>نوع الحساب</Label>
                <RadioGroup
                  value={formData.accountType}
                  onValueChange={(v) => updateFormData("accountType", v)}
                  className="grid grid-cols-3 gap-4 mt-2"
                >
                  {accountTypes.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={`account-${type.value}`}
                      className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.accountType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`radio-account-${type.value}`}
                    >
                      <RadioGroupItem value={type.value} id={`account-${type.value}`} className="sr-only" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="entityName">اسم الجهة / الشركة</Label>
                  <Input
                    id="entityName"
                    placeholder="مثال: شركة التطوير العقاري"
                    value={formData.entityName}
                    onChange={(e) => updateFormData("entityName", e.target.value)}
                    data-testid="input-entity-name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactName">اسم المسؤول</Label>
                  <Input
                    id="contactName"
                    placeholder="الاسم الكامل"
                    value={formData.contactName}
                    onChange={(e) => updateFormData("contactName", e.target.value)}
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="sellerPhone">رقم التواصل</Label>
                  <Input
                    id="sellerPhone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    dir="ltr"
                    className="text-right"
                    data-testid="input-seller-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="sellerEmail">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="sellerEmail"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    dir="ltr"
                    className="text-right"
                    data-testid="input-seller-email"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6" data-testid="seller-step-2">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">تفاصيل العقار</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  أضف معلومات العقار الأساسية
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">نوع العقار</Label>
                  <Select value={formData.propertyType} onValueChange={(v) => updateFormData("propertyType", v)}>
                    <SelectTrigger id="propertyType" data-testid="select-property-type">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sellerCity">المدينة</Label>
                  <Select value={formData.city} onValueChange={(v) => updateFormData("city", v)}>
                    <SelectTrigger id="sellerCity" data-testid="select-seller-city">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="district">الحي</Label>
                <Select value={formData.district} onValueChange={(v) => updateFormData("district", v)}>
                  <SelectTrigger id="district" data-testid="select-district">
                    <SelectValue placeholder="اختر الحي" />
                  </SelectTrigger>
                  <SelectContent>
                    {jeddahDistricts.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerRooms">عدد الغرف</Label>
                  <Select value={formData.rooms} onValueChange={(v) => updateFormData("rooms", v)}>
                    <SelectTrigger id="sellerRooms" data-testid="select-seller-rooms">
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
                  <Label htmlFor="sellerArea">المساحة (م²)</Label>
                  <Input
                    id="sellerArea"
                    type="number"
                    placeholder="مثال: 200"
                    value={formData.area}
                    onChange={(e) => updateFormData("area", e.target.value)}
                    data-testid="input-seller-area"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6" data-testid="seller-step-3">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">السعر والحالة</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  حدد سعر العقار وحالته
                </p>
              </div>

              <div>
                <Label htmlFor="price">السعر (ريال سعودي)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="مثال: 750000"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  data-testid="input-price"
                />
              </div>

              <div>
                <Label>حالة العقار</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(v) => updateFormData("status", v)}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {propertyStatuses.map((status) => (
                    <Label
                      key={status.value}
                      htmlFor={`status-${status.value}`}
                      className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.status === status.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`radio-status-${status.value}`}
                    >
                      <RadioGroupItem value={status.value} id={`status-${status.value}`} className="sr-only" />
                      <span className="font-medium">{status.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="description">وصف العقار</Label>
                <Textarea
                  id="description"
                  placeholder="أضف تفاصيل إضافية عن العقار مثل المميزات والخدمات القريبة..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6" data-testid="seller-step-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <ImagePlus className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">صور العقار</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  أضف صوراً واضحة للعقار لجذب المشترين
                </p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">اسحب الصور هنا أو اضغط للتحميل</p>
                <Button variant="outline" data-testid="button-upload-images">
                  اختر الصور
                </Button>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG حتى 5MB لكل صورة</p>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-bold mb-2">ملخص العقار</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">النوع:</span>{" "}
                    <span className="font-medium">{propertyTypes.find(t => t.value === formData.propertyType)?.label || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الموقع:</span>{" "}
                    <span className="font-medium">{formData.district}, {formData.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المساحة:</span>{" "}
                    <span className="font-medium">{formData.area || "-"} م²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">السعر:</span>{" "}
                    <span className="font-medium">{formData.price ? `${parseInt(formData.price).toLocaleString()} ريال` : "-"}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t gap-4">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep} data-testid="button-seller-prev">
                <ArrowRight className="ml-2 h-4 w-4" />
                السابق
              </Button>
            ) : (
              <div />
            )}
            
            {currentStep < TOTAL_STEPS ? (
              <Button onClick={nextStep} data-testid="button-seller-next">
                التالي
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={registerMutation.isPending} data-testid="button-seller-submit">
                {registerMutation.isPending ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="ml-2 h-4 w-4" />
                )}
                نشر العقار
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
