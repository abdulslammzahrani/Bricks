import { useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, User, Home, Building2, 
  Check, Phone, Camera, DollarSign,
  Building, Warehouse, LandPlot, Ruler, BedDouble,
  Send, MessageCircle, Navigation, Target
} from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyData {
  ownerName: string;
  ownerPhone: string;
  transactionType: "sale" | "rent";
  propertyCategory: "residential" | "commercial";
  city: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  propertyType: string;
  rooms: string;
  bathrooms: string;
  area: string;
  price: string;
  description: string;
  features: string[];
}

// Custom marker icon for pin location
const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click handler for placing pin
function LocationPicker({ 
  onLocationSelect, 
  currentPosition 
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
  currentPosition: [number, number] | null;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return currentPosition ? (
    <Marker position={currentPosition} icon={pinIcon} />
  ) : null;
}

// Map center changer
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
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

const featuresList = [
  "مصعد", "موقف سيارات", "حديقة", "مسبح", "غرفة خادمة", "غرفة سائق", "مكيفات", "مطبخ مجهز"
];

interface ListPropertyFormProps {
  onSubmit: (data: PropertyData) => void;
}

export const ListPropertyForm = memo(function ListPropertyForm({ onSubmit }: ListPropertyFormProps) {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoRegistered, setIsAutoRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [data, setData] = useState<PropertyData>({
    ownerName: "",
    ownerPhone: "",
    transactionType: "sale",
    propertyCategory: "residential",
    city: "",
    district: "",
    latitude: null,
    longitude: null,
    propertyType: "",
    rooms: "",
    bathrooms: "",
    area: "",
    price: "",
    description: "",
    features: [],
  });


  // Get map center based on selected city
  const mapCenter = useMemo<[number, number]>(() => {
    if (data.latitude && data.longitude) {
      return [data.latitude, data.longitude];
    }
    if (data.city) {
      const city = saudiCities.find(c => c.name === data.city);
      if (city) {
        return [city.coordinates.lat, city.coordinates.lng];
      }
    }
    return [24.7136, 46.6753]; // Default: Riyadh
  }, [data.city, data.latitude, data.longitude]);

  // Handle location selection from map click
  const handleLocationSelect = (lat: number, lng: number) => {
    setData(d => ({ ...d, latitude: lat, longitude: lng }));
  };

  const propertyTypes = propertyOptions[data.propertyCategory];
  const totalCards = 4;
  const progress = ((activeCard) / totalCards) * 100;

  const cards = [
    { id: 0, icon: User, title: "بيانات المالك", color: "bg-emerald-500", lightColor: "bg-emerald-100 dark:bg-emerald-900/40" },
    { id: 1, icon: MapPin, title: "الموقع", color: "bg-blue-500", lightColor: "bg-blue-100 dark:bg-blue-900/40" },
    { id: 2, icon: Home, title: "تفاصيل العقار", color: "bg-purple-500", lightColor: "bg-purple-100 dark:bg-purple-900/40" },
    { id: 3, icon: DollarSign, title: "السعر والوصف", color: "bg-amber-500", lightColor: "bg-amber-100 dark:bg-amber-900/40" },
  ];

  // Auto-register seller when moving from step 0 (owner info)
  const autoRegisterSeller = async () => {
    if (isAutoRegistered || isRegistering) return;
    
    setIsRegistering(true);
    try {
      // Normalize phone (remove spaces and convert Arabic numerals)
      let normalizedPhone = data.ownerPhone.replace(/[\s\-\(\)\.]/g, '');
      normalizedPhone = normalizedPhone.replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
      
      const response = await apiRequest("POST", "/api/sellers/register", {
        name: data.ownerName.trim(),
        email: `${normalizedPhone}@tatabuk.sa`,
        phone: normalizedPhone,
        city: data.city || "",
        district: data.district || "",
        propertyType: data.propertyType || "apartment",
        price: data.price ? parseInt(data.price) : 0,
        status: "ready",
        images: [],
        latitude: data.latitude,
        longitude: data.longitude,
      });
      
      const result = await response.json();
      if (result.success) {
        setIsAutoRegistered(true);
        toast({
          title: "تم تسجيلك كبائع",
          description: `مرحباً ${data.ownerName.split(" ")[0]}! تم إنشاء حسابك تلقائياً`,
        });
      }
    } catch (error: any) {
      console.error("Auto-register seller error:", error);
      // Don't show error to user, just continue
    } finally {
      setIsRegistering(false);
    }
  };

  const goNext = async () => {
    if (activeCard < totalCards - 1 && !isAnimating) {
      // Auto-register when moving from step 0 (owner info step)
      if (activeCard === 0 && !isAutoRegistered) {
        await autoRegisterSeller();
      }
      
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

  const handleSubmit = () => {
    onSubmit(data);
  };

  const canProceed = () => {
    switch (activeCard) {
      case 0: return data.ownerName.trim() !== "" && data.ownerPhone.trim() !== "";
      case 1: return data.city !== "";
      case 2: return data.propertyType !== "";
      case 3: return data.price !== "";
      default: return true;
    }
  };

  const toggleFeature = (feature: string) => {
    setData(d => ({
      ...d,
      features: d.features.includes(feature) 
        ? d.features.filter(f => f !== feature)
        : [...d.features, feature]
    }));
  };

  // Calculate match index score based on completed data
  const matchIndexScore = (() => {
    let score = 0;
    // Step 1: Owner data (25%)
    if (data.ownerName.trim()) score += 12;
    if (data.ownerPhone.trim().length >= 10) score += 13;
    // Step 2: Location (25%)
    if (data.city) score += 15;
    if (data.district) score += 10;
    // Step 3: Property details (25%)
    if (data.propertyType) score += 10;
    if (data.rooms) score += 5;
    if (data.bathrooms) score += 5;
    if (data.area) score += 5;
    // Step 4: Price & description (25%)
    if (data.price) score += 15;
    if (data.description.trim()) score += 10;
    return Math.min(100, score);
  })();

  // ==================== RENDER ====================
  return (
    <>
    {/* ==================== DESKTOP VERSION ==================== */}
    <div className="hidden md:block p-6">
      {/* Match Index - Shows after step 1 */}
      {activeCard >= 1 && (
        <div className="mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">مؤشر التطابق</span>
            <span className="text-sm font-bold text-amber-600">{matchIndexScore}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${matchIndexScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            كلما أكملت بياناتك، زادت فرص التطابق
          </p>
        </div>
      )}

      {/* Desktop Stacked Cards */}
      <div className="relative max-w-lg mx-auto" style={{ minHeight: "420px" }}>
        
        {/* Completed Cards */}
        {cards.slice(0, activeCard).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => goBack(card.id)}
              className="absolute inset-x-0 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ top: `${idx * 44}px`, zIndex: idx + 1 }}
            >
              <div className={`${card.lightColor} rounded-2xl p-4 flex items-center gap-4 border-2 border-amber-500/30 shadow-sm`}>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center shadow-md`}>
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm font-bold truncate flex-1">{card.title}</span>
                <span className="text-xs text-amber-600 font-medium">تعديل</span>
              </div>
            </div>
          );
        })}

        {/* Active Card */}
        <div
          className={`absolute inset-x-0 transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ top: `${activeCard * 44}px`, zIndex: 10 }}
        >
          <div className="bg-card border-2 rounded-2xl shadow-lg">
            
            {/* Card Header */}
            <div className="flex items-center gap-4 p-5 border-b">
              <div className={`w-12 h-12 rounded-xl ${cards[activeCard].lightColor} flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-6 h-6 text-amber-600" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{cards[activeCard].title}</h3>
                <p className="text-xs text-muted-foreground">الخطوة {activeCard + 1} من {totalCards}</p>
              </div>
              <div className="flex items-center gap-1">
                {cards.map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= activeCard ? 'bg-amber-500' : 'bg-muted'}`} />
                ))}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
              
              {/* Step 0: Owner Info */}
              {activeCard === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">اسم المالك</label>
                      <Input
                        placeholder="أدخل اسمك"
                        value={data.ownerName}
                        onChange={(e) => setData(d => ({ ...d, ownerName: e.target.value }))}
                        className="h-12 text-center rounded-xl"
                        data-testid="input-owner-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">رقم الجوال</label>
                      <Input
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={data.ownerPhone}
                        onChange={(e) => setData(d => ({ ...d, ownerPhone: e.target.value }))}
                        className="h-12 text-center rounded-xl"
                        dir="ltr"
                        data-testid="input-owner-phone"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { v: "sale", l: "للبيع", icon: DollarSign },
                      { v: "rent", l: "للإيجار", icon: Home }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setData(d => ({ ...d, transactionType: t.v as "sale" | "rent" }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all flex items-center justify-center gap-3 ${
                          data.transactionType === t.v ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-border"
                        }`}
                        data-testid={`button-list-${t.v}`}
                      >
                        <t.icon className={`h-5 w-5 ${data.transactionType === t.v ? "text-amber-600" : "text-muted-foreground"}`} />
                        <span className="font-bold">{t.l}</span>
                      </button>
                    ))}
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Location */}
              {activeCard === 1 && (
                <div className="space-y-4">
                  <div className="flex justify-center gap-3 mb-2">
                    {[
                      { v: "residential", l: "سكني", I: Home },
                      { v: "commercial", l: "تجاري", I: Building2 }
                    ].map(c => (
                      <button
                        key={c.v}
                        onClick={() => setData(d => ({ ...d, propertyCategory: c.v as "residential" | "commercial", propertyType: "" }))}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm transition-all ${
                          data.propertyCategory === c.v ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                        }`}
                        data-testid={`button-list-category-${c.v}`}
                      >
                        <c.I className="h-4 w-4" />
                        {c.l}
                      </button>
                    ))}
                  </div>
                  <label className="text-sm font-medium mb-2 block text-center">اختر المدينة</label>
                  <div className="max-h-[140px] overflow-y-auto border rounded-lg p-2">
                    <div className="grid grid-cols-4 gap-2">
                      {saudiCities.map((city) => (
                        <button
                          key={city.name}
                          onClick={() => setData(d => ({ ...d, city: city.name, latitude: null, longitude: null }))}
                          className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                            data.city === city.name ? "border-amber-500 bg-amber-500 text-white" : "border-border hover:border-amber-500/50"
                          }`}
                          data-testid={`button-list-city-${city.name}`}
                        >
                          <span className="truncate block">{city.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interactive Map for Pin Placement */}
                  {data.city && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4 text-amber-500" />
                          حدد الموقع بالنقر على الخريطة
                        </label>
                        {data.latitude && data.longitude && (
                          <button 
                            onClick={() => setData(d => ({ ...d, latitude: null, longitude: null }))}
                            className="text-xs text-red-500 hover:underline"
                            data-testid="button-clear-location"
                          >
                            مسح الموقع
                          </button>
                        )}
                      </div>
                      <div className="h-[180px] rounded-xl overflow-hidden border-2 border-border">
                        <MapContainer
                          center={mapCenter}
                          zoom={data.latitude ? 15 : 12}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={true}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <MapCenterUpdater center={mapCenter} zoom={data.latitude ? 15 : 12} />
                          <LocationPicker 
                            onLocationSelect={handleLocationSelect}
                            currentPosition={data.latitude && data.longitude ? [data.latitude, data.longitude] : null}
                          />
                        </MapContainer>
                      </div>
                      {data.latitude && data.longitude && (
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                          <Navigation className="h-3 w-3 text-amber-500" />
                          <span>تم تحديد الموقع: {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Input
                    placeholder="اسم الحي (اختياري)"
                    value={data.district}
                    onChange={(e) => setData(d => ({ ...d, district: e.target.value }))}
                    className="h-12 text-center rounded-xl"
                    data-testid="input-district"
                  />
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-1">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 2: Property Details */}
              {activeCard === 2 && (
                <div className="space-y-4">
                  <label className="text-sm font-medium block text-center">نوع العقار</label>
                  <div className="grid grid-cols-4 gap-3">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setData(d => ({ ...d, propertyType: type.value }))}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            data.propertyType === type.value ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-border"
                          }`}
                          data-testid={`button-list-type-${type.value}`}
                        >
                          <Icon className={`h-7 w-7 mx-auto ${data.propertyType === type.value ? "text-amber-600" : "text-muted-foreground"}`} />
                          <div className="text-sm font-medium mt-2">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block text-center">الغرف</label>
                      <div className="flex justify-center gap-1">
                        {["1", "2", "3", "4", "5+"].map((n) => (
                          <button
                            key={n}
                            onClick={() => setData(d => ({ ...d, rooms: n }))}
                            className={`w-9 h-9 rounded-full border-2 text-xs font-bold transition-all ${
                              data.rooms === n ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                            }`}
                            data-testid={`button-list-rooms-${n}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-center">دورات المياه</label>
                      <div className="flex justify-center gap-1">
                        {["1", "2", "3", "4+"].map((n) => (
                          <button
                            key={n}
                            onClick={() => setData(d => ({ ...d, bathrooms: n }))}
                            className={`w-9 h-9 rounded-full border-2 text-xs font-bold transition-all ${
                              data.bathrooms === n ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                            }`}
                            data-testid={`button-list-bathrooms-${n}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-center">المساحة م²</label>
                      <Input
                        type="number"
                        placeholder="150"
                        value={data.area}
                        onChange={(e) => setData(d => ({ ...d, area: e.target.value }))}
                        className="h-9 text-center rounded-lg text-sm"
                        data-testid="input-area"
                      />
                    </div>
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-2">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 3: Price & Description */}
              {activeCard === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">السعر (ريال)</label>
                    <Input
                      type="number"
                      placeholder={data.transactionType === "rent" ? "الإيجار الشهري" : "سعر البيع"}
                      value={data.price}
                      onChange={(e) => setData(d => ({ ...d, price: e.target.value }))}
                      className="h-12 text-center rounded-xl text-lg font-bold"
                      data-testid="input-price"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">المميزات</label>
                    <div className="flex flex-wrap gap-2">
                      {featuresList.map((feature) => (
                        <button
                          key={feature}
                          onClick={() => toggleFeature(feature)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            data.features.includes(feature) ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                          }`}
                          data-testid={`button-feature-${feature}`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">وصف إضافي (اختياري)</label>
                    <Textarea
                      placeholder="أضف تفاصيل إضافية عن العقار..."
                      value={data.description}
                      onChange={(e) => setData(d => ({ ...d, description: e.target.value }))}
                      className="rounded-xl resize-none"
                      rows={3}
                      data-testid="input-description"
                    />
                  </div>
                  <Button onClick={handleSubmit} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base gap-2 bg-gradient-to-r from-amber-500 to-orange-500" data-testid="button-submit-property">
                    <Camera className="h-5 w-5" />
                    اعرض عقارك
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
                top: `${(activeCard * 44) + 340 + (idx * 24)}px`,
                zIndex: -idx - 1,
                opacity: 0.5 - (idx * 0.15),
              }}
            >
              <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-3 border border-border/40">
                <div className={`w-9 h-9 rounded-lg ${card.lightColor} flex items-center justify-center opacity-70`}>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat with Consultant - Inside Form (Desktop) */}
      <div className="mt-10 pt-6 border-t border-dashed max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">أو تحدث مع مستشار العقارات</span>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 border rounded-full px-4 py-2.5">
          <Button
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0 bg-amber-500 hover:bg-amber-600"
            data-testid="button-send-consultant-seller-desktop"
          >
            <Send className="h-4 w-4" />
          </Button>
          <input
            type="text"
            dir="rtl"
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-transparent border-0 outline-none text-sm px-2"
            data-testid="input-chat-consultant-seller-desktop"
          />
        </div>
      </div>
      
      {/* Bottom spacing */}
      <div className="pb-4" />
    </div>

    {/* ==================== MOBILE VERSION ==================== */}
    <div className="md:hidden relative px-3 py-3">
      {/* Match Index - Shows after step 1 */}
      {activeCard >= 1 && (
        <div className="mb-2 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">مؤشر التطابق</span>
            <span className="text-xs font-bold text-amber-600">{matchIndexScore}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${matchIndexScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Stacked Cards - Dynamic height */}
      <div className="relative pb-2" style={{ minHeight: `${(activeCard * 28) + 240}px` }}>
        
        {/* Completed Cards */}
        {cards.slice(0, activeCard).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => goBack(card.id)}
              className="absolute inset-x-0 cursor-pointer transition-all duration-200"
              style={{ top: `${idx * 28}px`, zIndex: idx + 1 }}
            >
              <div className={`${card.lightColor} rounded-xl p-2.5 flex items-center gap-2 border border-amber-500/20`}>
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
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-5 h-5 text-amber-600" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{cards[activeCard].title}</h3>
              </div>
              <span className="text-xl font-bold text-muted-foreground/30">{activeCard + 1}</span>
            </div>

            {/* Card Content */}
            <div className="p-3">
              
              {/* Step 0: Owner */}
              {activeCard === 0 && (
                <div className="space-y-2">
                  <Input
                    placeholder="اسم المالك"
                    value={data.ownerName}
                    onChange={(e) => setData(d => ({ ...d, ownerName: e.target.value }))}
                    className="h-10 text-sm text-center rounded-lg"
                    data-testid="input-owner-name-mobile"
                  />
                  <Input
                    type="tel"
                    placeholder="رقم الجوال"
                    value={data.ownerPhone}
                    onChange={(e) => setData(d => ({ ...d, ownerPhone: e.target.value }))}
                    className="h-10 text-sm text-center rounded-lg"
                    dir="ltr"
                    data-testid="input-owner-phone-mobile"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "sale", l: "للبيع" },
                      { v: "rent", l: "للإيجار" }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setData(d => ({ ...d, transactionType: t.v as "sale" | "rent" }))}
                        className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                          data.transactionType === t.v ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-border"
                        }`}
                        data-testid={`button-list-${t.v}-mobile`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                  <div className="pb-14" />
                </div>
              )}

              {/* Floating Next Button for Step 0 */}
              {activeCard === 0 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm bg-amber-500 hover:bg-amber-600 shadow-lg" data-testid="button-next-list-mobile-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Location */}
              {activeCard === 1 && (
                <div className="space-y-2">
                  <div className="flex justify-center gap-2">
                    {[
                      { v: "residential", l: "سكني" },
                      { v: "commercial", l: "تجاري" }
                    ].map(c => (
                      <button
                        key={c.v}
                        onClick={() => setData(d => ({ ...d, propertyCategory: c.v as "residential" | "commercial", propertyType: "" }))}
                        className={`px-4 py-2 rounded-full border-2 text-xs transition-all ${
                          data.propertyCategory === c.v ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                        }`}
                        data-testid={`button-list-category-${c.v}-mobile`}
                      >
                        {c.l}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-[100px] overflow-y-auto border rounded-lg p-1.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {saudiCities.map((city) => (
                        <button
                          key={city.name}
                          onClick={() => setData(d => ({ ...d, city: city.name, latitude: null, longitude: null }))}
                          className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                            data.city === city.name ? "border-amber-500 bg-amber-500 text-white" : "border-border hover:border-amber-500/50"
                          }`}
                          data-testid={`button-list-city-${city.name}-mobile`}
                        >
                          <span className="truncate block">{city.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interactive Map for Mobile */}
                  {data.city && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-medium flex items-center gap-1">
                          <Target className="h-3 w-3 text-amber-500" />
                          انقر لتحديد الموقع
                        </span>
                        {data.latitude && (
                          <button 
                            onClick={() => setData(d => ({ ...d, latitude: null, longitude: null }))}
                            className="text-[10px] text-red-500"
                            data-testid="button-clear-location-mobile"
                          >
                            مسح
                          </button>
                        )}
                      </div>
                      <div className="h-[120px] rounded-lg overflow-hidden border border-border">
                        <MapContainer
                          center={mapCenter}
                          zoom={data.latitude ? 15 : 12}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={true}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <MapCenterUpdater center={mapCenter} zoom={data.latitude ? 15 : 12} />
                          <LocationPicker 
                            onLocationSelect={handleLocationSelect}
                            currentPosition={data.latitude && data.longitude ? [data.latitude, data.longitude] : null}
                          />
                        </MapContainer>
                      </div>
                      {data.latitude && data.longitude && (
                        <div className="text-[10px] text-center text-muted-foreground bg-amber-50 dark:bg-amber-900/20 rounded p-1">
                          تم التحديد: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pb-14" />
                </div>
              )}

              {/* Floating Next Button for Step 1 */}
              {activeCard === 1 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm bg-amber-500 hover:bg-amber-600 shadow-lg" data-testid="button-next-list-mobile-1">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 2: Property */}
              {activeCard === 2 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1.5">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setData(d => ({ ...d, propertyType: type.value }))}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            data.propertyType === type.value ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-border"
                          }`}
                          data-testid={`button-list-type-${type.value}-mobile`}
                        >
                          <Icon className={`h-5 w-5 mx-auto ${data.propertyType === type.value ? "text-amber-600" : "text-muted-foreground"}`} />
                          <div className="text-[10px] font-medium mt-1">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-[10px] text-center mb-1">الغرف</div>
                      <div className="flex justify-center gap-1">
                        {["1", "2", "3", "4", "5+"].map((n) => (
                          <button
                            key={n}
                            onClick={() => setData(d => ({ ...d, rooms: n }))}
                            className={`w-7 h-7 rounded-full border text-[10px] font-bold transition-all ${
                              data.rooms === n ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                            }`}
                            data-testid={`button-list-rooms-${n}-mobile`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      type="number"
                      placeholder="المساحة"
                      value={data.area}
                      onChange={(e) => setData(d => ({ ...d, area: e.target.value }))}
                      className="w-20 h-8 text-center text-xs rounded-lg"
                      data-testid="input-area-mobile"
                    />
                  </div>
                  <div className="pb-14" />
                </div>
              )}

              {/* Floating Next Button for Step 2 */}
              {activeCard === 2 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm bg-amber-500 hover:bg-amber-600 shadow-lg" data-testid="button-next-list-mobile-2">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 3: Price */}
              {activeCard === 3 && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="السعر بالريال"
                    value={data.price}
                    onChange={(e) => setData(d => ({ ...d, price: e.target.value }))}
                    className="h-10 text-center rounded-lg text-lg font-bold"
                    data-testid="input-price-mobile"
                  />
                  <div className="flex flex-wrap gap-1">
                    {featuresList.slice(0, 6).map((feature) => (
                      <button
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={`px-2 py-1 rounded-full border text-[10px] font-medium transition-all ${
                          data.features.includes(feature) ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                        }`}
                        data-testid={`button-feature-${feature}-mobile`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                  <div className="pb-14" />
                </div>
              )}

              {/* Floating Submit Button for Step 3 */}
              {activeCard === 3 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                  <Button onClick={handleSubmit} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg" data-testid="button-submit-property-mobile">
                    <Camera className="h-4 w-4" />
                    اعرض عقارك
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
                top: `${(activeCard * 28) + 240 + (idx * 16)}px`,
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

      {/* Chat with Consultant - Inside Form (Mobile) */}
      <div className="mt-8 pt-4 border-t border-dashed">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <MessageCircle className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">أو تحدث مع مستشار العقارات</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 border rounded-full px-3 py-2">
          <Button
            size="icon"
            className="rounded-full h-7 w-7 flex-shrink-0 bg-amber-500 hover:bg-amber-600"
            data-testid="button-send-consultant-seller-mobile"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
          <input
            type="text"
            dir="rtl"
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-transparent border-0 outline-none text-xs px-2"
            data-testid="input-chat-consultant-seller-mobile"
          />
        </div>
      </div>
      
      {/* Bottom spacing */}
      <div className="pb-4" />
    </div>
    </>
  );
});
