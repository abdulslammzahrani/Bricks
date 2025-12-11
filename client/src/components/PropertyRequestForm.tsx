import { useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  MapPin, User, Home, Building2, 
  Check, Phone, DollarSign, ChevronUp, ChevronDown,
  Building, Warehouse, LandPlot, Ruler, Mail,
  Send, Clock, CheckCircle2
} from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";

interface RequestData {
  name: string;
  phone: string;
  email: string;
  transactionType: "sale" | "rent";
  propertyCategory: "residential" | "commercial";
  city: string;
  districts: string[];
  propertyType: string;
  rooms: string;
  bathrooms: string;
  areaMin: string;
  areaMax: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  notes: string;
}

function validateSaudiPhone(phone: string): { isValid: boolean; error: string } {
  if (!phone.trim()) return { isValid: false, error: "" };
  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" };
  }
  return { isValid: true, error: "" };
}

interface PropertyRequestFormProps {
  onSubmit: (data: any) => void;
}

export const PropertyRequestForm = memo(function PropertyRequestForm({ onSubmit }: PropertyRequestFormProps) {
  const [activeCard, setActiveCard] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  
  const [formData, setFormData] = useState<RequestData>({
    name: "",
    phone: "",
    email: "",
    transactionType: "sale",
    propertyCategory: "residential",
    city: "",
    districts: [],
    propertyType: "",
    rooms: "",
    bathrooms: "",
    areaMin: "",
    areaMax: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    notes: ""
  });

  const cards = [
    { id: "personal", title: "البيانات الشخصية", icon: User, color: "bg-blue-500", lightColor: "bg-blue-100" },
    { id: "type", title: "نوع الطلب", icon: Home, color: "bg-purple-500", lightColor: "bg-purple-100" },
    { id: "location", title: "الموقع", icon: MapPin, color: "bg-green-500", lightColor: "bg-green-100" },
    { id: "specs", title: "المواصفات", icon: Building2, color: "bg-orange-500", lightColor: "bg-orange-100" },
    { id: "budget", title: "الميزانية", icon: DollarSign, color: "bg-emerald-500", lightColor: "bg-emerald-100" },
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

  const timelines = [
    { id: "immediate", label: "فوري" },
    { id: "1month", label: "خلال شهر" },
    { id: "3months", label: "خلال 3 أشهر" },
    { id: "6months", label: "خلال 6 أشهر" },
    { id: "flexible", label: "مرن" },
  ];

  const selectedCity = saudiCities.find(c => c.name === formData.city);
  const filteredCities = useMemo(() => saudiCities.filter(c => 
    c.name.includes(citySearch) || c.nameEn.toLowerCase().includes(citySearch.toLowerCase())
  ), [citySearch]);
  const filteredDistricts = useMemo(() => selectedCity?.neighborhoods.filter(n =>
    n.name.includes(districtSearch)
  ) || [], [selectedCity, districtSearch]);

  const propertyTypes = formData.propertyCategory === "residential" ? residentialTypes : commercialTypes;

  const canProceed = () => {
    switch (activeCard) {
      case 0: return formData.name.trim() && formData.phone.trim() && !phoneError;
      case 1: return formData.propertyType;
      case 2: return formData.city;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (activeCard < cards.length - 1 && canProceed()) {
      setActiveCard(activeCard + 1);
    }
  };

  const handlePrev = () => {
    if (activeCard > 0) {
      setActiveCard(activeCard - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, type: "request" });
  };

  const currentCard = cards[activeCard];
  const Icon = currentCard.icon;

  return (
    <div className="p-4 relative">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`h-1.5 rounded-full transition-all ${
              idx === activeCard ? "w-8 bg-primary" : 
              idx < activeCard ? "w-4 bg-primary/60" : "w-4 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Cards Stack */}
      <div className="relative" style={{ minHeight: "420px" }}>
        {/* Previous cards preview */}
        {activeCard > 0 && (
          <div 
            className="absolute inset-x-2 -top-2 cursor-pointer"
            onClick={handlePrev}
          >
            <div className="bg-muted/60 rounded-t-lg p-2 flex items-center justify-center gap-2 border-x border-t">
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{cards[activeCard - 1].title}</span>
            </div>
          </div>
        )}

        {/* Active Card */}
        <Card className={`relative z-10 overflow-hidden ${activeCard > 0 ? "mt-6" : ""}`}>
          {/* Card Header */}
          <div className={`${currentCard.color} text-white p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentCard.title}</h3>
                <p className="text-white/80 text-xs">
                  الخطوة {activeCard + 1} من {cards.length}
                </p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 space-y-4">
            {/* Card 1: Personal Data */}
            {activeCard === 0 && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الاسم الكامل *</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="أدخل اسمك"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pr-10"
                      data-testid="input-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">رقم الجوال *</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="05xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFormData({...formData, phone: val});
                        setPhoneError(validateSaudiPhone(val).error);
                      }}
                      className="pr-10"
                      data-testid="input-phone"
                    />
                  </div>
                  {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني (اختياري)</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pr-10"
                      data-testid="input-email"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Card 2: Property Type */}
            {activeCard === 1 && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الطلب</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.transactionType === "sale" ? "default" : "outline"}
                      onClick={() => setFormData({...formData, transactionType: "sale"})}
                      className="flex-1"
                      data-testid="button-sale"
                    >
                      شراء
                    </Button>
                    <Button
                      type="button"
                      variant={formData.transactionType === "rent" ? "default" : "outline"}
                      onClick={() => setFormData({...formData, transactionType: "rent"})}
                      className="flex-1"
                      data-testid="button-rent"
                    >
                      إيجار
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">تصنيف العقار</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.propertyCategory === "residential" ? "default" : "outline"}
                      onClick={() => setFormData({...formData, propertyCategory: "residential", propertyType: ""})}
                      className="flex-1"
                      data-testid="button-residential"
                    >
                      سكني
                    </Button>
                    <Button
                      type="button"
                      variant={formData.propertyCategory === "commercial" ? "default" : "outline"}
                      onClick={() => setFormData({...formData, propertyCategory: "commercial", propertyType: ""})}
                      className="flex-1"
                      data-testid="button-commercial"
                    >
                      تجاري
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">نوع العقار *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {propertyTypes.map(type => {
                      const TypeIcon = type.icon;
                      return (
                        <Button
                          key={type.id}
                          type="button"
                          variant={formData.propertyType === type.id ? "default" : "outline"}
                          onClick={() => setFormData({...formData, propertyType: type.id})}
                          className="flex flex-col gap-1 h-auto py-3"
                          data-testid={`button-type-${type.id}`}
                        >
                          <TypeIcon className="w-5 h-5" />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Card 3: Location */}
            {activeCard === 2 && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">المدينة *</label>
                  <Input
                    placeholder="ابحث عن المدينة..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="mb-2"
                    data-testid="input-city-search"
                  />
                  <div className="grid grid-cols-3 gap-2 max-h-[150px] overflow-y-auto">
                    {filteredCities.slice(0, 12).map(city => (
                      <Button
                        key={city.name}
                        type="button"
                        variant={formData.city === city.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setFormData({...formData, city: city.name, districts: []});
                          setCitySearch("");
                        }}
                        className="text-xs"
                        data-testid={`button-city-${city.name}`}
                      >
                        {city.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {formData.city && selectedCity && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">الأحياء المفضلة (اختياري)</label>
                    <Input
                      placeholder="ابحث عن الحي..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="mb-2"
                      data-testid="input-district-search"
                    />
                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                      {filteredDistricts.slice(0, 15).map(district => (
                        <Button
                          key={district.name}
                          type="button"
                          variant={formData.districts.includes(district.name) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (formData.districts.includes(district.name)) {
                              setFormData({...formData, districts: formData.districts.filter(d => d !== district.name)});
                            } else {
                              setFormData({...formData, districts: [...formData.districts, district.name]});
                            }
                          }}
                          className="text-xs"
                          data-testid={`button-district-${district.name}`}
                        >
                          {district.name}
                          {formData.districts.includes(district.name) && <Check className="w-3 h-3 mr-1" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Card 4: Specifications */}
            {activeCard === 3 && (
              <>
                {formData.propertyType !== "land" && (
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
                            className="flex-1 px-2"
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
                            className="flex-1 px-2"
                            data-testid={`button-bathrooms-${num}`}
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">المساحة (م²)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="من"
                        value={formData.areaMin}
                        onChange={(e) => setFormData({...formData, areaMin: e.target.value.replace(/\D/g, "")})}
                        className="pr-10"
                        data-testid="input-area-min"
                      />
                    </div>
                    <div className="relative">
                      <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="إلى"
                        value={formData.areaMax}
                        onChange={(e) => setFormData({...formData, areaMax: e.target.value.replace(/\D/g, "")})}
                        className="pr-10"
                        data-testid="input-area-max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">متى تريد الشراء/الاستئجار؟</label>
                  <div className="flex flex-wrap gap-2">
                    {timelines.map(t => (
                      <Button
                        key={t.id}
                        type="button"
                        variant={formData.timeline === t.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({...formData, timeline: t.id})}
                        data-testid={`button-timeline-${t.id}`}
                      >
                        <Clock className="w-3 h-3 ml-1" />
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Card 5: Budget */}
            {activeCard === 4 && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    الميزانية {formData.transactionType === "rent" ? "(شهري)" : ""} (ريال)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="من"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({...formData, budgetMin: e.target.value.replace(/\D/g, "")})}
                        className="pr-10"
                        data-testid="input-budget-min"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="إلى"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({...formData, budgetMax: e.target.value.replace(/\D/g, "")})}
                        className="pr-10"
                        data-testid="input-budget-max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات إضافية</label>
                  <Textarea
                    placeholder="أي متطلبات خاصة..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <h4 className="font-medium text-sm mb-2">ملخص الطلب:</h4>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>النوع: {formData.transactionType === "sale" ? "شراء" : "إيجار"} - {formData.propertyCategory === "residential" ? "سكني" : "تجاري"}</p>
                    <p>المدينة: {formData.city || "غير محدد"}</p>
                    {formData.districts.length > 0 && <p>الأحياء: {formData.districts.join("، ")}</p>}
                    <p>نوع العقار: {propertyTypes.find(t => t.id === formData.propertyType)?.label || "غير محدد"}</p>
                    {formData.rooms && <p>الغرف: {formData.rooms}</p>}
                    {(formData.budgetMin || formData.budgetMax) && (
                      <p>الميزانية: {formData.budgetMin || "0"} - {formData.budgetMax || "غير محدد"} ريال</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Card Footer - Navigation */}
          <div className="p-4 pt-0 flex gap-2">
            {activeCard > 0 && (
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
            
            {activeCard < cards.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
                data-testid="button-next"
              >
                التالي
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1 gap-2"
                data-testid="button-submit"
              >
                <Send className="w-4 h-4" />
                إرسال الطلب
              </Button>
            )}
          </div>
        </Card>

        {/* Next cards preview */}
        {activeCard < cards.length - 1 && (
          <div className="absolute inset-x-2 -bottom-2 pointer-events-none">
            <div className={`${cards[activeCard + 1].lightColor} rounded-b-lg p-2 flex items-center justify-center gap-2 border-x border-b opacity-60`}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{cards[activeCard + 1].title}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
