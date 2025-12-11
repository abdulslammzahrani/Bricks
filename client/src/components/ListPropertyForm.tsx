import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, User, Home, Building2, 
  Check, Phone, DollarSign,
  Building, Warehouse, LandPlot, Ruler, BedDouble,
  Send, Bath, Camera
} from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";

interface PropertyData {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  transactionType: "sale" | "rent";
  propertyCategory: "residential" | "commercial";
  city: string;
  district: string;
  propertyType: string;
  propertyCondition: "new" | "used" | "under_construction" | "";
  rooms: string;
  bathrooms: string;
  area: string;
  price: string;
  description: string;
}

function validateSaudiPhone(phone: string): { isValid: boolean; error: string } {
  if (!phone.trim()) return { isValid: false, error: "" };
  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" };
  }
  return { isValid: true, error: "" };
}

interface ListPropertyFormProps {
  onSubmit: (data: any) => void;
}

export const ListPropertyForm = memo(function ListPropertyForm({ onSubmit }: ListPropertyFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  
  const [formData, setFormData] = useState<PropertyData>({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    transactionType: "sale",
    propertyCategory: "residential",
    city: "",
    district: "",
    propertyType: "",
    propertyCondition: "",
    rooms: "",
    bathrooms: "",
    area: "",
    price: "",
    description: ""
  });

  const steps = [
    { id: "personal", title: "البيانات الشخصية", icon: User },
    { id: "location", title: "الموقع", icon: MapPin },
    { id: "property", title: "مواصفات العقار", icon: Home },
    { id: "price", title: "السعر والوصف", icon: DollarSign },
  ];

  const residentialTypes = [
    { id: "apartment", label: "شقة", icon: Building },
    { id: "villa", label: "فيلا", icon: Home },
    { id: "duplex", label: "دوبلكس", icon: Building2 },
    { id: "floor", label: "دور", icon: Building },
    { id: "land", label: "أرض", icon: LandPlot },
  ];

  const commercialTypes = [
    { id: "office", label: "مكتب", icon: Building },
    { id: "shop", label: "محل", icon: Warehouse },
    { id: "warehouse", label: "مستودع", icon: Warehouse },
    { id: "building", label: "عمارة", icon: Building2 },
    { id: "land", label: "أرض تجارية", icon: LandPlot },
  ];

  const propertyConditions = [
    { id: "new", label: "جديد" },
    { id: "used", label: "مستخدم" },
    { id: "under_construction", label: "تحت الإنشاء" },
  ];

  const selectedCity = saudiCities.find(c => c.name === formData.city);
  const filteredCities = saudiCities.filter(c => 
    c.name.includes(citySearch) || c.nameEn.toLowerCase().includes(citySearch.toLowerCase())
  );
  const filteredDistricts = selectedCity?.neighborhoods.filter(n =>
    n.name.includes(districtSearch)
  ) || [];

  const propertyTypes = formData.propertyCategory === "residential" ? residentialTypes : commercialTypes;

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      type: "listing"
    });
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formData.ownerName.trim() && formData.ownerPhone.trim() && !phoneError;
      case 1:
        return formData.city && formData.district;
      case 2:
        return formData.propertyType && formData.area;
      case 3:
        return formData.price;
      default:
        return false;
    }
  };

  return (
    <div className="p-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 px-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          const isComplete = idx < activeStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isComplete ? "bg-green-600 text-white" :
                  isActive ? "bg-green-600/20 text-green-600 border-2 border-green-600" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] ${isActive ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Personal Data */}
        {activeStep === 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">بيانات المالك</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">اسم المالك *</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="أدخل اسمك"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    className="pr-10"
                    data-testid="input-owner-name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">رقم الجوال *</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="05xxxxxxxx"
                    value={formData.ownerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({...formData, ownerPhone: val});
                      const result = validateSaudiPhone(val);
                      setPhoneError(result.error);
                    }}
                    className="pr-10"
                    data-testid="input-owner-phone"
                  />
                </div>
                {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">البريد الإلكتروني (اختياري)</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                  data-testid="input-owner-email"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="pt-4">
              <label className="text-sm font-medium mb-2 block">نوع العرض</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.transactionType === "sale" ? "default" : "outline"}
                  onClick={() => setFormData({...formData, transactionType: "sale"})}
                  className={`flex-1 ${formData.transactionType === "sale" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  data-testid="button-sale"
                >
                  بيع
                </Button>
                <Button
                  type="button"
                  variant={formData.transactionType === "rent" ? "default" : "outline"}
                  onClick={() => setFormData({...formData, transactionType: "rent"})}
                  className={`flex-1 ${formData.transactionType === "rent" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  data-testid="button-rent"
                >
                  إيجار
                </Button>
              </div>
            </div>

            {/* Property Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">تصنيف العقار</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.propertyCategory === "residential" ? "default" : "outline"}
                  onClick={() => setFormData({...formData, propertyCategory: "residential", propertyType: ""})}
                  className={`flex-1 ${formData.propertyCategory === "residential" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  data-testid="button-residential"
                >
                  سكني
                </Button>
                <Button
                  type="button"
                  variant={formData.propertyCategory === "commercial" ? "default" : "outline"}
                  onClick={() => setFormData({...formData, propertyCategory: "commercial", propertyType: ""})}
                  className={`flex-1 ${formData.propertyCategory === "commercial" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  data-testid="button-commercial"
                >
                  تجاري
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">موقع العقار</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">المدينة *</label>
              <Input
                placeholder="ابحث عن المدينة..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="mb-2"
                data-testid="input-city-search"
              />
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {filteredCities.slice(0, 12).map(city => (
                  <Button
                    key={city.name}
                    type="button"
                    variant={formData.city === city.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFormData({...formData, city: city.name, district: ""});
                      setCitySearch("");
                    }}
                    className={`text-xs ${formData.city === city.name ? "bg-green-600 hover:bg-green-700" : ""}`}
                    data-testid={`button-city-${city.name}`}
                  >
                    {city.name}
                  </Button>
                ))}
              </div>
            </div>

            {formData.city && selectedCity && (
              <div>
                <label className="text-sm font-medium mb-2 block">الحي *</label>
                <Input
                  placeholder="ابحث عن الحي..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="mb-2"
                  data-testid="input-district-search"
                />
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {filteredDistricts.slice(0, 20).map(district => (
                    <Button
                      key={district.name}
                      type="button"
                      variant={formData.district === district.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({...formData, district: district.name})}
                      className={`text-xs ${formData.district === district.name ? "bg-green-600 hover:bg-green-700" : ""}`}
                      data-testid={`button-district-${district.name}`}
                    >
                      {district.name}
                      {formData.district === district.name && <Check className="w-3 h-3 mr-1" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Property Specs */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">مواصفات العقار</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">نوع العقار *</label>
              <div className="grid grid-cols-3 gap-2">
                {propertyTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      type="button"
                      variant={formData.propertyType === type.id ? "default" : "outline"}
                      onClick={() => setFormData({...formData, propertyType: type.id})}
                      className={`flex flex-col gap-1 h-auto py-3 ${formData.propertyType === type.id ? "bg-green-600 hover:bg-green-700" : ""}`}
                      data-testid={`button-type-${type.id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Property Condition */}
            <div>
              <label className="text-sm font-medium mb-2 block">حالة العقار</label>
              <div className="flex gap-2">
                {propertyConditions.map(cond => (
                  <Button
                    key={cond.id}
                    type="button"
                    variant={formData.propertyCondition === cond.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({...formData, propertyCondition: cond.id as any})}
                    className={`flex-1 ${formData.propertyCondition === cond.id ? "bg-green-600 hover:bg-green-700" : ""}`}
                    data-testid={`button-condition-${cond.id}`}
                  >
                    {cond.label}
                  </Button>
                ))}
              </div>
            </div>

            {formData.propertyType !== "land" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">عدد الغرف</label>
                    <div className="flex gap-1">
                      {["1", "2", "3", "4", "5+"].map(num => (
                        <Button
                          key={num}
                          type="button"
                          variant={formData.rooms === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, rooms: num})}
                          className={`flex-1 ${formData.rooms === num ? "bg-green-600 hover:bg-green-700" : ""}`}
                          data-testid={`button-rooms-${num}`}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">دورات المياه</label>
                    <div className="flex gap-1">
                      {["1", "2", "3", "4+"].map(num => (
                        <Button
                          key={num}
                          type="button"
                          variant={formData.bathrooms === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, bathrooms: num})}
                          className={`flex-1 ${formData.bathrooms === num ? "bg-green-600 hover:bg-green-700" : ""}`}
                          data-testid={`button-bathrooms-${num}`}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">المساحة (م²) *</label>
              <div className="relative">
                <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="مثال: 200"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value.replace(/\D/g, "")})}
                  className="pr-10"
                  data-testid="input-area"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Price & Description */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">السعر والوصف</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                السعر {formData.transactionType === "rent" ? "(شهري)" : ""} (ريال) *
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="مثال: 500000"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value.replace(/\D/g, "")})}
                  className="pr-10"
                  data-testid="input-price"
                />
              </div>
              {formData.price && (
                <p className="text-xs text-muted-foreground mt-1">
                  {parseInt(formData.price).toLocaleString('ar-SA')} ريال
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">وصف العقار</label>
              <Textarea
                placeholder="أضف وصفاً تفصيلياً للعقار..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                data-testid="input-description"
              />
            </div>

            {/* Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-sm text-green-700 dark:text-green-300">ملخص العرض:</h4>
              <div className="text-xs space-y-1 text-green-600 dark:text-green-400">
                <p>النوع: {formData.transactionType === "sale" ? "بيع" : "إيجار"} - {formData.propertyCategory === "residential" ? "سكني" : "تجاري"}</p>
                <p>الموقع: {formData.city} - {formData.district}</p>
                <p>نوع العقار: {propertyTypes.find(t => t.id === formData.propertyType)?.label || "غير محدد"}</p>
                {formData.area && <p>المساحة: {formData.area} م²</p>}
                {formData.rooms && <p>الغرف: {formData.rooms}</p>}
                {formData.price && (
                  <p className="font-bold text-green-700 dark:text-green-300">
                    السعر: {parseInt(formData.price).toLocaleString('ar-SA')} ريال
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 mt-6">
        {activeStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            className="flex-1"
            data-testid="button-prev"
          >
            السابق
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-green-600 hover:bg-green-700"
            data-testid="button-next"
          >
            التالي
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed()}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            data-testid="button-submit"
          >
            <Send className="w-4 h-4" />
            نشر العقار
          </Button>
        )}
      </div>
    </div>
  );
});
