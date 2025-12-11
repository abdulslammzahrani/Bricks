import { useState, memo, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, User, Home, Building2, 
  Sparkles, Search, Building, Warehouse, LandPlot,
  Check, Castle, Hotel, Store, Factory, Blocks, Navigation,
  BedDouble, Bath, Wallet, Settings2, FileText,
  Car, Trees, Dumbbell, ShieldCheck, Waves, Wind, X,
  Tv, Wifi, Utensils, Shirt, Sofa, DoorOpen, Zap, Flame, Send,
  Hammer, Clock, CheckCircle2, Mic, MicOff, MessageCircle
} from "lucide-react";
import { saudiCities, type Neighborhood } from "@shared/saudi-locations";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green icon for selected items (larger)
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom grey icon for unselected items (smaller)
const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

// Custom red icon for hover state
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
  cities: string[];
  districts: string[];
  preferredLatitude: number | null;
  preferredLongitude: number | null;
  propertyCategory: "residential" | "commercial";
  propertyType: string;
  propertyCondition: "new" | "used" | "under_construction" | "";
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

// Custom pin icon for preferred location
const preferredLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Preferred location picker component
function PreferredLocationPicker({ 
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
    <Marker position={currentPosition} icon={preferredLocationIcon}>
      <Popup>
        <div className="text-center text-sm">
          <strong>المنطقة المفضلة</strong>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Map center updater for buyer form
function BuyerMapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
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
  { value: "elevator", label: "مصعد", icon: DoorOpen },
  { value: "furnished", label: "مؤثث", icon: Sofa },
  { value: "kitchen", label: "مطبخ راكب", icon: Utensils },
  { value: "internet", label: "انترنت", icon: Wifi },
  { value: "electricity", label: "كهرباء", icon: Zap },
  { value: "gas", label: "غاز مركزي", icon: Flame },
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

// Saudi Arabia center coordinates
const SAUDI_CENTER = { lat: 23.8859, lng: 45.0792 };

// Convert Arabic numerals to English
function convertArabicToEnglish(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  arabicNumerals.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), index.toString());
  });
  return result;
}

// Validate Saudi phone number
function validateSaudiPhone(phone: string): { isValid: boolean; normalized: string; error: string } {
  // Convert Arabic numerals to English
  let normalized = convertArabicToEnglish(phone);
  // Remove spaces, dashes, and other non-digit characters
  normalized = normalized.replace(/[\s\-\(\)\.]/g, '');
  
  // Handle different formats
  if (normalized.startsWith('+966')) {
    normalized = '0' + normalized.slice(4);
  } else if (normalized.startsWith('00966')) {
    normalized = '0' + normalized.slice(5);
  } else if (normalized.startsWith('966')) {
    normalized = '0' + normalized.slice(3);
  }
  
  // Check if it's a valid Saudi mobile number
  // Saudi mobile numbers: 05xxxxxxxx (10 digits starting with 05)
  const saudiMobileRegex = /^05[0-9]{8}$/;
  
  if (!normalized) {
    return { isValid: false, normalized: '', error: 'أدخل رقم الجوال' };
  }
  
  if (!saudiMobileRegex.test(normalized)) {
    if (normalized.length < 10) {
      return { isValid: false, normalized, error: 'الرقم قصير جداً' };
    } else if (normalized.length > 10) {
      return { isValid: false, normalized, error: 'الرقم طويل جداً' };
    } else if (!normalized.startsWith('05')) {
      return { isValid: false, normalized, error: 'يجب أن يبدأ بـ 05' };
    }
    return { isValid: false, normalized, error: 'رقم غير صحيح' };
  }
  
  return { isValid: true, normalized, error: '' };
}

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onSwitchToChat: () => void;
}

