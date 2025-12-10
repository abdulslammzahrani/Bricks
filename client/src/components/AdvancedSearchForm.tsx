import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, User, Home, Building2, 
  Sparkles, Search, Building, Warehouse, LandPlot,
  Check, Handshake
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
  const [completedCards, setCompletedCards] = useState<number[]>([]);
  const [animatingCard, setAnimatingCard] = useState<number | null>(null);
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

  const cards = [
    {
      id: 0,
      icon: User,
      number: "1",
      title: "البيانات الشخصية",
      subtitle: "عرّفنا على نفسك حتى نتواصل معك",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: 1,
      icon: Sparkles,
      number: "2",
      title: "نوع الطلب",
      subtitle: "حدد إذا كنت تريد شراء أو إيجار",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      id: 2,
      icon: MapPin,
      number: "3",
      title: "الموقع",
      subtitle: "اختر المدينة التي تبحث فيها عن عقار",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 3,
      icon: Home,
      number: "4",
      title: "مواصفات العقار",
      subtitle: "حدد نوع العقار وعدد الغرف المطلوبة",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  // Calculate progress percentage
  const progress = (completedCards.length / cards.length) * 100;

  const goToNextCard = () => {
    if (activeCard < cards.length - 1) {
      setAnimatingCard(activeCard);
      setTimeout(() => {
        setCompletedCards(prev => [...prev.filter(c => c !== activeCard), activeCard]);
        setActiveCard(prev => prev + 1);
        setAnimatingCard(null);
      }, 400);
    }
  };

  const goToCard = (index: number) => {
    if (completedCards.includes(index) || index === activeCard) {
      setActiveCard(index);
      // Remove from completed if editing
      setCompletedCards(prev => prev.filter(c => c !== index));
    }
  };

  const handleSearch = () => {
    setAnimatingCard(activeCard);
    setTimeout(() => {
      setCompletedCards(prev => [...prev.filter(c => c !== activeCard), activeCard]);
      onSearch(filters);
    }, 400);
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

  const isCompleted = (cardId: number) => completedCards.includes(cardId);

  return (
    <div className="relative p-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">تقدم الملف الشخصي</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          كلما أكملت بياناتك، زادت موثوقيتك وفرص التطابق
        </p>
      </div>

      {/* Cards Container */}
      <div className="space-y-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const completed = isCompleted(card.id);
          const isActive = activeCard === card.id;
          const isAnimating = animatingCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => !isActive && goToCard(card.id)}
              className={`
                relative bg-card rounded-2xl border-2 overflow-hidden
                transition-all duration-500 ease-out
                ${isActive ? "border-primary shadow-lg" : completed ? "border-green-500/50 cursor-pointer" : "border-border/50 opacity-50"}
                ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}
                ${!isActive && !completed ? "pointer-events-none" : ""}
              `}
            >
              {/* Card Header - Always Visible */}
              <div className={`p-5 ${isActive ? "pb-4" : ""}`}>
                <div className="flex items-start gap-4">
                  {/* Icon Circle */}
                  <div className={`relative flex-shrink-0 w-16 h-16 rounded-full ${card.bgColor} flex items-center justify-center transition-all duration-300`}>
                    {completed ? (
                      <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
                        <Check className="w-8 h-8 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <Icon className={`w-8 h-8 ${card.iconColor}`} />
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.subtitle}</p>
                  </div>

                  {/* Step Number */}
                  <span className="text-3xl font-bold text-muted-foreground/30">{card.number}</span>
                </div>

                {/* Completed Summary */}
                {completed && !isActive && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {card.id === 0 && `${filters.name} - ${filters.phone}`}
                      {card.id === 1 && `${filters.transactionType === "sale" ? "شراء" : "إيجار"} - ${filters.propertyCategory === "residential" ? "سكني" : "تجاري"}`}
                      {card.id === 2 && filters.location}
                      {card.id === 3 && `${propertyTypes.find(t => t.value === filters.propertyType)?.label || "أي نوع"}${filters.rooms ? ` - ${filters.rooms} غرف` : ""}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Expandable Content - Only for Active Card */}
              {isActive && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                  
                  {/* Card 0: Personal Info */}
                  {activeCard === 0 && (
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
                      <Button
                        onClick={goToNextCard}
                        disabled={!canProceed(0)}
                        className="w-full h-12 rounded-xl text-base"
                        data-testid="button-next-0"
                      >
                        التالي
                      </Button>
                    </div>
                  )}

                  {/* Card 1: Transaction Type */}
                  {activeCard === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setFilters(f => ({ ...f, transactionType: "sale" }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            filters.transactionType === "sale"
                              ? "border-primary bg-primary/10"
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
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          }`}
                          data-testid="button-filter-rent"
                        >
                          <div className="text-2xl mb-1">🔑</div>
                          <div className="font-bold">إيجار</div>
                        </button>
                      </div>

                      <div className="flex justify-center gap-2">
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
                        className="w-full h-12 rounded-xl text-base"
                        data-testid="button-next-1"
                      >
                        التالي
                      </Button>
                    </div>
                  )}

                  {/* Card 2: Location */}
                  {activeCard === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto">
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
                        className="w-full h-12 rounded-xl text-base"
                        data-testid="button-next-2"
                      >
                        التالي
                      </Button>
                    </div>
                  )}

                  {/* Card 3: Property Details */}
                  {activeCard === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {propertyTypes.map((type) => {
                          const TypeIcon = type.icon;
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
                              <TypeIcon className={`h-6 w-6 mx-auto mb-1 ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                              <div className="font-medium text-sm">{type.label}</div>
                            </button>
                          );
                        })}
                      </div>

                      <div>
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
              )}
            </div>
          );
        })}
      </div>

      {/* Chat Alternative */}
      <p className="text-center text-sm text-muted-foreground mt-6">
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
