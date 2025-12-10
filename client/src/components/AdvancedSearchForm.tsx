import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, User, Phone, Home, Building2, 
  ChevronLeft, ChevronRight, Sparkles, Search,
  Building, TreePine, Warehouse, LandPlot
} from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";

interface SearchFilters {
  name: string;
  phone: string;
  transactionType: "sale" | "rent";
  location: string;
  propertyCategory: "residential" | "commercial";
  propertyType: string;
  rooms: string;
  bathrooms: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  status: "all" | "ready" | "under_construction";
  rentPeriod: "all" | "yearly" | "monthly";
}

const propertyOptions = {
  residential: [
    { value: "apartment", label: "شقة", icon: Building },
    { value: "villa", label: "فيلا", icon: Home },
    { value: "floor", label: "دور", icon: Building2 },
    { value: "land", label: "أرض", icon: LandPlot },
  ],
  commercial: [
    { value: "office", label: "مكتب", icon: Building },
    { value: "warehouse", label: "مستودع", icon: Warehouse },
    { value: "shop", label: "محل", icon: Building2 },
    { value: "land", label: "أرض تجارية", icon: TreePine },
  ],
};

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onSwitchToChat: () => void;
}

export function AdvancedSearchForm({ onSearch, onSwitchToChat }: AdvancedSearchFormProps) {
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    phone: "",
    transactionType: "sale",
    location: "",
    propertyCategory: "residential",
    propertyType: "",
    rooms: "",
    bathrooms: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    status: "all",
    rentPeriod: "all",
  });

  const totalSteps = 4;
  const propertyTypes = propertyOptions[filters.propertyCategory];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return filters.name.trim() !== "" && filters.phone.trim() !== "";
      case 2: return true;
      case 3: return filters.location !== "";
      case 4: return true;
      default: return true;
    }
  };

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-2 p-4 pb-2">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => s <= step && setStep(s)}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step 
                ? "w-8 bg-primary" 
                : s < step 
                  ? "w-6 bg-primary/60 cursor-pointer" 
                  : "w-6 bg-muted"
            }`}
            data-testid={`step-indicator-${s}`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="p-5 min-h-[320px]">
        
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">مرحباً بك</h3>
              <p className="text-muted-foreground text-sm mt-1">عرّفنا على نفسك</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="الاسم الكريم"
                  value={filters.name}
                  onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                  className="h-14 text-lg text-center rounded-2xl border-2 focus:border-primary transition-colors"
                  data-testid="input-name"
                />
              </div>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="رقم الجوال"
                  value={filters.phone}
                  onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
                  className="h-14 text-lg text-center rounded-2xl border-2 focus:border-primary transition-colors"
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Transaction Type & Category */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">وش تبي؟</h3>
              <p className="text-muted-foreground text-sm mt-1">حدد نوع الطلب</p>
            </div>

            {/* Sale/Rent - Big Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFilters(f => ({ ...f, transactionType: "sale" }))}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-200 ${
                  filters.transactionType === "sale"
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-filter-sale"
              >
                <div className="text-3xl mb-2">🏠</div>
                <div className="font-bold text-lg">شراء</div>
                <div className="text-xs text-muted-foreground">أبحث عن عقار للتملك</div>
                {filters.transactionType === "sale" && (
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-primary" />
                )}
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, transactionType: "rent" }))}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-200 ${
                  filters.transactionType === "rent"
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-filter-rent"
              >
                <div className="text-3xl mb-2">🔑</div>
                <div className="font-bold text-lg">إيجار</div>
                <div className="text-xs text-muted-foreground">أبحث عن عقار للإيجار</div>
                {filters.transactionType === "rent" && (
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-primary" />
                )}
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setFilters(f => ({ ...f, propertyCategory: "residential", propertyType: "" }))}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all ${
                  filters.propertyCategory === "residential"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-category-residential"
              >
                <Home className="h-4 w-4" />
                سكني
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, propertyCategory: "commercial", propertyType: "" }))}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all ${
                  filters.propertyCategory === "commercial"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid="button-category-commercial"
              >
                <Building2 className="h-4 w-4" />
                تجاري
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">وين تبي؟</h3>
              <p className="text-muted-foreground text-sm mt-1">اختر المدينة</p>
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
              {saudiCities.slice(0, 12).map((city) => (
                <button
                  key={city.name}
                  onClick={() => setFilters(f => ({ ...f, location: city.name }))}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    filters.location === city.name
                      ? "border-primary bg-primary text-primary-foreground scale-[1.02]"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-city-${city.name}`}
                >
                  {city.name}
                </button>
              ))}
            </div>

            {/* More Cities */}
            {saudiCities.length > 12 && (
              <details className="group">
                <summary className="text-center text-sm text-primary cursor-pointer">
                  المزيد من المدن
                </summary>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {saudiCities.slice(12).map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setFilters(f => ({ ...f, location: city.name }))}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        filters.location === city.name
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Step 4: Property Type & Details */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">نوع العقار</h3>
              <p className="text-muted-foreground text-sm mt-1">اختر نوع العقار المطلوب</p>
            </div>

            {/* Property Types - Big Icons */}
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setFilters(f => ({ ...f, propertyType: f.propertyType === type.value ? "" : type.value }))}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      filters.propertyType === type.value
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`button-type-${type.value}`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-bold">{type.label}</div>
                    {filters.propertyType === type.value && (
                      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Options */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block text-center">عدد الغرف (اختياري)</label>
                <div className="flex justify-center gap-2">
                  {["1", "2", "3", "4", "5+"].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === num ? "" : num }))}
                      className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                        filters.rooms === num
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-rooms-${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 p-4 pt-0">
        {step > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="h-14 px-6 rounded-2xl"
            data-testid="button-back"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 h-14 rounded-2xl text-lg gap-2"
            data-testid="button-next"
          >
            التالي
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSearch}
            className="flex-1 h-14 rounded-2xl text-lg gap-2 bg-gradient-to-r from-primary to-green-600"
            data-testid="button-search"
          >
            <Search className="h-5 w-5" />
            ابحث الآن
          </Button>
        )}
      </div>

      {/* Chat Alternative */}
      <p className="text-center text-sm text-muted-foreground pb-4">
        أو{" "}
        <button
          onClick={onSwitchToChat}
          className="text-primary underline hover:no-underline"
          data-testid="button-switch-to-chat"
        >
          تحدث مع المساعد الذكي
        </button>
      </p>
    </div>
  );
}
