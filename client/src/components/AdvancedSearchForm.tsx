import { useState, memo, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, User, Home, Building2, 
  Sparkles, Search, Building, Warehouse, LandPlot,
  Check, Castle, Hotel, Store, Factory, Blocks, Navigation,
  BedDouble, Bath, Wallet, Settings2, FileText,
  Car, Trees, Dumbbell, ShieldCheck, Waves, Wind, X
} from "lucide-react";
import { saudiCities, type Neighborhood } from "@shared/saudi-locations";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green icon for selected districts
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface SearchFilters {
  name: string;
  phone: string;
  transactionType: "sale" | "rent";
  location: string;
  districts: string[];
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
  features: string[];
  notes: string;
}

const propertyOptions = {
  residential: [
    { value: "apartment", label: "شقة", icon: Building },
    { value: "villa", label: "فيلا", icon: Home },
    { value: "duplex", label: "دوبلكس", icon: Blocks },
    { value: "floor", label: "دور", icon: Building2 },
    { value: "palace", label: "قصر", icon: Castle },
    { value: "building", label: "عمارة", icon: Hotel },
    { value: "land", label: "أرض سكنية", icon: LandPlot },
    { value: "rest_house", label: "استراحة", icon: Home },
  ],
  commercial: [
    { value: "office", label: "مكتب", icon: Building },
    { value: "shop", label: "محل", icon: Store },
    { value: "warehouse", label: "مستودع", icon: Warehouse },
    { value: "showroom", label: "معرض", icon: Building2 },
    { value: "factory", label: "مصنع", icon: Factory },
    { value: "building", label: "عمارة تجارية", icon: Hotel },
    { value: "land", label: "أرض تجارية", icon: LandPlot },
    { value: "complex", label: "مجمع تجاري", icon: Blocks },
  ],
};

const featureOptions = [
  { value: "parking", label: "موقف سيارات", icon: Car },
  { value: "garden", label: "حديقة", icon: Trees },
  { value: "gym", label: "صالة رياضية", icon: Dumbbell },
  { value: "security", label: "حراسة أمنية", icon: ShieldCheck },
  { value: "pool", label: "مسبح", icon: Waves },
  { value: "ac", label: "تكييف مركزي", icon: Wind },
];

const budgetOptions = {
  sale: [
    { value: "500000", label: "أقل من 500 ألف" },
    { value: "1000000", label: "500 ألف - مليون" },
    { value: "2000000", label: "مليون - 2 مليون" },
    { value: "3000000", label: "2 - 3 مليون" },
    { value: "5000000", label: "3 - 5 مليون" },
    { value: "10000000", label: "أكثر من 5 مليون" },
  ],
  rent: [
    { value: "20000", label: "أقل من 20 ألف/سنة" },
    { value: "40000", label: "20 - 40 ألف/سنة" },
    { value: "60000", label: "40 - 60 ألف/سنة" },
    { value: "100000", label: "60 - 100 ألف/سنة" },
    { value: "150000", label: "100 - 150 ألف/سنة" },
    { value: "200000", label: "أكثر من 150 ألف/سنة" },
  ],
};

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onSwitchToChat: () => void;
}

// Generate approximate coordinates for neighborhoods based on city center
function getNeighborhoodCoords(cityCoords: { lat: number; lng: number }, index: number, total: number) {
  const radius = 0.05; // ~5km radius
  const angle = (2 * Math.PI * index) / Math.min(total, 20);
  const distance = radius * (0.3 + (index % 5) * 0.15);
  return {
    lat: cityCoords.lat + distance * Math.cos(angle),
    lng: cityCoords.lng + distance * Math.sin(angle)
  };
}

