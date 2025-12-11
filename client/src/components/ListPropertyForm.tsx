import { useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  MapPin, User, Home, Building2, 
  Check, Phone, DollarSign, ChevronUp, ChevronDown,
  Building, Warehouse, LandPlot, Ruler, Mail,
  Send, Navigation
} from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationPinPicker({ 
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

function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
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
  const [activeCard, setActiveCard] = useState(0);
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
    latitude: null,
    longitude: null,
    propertyType: "",
    propertyCondition: "",
    rooms: "",
    bathrooms: "",
    area: "",
    price: "",
    description: ""
  });

  const cards = [
    { id: "personal", title: "بيانات المالك", icon: User, color: "bg-green-600", lightColor: "bg-green-100" },
    { id: "type", title: "نوع العقار", icon: Home, color: "bg-emerald-600", lightColor: "bg-emerald-100" },
    { id: "location", title: "الموقع", icon: MapPin, color: "bg-teal-600", lightColor: "bg-teal-100" },
    { id: "specs", title: "المواصفات", icon: Building2, color: "bg-green-700", lightColor: "bg-green-100" },
    { id: "price", title: "السعر والوصف", icon: DollarSign, color: "bg-emerald-700", lightColor: "bg-emerald-100" },
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
  const filteredCities = useMemo(() => saudiCities.filter(c => 
    c.name.includes(citySearch) || c.nameEn.toLowerCase().includes(citySearch.toLowerCase())
  ), [citySearch]);
  const filteredDistricts = useMemo(() => selectedCity?.neighborhoods.filter(n =>
    n.name.includes(districtSearch)
  ) || [], [selectedCity, districtSearch]);

  const propertyTypes = formData.propertyCategory === "residential" ? residentialTypes : commercialTypes;

  const canProceed = () => {
    switch (activeCard) {
      case 0: return formData.ownerName.trim() && formData.ownerPhone.trim() && !phoneError;
      case 1: return formData.propertyType;
      case 2: return formData.city && formData.district;
      case 3: return formData.area;
      case 4: return formData.price;
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
    onSubmit({ ...formData, type: "listing" });
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
              idx === activeCard ? "w-8 bg-green-600" : 
              idx < activeCard ? "w-4 bg-green-600/60" : "w-4 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Cards Stack */}
      <div className="relative" style={{ minHeight: "480px" }}>
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
            {/* Card 1: Owner Data */}
            {activeCard === 0 && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">اسم المالك *</label>
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
                  <label className="text-sm font-medium mb-1.5 block">رقم الجوال *</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="05xxxxxxxx"
                      value={formData.ownerPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFormData({...formData, ownerPhone: val});
                        setPhoneError(validateSaudiPhone(val).error);
                      }}
                      className="pr-10"
                      data-testid="input-owner-phone"
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
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                      className="pr-10"
                      data-testid="input-owner-email"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Card 2: Property Type */}
            {activeCard === 1 && (
              <>
                <div>
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
                          className={`flex flex-col gap-1 h-auto py-3 ${formData.propertyType === type.id ? "bg-green-600 hover:bg-green-700" : ""}`}
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
                  <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto">
                    {filteredCities.slice(0, 12).map(city => (
                      <Button
                        key={city.name}
                        type="button"
                        variant={formData.city === city.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setFormData({...formData, city: city.name, district: "", latitude: null, longitude: null});
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
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">الحي *</label>
                      <Input
                        placeholder="ابحث عن الحي..."
                        value={districtSearch}
                        onChange={(e) => setDistrictSearch(e.target.value)}
                        className="mb-2"
                        data-testid="input-district-search"
                      />
                      <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                        {filteredDistricts.slice(0, 12).map(district => (
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

                    {/* Map */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">حدد الموقع على الخريطة (اختياري)</label>
                      <div className="h-[150px] rounded-lg overflow-hidden border">
                        <MapContainer
                          center={[selectedCity.coordinates.lat, selectedCity.coordinates.lng]}
                          zoom={12}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapCenterUpdater 
                            center={[selectedCity.coordinates.lat, selectedCity.coordinates.lng]} 
                            zoom={12} 
                          />
                          <LocationPinPicker
                            onLocationSelect={(lat, lng) => {
                              setFormData({...formData, latitude: lat, longitude: lng});
                            }}
                            currentPosition={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                          />
                        </MapContainer>
                      </div>
                      {formData.latitude && formData.longitude && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                          <Navigation className="w-4 h-4" />
                          <span>تم تحديد الموقع</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Card 4: Specifications */}
            {activeCard === 3 && (
              <>
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
                            className={`flex-1 px-2 ${formData.rooms === num ? "bg-green-600 hover:bg-green-700" : ""}`}
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
                            className={`flex-1 px-2 ${formData.bathrooms === num ? "bg-green-600 hover:bg-green-700" : ""}`}
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
              </>
            )}

            {/* Card 5: Price */}
            {activeCard === 4 && (
              <>
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
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                {/* Summary */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-1 border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-sm text-green-700 dark:text-green-300 mb-2">ملخص العرض:</h4>
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
