import { useState, memo, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, User, Home, Building2, 
  Check, Phone, Camera, DollarSign,
  Building, Warehouse, LandPlot, Ruler, BedDouble,
  Send, MessageCircle, Navigation, Target, Search
} from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Generate neighborhood coordinates around city center
function getNeighborhoodCoords(cityCoords: { lat: number; lng: number }, index: number, total: number, seed: number) {
  const angle = (2 * Math.PI * index) / total + (seed * 0.1);
  const radius = 0.02 + (seed % 3) * 0.01;
  return {
    lat: cityCoords.lat + radius * Math.cos(angle),
    lng: cityCoords.lng + radius * Math.sin(angle)
  };
}

interface PropertyData {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
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

// Phone validation function
function validateSaudiPhone(phone: string): { isValid: boolean; error: string } {
  if (!phone.trim()) return { isValid: false, error: "" };
  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" };
  }
  return { isValid: true, error: "" };
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

// Custom icons for cities and districts
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

// City marker component for seller form - ALL markers are GREEN
function SellerCityMarker({ 
  city, 
  isSelected, 
  onSelect 
}: { 
  city: typeof saudiCities[0]; 
  isSelected: boolean;
  onSelect: (name: string) => void;
}) {
  return (
    <Marker 
      position={[city.coordinates.lat, city.coordinates.lng]}
      icon={greenIcon}
      eventHandlers={{
        click: () => onSelect(city.name)
      }}
    >
      <Popup>
        <div className="text-center text-sm font-bold">{city.name}</div>
        {isSelected && <div className="text-xs text-green-600">محدد</div>}
      </Popup>
    </Marker>
  );
}

// District marker component for seller form - ALL markers are GREEN
function SellerDistrictMarker({ 
  name, 
  coords, 
  isSelected, 
  onSelect 
}: { 
  name: string;
  coords: { lat: number; lng: number };
  isSelected: boolean;
  onSelect: (name: string) => void;
}) {
  // Validate coordinates
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number' || isNaN(coords.lat) || isNaN(coords.lng)) {
    return null;
  }
  
  return (
    <CircleMarker 
      center={[coords.lat, coords.lng]}
      radius={isSelected ? 12 : 8}
      pathOptions={{
        color: '#22c55e',
        fillColor: '#22c55e',
        fillOpacity: isSelected ? 0.9 : 0.6,
        weight: isSelected ? 3 : 2
      }}
      eventHandlers={{
        click: () => onSelect(name)
      }}
    >
      <Popup>
        <div className="text-center text-sm font-bold">{name}</div>
      </Popup>
    </CircleMarker>
  );
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
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [data, setData] = useState<PropertyData>({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
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
  
  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  
  // Auto-registration state
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);
  const [autoRegisterResult, setAutoRegisterResult] = useState<{
    success: boolean;
    message: string;
    generatedPassword?: string;
    userId?: string;
  } | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  
  // Validate email format
  const validateEmail = (email: string): { isValid: boolean; error: string } => {
    if (!email.trim()) return { isValid: false, error: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "صيغة البريد الإلكتروني غير صحيحة" };
    }
    return { isValid: true, error: "" };
  };

  // Handle phone change
  const handlePhoneChange = (value: string) => {
    const validation = validateSaudiPhone(value);
    setData(d => ({ ...d, ownerPhone: value }));
    if (value.trim()) {
      setPhoneError(validation.isValid ? "" : validation.error);
    } else {
      setPhoneError("");
    }
  };

  // Handle email change
  const handleEmailChange = (value: string) => {
    setData(d => ({ ...d, ownerEmail: value }));
    if (value.trim()) {
      const validation = validateEmail(value);
      setEmailError(validation.error);
    } else {
      setEmailError("");
    }
  };

  // Check if phone is valid
  const isPhoneValid = useMemo(() => {
    if (!data.ownerPhone.trim()) return false;
    return validateSaudiPhone(data.ownerPhone).isValid;
  }, [data.ownerPhone]);

  // Check if email is valid
  const isEmailValid = useMemo(() => {
    if (!data.ownerEmail.trim()) return false;
    return validateEmail(data.ownerEmail).isValid;
  }, [data.ownerEmail]);

