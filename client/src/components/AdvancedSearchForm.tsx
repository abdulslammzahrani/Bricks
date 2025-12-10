import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, User, Phone, Home, Building2, 
  Sparkles, Search, Building, Warehouse, LandPlot,
  ArrowUp
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
    { value: "land", label: "أرض تجارية", icon: LandPlot },
  ],
};

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onSwitchToChat: () => void;
}

export function AdvancedSearchForm({ onSearch, onSwitchToChat }: AdvancedSearchFormProps) {
  const [activeCard, setActiveCard] = useState(0);
  const [animating, setAnimating] = useState(false);
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

  const propertyTypes = propertyOptions[filters.propertyCategory];

  const goToNextCard = () => {
    if (activeCard < 3 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setActiveCard(prev => prev + 1);
        setAnimating(false);
      }, 300);
    }
  };

  const goToPrevCard = (index: number) => {
    if (index < activeCard && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setActiveCard(index);
        setAnimating(false);
      }, 200);
    }
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const canProceed = (card: number) => {
    switch (card) {
      case 0: return filters.name.trim() !== "" && filters.phone.trim() !== "";
      case 1: return true;
      case 2: return filters.location !== "";
      case 3: return true;
      default: return true;
    }
  };

  // Card configurations
  const cards = [
    {
      id: 0,
      icon: User,
      title: "مرحباً بك",
      subtitle: "عرّفنا على نفسك",
      color: "from-emerald-500/20 to-emerald-600/5",
      completed: filters.name && filters.phone,
      summary: filters.name ? `${filters.name} - ${filters.phone}` : "",
    },
    {
      id: 1,
      icon: Sparkles,
      title: "نوع الطلب",
      subtitle: "شراء أو إيجار؟",
      color: "from-amber-500/20 to-amber-600/5",
      completed: true,
      summary: `${filters.transactionType === "sale" ? "شراء" : "إيجار"} - ${filters.propertyCategory === "residential" ? "سكني" : "تجاري"}`,
    },
    {
      id: 2,
      icon: MapPin,
      title: "المدينة",
      subtitle: "وين تبي العقار؟",
      color: "from-blue-500/20 to-blue-600/5",
      completed: !!filters.location,
      summary: filters.location || "",
    },
    {
      id: 3,
      icon: Home,
      title: "تفاصيل العقار",
      subtitle: "حدد المواصفات",
      color: "from-purple-500/20 to-purple-600/5",
      completed: !!filters.propertyType,
      summary: propertyTypes.find(t => t.value === filters.propertyType)?.label || "",
    },
  ];

  return (
    <div className="relative p-4 pb-6">
      {/* Stacked Cards Container */}
      <div className="relative" style={{ minHeight: "380px" }}>
        
        {/* Completed Cards - Collapsed at top */}
        {cards.slice(0, activeCard).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => goToPrevCard(card.id)}
              className={`
                absolute top-0 left-0 right-0 cursor-pointer
                transition-all duration-500 ease-out
              `}
              style={{
                transform: `translateY(${idx * 56}px)`,
                zIndex: idx + 1,
              }}
            >
              <div className={`
                bg-card border-2 border-primary/30 rounded-2xl p-3 shadow-sm
                hover:shadow-md transition-shadow
              `}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{card.title}</div>
                    <div className="font-semibold text-sm truncate">{card.summary}</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Card */}
        <div
          className={`
            absolute left-0 right-0
            transition-all duration-500 ease-out
            ${animating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
          `}
          style={{
            top: `${activeCard * 56}px`,
            zIndex: 10,
          }}
        >
          <div className="bg-card border-2 border-border rounded-2xl shadow-lg overflow-hidden">
            
            {/* Card 0: Personal Info */}
            {activeCard === 0 && (
              <div className="p-5">
                <div className="text-center mb-5">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${cards[0].color} mb-3`}>
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{cards[0].title}</h3>
                  <p className="text-muted-foreground text-sm">{cards[0].subtitle}</p>
                </div>
                
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="الاسم الكريم"
                    value={filters.name}
                    onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                    className="h-12 text-base text-center rounded-xl border-2 focus:border-primary"
                    data-testid="input-name"
                  />
                  <Input
                    type="tel"
                    placeholder="رقم الجوال"
                    value={filters.phone}
                    onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
                    className="h-12 text-base text-center rounded-xl border-2 focus:border-primary"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                </div>

                <Button
                  onClick={goToNextCard}
                  disabled={!canProceed(0)}
                  className="w-full h-12 mt-4 rounded-xl text-base gap-2"
                  data-testid="button-next-0"
                >
                  <ArrowUp className="h-4 w-4" />
                  التالي
                </Button>
              </div>
            )}

            {/* Card 1: Transaction Type */}
            {activeCard === 1 && (
              <div className="p-5">
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${cards[1].color} mb-3`}>
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{cards[1].title}</h3>
                  <p className="text-muted-foreground text-sm">{cards[1].subtitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setFilters(f => ({ ...f, transactionType: "sale" }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.transactionType === "sale"
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border"
                    }`}
                    data-testid="button-filter-sale"
                  >
                    <div className="text-2xl mb-1">🏠</div>
                    <div className="font-bold">شراء</div>
                  </button>
                  <button
                    onClick={() => setFilters(f => ({ ...f, transactionType: "rent" }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.transactionType === "rent"
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border"
                    }`}
                    data-testid="button-filter-rent"
                  >
                    <div className="text-2xl mb-1">🔑</div>
                    <div className="font-bold">إيجار</div>
                  </button>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  <button
                    onClick={() => setFilters(f => ({ ...f, propertyCategory: "residential", propertyType: "" }))}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm transition-all ${
                      filters.propertyCategory === "residential"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                    data-testid="button-category-residential"
                  >
                    <Home className="h-4 w-4" />
                    سكني
                  </button>
                  <button
                    onClick={() => setFilters(f => ({ ...f, propertyCategory: "commercial", propertyType: "" }))}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm transition-all ${
                      filters.propertyCategory === "commercial"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                    data-testid="button-category-commercial"
                  >
                    <Building2 className="h-4 w-4" />
                    تجاري
                  </button>
                </div>

                <Button
                  onClick={goToNextCard}
                  className="w-full h-12 rounded-xl text-base gap-2"
                  data-testid="button-next-1"
                >
                  <ArrowUp className="h-4 w-4" />
                  التالي
                </Button>
              </div>
            )}

            {/* Card 2: Location */}
            {activeCard === 2 && (
              <div className="p-5">
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${cards[2].color} mb-3`}>
                    <MapPin className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{cards[2].title}</h3>
                  <p className="text-muted-foreground text-sm">{cards[2].subtitle}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto mb-4">
                  {saudiCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setFilters(f => ({ ...f, location: city.name }))}
                      className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        filters.location === city.name
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                      data-testid={`button-city-${city.name}`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={goToNextCard}
                  disabled={!canProceed(2)}
                  className="w-full h-12 rounded-xl text-base gap-2"
                  data-testid="button-next-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  التالي
                </Button>
              </div>
            )}

            {/* Card 3: Property Details */}
            {activeCard === 3 && (
              <div className="p-5">
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${cards[3].color} mb-3`}>
                    <Home className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{cards[3].title}</h3>
                  <p className="text-muted-foreground text-sm">{cards[3].subtitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {propertyTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFilters(f => ({ ...f, propertyType: f.propertyType === type.value ? "" : type.value }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          filters.propertyType === type.value
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                        data-testid={`button-type-${type.value}`}
                      >
                        <Icon className={`h-6 w-6 mx-auto mb-1 ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2 text-center">عدد الغرف</div>
                  <div className="flex justify-center gap-2">
                    {["1", "2", "3", "4", "5+"].map((num) => (
                      <button
                        key={num}
                        onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === num ? "" : num }))}
                        className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-all ${
                          filters.rooms === num
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                        data-testid={`button-rooms-${num}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  className="w-full h-12 rounded-xl text-base gap-2 bg-gradient-to-r from-primary to-green-600"
                  data-testid="button-search"
                >
                  <Search className="h-5 w-5" />
                  ابحث الآن
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Cards Preview - Stacked below */}
        {cards.slice(activeCard + 1).map((card, idx) => {
          const Icon = card.icon;
          const offset = (activeCard * 56) + 340 + (idx * 12);
          return (
            <div
              key={card.id}
              className="absolute left-2 right-2 pointer-events-none"
              style={{
                top: `${offset}px`,
                zIndex: -idx,
                opacity: Math.max(0.3, 1 - (idx * 0.3)),
                transform: `scale(${1 - (idx * 0.02)})`,
              }}
            >
              <div className="bg-muted/50 border border-border/50 rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center opacity-50`}>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{card.title}</div>
                    <div className="text-xs text-muted-foreground/70">{card.subtitle}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Alternative */}
      <p className="text-center text-sm text-muted-foreground mt-4">
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