// Generate approximate coordinates for neighborhoods based on city center with grid distribution
function getNeighborhoodCoords(cityCoords: { lat: number; lng: number }, index: number, total: number, seed: number = 0) {
  // Use a grid-based approach centered around city
  const gridSize = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  
  // Small spacing between neighborhoods (approximately 1-2 km)
  const spacing = 0.015;
  
  // Center the grid around the city center
  const offsetRow = (row - gridSize / 2) * spacing;
  const offsetCol = (col - gridSize / 2) * spacing;
  
  // Add small variation based on seed to prevent perfect grid
  const variation = ((seed % 100) / 100 - 0.5) * 0.005;
  
  return {
    lat: cityCoords.lat + offsetRow + variation,
    lng: cityCoords.lng + offsetCol + variation * 0.8
  };
}

// Map center changer component
function MapCenterChanger({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Interactive City Marker Component
function CityMarker({ 
  city, 
  isSelected, 
  onToggle 
}: { 
  city: typeof saudiCities[0]; 
  isSelected: boolean; 
  onToggle: (name: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const eventHandlers = useMemo(() => ({
    click: () => onToggle(city.name),
    mouseover: () => setIsHovered(true),
    mouseout: () => setIsHovered(false),
  }), [city.name, onToggle]);

  const icon = isSelected ? greenIcon : (isHovered ? redIcon : greyIcon);

  return (
    <Marker 
      position={[city.coordinates.lat, city.coordinates.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      <Popup closeButton={false} className="custom-popup">
        <div className="text-center py-1 px-2">
          <div className="font-bold text-sm">{city.name}</div>
          <div className="text-xs text-gray-500">{city.nameEn}</div>
          <div className="text-xs mt-1">
            {isSelected ? (
              <span className="text-green-600 font-medium">محددة</span>
            ) : (
              <span className="text-gray-400">انقر للتحديد</span>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Interactive District Marker Component
function DistrictMarker({ 
  name,
  cityName,
  coords,
  isSelected, 
  onToggle 
}: { 
  name: string;
  cityName: string;
  coords: { lat: number; lng: number };
  isSelected: boolean; 
  onToggle: (name: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const eventHandlers = useMemo(() => ({
    click: () => onToggle(name),
    mouseover: () => setIsHovered(true),
    mouseout: () => setIsHovered(false),
  }), [name, onToggle]);

  const icon = isSelected ? greenIcon : (isHovered ? redIcon : greyIcon);

  return (
    <Marker 
      position={[coords.lat, coords.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      <Popup closeButton={false} className="custom-popup">
        <div className="text-center py-1 px-2">
          <div className="font-bold text-sm">{name}</div>
          <div className="text-xs text-gray-500">{cityName}</div>
          <div className="text-xs mt-1">
            {isSelected ? (
              <span className="text-green-600 font-medium">محدد</span>
            ) : (
              <span className="text-gray-400">انقر للتحديد</span>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Map click handler with proximity detection
function SmartMapClickHandler({ 
  items,
  onSelect,
  maxDistance = 0.5
}: { 
  items: { name: string; lat: number; lng: number }[];
  onSelect: (name: string) => void;
  maxDistance?: number;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      let nearest: string | null = null;
      let minDist = Infinity;
      
      items.forEach(item => {
        const dist = Math.sqrt(Math.pow(item.lat - lat, 2) + Math.pow(item.lng - lng, 2));
        if (dist < minDist && dist < maxDistance) {
          minDist = dist;
          nearest = item.name;
        }
      });
      
      if (nearest) {
        onSelect(nearest);
      }
    },
  });
  return null;
}

export const AdvancedSearchForm = memo(function AdvancedSearchForm({ onSearch, onSwitchToChat }: AdvancedSearchFormProps) {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoRegistered, setIsAutoRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    phone: "",
    transactionType: "sale",
    cities: [],
    districts: [],
    preferredLatitude: null,
    preferredLongitude: null,
    propertyCategory: "residential",
    propertyType: "",
    propertyCondition: "",
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
  
  // Get map center for preferred location picker
  const preferredMapCenter = useMemo<[number, number]>(() => {
    if (filters.preferredLatitude && filters.preferredLongitude) {
      return [filters.preferredLatitude, filters.preferredLongitude];
    }
    if (filters.cities.length > 0) {
      const city = saudiCities.find(c => c.name === filters.cities[0]);
      if (city) {
        return [city.coordinates.lat, city.coordinates.lng];
      }
    }
    return [24.7136, 46.6753]; // Default: Riyadh
  }, [filters.cities, filters.preferredLatitude, filters.preferredLongitude]);

  // Handle preferred location selection
  const handlePreferredLocationSelect = (lat: number, lng: number) => {
    setFilters(f => ({ ...f, preferredLatitude: lat, preferredLongitude: lng }));
  };
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Validate phone on change
  const handlePhoneChange = (value: string) => {
    const validation = validateSaudiPhone(value);
    setFilters(f => ({ ...f, phone: value }));
    if (value.trim()) {
      setPhoneError(validation.isValid ? "" : validation.error);
    } else {
      setPhoneError("");
    }
  };

  // Check if phone is valid
  const isPhoneValid = useMemo(() => {
    if (!filters.phone.trim()) return false;
    return validateSaudiPhone(filters.phone).isValid;
  }, [filters.phone]);

  const propertyTypes = propertyOptions[filters.propertyCategory];
  const totalCards = 8;

  // Main cities that always show (most popular)
  const mainCityNames = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر"];
  
  // Filter cities - main cities always visible, plus search results
  const filteredCities = useMemo(() => {
    const mainCities = saudiCities.filter(c => mainCityNames.includes(c.name));
    const otherCities = saudiCities.filter(c => !mainCityNames.includes(c.name));
    
    if (!citySearch.trim()) {
      // No search - show main cities first, then others
      return [...mainCities, ...otherCities];
    }
    
    // With search - show matching cities, but always include main cities
    const searchMatches = saudiCities.filter(c => 
      c.name.includes(citySearch) || c.nameEn.toLowerCase().includes(citySearch.toLowerCase())
    );
    
    // Combine: search matches first, then remaining main cities not in search
    const matchNames = new Set(searchMatches.map(c => c.name));
    const remainingMainCities = mainCities.filter(c => !matchNames.has(c.name));
    
    return [...searchMatches, ...remainingMainCities];
  }, [citySearch]);

  // City items for map click detection
  const cityItems = useMemo(() => {
    return saudiCities.map(c => ({
      name: c.name,
      lat: c.coordinates.lat,
      lng: c.coordinates.lng
    }));
  }, []);

  // Get all neighborhoods from selected cities
  const availableDistricts = useMemo(() => {
    if (filters.cities.length === 0) return [];
    const districts: { name: string; cityName: string }[] = [];
    filters.cities.forEach(cityName => {
      const city = saudiCities.find(c => c.name === cityName);
      if (city) {
        city.neighborhoods.forEach(n => {
          districts.push({ name: n.name, cityName: city.name });
        });
      }
    });
    return districts;
  }, [filters.cities]);

  // Filter districts based on search
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return availableDistricts;
    return availableDistricts.filter(d => d.name.includes(districtSearch));
  }, [availableDistricts, districtSearch]);

  // Generate neighborhood coordinates for selected cities
  const neighborhoodCoords = useMemo(() => {
    const coords = new Map<string, { lat: number; lng: number; cityName: string }>();
    filters.cities.forEach(cityName => {
      const city = saudiCities.find(c => c.name === cityName);
      if (city) {
        city.neighborhoods.forEach((n, i) => {
          const coord = getNeighborhoodCoords(city.coordinates, i, city.neighborhoods.length, n.name.charCodeAt(0));
          coords.set(n.name, { ...coord, cityName: city.name });
        });
      }
    });
    return coords;
  }, [filters.cities]);

  // District items for map click detection
  const districtItems = useMemo(() => {
    const items: { name: string; lat: number; lng: number }[] = [];
    neighborhoodCoords.forEach((coords, name) => {
      items.push({ name, lat: coords.lat, lng: coords.lng });
    });
    return items;
  }, [neighborhoodCoords]);

  const cards = [
    { id: 0, icon: User, title: "البيانات", color: "bg-emerald-500", lightColor: "bg-emerald-100 dark:bg-emerald-900/40" },
    { id: 1, icon: Sparkles, title: "نوع الطلب", color: "bg-amber-500", lightColor: "bg-amber-100 dark:bg-amber-900/40" },
    { id: 2, icon: MapPin, title: "المدينة", color: "bg-blue-500", lightColor: "bg-blue-100 dark:bg-blue-900/40" },
    { id: 3, icon: Navigation, title: "الحي", color: "bg-teal-500", lightColor: "bg-teal-100 dark:bg-teal-900/40" },
    { id: 4, icon: Home, title: "العقار", color: "bg-purple-500", lightColor: "bg-purple-100 dark:bg-purple-900/40" },
    { id: 5, icon: Hammer, title: "حالة العقار", color: "bg-cyan-500", lightColor: "bg-cyan-100 dark:bg-cyan-900/40" },
    { id: 6, icon: Settings2, title: "المواصفات", color: "bg-orange-500", lightColor: "bg-orange-100 dark:bg-orange-900/40" },
    { id: 7, icon: FileText, title: "تفاصيل إضافية", color: "bg-pink-500", lightColor: "bg-pink-100 dark:bg-pink-900/40" },
  ];

  // Auto-register user when moving from step 0 (contact info)
  const autoRegisterUser = async () => {
    if (isAutoRegistered || isRegistering) return;
    
    setIsRegistering(true);
    try {
      const normalizedPhone = validateSaudiPhone(filters.phone).normalized;
      const response = await apiRequest("POST", "/api/auth/auto-register", {
        name: filters.name.trim(),
        phone: normalizedPhone,
        email: `${normalizedPhone}@tatabuk.sa`,
        city: filters.cities[0] || "",
        districts: filters.districts,
        propertyType: filters.propertyType || "apartment",
        budgetMin: filters.minPrice ? parseInt(filters.minPrice) : 0,
        budgetMax: filters.maxPrice ? parseInt(filters.maxPrice) : 0,
        paymentMethod: "cash",
        transactionType: filters.transactionType === "sale" ? "buy" : "rent",
      });
      
      const result = await response.json();
      if (result.success) {
        setIsAutoRegistered(true);
        toast({
          title: "تم تسجيلك بنجاح",
          description: `مرحباً ${filters.name.split(" ")[0]}! تم إنشاء حسابك تلقائياً`,
        });
      }
    } catch (error: any) {
      console.error("Auto-register error:", error);
      // Don't show error to user, just continue
    } finally {
      setIsRegistering(false);
    }
  };

  const goNext = async () => {
    if (activeCard < totalCards - 1 && !isAnimating) {
      // Auto-register when moving from step 0 (contact info step)
      if (activeCard === 0 && !isAutoRegistered) {
        await autoRegisterUser();
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

  const handleSearch = () => {
    onSearch(filters);
  };

  const canProceed = () => {
    switch (activeCard) {
      case 0: return filters.name.trim() !== "" && isPhoneValid;
      case 1: return true;
      case 2: return filters.cities.length > 0;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  // Toggle city selection
  const toggleCity = (cityName: string) => {
    setFilters(f => {
      const newCities = f.cities.includes(cityName)
        ? f.cities.filter(c => c !== cityName)
        : [...f.cities, cityName];
      // Reset districts when cities change
      const validDistricts = f.districts.filter(d => {
        return newCities.some(cName => {
          const city = saudiCities.find(c => c.name === cName);
          return city?.neighborhoods.some(n => n.name === d);
        });
      });
      return { ...f, cities: newCities, districts: validDistricts };
    });
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
    if (filters.cities.length > 0) score += 15;
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

  // Get map center for cities (center on last selected city)
  const cityMapCenter = useMemo(() => {
    if (filters.cities.length > 0) {
      const lastCity = filters.cities[filters.cities.length - 1];
      const city = saudiCities.find(c => c.name === lastCity);
      if (city) return city.coordinates;
    }
    return SAUDI_CENTER;
  }, [filters.cities]);

  // Get map center for districts (center on last selected district, or first city)
  const districtMapCenter = useMemo(() => {
    // If there are selected districts, center on the last one
    if (filters.districts.length > 0) {
      const lastDistrict = filters.districts[filters.districts.length - 1];
      const coords = neighborhoodCoords.get(lastDistrict);
      if (coords) {
        return { lat: coords.lat, lng: coords.lng };
      }
    }
    // Otherwise center on first selected city
    if (filters.cities.length === 0) return SAUDI_CENTER;
    const firstCity = saudiCities.find(c => c.name === filters.cities[0]);
    return firstCity?.coordinates || SAUDI_CENTER;
  }, [filters.cities, filters.districts, neighborhoodCoords]);

  return (
    <>
    {/* ==================== DESKTOP VERSION ==================== */}
    <div className="hidden md:block p-6">
      {/* Match Index - Shows after step 1 */}
      {activeCard >= 1 && (
        <div className="mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">مؤشر التطابق</span>
            <span className="text-sm font-bold text-primary">{reliabilityScore}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${reliabilityScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            كلما أكملت بياناتك، زادت فرص التطابق
          </p>
        </div>
      )}

      {/* Desktop Stacked Cards Container */}
      <div className="relative max-w-lg mx-auto" style={{ minHeight: "520px" }}>
        
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
                        placeholder="رقم الجوال"
                        value={filters.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`h-11 text-center rounded-xl ${phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        dir="ltr"
                        data-testid="input-phone-desktop"
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

              {/* Step 2: City with Smart Map - Multiple Selection */}
              {activeCard === 2 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block text-center">اختر المدن</label>
                  <p className="text-xs text-muted-foreground text-center">انقر على الدبابيس مباشرة أو اختر من القائمة</p>
                  
                  {/* Selected Cities */}
                  {filters.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {filters.cities.map(c => (
                        <Badge key={c} variant="secondary" className="gap-1 pl-2">
                          {c}
                          <button onClick={() => toggleCity(c)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن مدينة..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="h-9 pr-10 text-sm rounded-xl"
                      data-testid="input-city-search-desktop"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Map with selected city markers */}
                    <div className="h-[300px] rounded-xl overflow-hidden border-2 border-border">
                      <MapContainer
                        center={[cityMapCenter.lat, cityMapCenter.lng]}
                        zoom={filters.cities.length > 0 ? 8 : 5}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapCenterChanger 
                          center={[cityMapCenter.lat, cityMapCenter.lng]} 
                          zoom={filters.cities.length > 0 ? 8 : 5} 
                        />
                        
                        {/* Show only selected cities as markers */}
                        {filters.cities.map(cityName => {
                          const city = saudiCities.find(c => c.name === cityName);
                          if (!city) return null;
                          return (
                            <CityMarker
                              key={city.name}
                              city={city}
                              isSelected={true}
                              onToggle={toggleCity}
                            />
                          );
                        })}
                      </MapContainer>
                    </div>

                    {/* Cities Grid */}
                    <div className="h-[300px] overflow-y-auto p-1">
                      <div className="grid grid-cols-2 gap-2">
                        {filteredCities.map((city) => {
                          const isSelected = filters.cities.includes(city.name);
                          return (
                            <button
                              key={city.name}
                              onClick={() => toggleCity(city.name)}
                              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground" 
                                  : "border-border hover:border-primary/50"
                              }`}
                              data-testid={`button-city-desktop-${city.name}`}
                            >
                              {isSelected && <Check className="h-4 w-4" />}
                              {city.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-2">
                    {filters.cities.length > 0 ? `التالي (${filters.cities.length} مدينة)` : "اختر مدينة واحدة على الأقل"}
                  </Button>
                </div>
              )}

              {/* Step 3: District with Smart Map - Multiple Selection */}
              {activeCard === 3 && filters.cities.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block text-center">اختر الأحياء</label>
                  <p className="text-xs text-muted-foreground text-center">انقر على الدبابيس مباشرة أو اختر من القائمة</p>
                  
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
                    {/* Map with all district markers + preferred location picker */}
                    <div className="h-[300px] rounded-xl overflow-hidden border-2 border-border">
                      <MapContainer
                        center={[districtMapCenter.lat, districtMapCenter.lng]}
                        zoom={11}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapCenterChanger 
                          center={[districtMapCenter.lat, districtMapCenter.lng]} 
                          zoom={11} 
                        />
                        {/* Show all districts as markers for selection */}
                        {filteredDistricts.map(district => {
                          const isSelected = filters.districts.includes(district.name);
                          return (
                            <DistrictMarker
                              key={`${district.cityName}-${district.name}`}
                              name={district.name}
                              cityName={district.cityName}
                              coords={{ lat: district.lat, lng: district.lng }}
                              isSelected={isSelected}
                              onToggle={toggleDistrict}
                            />
                          );
                        })}
                        {/* Preferred location picker */}
                        <PreferredLocationPicker 
                          onLocationSelect={handlePreferredLocationSelect}
                          currentPosition={filters.preferredLatitude && filters.preferredLongitude 
                            ? [filters.preferredLatitude, filters.preferredLongitude] 
                            : null}
                        />
                      </MapContainer>
                    </div>

                    {/* Districts Grid */}
                    <div className="h-[300px] overflow-y-auto p-1">
                      <div className="grid grid-cols-2 gap-2">
                        {filteredDistricts.map((district) => {
                          const isSelected = filters.districts.includes(district.name);
                          return (
                            <button
                              key={`${district.cityName}-${district.name}`}
                              onClick={() => toggleDistrict(district.name)}
                              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground" 
                                  : "border-border hover:border-primary/50"
                              }`}
                              data-testid={`button-district-desktop-${district.name}`}
                            >
                              {isSelected && <Check className="h-4 w-4" />}
                              {district.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Location Info */}
                  {filters.preferredLatitude && filters.preferredLongitude && (
                    <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span>تم تحديد منطقة مفضلة</span>
                        <span className="text-xs text-muted-foreground">
                          ({filters.preferredLatitude.toFixed(4)}, {filters.preferredLongitude.toFixed(4)})
                        </span>
                      </div>
                      <button 
                        onClick={() => setFilters(f => ({ ...f, preferredLatitude: null, preferredLongitude: null }))}
                        className="text-xs text-destructive hover:underline"
                        data-testid="button-clear-preferred-location-desktop"
                      >
                        مسح
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    انقر على الخريطة لتحديد موقع مفضل بدقة (اختياري)
                  </p>

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

              {/* Step 5: Property Condition */}
              {activeCard === 5 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block text-center">حالة العقار</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "new", label: "جديد", icon: CheckCircle2 },
                      { value: "used", label: "مستخدم", icon: Clock },
                      { value: "under_construction", label: "تحت الإنشاء", icon: Hammer },
                    ].map((condition) => {
                      const Icon = condition.icon;
                      const isSelected = filters.propertyCondition === condition.value;
                      return (
                        <button
                          key={condition.value}
                          onClick={() => setFilters(f => ({ ...f, propertyCondition: f.propertyCondition === condition.value ? "" : condition.value as any }))}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-condition-desktop-${condition.value}`}
                        >
                          <Icon className={`h-8 w-8 mx-auto ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="text-sm font-medium mt-2">{condition.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={goNext} className="w-full h-11 rounded-xl" data-testid="button-next-desktop-5">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 6: Specifications */}
              {activeCard === 6 && (
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

              {/* Step 7: Additional Details */}
              {activeCard === 7 && (
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
                    <Send className="h-5 w-5" />
                    إرسال الطلب
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
                top: `${(activeCard * 40) + 360 + (idx * 20)}px`,
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

      {/* Chat with Consultant - Inside Form (Desktop) */}
      <div className="mt-6 pt-4 border-t border-dashed max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">أو تحدث مع مستشار العقارات</span>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 border rounded-full px-4 py-2.5">
          <Button
            size="icon"
            variant="default"
            onClick={() => onSwitchToChat?.()}
            className="rounded-full h-9 w-9 flex-shrink-0"
            data-testid="button-send-consultant-desktop"
          >
            <Send className="h-4 w-4" />
          </Button>
          <input
            type="text"
            dir="rtl"
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-transparent border-0 outline-none text-sm px-2"
            onFocus={() => onSwitchToChat?.()}
            data-testid="input-chat-consultant-desktop"
          />
        </div>
      </div>
    </div>

    {/* ==================== MOBILE VERSION ==================== */}
    <div className="md:hidden relative px-3 py-3">
      {/* Match Index - Shows after step 1 */}
      {activeCard >= 1 && (
        <div className="mb-2 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">مؤشر التطابق</span>
            <span className="text-xs font-bold text-primary">{reliabilityScore}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${reliabilityScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Stacked Cards Container - Dynamic height based on content */}
      <div className="relative pb-2" style={{ minHeight: `${(activeCard * 24) + 320}px` }}>
        
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
                  <div>
                    <Input
                      type="tel"
                      placeholder="رقم الجوال"
                      value={filters.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`h-9 text-sm text-center rounded-lg ${phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      dir="ltr"
                      data-testid="input-phone"
                    />
                    {phoneError && (
                      <p className="text-[10px] text-red-500 mt-0.5 text-center">{phoneError}</p>
                    )}
                    {isPhoneValid && (
                      <p className="text-[10px] text-green-500 mt-0.5 text-center flex items-center justify-center gap-0.5">
                        <Check className="h-2.5 w-2.5" /> صحيح
                      </p>
                    )}
                  </div>
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

              {/* Step 2: City - Smart Map */}
              {activeCard === 2 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground text-center">انقر على الدبابيس للتحديد</p>
                  
                  {/* Selected Cities */}
                  {filters.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {filters.cities.map(c => (
                        <Badge key={c} variant="secondary" className="text-[10px] gap-0.5 pl-1.5 py-0">
                          {c}
                          <button onClick={() => toggleCity(c)}>
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن مدينة..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="h-8 pr-7 text-xs rounded-lg"
                      data-testid="input-city-search"
                    />
                  </div>

                  {/* Map with selected cities */}
                  <div className="h-[140px] rounded-lg overflow-hidden border border-border">
                    <MapContainer
                      center={[cityMapCenter.lat, cityMapCenter.lng]}
                      zoom={filters.cities.length > 0 ? 8 : 5}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapCenterChanger 
                        center={[cityMapCenter.lat, cityMapCenter.lng]} 
                        zoom={filters.cities.length > 0 ? 8 : 5} 
                      />
                      {/* Show only selected cities as markers */}
                      {filters.cities.map(cityName => {
                        const city = saudiCities.find(c => c.name === cityName);
                        if (!city) return null;
                        return (
                          <CityMarker
                            key={city.name}
                            city={city}
                            isSelected={true}
                            onToggle={toggleCity}
                          />
                        );
                      })}
                    </MapContainer>
                  </div>

                  {/* Cities Grid - Show exactly 6 main cities in 2 rows */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "الرياض" },
                      { name: "جدة" },
                      { name: "مكة المكرمة" },
                      { name: "المدينة المنورة" },
                      { name: "الدمام" },
                      { name: "الخبر" }
                    ].map((city) => {
                      const isSelected = filters.cities.includes(city.name);
                      return (
                        <button
                          key={city.name}
                          onClick={() => toggleCity(city.name)}
                          className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-city-${city.name}`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {city.name}
                        </button>
                      );
                    })}
                  </div>

                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-2">
                    {filters.cities.length > 0 ? `التالي (${filters.cities.length})` : "اختر مدينة"}
                  </Button>
                </div>
              )}

              {/* Step 3: District - Smart Map */}
              {activeCard === 3 && filters.cities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground text-center">انقر على الدبابيس للتحديد</p>
                  
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

                  {/* Map with all districts + preferred location */}
                  <div className="h-[140px] rounded-lg overflow-hidden border border-border">
                    <MapContainer
                      center={[districtMapCenter.lat, districtMapCenter.lng]}
                      zoom={11}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapCenterChanger center={[districtMapCenter.lat, districtMapCenter.lng]} zoom={11} />
                      {/* Show only selected districts as markers */}
                      {filters.districts.map(districtName => {
                        const data = neighborhoodCoords.get(districtName);
                        if (!data) return null;
                        return (
                          <DistrictMarker
                            key={districtName}
                            name={districtName}
                            cityName={data.cityName}
                            coords={{ lat: data.lat, lng: data.lng }}
                            isSelected={true}
                            onToggle={toggleDistrict}
                          />
                        );
                      })}
                      {/* Preferred location picker */}
                      <PreferredLocationPicker 
                        onLocationSelect={handlePreferredLocationSelect}
                        currentPosition={filters.preferredLatitude && filters.preferredLongitude 
                          ? [filters.preferredLatitude, filters.preferredLongitude] 
                          : null}
                      />
                    </MapContainer>
                  </div>

                  {/* Preferred Location Info - Mobile */}
                  {filters.preferredLatitude && filters.preferredLongitude && (
                    <div className="flex items-center justify-between bg-primary/10 rounded p-1.5">
                      <div className="flex items-center gap-1 text-[10px]">
                        <Navigation className="h-3 w-3 text-primary" />
                        <span>منطقة مفضلة</span>
                      </div>
                      <button 
                        onClick={() => setFilters(f => ({ ...f, preferredLatitude: null, preferredLongitude: null }))}
                        className="text-[10px] text-destructive"
                        data-testid="button-clear-preferred-location-mobile"
                      >
                        مسح
                      </button>
                    </div>
                  )}

                  {/* Districts Grid - Show exactly 6 districts in 2 rows */}
                  <div className="grid grid-cols-3 gap-1.5 p-1">
                    {filteredDistricts.slice(0, 6).map((district) => {
                      const isSelected = filters.districts.includes(district.name);
                      return (
                        <button
                          key={`${district.cityName}-${district.name}`}
                          onClick={() => toggleDistrict(district.name)}
                          className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-district-${district.name}`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {district.name}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[9px] text-muted-foreground text-center">انقر على الخريطة لتحديد موقع مفضل</p>

                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-3">
                    {filters.districts.length > 0 ? `التالي (${filters.districts.length})` : "تخطي"}
                  </Button>
                </div>
              )}

              {/* Step 4: Property Type */}
              {activeCard === 4 && (
                <div className="space-y-2">
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
                          data-testid={`button-type-${type.value}`}
                        >
                          <Icon className={`h-7 w-7 mx-auto ${filters.propertyType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="text-xs font-medium mt-1">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-4">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 5: Property Condition */}
              {activeCard === 5 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "new", label: "جديد", icon: CheckCircle2 },
                      { value: "used", label: "مستخدم", icon: Clock },
                      { value: "under_construction", label: "تحت الإنشاء", icon: Hammer },
                    ].map((condition) => {
                      const Icon = condition.icon;
                      const isSelected = filters.propertyCondition === condition.value;
                      return (
                        <button
                          key={condition.value}
                          onClick={() => setFilters(f => ({ ...f, propertyCondition: f.propertyCondition === condition.value ? "" : condition.value as any }))}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-condition-${condition.value}`}
                        >
                          <Icon className={`h-7 w-7 mx-auto ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="text-xs font-medium mt-1">{condition.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={goNext} className="w-full h-9 rounded-lg text-sm" data-testid="button-next-5">
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 6: Specifications */}
              {activeCard === 6 && (
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

              {/* Step 7: Additional Details */}
              {activeCard === 7 && (
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
                    <Send className="h-4 w-4" />
                    إرسال الطلب
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
                top: `${(activeCard * 24) + (activeCard >= 2 ? 360 : 240) + (idx * 14)}px`,
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

      {/* Chat with Consultant - Inside Form */}
      <div className="mt-3 pt-3 border-t border-dashed">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <MessageCircle className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">أو تحدث مع مستشار العقارات</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 border rounded-full px-3 py-2">
          <Button
            size="icon"
            variant="default"
            onClick={() => onSwitchToChat?.()}
            className="rounded-full h-7 w-7 flex-shrink-0"
            data-testid="button-send-consultant"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
          <input
            type="text"
            dir="rtl"
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-transparent border-0 outline-none text-xs px-2"
            onFocus={() => onSwitchToChat?.()}
            data-testid="input-chat-consultant"
          />
        </div>
      </div>
    </div>
    </>
  );
});