  // Check if all personal data is complete for auto-registration
  const isPersonalDataComplete = useMemo(() => {
    return data.ownerName.trim().length >= 2 && isPhoneValid && isEmailValid;
  }, [data.ownerName, isPhoneValid, isEmailValid]);

  // Auto-register user when personal data is complete
  const autoRegisterRef = useRef(false);
  
  useEffect(() => {
    if (isPersonalDataComplete && !registeredUserId && !isAutoRegistering && !autoRegisterRef.current) {
      autoRegisterRef.current = true;
      setIsAutoRegistering(true);
      
      fetch('/api/auth/autoregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.ownerName,
          phone: data.ownerPhone,
          email: data.ownerEmail,
          role: 'seller'
        }),
        credentials: 'include'
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setRegisteredUserId(result.user.id);
            setAutoRegisterResult({
              success: true,
              message: result.isExisting ? 'تم تسجيل الدخول بنجاح' : `تم التسجيل! كلمة المرور: ${result.generatedPassword}`,
              generatedPassword: result.generatedPassword,
              userId: result.user.id
            });
          } else {
            setAutoRegisterResult({
              success: false,
              message: result.error || 'حدث خطأ أثناء التسجيل'
            });
            autoRegisterRef.current = false;
          }
        })
        .catch(err => {
          console.error('Auto-register error:', err);
          setAutoRegisterResult({
            success: false,
            message: 'حدث خطأ أثناء التسجيل'
          });
          autoRegisterRef.current = false;
        })
        .finally(() => {
          setIsAutoRegistering(false);
        });
    }
  }, [isPersonalDataComplete, registeredUserId, isAutoRegistering, data.ownerName, data.ownerPhone, data.ownerEmail]);

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

  // Get available districts for selected city with coordinates
  const availableDistricts = useMemo(() => {
    if (!data.city) return [];
    const city = saudiCities.find(c => c.name === data.city);
    if (!city) return [];
    return city.neighborhoods.map((n, i) => {
      const coord = getNeighborhoodCoords(city.coordinates, i, city.neighborhoods.length, n.name.charCodeAt(0));
      return { name: n.name, lat: coord.lat, lng: coord.lng };
    });
  }, [data.city]);

  // Handle location selection from map click
  const handleLocationSelect = (lat: number, lng: number) => {
    setData(d => ({ ...d, latitude: lat, longitude: lng }));
  };

  // Handle city selection
  const handleCitySelect = (cityName: string) => {
    setData(d => ({ ...d, city: cityName, district: "", latitude: null, longitude: null }));
  };

  // Handle district selection
  const handleDistrictSelect = (districtName: string) => {
    const district = availableDistricts.find(d => d.name === districtName);
    if (district) {
      setData(d => ({ ...d, district: districtName, latitude: district.lat, longitude: district.lng }));
    }
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

  const handleSubmit = () => {
    onSubmit(data);
  };

  const canProceed = () => {
    switch (activeCard) {
      case 0: return data.ownerName.trim() !== "" && isPhoneValid && isEmailValid;
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

  // ==================== DESKTOP VERSION ====================
  const DesktopForm = () => (
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
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">اسم المالك</label>
                      <Input
                        placeholder="أدخل اسمك"
                        value={data.ownerName}
                        onChange={(e) => setData(d => ({ ...d, ownerName: e.target.value }))}
                        className="h-12 text-center rounded-xl"
                        name="name"
                        autoComplete="name"
                        data-testid="input-owner-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">رقم الجوال</label>
                      <Input
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={data.ownerPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`h-12 text-center rounded-xl ${phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        dir="ltr"
                        name="tel"
                        autoComplete="tel"
                        data-testid="input-owner-phone"
                      />
                      {phoneError && (
                        <p className="text-xs text-red-500 mt-1 text-center">{phoneError}</p>
                      )}
                      {isPhoneValid && (
                        <p className="text-xs text-green-500 mt-1 text-center flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" /> رقم صحيح
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={data.ownerEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`h-12 text-center rounded-xl ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        dir="ltr"
                        name="email"
                        autoComplete="email"
                        data-testid="input-owner-email"
                      />
                      {emailError && (
                        <p className="text-xs text-red-500 mt-1 text-center">{emailError}</p>
                      )}
                      {isEmailValid && (
                        <p className="text-xs text-green-500 mt-1 text-center flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" /> بريد صحيح
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Auto-registration status */}
                  {isAutoRegistering && (
                    <div className="flex items-center justify-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm text-blue-600 dark:text-blue-400">جاري التسجيل...</span>
                    </div>
                  )}
                  
                  {autoRegisterResult && (
                    <div className={`p-3 rounded-lg ${autoRegisterResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                      <p className={`text-sm font-medium ${autoRegisterResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {autoRegisterResult.message}
                      </p>
                      {autoRegisterResult.generatedPassword && (
                        <p className="text-xs text-muted-foreground mt-1">
                          احفظ كلمة المرور هذه للدخول لاحقاً
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Transaction Type - Amber/Orange for seller (Desktop) - text only, no icons */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { v: "sale", l: "للبيع" },
                      { v: "rent", l: "للإيجار" }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setData(d => ({ ...d, transactionType: t.v as "sale" | "rent" }))}
                        className={`py-4 rounded-xl border-2 text-center font-bold transition-all ${
                          data.transactionType === t.v 
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" 
                            : "border-border hover:border-amber-300 text-foreground"
                        }`}
                        data-testid={`button-list-${t.v}`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                  
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl font-bold bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Location */}
              {activeCard === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* City Map with all markers */}
                    <div>
                      <label className="text-sm font-medium mb-2 block text-center">اختر المدينة من الخريطة</label>
                      <div className="h-[200px] rounded-xl overflow-hidden border-2 border-border">
                        <MapContainer
                          center={[24.7136, 46.6753]}
                          zoom={5}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={true}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {saudiCities.map(city => (
                            <SellerCityMarker
                              key={city.name}
                              city={city}
                              isSelected={data.city === city.name}
                              onSelect={handleCitySelect}
                            />
                          ))}
                        </MapContainer>
                      </div>
                    </div>
                    
                    {/* City List */}
                    <div>
                      <label className="text-sm font-medium mb-2 block text-center">أو اختر من القائمة</label>
                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
                        {saudiCities.slice(0, 20).map((city) => (
                          <button
                            key={city.name}
                            onClick={() => handleCitySelect(city.name)}
                            className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                              data.city === city.name ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                            }`}
                            data-testid={`button-list-city-${city.name}`}
                          >
                            {city.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Districts Map and List - Shows when city is selected */}
                  {data.city && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium block text-center">اختر الحي</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Districts Map */}
                        <div>
                          <div className="h-[180px] rounded-xl overflow-hidden border-2 border-border">
                            <MapContainer
                              center={mapCenter}
                              zoom={12}
                              style={{ height: "100%", width: "100%" }}
                              scrollWheelZoom={true}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <MapCenterUpdater center={mapCenter} zoom={12} />
                              {/* Show all districts as markers */}
                              {availableDistricts.map(district => (
                                <SellerDistrictMarker
                                  key={district.name}
                                  name={district.name}
                                  coords={{ lat: district.lat, lng: district.lng }}
                                  isSelected={data.district === district.name}
                                  onSelect={handleDistrictSelect}
                                />
                              ))}
                              {/* Allow manual pin placement */}
                              <LocationPicker 
                                onLocationSelect={handleLocationSelect}
                                currentPosition={data.latitude && data.longitude ? [data.latitude, data.longitude] : null}
                              />
                            </MapContainer>
                          </div>
                          <p className="text-[10px] text-muted-foreground text-center mt-1">انقر على الدائرة لاختيار الحي أو انقر في أي مكان لتحديد موقع دقيق</p>
                        </div>
                        
                        {/* Districts List */}
                        <div className="max-h-[200px] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-1.5">
                            {availableDistricts.map(district => (
                              <button
                                key={district.name}
                                onClick={() => handleDistrictSelect(district.name)}
                                className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                                  data.district === district.name ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                                }`}
                                data-testid={`button-list-district-${district.name}`}
                              >
                                {district.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {data.latitude && data.longitude && (
                        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Navigation className="h-3 w-3 text-amber-500" />
                            <span>الموقع: {data.district || 'موقع مخصص'} ({data.latitude.toFixed(4)}, {data.longitude.toFixed(4)})</span>
                          </div>
                          <button 
                            onClick={() => setData(d => ({ ...d, district: "", latitude: null, longitude: null }))}
                            className="text-xs text-red-500 hover:underline"
                            data-testid="button-clear-location"
                          >
                            مسح
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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
      <div className="mt-6 pt-4 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">أو تحدث مع مستشار المبيعات</span>
        </div>
        <div className="flex items-center gap-3 bg-muted/40 dark:bg-muted/20 rounded-xl px-4 py-3.5 border border-border/50">
          <Button
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0 bg-amber-500 hover:bg-amber-600"
            data-testid="button-send-consultant-seller-desktop"
          >
            <Send className="h-4 w-4" />
          </Button>
          <input
            type="text"
            dir="rtl"
            placeholder="اكتب رسالتك هنا .."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-muted-foreground placeholder:text-muted-foreground/70"
            data-testid="input-chat-consultant-seller-desktop"
          />
        </div>
      </div>
    </div>
  );

  // ==================== MOBILE VERSION ====================
  const MobileForm = () => (
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
            
            {/* Card Header - Minimal like design */}
            <div className="flex items-center justify-between p-4">
              <span className="text-2xl font-bold text-muted-foreground/40">{activeCard + 1}</span>
              <div className={`w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-5 h-5 text-amber-600" />; })()}
              </div>
            </div>

            {/* Card Content */}
            <div className="px-4 pb-4 space-y-3">
              
              {/* Step 0: Owner */}
              {activeCard === 0 && (
                <div className="space-y-3">
                  <Input
                    placeholder="اسم المالك"
                    value={data.ownerName}
                    onChange={(e) => setData(d => ({ ...d, ownerName: e.target.value }))}
                    className="h-12 text-sm text-center rounded-lg border-border"
                    name="name"
                    autoComplete="name"
                    data-testid="input-owner-name-mobile"
                  />
                  <div>
                    <Input
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={data.ownerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`h-12 text-sm text-center rounded-lg ${phoneError ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
                      dir="ltr"
                      name="tel"
                      autoComplete="tel"
                      data-testid="input-owner-phone-mobile"
                    />
                    {phoneError && (
                      <p className="text-[10px] text-red-500 mt-1 text-center">{phoneError}</p>
                    )}
                    {isPhoneValid && (
                      <p className="text-[10px] text-green-500 mt-1 text-center flex items-center justify-center gap-0.5">
                        <Check className="h-2.5 w-2.5" /> صحيح
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={data.ownerEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`h-12 text-sm text-center rounded-lg ${emailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
                      dir="ltr"
                      name="email"
                      autoComplete="email"
                      data-testid="input-owner-email-mobile"
                    />
                    {emailError && (
                      <p className="text-[10px] text-red-500 mt-1 text-center">{emailError}</p>
                    )}
                    {isEmailValid && (
                      <p className="text-[10px] text-green-500 mt-1 text-center flex items-center justify-center gap-0.5">
                        <Check className="h-2.5 w-2.5" /> صحيح
                      </p>
                    )}
                  </div>
                  
                  {/* Auto-registration status */}
                  {isAutoRegistering && (
                    <div className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">جاري التسجيل...</span>
                    </div>
                  )}
                  
                  {autoRegisterResult && (
                    <div className={`p-2.5 rounded-lg ${autoRegisterResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                      <p className={`text-xs font-medium ${autoRegisterResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {autoRegisterResult.message}
                      </p>
                    </div>
                  )}
                  
                  {/* Transaction Type - Amber/Orange for seller (text only, no icons) */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: "sale", l: "للبيع" },
                      { v: "rent", l: "للإيجار" }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setData(d => ({ ...d, transactionType: t.v as "sale" | "rent" }))}
                        className={`py-3 rounded-lg border-2 text-center font-bold text-sm transition-all ${
                          data.transactionType === t.v 
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" 
                            : "border-border text-foreground"
                        }`}
                        data-testid={`button-list-${t.v}-mobile`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                  
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-mobile-0">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 1: Location */}
              {activeCard === 1 && (
                <div className="space-y-2">
                  {/* City Map with markers - Mobile */}
                  <div className="h-[100px] rounded-lg overflow-hidden border border-border">
                    <MapContainer
                      center={[24.7136, 46.6753]}
                      zoom={5}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {saudiCities.map(city => (
                        <SellerCityMarker
                          key={city.name}
                          city={city}
                          isSelected={data.city === city.name}
                          onSelect={handleCitySelect}
                        />
                      ))}
                    </MapContainer>
                  </div>
                  
                  {/* City Grid - Mobile */}
                  <div className="grid grid-cols-4 gap-1.5 max-h-[60px] overflow-y-auto">
                    {saudiCities.slice(0, 12).map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city.name)}
                        className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                          data.city === city.name ? "border-amber-500 bg-amber-500 text-white" : "border-border"
                        }`}
                        data-testid={`button-list-city-${city.name}-mobile`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Districts Map and List - Mobile */}
                  {data.city && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-center font-medium">اختر الحي من الخريطة أو القائمة</p>
                      <div className="h-[100px] rounded-lg overflow-hidden border border-border">
                        <MapContainer
                          center={mapCenter}
                          zoom={12}
                          style={{ height: "100%", width: "100%" }}
                          zoomControl={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <MapCenterUpdater center={mapCenter} zoom={12} />
                          {availableDistricts.map(district => (
                            <SellerDistrictMarker
                              key={district.name}
                              name={district.name}
                              coords={{ lat: district.lat, lng: district.lng }}
                              isSelected={data.district === district.name}
                              onSelect={handleDistrictSelect}
                            />
                          ))}
                          <LocationPicker 
                            onLocationSelect={handleLocationSelect}
                            currentPosition={data.latitude && data.longitude ? [data.latitude, data.longitude] : null}
                          />
                        </MapContainer>
                      </div>
                      
                      {/* Districts Grid - Mobile */}
                      <div className="grid grid-cols-3 gap-1 max-h-[60px] overflow-y-auto">
                        {availableDistricts.slice(0, 9).map(district => (
                          <button
                            key={district.name}
                            onClick={() => handleDistrictSelect(district.name)}
                            className={`py-1 px-1 rounded text-[9px] font-medium transition-all ${
                              data.district === district.name ? "bg-amber-500 text-white" : "bg-muted"
                            }`}
                            data-testid={`button-list-district-${district.name}-mobile`}
                          >
                            {district.name}
                          </button>
                        ))}
                      </div>
                      
                      {data.latitude && data.longitude && (
                        <div className="flex items-center justify-between text-[10px] bg-amber-50 dark:bg-amber-900/20 rounded p-1">
                          <span>{data.district || 'موقع مخصص'}: {data.latitude.toFixed(4)}</span>
                          <button 
                            onClick={() => setData(d => ({ ...d, district: "", latitude: null, longitude: null }))}
                            className="text-red-500"
                            data-testid="button-clear-location-mobile"
                          >
                            مسح
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg text-sm bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-mobile-1">
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
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg text-sm bg-amber-500 hover:bg-amber-600" data-testid="button-next-list-mobile-2">
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
                  <Button onClick={handleSubmit} disabled={!canProceed()} className="w-full h-10 rounded-lg text-sm gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500" data-testid="button-submit-property-mobile">
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
      <div className="mt-6 pt-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">أو تحدث مع مستشار المبيعات</span>
        </div>
        <div className="flex items-center gap-3 bg-muted/40 dark:bg-muted/20 rounded-xl px-4 py-3.5 border border-border/50">
          <Button
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0 bg-amber-500 hover:bg-amber-600"
            data-testid="button-send-consultant-seller-mobile"
          >
            <Send className="h-4 w-4" />
          </Button>
          <input
            type="text"
            dir="rtl"
            placeholder="اكتب رسالتك هنا .."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-muted-foreground placeholder:text-muted-foreground/70"
            data-testid="input-chat-consultant-seller-mobile"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopForm />
      <MobileForm />
    </>
  );
});