// Map click handler component
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Map center changer component
function MapCenterChanger({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const AdvancedSearchForm = memo(function AdvancedSearchForm({ onSearch, onSwitchToChat }: AdvancedSearchFormProps) {
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    phone: "",
    transactionType: "sale",
    location: "",
    districts: [],
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
    features: [],
    notes: "",
  });
  const [districtSearch, setDistrictSearch] = useState("");

  const propertyTypes = propertyOptions[filters.propertyCategory];
  const totalCards = 7;
  const progress = ((activeCard) / totalCards) * 100;

  // Get selected city data
  const selectedCity = useMemo(() => {
    return saudiCities.find(city => city.name === filters.location);
  }, [filters.location]);

  // Generate neighborhood coordinates
  const neighborhoodCoords = useMemo(() => {
    if (!selectedCity) return new Map<string, { lat: number; lng: number }>();
    const coords = new Map<string, { lat: number; lng: number }>();
    selectedCity.neighborhoods.forEach((n, i) => {
      coords.set(n.name, getNeighborhoodCoords(selectedCity.coordinates, i, selectedCity.neighborhoods.length));
    });
    return coords;
  }, [selectedCity]);

  // Filter districts based on search
  const filteredDistricts = useMemo(() => {
    if (!selectedCity) return [];
    if (!districtSearch.trim()) return selectedCity.neighborhoods;
    return selectedCity.neighborhoods.filter(n => 
      n.name.includes(districtSearch) || (n.nameEn && n.nameEn.toLowerCase().includes(districtSearch.toLowerCase()))
    );
  }, [selectedCity, districtSearch]);

  // Find nearest district to a point
  const findNearestDistrict = (lat: number, lng: number): string | null => {
    if (!selectedCity) return null;
    let nearest: string | null = null;
    let minDist = Infinity;
    
    neighborhoodCoords.forEach((coords, name) => {
      const dist = Math.sqrt(Math.pow(coords.lat - lat, 2) + Math.pow(coords.lng - lng, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = name;
      }
    });
    
    return nearest;
  };

  const cards = [
    { id: 0, icon: User, title: "البيانات", color: "bg-emerald-500", lightColor: "bg-emerald-100 dark:bg-emerald-900/40" },
    { id: 1, icon: Sparkles, title: "نوع الطلب", color: "bg-amber-500", lightColor: "bg-amber-100 dark:bg-amber-900/40" },
    { id: 2, icon: MapPin, title: "المدينة", color: "bg-blue-500", lightColor: "bg-blue-100 dark:bg-blue-900/40" },
    { id: 3, icon: Navigation, title: "الحي", color: "bg-teal-500", lightColor: "bg-teal-100 dark:bg-teal-900/40" },
    { id: 4, icon: Home, title: "العقار", color: "bg-purple-500", lightColor: "bg-purple-100 dark:bg-purple-900/40" },
    { id: 5, icon: Settings2, title: "المواصفات", color: "bg-orange-500", lightColor: "bg-orange-100 dark:bg-orange-900/40" },
    { id: 6, icon: FileText, title: "تفاصيل إضافية", color: "bg-pink-500", lightColor: "bg-pink-100 dark:bg-pink-900/40" },
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
      case 4: return true;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  // Toggle district selection
  const toggleDistrict = (districtName: string) => {
    setFilters(f => ({
      ...f,
      districts: f.districts.includes(districtName)
        ? f.districts.filter(d => d !== districtName)
        : [...f.districts, districtName]
    }));
  };

  // Handle map pin placement - find nearest district and add it
  const handleMapClick = (lat: number, lng: number) => {
    const nearest = findNearestDistrict(lat, lng);
    if (nearest && !filters.districts.includes(nearest)) {
      setFilters(f => ({ ...f, districts: [...f.districts, nearest] }));
    }
  };

  // Toggle feature
  const toggleFeature = (feature: string) => {
    setFilters(f => ({
      ...f,
      features: f.features.includes(feature)
        ? f.features.filter(feat => feat !== feature)
        : [...f.features, feature]
    }));
  };

  // Calculate reliability score
  const getReliabilityScore = () => {
    let score = 0;
    if (filters.name.trim()) score += 10;
    if (filters.phone.trim()) score += 10;
    if (filters.location) score += 15;
    if (filters.districts.length > 0) score += 15;
    if (filters.propertyType) score += 15;
    if (filters.rooms) score += 10;
    if (filters.bathrooms) score += 5;
    if (filters.maxPrice) score += 10;
    if (filters.features.length > 0) score += 5;
    if (filters.notes.trim()) score += 5;
    return Math.min(score, 100);
  };

  const reliabilityScore = getReliabilityScore();

  return (
    <>
    {/* ==================== DESKTOP VERSION ==================== */}
    <div className="hidden md:block p-6">
      {/* Progress & Reliability */}
      <div className="mb-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">مؤشر الموثوقية</span>
          <span className="text-sm font-bold text-primary">{reliabilityScore}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${reliabilityScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          كلما أكملت بياناتك، زادت موثوقيتك وفرص التطابق
        </p>
      </div>

      {/* Desktop Stacked Cards Container */}
      <div className="relative max-w-lg mx-auto" style={{ minHeight: "480px" }}>
        
        {/* Completed Cards */}
        {cards.slice(0, activeCard).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => goBack(card.id)}
              className="absolute inset-x-0 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ top: `${idx * 40}px`, zIndex: idx + 1 }}
            >
              <div className={`${card.lightColor} rounded-2xl p-3 flex items-center gap-3 border-2 border-primary/30 shadow-sm`}>
                <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center shadow-md`}>
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm font-bold truncate flex-1">{card.title}</span>
                <span className="text-xs text-primary font-medium">تعديل</span>
              </div>
            </div>
          );
        })}

        {/* Active Card */}
        <div
          className={`absolute inset-x-0 transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ top: `${activeCard * 40}px`, zIndex: 10 }}
        >
          <div className="bg-card border-2 rounded-2xl shadow-lg">
            
            {/* Card Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <div className={`w-10 h-10 rounded-xl ${cards[activeCard].lightColor} flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">{cards[activeCard].title}</h3>
                <p className="text-xs text-muted-foreground">الخطوة {activeCard + 1} من {totalCards}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {cards.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= activeCard ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              
              {/* Step 0: Personal */}
              {activeCard === 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">الاسم</label>
                      <Input
                        placeholder="أدخل اسمك"
                        value={filters.name}
                        onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                        className="h-11 text-center rounded-xl"
                        data-testid="input-name-desktop"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">رقم الجوال</label>
                      <Input
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={filters.phone}
                        onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
                        className="h-11 text-center rounded-xl"
                        dir="ltr"
                        data-testid="input-phone-desktop"
                      />
                    </div>
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Type */}
              {activeCard === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: "sale", l: "شراء", desc: "أبحث عن عقار للشراء", icon: Home },
                      { v: "rent", l: "إيجار", desc: "أبحث عن عقار للإيجار", icon: Building2 }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setFilters(f => ({ ...f, transactionType: t.v as "sale" | "rent", maxPrice: "" }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          filters.transactionType === t.v ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-filter-${t.v}-desktop`}
                      >
                        <t.icon className={`h-7 w-7 mx-auto mb-1.5 ${filters.transactionType === t.v ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="font-bold text-sm">{t.l}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
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
                        className={`flex items-center gap-1.5 px-5 py-2 rounded-full border-2 text-sm transition-all ${
                          filters.propertyCategory === c.v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-category-${c.v}-desktop`}
                      >
                        <c.I className="h-4 w-4" />
                        {c.l}
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-1">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 2: Location */}
              {activeCard === 2 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium mb-1 block text-center">اختر المدينة</label>
                  <div className="grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto p-1">
                    {saudiCities.slice(0, 20).map((city) => (
                      <button
                        key={city.name}
                        onClick={() => setFilters(f => ({ ...f, location: city.name, districts: [] }))}
                        className={`py-2.5 px-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          filters.location === city.name ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-city-desktop-${city.name}`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-2">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 3: District with Map - Multiple Selection */}
              {activeCard === 3 && selectedCity && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block text-center">اختر الأحياء في {filters.location}</label>
                  <p className="text-xs text-muted-foreground text-center">يمكنك اختيار أكثر من حي أو النقر على الخريطة</p>
                  
                  {/* Selected Districts */}
                  {filters.districts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {filters.districts.map(d => (
                        <Badge key={d} variant="secondary" className="gap-1 pl-2">
                          {d}
                          <button onClick={() => toggleDistrict(d)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن حي..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="h-9 pr-10 text-sm rounded-xl"
                      data-testid="input-district-search-desktop"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Map with markers */}
                    <div className="h-[180px] rounded-xl overflow-hidden border-2 border-border">
                      <MapContainer
                        center={[selectedCity.coordinates.lat, selectedCity.coordinates.lng]}
                        zoom={11}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapCenterChanger 
                          center={[selectedCity.coordinates.lat, selectedCity.coordinates.lng]} 
                          zoom={11} 
                        />
                        <MapClickHandler onLocationSelect={handleMapClick} />
                        
                        {/* Show markers for selected districts */}
                        {filters.districts.map(districtName => {
                          const coords = neighborhoodCoords.get(districtName);
                          if (!coords) return null;
                          return (
                            <Marker 
                              key={districtName} 
                              position={[coords.lat, coords.lng]}
                              icon={greenIcon}
                            />
                          );
                        })}
                      </MapContainer>
                    </div>

                    {/* Districts List */}
                    <div className="h-[180px] overflow-y-auto space-y-1">
                      {filteredDistricts.slice(0, 15).map((district) => {
                        const isSelected = filters.districts.includes(district.name);
                        return (
                          <button
                            key={district.name}
                            onClick={() => toggleDistrict(district.name)}
                            className={`w-full py-1.5 px-2 rounded-lg border text-sm font-medium text-right transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground" 
                                : "border-border hover:border-primary/50"
                            }`}
                            data-testid={`button-district-desktop-${district.name}`}
                          >
                            <span>{district.name}</span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button onClick={goNext} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-3">
                    {filters.districts.length > 0 ? `التالي (${filters.districts.length} حي)` : "تخطي"}
                  </Button>
                </div>
              )}

              {/* Step 4: Property Type */}
              {activeCard === 4 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block text-center">نوع العقار</label>
                  <div className="grid grid-cols-4 gap-2">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFilters(f => ({ ...f, propertyType: f.propertyType === type.value ? "" : type.value }))}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            filters.propertyType === type.value ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-type-desktop-${type.value}`}
                        >
                          <Icon className={`h-6 w-6 mx-auto ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="text-xs font-medium mt-1">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={goNext} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-4">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 5: Specifications */}
              {activeCard === 5 && (
                <div className="space-y-4">
                  {/* Rooms */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BedDouble className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium">عدد الغرف</label>
                    </div>
                    <div className="flex justify-center gap-2">
                      {["1", "2", "3", "4", "5", "6+"].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === n ? "" : n }))}
                          className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-all ${
                            filters.rooms === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-rooms-desktop-${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bath className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium">عدد الحمامات</label>
                    </div>
                    <div className="flex justify-center gap-2">
                      {["1", "2", "3", "4", "5+"].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFilters(f => ({ ...f, bathrooms: f.bathrooms === n ? "" : n }))}
                          className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-all ${
                            filters.bathrooms === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-bathrooms-desktop-${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium">الميزانية</label>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {budgetOptions[filters.transactionType].map((b) => (
                        <button
                          key={b.value}
                          onClick={() => setFilters(f => ({ ...f, maxPrice: f.maxPrice === b.value ? "" : b.value }))}
                          className={`py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all ${
                            filters.maxPrice === b.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-budget-desktop-${b.value}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={goNext} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-5">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 6: Additional Details */}
              {activeCard === 6 && (
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">مميزات مطلوبة</label>
                    <div className="grid grid-cols-3 gap-2">
                      {featureOptions.map((feat) => {
                        const Icon = feat.icon;
                        const isSelected = filters.features.includes(feat.value);
                        return (
                          <button
                            key={feat.value}
                            onClick={() => toggleFeature(feat.value)}
                            className={`p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                              isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            }`}
                            data-testid={`button-feature-desktop-${feat.value}`}
                          >
                            <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-xs font-medium">{feat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">ملاحظات إضافية</label>
                    <Textarea
                      placeholder="أضف أي تفاصيل إضافية تساعد في إيجاد العقار المناسب..."
                      value={filters.notes}
                      onChange={(e) => setFilters(f => ({ ...f, notes: e.target.value }))}
                      className="h-20 resize-none rounded-xl text-sm"
                      data-testid="textarea-notes-desktop"
                    />
                  </div>

                  <Button onClick={handleSearch} className="w-full h-12 rounded-xl text-base gap-2 bg-gradient-to-r from-primary to-green-600" data-testid="button-search-desktop">
                    <Search className="h-5 w-5" />
                    ابدأ البحث والمطابقة
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
              className="absolute inset-x-2 pointer-events-none"
              style={{
                top: `${(activeCard * 40) + 280 + (idx * 20)}px`,
                zIndex: -idx - 1,
                opacity: 0.5 - (idx * 0.1),
              }}
            >
              <div className="bg-muted/60 rounded-xl p-2.5 flex items-center gap-2 border border-border/40">
                <div className={`w-8 h-8 rounded-lg ${card.lightColor} flex items-center justify-center opacity-70`}>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* ==================== MOBILE VERSION ==================== */}
    <div className="md:hidden relative px-3 py-4">
      {/* Progress & Reliability */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">الموثوقية</span>
          <span className="text-xs font-bold text-primary">{reliabilityScore}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-300"
            style={{ width: `${reliabilityScore}%` }}
          />
        </div>
      </div>

      {/* Stacked Cards Container */}
      <div className="relative" style={{ height: activeCard >= 3 ? "380px" : "300px" }}>
        
        {/* Completed Cards */}
        {cards.slice(0, activeCard).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => goBack(card.id)}
              className="absolute inset-x-0 cursor-pointer transition-all duration-200"
              style={{ top: `${idx * 24}px`, zIndex: idx + 1 }}
            >
              <div className={`${card.lightColor} rounded-xl p-2 flex items-center gap-2 border border-primary/20`}>
                <div className={`w-6 h-6 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs font-medium truncate flex-1">{card.title}</span>
              </div>
            </div>
          );
        })}

        {/* Active Card */}
        <div
          className={`absolute inset-x-0 transition-all duration-200 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ top: `${activeCard * 24}px`, zIndex: 10 }}
        >
          <div className="bg-card border rounded-xl shadow-md">
            
            {/* Card Header */}
            <div className="flex items-center gap-2 p-2.5 border-b">
              <div className={`w-8 h-8 rounded-lg ${cards[activeCard].lightColor} flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-4 h-4 text-primary" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{cards[activeCard].title}</h3>
              </div>
              <span className="text-lg font-bold text-muted-foreground/30">{activeCard + 1}</span>
            </div>

            {/* Card Content */}
            <div className="p-2.5">
              
              {/* Step 0: Personal */}
              {activeCard === 0 && (
                <div className="space-y-2">
                  <Input
                    placeholder="الاسم"
                    value={filters.name}
                    onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                    className="h-9 text-sm text-center rounded-lg"
                    data-testid="input-name"
                  />
                  <Input
                    type="tel"
                    placeholder="رقم الجوال"
                    value={filters.phone}
                    onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
                    className="h-9 text-sm text-center rounded-lg"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Type */}
              {activeCard === 1 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "sale", l: "شراء", icon: Home },
                      { v: "rent", l: "إيجار", icon: Building2 }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setFilters(f => ({ ...f, transactionType: t.v as "sale" | "rent", maxPrice: "" }))}
                        className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                          filters.transactionType === t.v ? "border-primary bg-primary/10" : "border-border"
                        }`}
                        data-testid={`button-filter-${t.v}`}
                      >
                        <t.icon className={`h-5 w-5 mx-auto ${filters.transactionType === t.v ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="font-bold text-xs mt-1">{t.l}</div>
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
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-2 text-xs transition-all ${
                          filters.propertyCategory === c.v ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                        data-testid={`button-category-${c.v}`}
                      >
                        <c.I className="h-3 w-3" />
                        {c.l}
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-1">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 2: Location */}
              {activeCard === 2 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1 max-h-[100px] overflow-y-auto">
                    {saudiCities.slice(0, 16).map((city) => (
                      <button
                        key={city.name}
                        onClick={() => setFilters(f => ({ ...f, location: city.name, districts: [] }))}
                        className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                          filters.location === city.name ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                        data-testid={`button-city-${city.name}`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-2">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 3: District - Multiple Selection */}
              {activeCard === 3 && selectedCity && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground text-center">اختر أكثر من حي أو انقر على الخريطة</p>
                  
                  {/* Selected Districts */}
                  {filters.districts.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {filters.districts.map(d => (
                        <Badge key={d} variant="secondary" className="text-[10px] gap-0.5 pl-1.5 py-0">
                          {d}
                          <button onClick={() => toggleDistrict(d)}>
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن حي..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="h-8 pr-7 text-xs rounded-lg"
                      data-testid="input-district-search"
                    />
                  </div>

                  {/* Map */}
                  <div className="h-[90px] rounded-lg overflow-hidden border border-border">
                    <MapContainer
                      center={[selectedCity.coordinates.lat, selectedCity.coordinates.lng]}
                      zoom={10}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapCenterChanger center={[selectedCity.coordinates.lat, selectedCity.coordinates.lng]} zoom={10} />
                      <MapClickHandler onLocationSelect={handleMapClick} />
                      {filters.districts.map(districtName => {
                        const coords = neighborhoodCoords.get(districtName);
                        if (!coords) return null;
                        return <Marker key={districtName} position={[coords.lat, coords.lng]} icon={greenIcon} />;
                      })}
                    </MapContainer>
                  </div>

                  {/* Districts Grid */}
                  <div className="grid grid-cols-3 gap-1 max-h-[70px] overflow-y-auto">
                    {filteredDistricts.slice(0, 12).map((district) => {
                      const isSelected = filters.districts.includes(district.name);
                      return (
                        <button
                          key={district.name}
                          onClick={() => toggleDistrict(district.name)}
                          className={`py-1 px-1 rounded-lg border text-[10px] font-medium transition-all flex items-center justify-center gap-0.5 ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                          data-testid={`button-district-${district.name}`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                          {district.name}
                        </button>
                      );
                    })}
                  </div>

                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-3">
                    {filters.districts.length > 0 ? `التالي (${filters.districts.length})` : "تخطي"}
                  </Button>
                </div>
              )}

              {/* Step 4: Property Type */}
              {activeCard === 4 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFilters(f => ({ ...f, propertyType: f.propertyType === type.value ? "" : type.value }))}
                          className={`p-1.5 rounded-lg border text-center transition-all ${
                            filters.propertyType === type.value ? "border-primary bg-primary/10" : "border-border"
                          }`}
                          data-testid={`button-type-${type.value}`}
                        >
                          <Icon className={`h-4 w-4 mx-auto ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="text-[9px] font-medium mt-0.5">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-4">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 5: Specifications */}
              {activeCard === 5 && (
                <div className="space-y-3">
                  {/* Rooms */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BedDouble className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">الغرف</span>
                    </div>
                    <div className="flex justify-center gap-1.5">
                      {["1", "2", "3", "4", "5", "6+"].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === n ? "" : n }))}
                          className={`w-8 h-8 rounded-full border-2 text-xs font-bold transition-all ${
                            filters.rooms === n ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                          data-testid={`button-rooms-${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bath className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">الحمامات</span>
                    </div>
                    <div className="flex justify-center gap-1.5">
                      {["1", "2", "3", "4", "5+"].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFilters(f => ({ ...f, bathrooms: f.bathrooms === n ? "" : n }))}
                          className={`w-8 h-8 rounded-full border-2 text-xs font-bold transition-all ${
                            filters.bathrooms === n ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                          data-testid={`button-bathrooms-${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">الميزانية</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {budgetOptions[filters.transactionType].map((b) => (
                        <button
                          key={b.value}
                          onClick={() => setFilters(f => ({ ...f, maxPrice: f.maxPrice === b.value ? "" : b.value }))}
                          className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                            filters.maxPrice === b.value ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                          data-testid={`button-budget-${b.value}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-5">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 6: Additional Details */}
              {activeCard === 6 && (
                <div className="space-y-3">
                  {/* Features */}
                  <div>
                    <span className="text-xs font-medium mb-1.5 block">مميزات مطلوبة</span>
                    <div className="grid grid-cols-3 gap-1">
                      {featureOptions.map((feat) => {
                        const Icon = feat.icon;
                        const isSelected = filters.features.includes(feat.value);
                        return (
                          <button
                            key={feat.value}
                            onClick={() => toggleFeature(feat.value)}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                              isSelected ? "border-primary bg-primary/10" : "border-border"
                            }`}
                            data-testid={`button-feature-${feat.value}`}
                          >
                            <Icon className={`h-3 w-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-[9px] font-medium">{feat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <span className="text-xs font-medium mb-1.5 block">ملاحظات</span>
                    <Textarea
                      placeholder="أضف تفاصيل إضافية..."
                      value={filters.notes}
                      onChange={(e) => setFilters(f => ({ ...f, notes: e.target.value }))}
                      className="h-16 resize-none rounded-lg text-xs"
                      data-testid="textarea-notes"
                    />
                  </div>

                  <Button onClick={handleSearch} className="w-full h-10 rounded-lg text-sm gap-1.5 bg-gradient-to-r from-primary to-green-600" data-testid="button-search">
                    <Search className="h-4 w-4" />
                    ابدأ البحث
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
                top: `${(activeCard * 24) + (activeCard >= 3 ? 320 : 240) + (idx * 14)}px`,
                zIndex: -idx - 1,
                opacity: 0.4 - (idx * 0.1),
              }}
            >
              <div className="bg-muted/50 rounded-lg p-1.5 flex items-center gap-1.5 border border-border/30">
                <div className={`w-5 h-5 rounded ${card.lightColor} flex items-center justify-center opacity-60`}>
                  <Icon className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">{card.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
});
