import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, User, Home, Building2, 
  Sparkles, Search, Building, Warehouse, LandPlot,
  Check
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
  const [isAnimating, setIsAnimating] = useState(false);
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
  const totalCards = 4;
  const progress = ((activeCard) / totalCards) * 100;

  const cards = [
    { id: 0, icon: User, title: "البيانات", color: "bg-emerald-500", lightColor: "bg-emerald-100 dark:bg-emerald-900/40" },
    { id: 1, icon: Sparkles, title: "نوع الطلب", color: "bg-amber-500", lightColor: "bg-amber-100 dark:bg-amber-900/40" },
    { id: 2, icon: MapPin, title: "المدينة", color: "bg-blue-500", lightColor: "bg-blue-100 dark:bg-blue-900/40" },
    { id: 3, icon: Home, title: "العقار", color: "bg-purple-500", lightColor: "bg-purple-100 dark:bg-purple-900/40" },
  ];

  const goNext = () => {
    if (activeCard < totalCards - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveCard(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goBack = (index: number) => {
    if (index < activeCard && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveCard(index);
        setIsAnimating(false);
      }, 100);
    }
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const canProceed = () => {
    switch (activeCard) {
      case 0: return filters.name.trim() !== "" && filters.phone.trim() !== "";
      case 1: return true;
      case 2: return filters.location !== "";
      case 3: return true;
      default: return true;
    }
  };

  return (
    <div className="relative px-3 py-4">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{activeCard + 1}/{totalCards}</span>
      </div>

      {/* Stacked Cards Container */}
      <div className="relative" style={{ height: "280px" }}>
        
        {/* Completed Cards - Stacked at top */}
        {cards.slice(0, activeCard).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => goBack(card.id)}
              className="absolute inset-x-0 cursor-pointer transition-all duration-200"
              style={{
                top: `${idx * 28}px`,
                zIndex: idx + 1,
              }}
            >
              <div className={`${card.lightColor} rounded-xl p-2.5 flex items-center gap-2 border border-primary/20`}>
                <div className={`w-7 h-7 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs font-medium truncate flex-1">{card.title}</span>
              </div>
            </div>
          );
        })}

        {/* Active Card */}
        <div
          className={`absolute inset-x-0 transition-all duration-200 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ top: `${activeCard * 28}px`, zIndex: 10 }}
        >
          <div className="bg-card border rounded-xl shadow-md">
            
            {/* Card Header */}
            <div className="flex items-center gap-3 p-3 border-b">
              <div className={`w-9 h-9 rounded-xl ${cards[activeCard].lightColor} flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{cards[activeCard].title}</h3>
              </div>
              <span className="text-xl font-bold text-muted-foreground/30">{activeCard + 1}</span>
            </div>

            {/* Card Content */}
            <div className="p-3">
              
              {/* Step 0: Personal */}
              {activeCard === 0 && (
                <div className="space-y-2">
                  <Input
                    placeholder="الاسم"
                    value={filters.name}
                    onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                    className="h-10 text-sm text-center rounded-lg"
                    data-testid="input-name"
                  />
                  <Input
                    type="tel"
                    placeholder="رقم الجوال"
                    value={filters.phone}
                    onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
                    className="h-10 text-sm text-center rounded-lg"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg text-sm" data-testid="button-next-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Type */}
              {activeCard === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "sale", l: "شراء", e: "🏠" },
                      { v: "rent", l: "إيجار", e: "🔑" }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setFilters(f => ({ ...f, transactionType: t.v as "sale" | "rent" }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          filters.transactionType === t.v ? "border-primary bg-primary/10" : "border-border"
                        }`}
                        data-testid={`button-filter-${t.v}`}
                      >
                        <span className="text-xl">{t.e}</span>
                        <div className="font-bold text-sm mt-1">{t.l}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2">
                    {[
                      { v: "residential", l: "سكني", I: Home },
                      { v: "commercial", l: "تجاري", I: Building2 }
                    ].map(c => (
                      <button
                        key={c.v}
                        onClick={() => setFilters(f => ({ ...f, propertyCategory: c.v as "residential" | "commercial", propertyType: "" }))}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-xs transition-all ${
                          filters.propertyCategory === c.v ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                        data-testid={`button-category-${c.v}`}
                      >
                        <c.I className="h-3.5 w-3.5" />
                        {c.l}
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} className="w-full h-10 rounded-lg text-sm" data-testid="button-next-1">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 2: Location */}
              {activeCard === 2 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto">
                    {saudiCities.slice(0, 16).map((city) => (
                      <button
                        key={city.name}
                        onClick={() => setFilters(f => ({ ...f, location: city.name }))}
                        className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                          filters.location === city.name ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                        data-testid={`button-city-${city.name}`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg text-sm" data-testid="button-next-2">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 3: Property */}
              {activeCard === 3 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1.5">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFilters(f => ({ ...f, propertyType: f.propertyType === type.value ? "" : type.value }))}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            filters.propertyType === type.value ? "border-primary bg-primary/10" : "border-border"
                          }`}
                          data-testid={`button-type-${type.value}`}
                        >
                          <Icon className={`h-5 w-5 mx-auto ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="text-[10px] font-medium mt-1">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {["1", "2", "3", "4", "5+"].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === n ? "" : n }))}
                        className={`w-9 h-9 rounded-full border-2 text-xs font-bold transition-all ${
                          filters.rooms === n ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                        data-testid={`button-rooms-${n}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <Button onClick={handleSearch} className="w-full h-10 rounded-lg text-sm gap-1.5 bg-gradient-to-r from-primary to-green-600" data-testid="button-search">
                    <Search className="h-4 w-4" />
                    ابحث
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Cards Preview */}
        {cards.slice(activeCard + 1).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="absolute inset-x-1 pointer-events-none"
              style={{
                top: `${(activeCard * 28) + 220 + (idx * 16)}px`,
                zIndex: -idx - 1,
                opacity: 0.4 - (idx * 0.15),
              }}
            >
              <div className="bg-muted/50 rounded-xl p-2 flex items-center gap-2 border border-border/30">
                <div className={`w-7 h-7 rounded-lg ${card.lightColor} flex items-center justify-center opacity-60`}>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">{card.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Link */}
      <p className="text-center text-xs text-muted-foreground mt-2">
        <button onClick={onSwitchToChat} className="text-primary underline" data-testid="button-switch-to-chat">
          تحدث مع المساعد الذكي
        </button>
      </p>
    </div>
  );
}
