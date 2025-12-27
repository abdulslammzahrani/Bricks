import { useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFormBuilderConfig } from "@/hooks/useFormBuilderConfig";
import DynamicFormRenderer from "@/components/admin/FormBuilder/DynamicFormRenderer";
import FormNavigationButton from "@/components/admin/FormBuilder/FormNavigationButton";

import { 
  MapPin, User, Home, Building2, 
  Sparkles, Search, Building, Warehouse, LandPlot,
  Check, Navigation, Wallet, Settings2, FileText,
  Hammer, Clock, CheckCircle2, MessageCircle, Edit2, Banknote, Ruler, Plus, 
  ArrowUpFromLine, Coins, Percent, Compass, LayoutDashboard, Star, Landmark, 
  BrainCircuit, X, Hotel, Store, Factory, Blocks, Trees, Waves,
  PaintBucket, Construction, ChevronLeft, ShieldCheck, DoorOpen, Zap, Flame, Send,
  BedDouble, Bath, Shirt, Sofa, Tv, Utensils, Wifi, Dumbbell, Car,
  ArrowUp, School, Stethoscope, Fuel, Briefcase, Truck, Users, Activity,
  Armchair, Trees as TreeIcon, Key, FileSignature 
} from "lucide-react";
import * as icons from "lucide-react";
import { saudiCities, directionLabels, Direction } from "@shared/saudi-locations";

// استيراد الإعدادات المشتركة
import { 
  SPECIFIC_TAGS, SMART_RANGES, SAUDI_BANKS, 
  getPropertyTypesByCategory, getTagsForPropertyType 
} from "@/lib/property-form-config";

interface SearchFilters {
  name: string; phone: string; email: string; 
  propertyCategory: "residential" | "commercial" | "";
  transactionType: "sale" | "rent" | ""; 
  propertyCondition: "new" | "used" | "under_construction" | "";
  cities: string[]; districts: string[]; 
  propertyType: string; 
  minArea: string; maxArea: string;
  rooms: string; bathrooms: string; livingRooms: string; hasMaidRoom: boolean;
  facade: string; streetWidth: string; plotLocation: string;
  annualIncome: string; roi: string; unitsCount: string; propertyAge: string;
  floorsCount: string; elevatorsCount: string; bua: string; buildingClass: string; parkingCapacity: string;
  facadeWidth: string; ceilingHeight: string; hasMezzanine: boolean; groundArea: string; mezzanineArea: string; powerCapacity: string;
  floorNumber: string; nla: string; finishingStatus: string; acType: string;
  studentCapacity: string; classroomsCount: string; labsCount: string; municipalityClass: string;
  hasCivilDefense: string; floorLoad: string;
  pumpsCount: string; tanksCapacity: string; stationCategory: string;
  shopsCount: string; apartmentsCount: string;
  buildingsCount: string; occupancyRate: string;
  zoning: string;
  activityType: string; buildingRatio: string;
  wellsCount: string; waterType: string; treesCount: string; farmFacade: string;
  productionArea: string; licenseType: string; craneLoad: string;
  clinicsCount: string; waitingArea: string; healthLicense: string;
  minPrice: string; maxPrice: string; 
  paymentMethod: "cash" | "finance" | ""; bankName: string; salary: string;
  smartTags: string[]; notes: string; 
  status: "all" | "ready" | "under_construction"; rentPeriod: "all" | "yearly" | "monthly"; features: string[]; 
}

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const ScrollableOptions = ({ label, options, selected, onSelect, unit = "" }: { label: string, options: string[], selected: string, onSelect: (val: string) => void, unit?: string }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold mb-2 text-gray-700">{label}</label>
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`
            flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold transition-all whitespace-nowrap
            ${selected === opt 
              ? "bg-primary text-white border-primary shadow-sm scale-105" 
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
          `}
        >
          {opt} {unit}
        </button>
      ))}
    </div>
  </div>
);

export const AdvancedSearchForm = memo(function AdvancedSearchForm({ onSearch }: AdvancedSearchFormProps) {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoRegistered, setIsAutoRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Try to load form config from Form Builder (optional - fallback to hardcoded if not available)
  const { formConfig, useFormBuilder, isLoading: isLoadingFormConfig } = useFormBuilderConfig("buyer_form");
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log("AdvancedSearchForm - useFormBuilder:", useFormBuilder);
    console.log("AdvancedSearchForm - formConfig:", formConfig);
    console.log("AdvancedSearchForm - isLoadingFormConfig:", isLoadingFormConfig);
  }

  const [filters, setFilters] = useState<SearchFilters>({
    name: "", phone: "", email: "", propertyCategory: "",
    transactionType: "", propertyCondition: "",
    cities: [], districts: [], propertyType: "",
    minArea: "", maxArea: "",
    rooms: "", bathrooms: "", livingRooms: "", hasMaidRoom: false,
    facade: "", streetWidth: "", plotLocation: "",
    annualIncome: "", roi: "", unitsCount: "", propertyAge: "",
    floorsCount: "", elevatorsCount: "", bua: "", buildingClass: "", parkingCapacity: "",
    facadeWidth: "", ceilingHeight: "", hasMezzanine: false, groundArea: "", mezzanineArea: "", powerCapacity: "",
    floorNumber: "", nla: "", finishingStatus: "", acType: "",
    studentCapacity: "", classroomsCount: "", labsCount: "", municipalityClass: "",
    hasCivilDefense: "", floorLoad: "",
    pumpsCount: "", tanksCapacity: "", stationCategory: "",
    shopsCount: "", apartmentsCount: "",
    buildingsCount: "", occupancyRate: "",
    zoning: "",
    activityType: "", buildingRatio: "",
    wellsCount: "", waterType: "", treesCount: "", farmFacade: "",
    productionArea: "", licenseType: "", craneLoad: "",
    clinicsCount: "", waitingArea: "", healthLicense: "",
    minPrice: "", maxPrice: "", paymentMethod: "", bankName: "", salary: "",
    smartTags: [], notes: "", 
    status: "all", rentPeriod: "all", features: []
  });

  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<Direction | "all">("all");

  const firstName = filters.name ? filters.name.split(" ")[0] : "";

  // Step colors - matching the real form
  const stepColors = [
    { bg: "bg-emerald-500", light: "bg-emerald-100", border: "border-emerald-200" },
    { bg: "bg-amber-500", light: "bg-amber-100", border: "border-amber-200" },
    { bg: "bg-blue-500", light: "bg-blue-100", border: "border-blue-200" },
    { bg: "bg-teal-500", light: "bg-teal-100", border: "border-teal-200" },
    { bg: "bg-purple-500", light: "bg-purple-100", border: "border-purple-200" },
    { bg: "bg-orange-500", light: "bg-orange-100", border: "border-orange-200" },
    { bg: "bg-indigo-500", light: "bg-indigo-100", border: "border-indigo-200" },
    { bg: "bg-pink-500", light: "bg-pink-100", border: "border-pink-200" },
  ];

  // Use Form Builder steps if available, otherwise use hardcoded cards
  const cards = useMemo(() => {
    if (useFormBuilder && formConfig && formConfig.steps) {
      return formConfig.steps.map((stepData, idx) => {
        const color = stepColors[idx % stepColors.length];
        const StepIcon = stepData.step.icon
          ? (icons[stepData.step.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>)
          : FileText;
        return {
          id: idx,
          icon: StepIcon || FileText,
          title: stepData.step.title,
          color: color.bg,
          lightColor: color.light,
        };
      });
    }
    // Fallback to hardcoded cards
    return [
      { id: 0, icon: User, title: "ابدأ رحلتك العقارية", color: "bg-emerald-500", lightColor: "bg-emerald-100" },
      { id: 1, icon: Sparkles, title: `تفاصيل الطلب`, color: "bg-amber-500", lightColor: "bg-amber-100" },
      { id: 2, icon: MapPin, title: "المدينة المفضلة", color: "bg-blue-500", lightColor: "bg-blue-100" },
      { id: 3, icon: Navigation, title: "الحي المرغوب", color: "bg-teal-500", lightColor: "bg-teal-100" },
      { id: 4, icon: Home, title: "نوع العقار", color: "bg-purple-500", lightColor: "bg-purple-100" },
      { id: 5, icon: Settings2, title: "المواصفات الفنية", color: "bg-orange-500", lightColor: "bg-orange-100" },
      { id: 6, icon: Wallet, title: "الميزانية والاستثمار", color: "bg-indigo-500", lightColor: "bg-indigo-100" },
      { id: 7, icon: Star, title: "اللمسات الأخيرة", color: "bg-pink-500", lightColor: "bg-pink-100" },
    ];
  }, [useFormBuilder, formConfig, firstName]);

  const totalCards = cards.length;

  function validateSaudiPhone(phone: string) { let normalized = phone.replace(/[^\d]/g, ''); if (normalized.startsWith('966')) normalized = '0' + normalized.slice(3); return normalized.startsWith('05') && normalized.length === 10 ? { isValid: true, normalized, error: '' } : { isValid: false, normalized: '', error: 'رقم غير صحيح' }; }
  const handlePhoneChange = (value: string) => { const validation = validateSaudiPhone(value); setFilters(f => ({ ...f, phone: value })); setPhoneError(value.trim() ? (validation.isValid ? "" : validation.error) : ""); };
  const isPhoneValid = useMemo(() => filters.phone.trim() ? validateSaudiPhone(filters.phone).isValid : false, [filters.phone]);
  const filteredCities = useMemo(() => saudiCities.filter(c => c.name.includes(citySearch)), [citySearch]);
  const availableDistricts = useMemo(() => { if (filters.cities.length === 0) return []; return saudiCities.find(c => c.name === filters.cities[0])?.neighborhoods || []; }, [filters.cities]);
  const filteredDistricts = useMemo(() => {
    let districts = availableDistricts;
    // تصفية حسب الاتجاه
    if (selectedDirection !== "all") {
      districts = districts.filter(d => d.direction === selectedDirection);
    }
    // تصفية حسب البحث
    if (districtSearch) {
      districts = districts.filter(d => d.name.includes(districtSearch));
    }
    return districts;
  }, [availableDistricts, districtSearch, selectedDirection]);
  
  // التحقق من وجود أحياء مع اتجاهات في المدينة المحددة
  const hasDirections = useMemo(() => {
    return availableDistricts.some(d => d.direction);
  }, [availableDistricts]);
  const toggleFeature = (tag: string) => { setFilters(prev => ({ ...prev, smartTags: prev.smartTags.includes(tag) ? prev.smartTags.filter(t => t !== tag) : [...prev.smartTags, tag] })); };

  // ✅✅ FIX: Toggle Logic for City and District
  const toggleCity = (cityName: string) => {
    setFilters(prev => {
      // Check if already selected
      const isSelected = prev.cities.includes(cityName);
      return {
        ...prev,
        // If selected, filter it out (remove). If not, set it as the new selection (single select for city usually, or append for multi)
        // Assuming single select based on UI behavior desire, but here is multi-select toggle logic:
        cities: isSelected ? prev.cities.filter(c => c !== cityName) : [cityName] // Change to [...prev.cities, cityName] for multi-select
      };
    });
  };

  const toggleDistrict = (districtName: string) => {
    setFilters(prev => {
      const isSelected = prev.districts.includes(districtName);
      return {
        ...prev,
        districts: isSelected 
          ? prev.districts.filter(d => d !== districtName) 
          : [...prev.districts, districtName] // Multi-select for districts is standard
      };
    });
  };

  const autoRegisterUser = async () => {
    if (isRegistering || isAutoRegistered) return;
    
    setIsRegistering(true);
    
    try {
      // التحقق من البيانات الأساسية
      if (!filters.name || !isPhoneValid || !filters.email) {
        toast({
          title: "خطأ",
          description: "يرجى إكمال البيانات الأساسية أولاً",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      // تسجيل المستخدم تلقائياً عبر API
      const response = await fetch("/api/buyers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: filters.name,
          phone: filters.phone,
          email: filters.email,
          city: filters.cities && filters.cities.length > 0 ? filters.cities[0] : "الرياض",
          districts: filters.districts || [],
          propertyType: filters.propertyType || null,
          propertyCategory: filters.propertyCategory || null,
          transactionType: filters.transactionType || "buy",
        }),
      });

      if (response.ok) {
        setIsAutoRegistered(true);
        toast({
          title: "تم التسجيل",
          description: "تم تسجيلك بنجاح، يمكنك المتابعة",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل في التسجيل");
      }
    } catch (error: any) {
      console.error("Error auto-registering:", error);
      // لا نعرض خطأ للمستخدم هنا، فقط نسجل (لأن التسجيل سيحدث عند الإرسال النهائي)
    } finally {
      setIsRegistering(false);
    }
  };
  const goNext = async () => { if (activeCard < totalCards - 1 && !isAnimating) { if (activeCard === 0 && !isAutoRegistered) await autoRegisterUser(); if (activeCard === 5) { setIsAnalyzing(true); setTimeout(() => { setIsAnalyzing(false); advance(); }, 1500); return; } advance(); } };
  const advance = () => { setIsAnimating(true); setTimeout(() => { setActiveCard(p => p + 1); setIsAnimating(false); }, 200); };
  const goBack = (idx: number) => { if (idx < activeCard && !isAnimating) { setIsAnimating(true); setTimeout(() => { setActiveCard(idx); setIsAnimating(false); }, 200); }};
  const handleSelection = (field: keyof SearchFilters, value: any) => setFilters(p => ({ ...p, [field]: value }));
  const handleSearch = () => {
    console.log("handleSearch called with filters:", filters);
    onSearch(filters);
  };

  const canProceed = (): boolean => {
    // If using Form Builder, validate based on current step's required fields
    if (useFormBuilder && formConfig && formConfig.steps[activeCard]) {
      const currentStep = formConfig.steps[activeCard];
      const requiredFields = currentStep.fields.filter(f => f.field.required);
      
      // Check if all required fields are filled
      for (const fieldData of requiredFields) {
        const field = fieldData.field;
        const value = (filters as Record<string, any>)[field.name];
        
        // Special validation for phone
        if (field.name === "phone" && !isPhoneValid) {
          return false;
        }
        
        // Check if field has value
        if (value === undefined || value === null || value === "" || 
            (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
      return true;
    }
    
    // Fallback to hardcoded validation
    if (activeCard === 0) return !!(filters.name && isPhoneValid && filters.email && filters.propertyCategory);
    if (activeCard === 1) return !!(filters.transactionType && filters.propertyCondition);
    if (activeCard === 2) return filters.cities.length > 0;
    if (activeCard === 3) return filters.districts.length > 0;
    if (activeCard === 4) return !!filters.propertyType;
    if (activeCard === 5) return !!filters.minArea; 
    if (activeCard === 6) return !!(filters.maxPrice && filters.paymentMethod);
    return true;
  };

  const reliabilityScore = useMemo(() => {
    let score = 10; if (filters.name) score += 10; if (filters.phone) score += 10; if (filters.cities.length) score += 10; if (filters.districts.length) score += 10; if (filters.propertyType) score += 10; if (filters.maxPrice) score += 15; if (filters.smartTags.length) score += 10; return Math.min(score, 100);
  }, [filters]);

  const DESKTOP_HEADER_HEIGHT = 50;
  const MOBILE_HEADER_HEIGHT = 42;
  const BASE_CONTENT_HEIGHT_DESKTOP = 650; 
  const BASE_CONTENT_HEIGHT_MOBILE = 480;
  const containerHeightDesktop = (activeCard * DESKTOP_HEADER_HEIGHT) + BASE_CONTENT_HEIGHT_DESKTOP;
  const containerHeightMobile = (activeCard * MOBILE_HEADER_HEIGHT) + BASE_CONTENT_HEIGHT_MOBILE;

  const getBudgetOptions = () => {
    const type = filters.propertyType;
    const isRent = filters.transactionType === "rent";
    if (isRent) return [{ v: "50000", l: "< 50 ألف" }, { v: "100000", l: "50-100 ألف" }, { v: "200000", l: "100-200 ألف" }, { v: "500000", l: "+200 ألف" }];

    if (["tower", "complex", "hospital", "commercial_building"].includes(type)) {
      return [{ value: "5000000", label: "< 5 مليون" }, { value: "15000000", label: "5 - 15 مليون" }, { value: "30000000", label: "15 - 30 مليون" }, { value: "50000000", label: "30 - 50 مليون" }, { value: "100000000", label: "50 - 100 مليون" }, { value: "200000000", label: "+ 100 مليون" }];
    }
    if (["gas_station", "school", "factory", "commercial_land", "industrial_land", "farm"].includes(type)) {
      return [{ value: "2000000", label: "< 2 مليون" }, { value: "4000000", label: "2 - 4 مليون" }, { value: "6000000", label: "4 - 6 مليون" }, { value: "10000000", label: "6 - 10 مليون" }, { value: "20000000", label: "+ 20 مليون" }];
    }
    return [{ value: "800000", label: "< 800 ألف" }, { value: "1200000", label: "800 - 1.2 مليون" }, { value: "1800000", label: "1.2 - 1.8 مليون" }, { value: "2500000", label: "1.8 - 2.5 مليون" }, { value: "3500000", label: "2.5 - 3.5 مليون" }, { value: "5000000", label: "+ 3.5 مليون" }];
  };

  const propertyOptions = {
    residential: [
      { value: "apartment", label: "شقة", icon: Building }, { value: "villa", label: "فيلا", icon: Home }, 
      { value: "floor", label: "دور", icon: Building2 }, { value: "townhouse", label: "تاون هاوس", icon: Home },
      { value: "residential_building", label: "عمارة سكنية", icon: Hotel }, { value: "residential_land", label: "أرض سكنية", icon: LandPlot }, 
      { value: "rest_house", label: "استراحة", icon: Trees }, { value: "chalet", label: "شاليه", icon: Waves },
      { value: "room", label: "غرفة", icon: BedDouble }
    ],
    commercial: [
      { value: "commercial_building", label: "عمارة تجارية", icon: Building2 }, { value: "tower", label: "برج", icon: Building },
      { value: "complex", label: "مجمع", icon: Blocks }, { value: "commercial_land", label: "أرض تجارية", icon: LandPlot },
      { value: "industrial_land", label: "أرض صناعية", icon: Factory },
      { value: "farm", label: "مزرعة", icon: Trees },
      { value: "warehouse", label: "مستودع", icon: Warehouse }, { value: "factory", label: "مصنع", icon: Factory },
      { value: "school", label: "مدرسة", icon: School },
      { value: "health_center", label: "مركز صحي", icon: Stethoscope }, 
      { value: "gas_station", label: "محطة", icon: Fuel }, 
      { value: "showroom", label: "معرض", icon: Store },
      { value: "office", label: "مكتب", icon: Briefcase }
    ],
  };

  const currentPropertyOptions = filters.propertyCategory === "commercial" ? propertyOptions.commercial : propertyOptions.residential;
  const propertyTypes = currentPropertyOptions; 

  const renderCard5Content = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8">

      <ScrollableOptions label="المساحة (م²)" options={SMART_RANGES.area} selected={filters.minArea} onSelect={(v) => setFilters(p => ({...p, minArea: v}))} />

      {/* --- TOWER --- */}
      {filters.propertyType === "tower" && (
        <>
          <ScrollableOptions label="عدد الأدوار" options={SMART_RANGES.floors} selected={filters.floorsCount} onSelect={v => setFilters(p=>({...p, floorsCount:v}))} />
          <ScrollableOptions label="عدد المصاعد" options={SMART_RANGES.elevators} selected={filters.elevatorsCount} onSelect={v => setFilters(p=>({...p, elevatorsCount:v}))} />
          <ScrollableOptions label="عدد الوحدات/المكاتب" options={SMART_RANGES.units_large} selected={filters.unitsCount} onSelect={v => setFilters(p=>({...p, unitsCount:v}))} />
          <ScrollableOptions label="التصنيف (Class)" options={["A", "B", "C"]} selected={filters.buildingClass} onSelect={v => setFilters(p=>({...p, buildingClass:v}))} />
        </>
      )}

      {/* --- SHOWROOM --- */}
      {filters.propertyType === "showroom" && (
        <>
          <ScrollableOptions label="عرض الواجهة" options={SMART_RANGES.facadeWidth} selected={filters.facadeWidth} onSelect={v => setFilters(p=>({...p, facadeWidth:v}))} />
          <ScrollableOptions label="ارتفاع السقف" options={SMART_RANGES.ceilingHeight} selected={filters.ceilingHeight} onSelect={v => setFilters(p=>({...p, ceilingHeight:v}))} />
          <div className="mb-4"><button onClick={()=>setFilters(p=>({...p,hasMezzanine:!p.hasMezzanine}))} className={`w-full py-3 rounded-xl border-2 font-bold ${filters.hasMezzanine?"border-green-500 bg-green-50 text-green-700":"border-gray-200"}`}>{filters.hasMezzanine?"✅ يوجد ميزانين":"⬜ هل يوجد ميزانين؟"}</button></div>
          <ScrollableOptions label="الحمل الكهربائي" options={SMART_RANGES.power} selected={filters.powerCapacity} onSelect={v => setFilters(p=>({...p, powerCapacity:v}))} />
        </>
      )}

      {/* --- OFFICE --- */}
      {filters.propertyType === "office" && (
        <>
          <ScrollableOptions label="رقم الطابق" options={["1-5", "6-10", "11-20", "20+"]} selected={filters.floorNumber} onSelect={v => setFilters(p=>({...p, floorNumber:v}))} />
          <ScrollableOptions label="التشطيب" options={["عظم", "نصف تشطيب", "مؤثث بالكامل"]} selected={filters.finishingStatus} onSelect={v => setFilters(p=>({...p, finishingStatus:v}))} />
          <ScrollableOptions label="نوع التكييف" options={["مركزي", "سبليت", "مخفي"]} selected={filters.acType} onSelect={v => setFilters(p=>({...p, acType:v}))} />
        </>
      )}

      {/* --- SCHOOL --- */}
      {filters.propertyType === "school" && (
        <>
          <ScrollableOptions label="الطاقة الاستيعابية (طلاب)" options={SMART_RANGES.capacity} selected={filters.studentCapacity} onSelect={v => setFilters(p=>({...p, studentCapacity:v}))} />
          <ScrollableOptions label="عدد الفصول" options={["10-20", "20-40", "40-60", "60+"]} selected={filters.classroomsCount} onSelect={v => setFilters(p=>({...p, classroomsCount:v}))} />
        </>
      )}

      {/* --- WAREHOUSE --- */}
      {filters.propertyType === "warehouse" && (
        <>
          <ScrollableOptions label="ارتفاع السقف" options={SMART_RANGES.ceilingHeight} selected={filters.ceilingHeight} onSelect={v => setFilters(p=>({...p, ceilingHeight:v}))} />
          <ScrollableOptions label="الكهرباء" options={["عادي", "3 Phase"]} selected={filters.powerCapacity} onSelect={v => setFilters(p=>({...p, powerCapacity:v}))} />
          <ScrollableOptions label="الدفاع المدني" options={["خطورة عالية", "متوسطة", "منخفضة"]} selected={filters.hasCivilDefense} onSelect={v => setFilters(p=>({...p, hasCivilDefense:v}))} />
        </>
      )}

      {/* --- GAS STATION --- */}
      {filters.propertyType === "gas_station" && (
        <>
          <ScrollableOptions label="الفئة" options={["أ", "ب"]} selected={filters.stationCategory} onSelect={v => setFilters(p=>({...p, stationCategory:v}))} />
          <ScrollableOptions label="عدد المضخات" options={SMART_RANGES.pumps} selected={filters.pumpsCount} onSelect={v => setFilters(p=>({...p, pumpsCount:v}))} />
          <ScrollableOptions label="سعة الخزانات" options={SMART_RANGES.tanks} selected={filters.tanksCapacity} onSelect={v => setFilters(p=>({...p, tanksCapacity:v}))} />
          <ScrollableOptions label="الدخل اليومي" options={SMART_RANGES.income} selected={filters.annualIncome} onSelect={v => setFilters(p=>({...p, annualIncome:v}))} />
        </>
      )}

      {/* --- COMMERCIAL BUILDING --- */}
      {filters.propertyType === "commercial_building" && (
        <>
          <ScrollableOptions label="الدخل السنوي" options={SMART_RANGES.income} selected={filters.annualIncome} onSelect={v => setFilters(p=>({...p, annualIncome:v}))} />
          <ScrollableOptions label="عدد المعارض" options={SMART_RANGES.units_small} selected={filters.shopsCount} onSelect={v => setFilters(p=>({...p, shopsCount:v}))} />
          <ScrollableOptions label="عدد الشقق/المكاتب" options={SMART_RANGES.units_small} selected={filters.apartmentsCount} onSelect={v => setFilters(p=>({...p, apartmentsCount:v}))} />
        </>
      )}

      {/* --- DEFAULT RESIDENTIAL --- */}
      {["apartment", "villa", "floor", "townhouse", "residential_building"].includes(filters.propertyType) && (
        <>
          <ScrollableOptions label="عدد الغرف" options={SMART_RANGES.rooms} selected={filters.rooms} onSelect={v => setFilters(p=>({...p, rooms:v}))} />
          <ScrollableOptions label="عدد دورات المياه" options={SMART_RANGES.bathrooms} selected={filters.bathrooms} onSelect={v => setFilters(p=>({...p, bathrooms:v}))} />
        </>
      )}

      {/* --- LAND --- */}
      {["residential_land", "commercial_land", "industrial_land", "farm"].includes(filters.propertyType) && (
        <>
          <ScrollableOptions label="الواجهة" options={["شمالية", "جنوبية", "شرقية", "غربية"]} selected={filters.facade} onSelect={v => setFilters(p=>({...p, facade:v}))} />
          <ScrollableOptions label="عدد الشوارع" options={SMART_RANGES.streets} selected={filters.streetWidth} onSelect={v => setFilters(p=>({...p, streetWidth:v}))} />
        </>
      )}

      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg mt-4">التالي</Button>
    </div>
  );

  return (
    <>
      <div className="hidden md:block p-6">
        {/* ... Desktop Header ... */}
        {activeCard >= 1 && (<div className="mb-6 max-w-md mx-auto"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">{reliabilityScore < 50 ? "بداية موفقة.." : "اقتربنا من الهدف!"}</span><span className="text-sm font-bold text-green-600">{reliabilityScore}%</span></div><div className="h-2.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700" style={{ width: `${reliabilityScore}%` }} /></div></div>)}

        <div className="relative max-w-lg mx-auto transition-all duration-500 ease-in-out" style={{ height: `${containerHeightDesktop}px` }}>
          {/* Cards Header Logic ... */}
          {cards.slice(0, activeCard).map((card, idx) => (
            <div key={card.id} onClick={() => goBack(card.id)} className="absolute inset-x-0 cursor-pointer hover:brightness-95 z-20" style={{ top: `${idx * DESKTOP_HEADER_HEIGHT}px`, height: '60px' }}>
              <div className={`${card.lightColor} rounded-t-2xl border-x-2 border-t-2 border-white/20 shadow-sm h-full flex items-center justify-between px-6`}>
                <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full ${card.color} text-white flex items-center justify-center`}><Check className="w-5 h-5" /></div><span className="font-bold text-lg">{card.title}</span></div>
                <div className="flex items-center gap-1 text-primary/80 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /><span className="text-sm font-medium">تعديل</span></div>
              </div>
            </div>
          ))}

          <div className={`absolute inset-x-0 transition-all duration-500 ease-out z-10 ${isAnimating ? "opacity-0 translate-x-10" : "opacity-100 translate-x-0"}`} style={{ top: `${activeCard * DESKTOP_HEADER_HEIGHT}px` }}>
            {/* ... Content Wrapper ... */}
            {isAnalyzing ? (
              <div className="bg-white border shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center h-[400px] text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative"><BrainCircuit className="w-10 h-10 text-primary animate-pulse" /><div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
                <h3 className="text-2xl font-bold mb-2">جاري تحليل طلبك...</h3>
              </div>
            ) : (
              <div className="bg-white border shadow-xl rounded-2xl overflow-hidden pb-4">
                <div className="flex items-center justify-between p-5 border-b bg-muted/10">
                  <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${cards[activeCard]?.lightColor || 'bg-gray-100'} flex items-center justify-center`}>{(() => { if (!cards[activeCard]) return null; const Icon = cards[activeCard].icon; return Icon ? <Icon className="w-5 h-5 text-primary" /> : null; })()}</div><div><h3 className="font-bold text-xl">{cards[activeCard]?.title}</h3><p className="text-sm text-muted-foreground">الخطوة {activeCard + 1} من {totalCards}</p></div></div>
                </div>

                <div className="p-6">
                  {/* Use Form Builder if available, otherwise use hardcoded form */}
                  {useFormBuilder && formConfig && formConfig.config && formConfig.steps[activeCard] ? (
                    <DynamicFormRenderer
                      formConfig={{
                        config: formConfig.config,
                        steps: [formConfig.steps[activeCard]],
                      }}
                      values={filters}
                      onChange={(fieldName, value) => {
                        if (fieldName === "phone") {
                          handlePhoneChange(value);
                        } else {
                          setFilters((f) => ({ ...f, [fieldName]: value }));
                        }
                      }}
                      renderFieldsOnly={true}
                    />
                  ) : (
                    <>
                  {/* Card 0: Improved UI with 2 Big Cards */}
                  {activeCard === 0 && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium mb-1.5 block">الاسم</label><Input placeholder="أدخل اسمك" value={filters.name} onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))} className="h-12 text-center rounded-xl" /></div>
                        <div><label className="text-sm font-medium mb-1.5 block">رقم الجوال</label><Input type="tel" placeholder="05xxxxxxxx" value={filters.phone} onChange={(e) => handlePhoneChange(e.target.value)} className={`h-12 text-center rounded-xl ${phoneError ? 'border-red-500' : ''}`} dir="ltr" /></div>
                      </div>
                      <div><label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني <span className="text-red-500">*</span></label><Input type="email" placeholder="your@email.com" value={filters.email} onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))} className="h-12 text-center rounded-xl" dir="ltr" required /></div>

                      <div className="mt-4">
                        <label className="text-sm font-medium mb-3 block text-center">تصنيف العقار المطلوب</label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Residential Card */}
                          <div 
                            onClick={() => handleSelection('propertyCategory', 'residential')}
                            className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg h-36 ${filters.propertyCategory === 'residential' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-blue-200'}`}
                          >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${filters.propertyCategory === 'residential' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                              <Armchair className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <span className="block font-bold text-lg">سكني</span>
                              <span className="text-[10px] text-muted-foreground">فلل، شقق، أراضي</span>
                            </div>
                          </div>

                          {/* Commercial Card */}
                          <div 
                            onClick={() => handleSelection('propertyCategory', 'commercial')}
                            className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg h-36 ${filters.propertyCategory === 'commercial' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-200 bg-white hover:border-amber-200'}`}
                          >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${filters.propertyCategory === 'commercial' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                              <Briefcase className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <span className="block font-bold text-lg">تجاري</span>
                              <span className="text-[10px] text-muted-foreground">مكاتب، معارض، أبراج</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg mt-4">التالي</Button>
                    </div>
                  )}

                  {/* Card 1: Improved Transaction Selection */}
                  {activeCard === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                      {/* Section 1: Transaction Type */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">الهدف من الطلب</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div 
                            onClick={() => handleSelection('transactionType', 'sale')}
                            className={`group cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all h-32 hover:shadow-md ${filters.transactionType === 'sale' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                          >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 ${filters.transactionType === 'sale' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                              <FileSignature className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-lg text-emerald-900">شراء</span>
                          </div>

                          <div 
                            onClick={() => handleSelection('transactionType', 'rent')}
                            className={`group cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all h-32 hover:shadow-md ${filters.transactionType === 'rent' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'}`}
                          >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${filters.transactionType === 'rent' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                              <Key className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-lg text-blue-900">إيجار</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-dashed" />

                      {/* Section 2: Property Condition */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">حالة العقار المفضل</label>
                        <div className="grid grid-cols-3 gap-3">
                          {/* New */}
                          <button 
                            onClick={() => handleSelection('propertyCondition', 'new')} 
                            className={`group p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all hover:shadow-sm ${filters.propertyCondition === 'new' ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:bg-amber-50/30"}`}
                          >
                            <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${filters.propertyCondition === 'new' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                              <Sparkles className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold">جديد</span>
                          </button>

                          {/* Used */}
                          <button 
                            onClick={() => handleSelection('propertyCondition', 'used')} 
                            className={`group p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all hover:shadow-sm ${filters.propertyCondition === 'used' ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:bg-purple-50/30"}`}
                          >
                            <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${filters.propertyCondition === 'used' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                              <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold">مستخدم</span>
                          </button>

                          {/* Under Construction */}
                          <button 
                            onClick={() => handleSelection('propertyCondition', 'under_construction')} 
                            className={`group p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all hover:shadow-sm ${filters.propertyCondition === 'under_construction' ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:bg-orange-50/30"}`}
                          >
                            <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${filters.propertyCondition === 'under_construction' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                              <Hammer className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold">تحت الإنشاء</span>
                          </button>
                        </div>
                      </div>

                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg mt-2">التالي</Button>
                    </div>
                  )}

                  {/* ✅✅ Card 2: City with Toggle Logic */}
                  {activeCard === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8">
                      <div className="relative"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="ابحث عن مدينة..." value={citySearch} onChange={(e) => setCitySearch(e.target.value)} className="h-12 pr-10 rounded-xl" /></div>
                      <div className="h-[240px] overflow-y-auto grid grid-cols-3 gap-2 pr-2">
                        {filteredCities.map(c => (
                          <button key={c.name} onClick={() => toggleCity(c.name)} className={`py-3 px-2 rounded-lg border text-sm font-bold transition-all ${filters.cities.includes(c.name) ? "bg-primary text-white border-primary" : "bg-white hover:bg-muted border-border"}`}>
                            {filters.cities.includes(c.name) && <Check className="inline-block w-3 h-3 ml-1" />}{c.name}
                          </button>
                        ))}
                      </div>
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg">التالي</Button>
                    </div>
                  )}

                  {/* ✅✅ Card 3: District with Toggle Logic */}
                  {activeCard === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8">
                      {/* فلتر الاتجاهات */}
                      {hasDirections && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => setSelectedDirection("all")}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedDirection === "all" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
                          >
                            الكل
                          </button>
                          {(["north", "south", "east", "west", "center"] as Direction[]).map(dir => (
                            <button
                              key={dir}
                              onClick={() => setSelectedDirection(dir)}
                              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${selectedDirection === dir ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
                            >
                              <Compass className="w-3 h-3" />
                              {directionLabels[dir]}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="relative"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="ابحث عن حي..." value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)} className="h-12 pr-10 rounded-xl" /></div>
                      <div className="h-[200px] overflow-y-auto grid grid-cols-3 gap-2 pr-2">
                        {filteredDistricts.length > 0 ? filteredDistricts.map(d => (
                          <button key={d.name} onClick={() => toggleDistrict(d.name)} className={`py-3 px-2 rounded-lg border text-sm font-bold transition-all ${filters.districts.includes(d.name) ? "bg-primary text-white border-primary" : "bg-white hover:bg-muted border-border"}`}>
                            {filters.districts.includes(d.name) && <Check className="inline-block w-3 h-3 ml-1" />}{d.name}
                          </button>
                        )) : <p className="col-span-3 text-center text-muted-foreground py-10">لا توجد نتائج</p>}
                      </div>
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg">التالي</Button>
                    </div>
                  )}

                  {activeCard === 4 && <div className="space-y-4 animate-in slide-in-from-right-8"><div className="grid grid-cols-3 gap-3">{currentPropertyOptions.map(type => { const Icon = type.icon; return (<button key={type.value} onClick={() => setFilters(f => ({ ...f, propertyType: type.value }))} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${filters.propertyType === type.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/50"}`}><Icon className="h-6 w-6 opacity-70" /><span className="text-xs font-bold text-center">{type.label}</span></button>) })}</div><Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg mt-4">التالي</Button></div>}

                  {/* ✅✅✅ Card 5: The Specific Specs Logic (De-Grouped) */}
                  {activeCard === 5 && renderCard5Content()}

                  {/* Card 6: Budget */}
                  {activeCard === 6 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 flex flex-col justify-center min-h-[400px]">
                      <div><label className="block text-sm font-medium mb-2">الميزانية المتوقعة</label><div className="grid grid-cols-2 gap-2">{getBudgetOptions().map(b => {
                        const value = 'value' in b ? b.value : b.v;
                        const label = 'label' in b ? b.label : b.l;
                        return <button key={value} onClick={() => setFilters(f => ({ ...f, maxPrice: value }))} className={`py-3 px-2 rounded-lg border text-xs font-bold transition-all hover:shadow-md ${filters.maxPrice === value ? "border-primary bg-primary text-white scale-105" : "border-border hover:bg-muted"}`}>{label}</button>;
                      })}</div></div>
                      <div><label className="block text-sm font-medium mb-2 flex items-center gap-2"><Wallet className="h-4 w-4" /> طريقة الشراء</label><div className="grid grid-cols-2 gap-3"><button onClick={() => setFilters(f => ({ ...f, paymentMethod: "cash" }))} className={`p-3 rounded-xl border-2 font-bold ${filters.paymentMethod === "cash" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>كاش</button><button onClick={() => setFilters(f => ({ ...f, paymentMethod: "finance" }))} className={`p-3 rounded-xl border-2 font-bold ${filters.paymentMethod === "finance" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>تمويل بنكي</button></div></div>
                      {filters.paymentMethod === "finance" && (<div className="space-y-3 animate-in fade-in"><label className="block text-sm font-medium mb-1">البنك</label><div className="grid grid-cols-2 gap-2">{SAUDI_BANKS.map(bank => (<button key={bank} onClick={() => setFilters(f => ({...f, bankName: bank}))} className={`py-2 px-1 rounded border text-[10px] font-bold ${filters.bankName === bank ? "bg-primary text-white" : "bg-white"}`}>{bank}</button>))}</div><Input type="number" placeholder="الراتب الشهري" value={filters.salary} onChange={e => setFilters(f => ({...f, salary: e.target.value}))} className="text-center" /></div>)}
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-lg">التالي</Button>
                    </div>
                  )}

                  {/* Card 7: Extras (GRANULAR TAGS) */}
                  {activeCard === 7 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8">
                      <div>
                        <label className="block text-sm font-medium mb-2">مميزات إضافية (اختياري)</label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {/* ✅ Fetch specific tags dynamically */}
                          {(SPECIFIC_TAGS[filters.propertyType] || SPECIFIC_TAGS["villa"]).map(tag => (
                            <button key={tag} onClick={() => toggleFeature(tag)} className={`px-3 py-2 rounded-full border text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap h-auto ${filters.smartTags.includes(tag) ? "bg-primary text-white border-primary shadow-sm" : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600"}`}>
                              {filters.smartTags.includes(tag) ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Plus className="w-3.5 h-3.5 flex-shrink-0" />} <span>{tag}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea value={filters.notes} onChange={e => setFilters(f => ({ ...f, notes: e.target.value }))} className="h-24 resize-none rounded-xl" placeholder="أو اكتب أي تفاصيل أخرى هنا..." />
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSearch();
                        }}
                        className="w-full h-12 rounded-xl text-lg bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg text-white hover:from-emerald-700 hover:to-green-600"
                        type="button"
                      >
                        إرسال الطلب
                      </Button>
                    </div>
                  )}
                    </>
                  )}
                  
                  {/* Next/Submit Button for Form Builder mode */}
                  {useFormBuilder && formConfig && (
                    <FormNavigationButton
                      isLastStep={activeCard === formConfig.steps.length - 1}
                      canProceed={canProceed()}
                      onNext={goNext}
                      onSubmit={handleSearch}
                      submitLabel="إرسال الطلب"
                      nextLabel="التالي"
                      submitGradient={{
                        from: "from-emerald-600",
                        to: "to-green-500",
                        hoverFrom: "hover:from-emerald-700",
                        hoverTo: "hover:to-green-600",
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* MOBILE VERSION (REPLICATED EXACTLY) */}
      <div className="md:hidden relative px-3 py-3">
        {activeCard >= 1 && (<div className="mb-4 px-1"><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium">{reliabilityScore < 50 ? "بداية..." : "قربنا!"}</span><span className="text-xs font-bold text-green-600">{reliabilityScore}%</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700" style={{ width: `${reliabilityScore}%` }} /></div></div>)}

        <div className="relative transition-all duration-500 ease-in-out" style={{ height: `${containerHeightMobile}px` }}>
          {cards.slice(0, activeCard).map((card, idx) => (
            <div key={card.id} onClick={() => goBack(card.id)} className="absolute inset-x-0 cursor-pointer z-20" style={{ top: `${idx * MOBILE_HEADER_HEIGHT}px`, height: '50px' }}>
              <div className={`${card.lightColor} rounded-t-xl border-x border-t border-white/20 shadow-sm h-full flex items-center justify-between px-4`}>
                <div className="flex items-center gap-2"><div className={`w-6 h-6 rounded-full ${card.color} text-white flex items-center justify-center`}><Check className="w-3.5 h-3.5" /></div><span className="font-bold text-sm">{card.title}</span></div>
                <div className="flex items-center gap-1 text-primary/80"><Edit2 className="w-3 h-3" /><span className="text-[10px] font-medium">تعديل</span></div>
              </div>
            </div>
          ))}

          <div className={`absolute inset-x-0 transition-all duration-300 z-10 ${isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`} style={{ top: `${activeCard * MOBILE_HEADER_HEIGHT}px` }}>
            {isAnalyzing ? (
               <div className="bg-white border shadow-lg rounded-xl p-6 flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in">
                 <BrainCircuit className="w-8 h-8 text-primary animate-pulse mb-3" />
                 <h3 className="font-bold">جاري المطابقة...</h3>
               </div>
            ) : (
            <div className="bg-white border shadow-lg rounded-xl overflow-hidden pb-3">
              <div className="flex items-center justify-between p-3 border-b bg-muted/10">
                <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg ${cards[activeCard]?.lightColor || 'bg-gray-100'} flex items-center justify-center`}>{(() => { if (!cards[activeCard]) return null; const Icon = cards[activeCard].icon; return Icon ? <Icon className="w-4 h-4 text-primary" /> : null; })()}</div><h3 className="font-bold text-sm">{cards[activeCard]?.title}</h3></div>
                <span className="text-xs text-muted-foreground">{activeCard + 1} / {totalCards}</span>
              </div>

              <div className="p-4">
                {/* Mobile Card 0: Improved UI with 2 Big Cards (Same as Desktop) */}
                {activeCard === 0 && (
                  <div className="space-y-3 animate-in slide-in-from-right-4">
                    <Input placeholder="الاسم" value={filters.name} onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))} className="h-10 text-center rounded-lg" />
                    <Input type="tel" placeholder="05xxxxxxxx" value={filters.phone} onChange={(e) => handlePhoneChange(e.target.value)} className={`h-10 text-center rounded-lg ${phoneError ? 'border-red-500' : ''}`} dir="ltr" />
                    <Input type="email" placeholder="email@example.com" value={filters.email} onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))} className="h-10 text-center rounded-lg" dir="ltr" required />

                    <div className="mt-2">
                      <label className="text-xs font-medium mb-2 block text-center">تصنيف العقار المطلوب</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Residential Card */}
                        <div 
                          onClick={() => handleSelection('propertyCategory', 'residential')}
                          className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 h-28 ${filters.propertyCategory === 'residential' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 bg-white'}`}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${filters.propertyCategory === 'residential' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                            <Armchair className="h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <span className="block font-bold text-sm">سكني</span>
                            <span className="text-[9px] text-muted-foreground">فلل، شقق</span>
                          </div>
                        </div>

                        {/* Commercial Card */}
                        <div 
                          onClick={() => handleSelection('propertyCategory', 'commercial')}
                          className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 h-28 ${filters.propertyCategory === 'commercial' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-200' : 'border-gray-200 bg-white'}`}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${filters.propertyCategory === 'commercial' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <span className="block font-bold text-sm">تجاري</span>
                            <span className="text-[9px] text-muted-foreground">مكاتب، معارض</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg mt-2">التالي</Button>
                  </div>
                )}

                {/* Mobile Card 1: Improved Transaction Selection */}
                {activeCard === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4">
                    {/* Section 1: Transaction Type */}
                    <div>
                      <label className="text-xs font-medium mb-2 block">الهدف من الطلب</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          onClick={() => handleSelection('transactionType', 'sale')}
                          className={`group cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all h-28 ${filters.transactionType === 'sale' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${filters.transactionType === 'sale' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <FileSignature className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold">شراء</span>
                        </div>

                        <div 
                          onClick={() => handleSelection('transactionType', 'rent')}
                          className={`cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all h-28 ${filters.transactionType === 'rent' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${filters.transactionType === 'rent' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Key className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold">إيجار</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed" />

                    {/* Section 2: Property Condition */}
                    <div>
                      <label className="text-xs font-medium mb-2 block">حالة العقار المفضل</label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* New */}
                        <button 
                          key="new"
                          onClick={() => handleSelection('propertyCondition', 'new')} 
                          className={`group p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${filters.propertyCondition === 'new' ? "border-amber-400 bg-amber-50" : "border-gray-200"}`}
                        >
                          <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 ${filters.propertyCondition === 'new' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold">جديد</span>
                        </button>

                        {/* Used */}
                        <button 
                          key="used"
                          onClick={() => handleSelection('propertyCondition', 'used')} 
                          className={`group p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${filters.propertyCondition === 'used' ? "border-purple-400 bg-purple-50" : "border-gray-200"}`}
                        >
                          <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 ${filters.propertyCondition === 'used' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold">مستخدم</span>
                        </button>

                        {/* Under Construction */}
                        <button 
                          key="under_construction"
                          onClick={() => handleSelection('propertyCondition', 'under_construction')} 
                          className={`group p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${filters.propertyCondition === 'under_construction' ? "border-orange-400 bg-orange-50" : "border-gray-200"}`}
                        >
                          <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 ${filters.propertyCondition === 'under_construction' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Hammer className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold">تحت الإنشاء</span>
                        </button>
                      </div>
                    </div>

                    <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg mt-2">التالي</Button>
                  </div>
                )}

                {/* ✅✅ Card 2: City with Toggle Logic */}
                {activeCard === 2 && <div className="space-y-3 animate-in slide-in-from-right-4">{filters.cities.length > 0 && <div className="flex flex-wrap gap-1 justify-center">{filters.cities.map(c => <Badge key={c} variant="secondary" className="px-2 py-0.5 text-[10px]">{c} <X className="h-2.5 w-2.5 mr-1" onClick={() => toggleCity(c)} /></Badge>)}</div>}<div className="relative"><Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="بحث..." value={citySearch} onChange={e => setCitySearch(e.target.value)} className="h-10 pr-8 text-xs rounded-lg" /></div><div className="h-[200px] overflow-y-auto pr-1 custom-scrollbar border rounded-lg p-2 bg-muted/5"><div className="grid grid-cols-3 gap-2">{filteredCities.map(c => { const isSelected = filters.cities.includes(c.name); return (<button key={c.name} onClick={() => toggleCity(c.name)} className={`py-2.5 px-1 rounded border text-[10px] font-bold ${isSelected ? "bg-primary text-white" : "bg-white hover:bg-muted border-border"}`}>{isSelected && <Check className="h-2.5 w-2.5" />}<span className="truncate">{c.name}</span></button>); })}</div></div><Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg">التالي</Button></div>}

                {/* ✅✅ Card 3: District with Toggle Logic */}
                {activeCard === 3 && <div className="space-y-3 animate-in slide-in-from-right-4">
                  {/* فلتر الاتجاهات - موبايل */}
                  {hasDirections && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <button
                        onClick={() => setSelectedDirection("all")}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${selectedDirection === "all" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
                      >
                        الكل
                      </button>
                      {(["north", "south", "east", "west", "center"] as Direction[]).map(dir => (
                        <button
                          key={dir}
                          onClick={() => setSelectedDirection(dir)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-0.5 ${selectedDirection === dir ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
                        >
                          {directionLabels[dir]}
                        </button>
                      ))}
                    </div>
                  )}
                  {filters.districts.length > 0 && <div className="flex flex-wrap gap-1 justify-center">{filters.districts.map(d => <Badge key={d} variant="secondary" className="text-[10px]">{d} <X className="h-2.5 w-2.5 mr-1" onClick={() => toggleDistrict(d)} /></Badge>)}</div>}
                  <div className="relative"><Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="بحث..." value={districtSearch} onChange={e => setDistrictSearch(e.target.value)} className="h-10 pr-8 text-xs rounded-lg" /></div>
                  <div className="h-[160px] overflow-y-auto pr-1 custom-scrollbar border rounded-lg p-2 bg-muted/5">
                    {filteredDistricts.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {filteredDistricts.map(d => { 
                          const isSelected = filters.districts.includes(d.name); 
                          return (
                            <button key={d.name} onClick={() => toggleDistrict(d.name)} className={`py-2.5 px-1 rounded border text-[10px] font-bold ${isSelected ? "bg-primary text-white" : "bg-white hover:bg-muted border-border"}`}>
                              {isSelected && <Check className="h-2.5 w-2.5" />}
                              <span className="truncate">{d.name}</span>
                            </button>
                          ); 
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <MapPin className="h-6 w-6 mb-2 opacity-20" />
                        <p className="text-xs">لا توجد أحياء مطابقة</p>
                      </div>
                    )}
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg">التالي</Button>
                </div>}

                {activeCard === 4 && <div className="space-y-3 animate-in slide-in-from-right-4"><div className="grid grid-cols-4 gap-2">{propertyTypes.map(type => { const Icon = type.icon; return (<button key={type.value} onClick={() => handleSelection('propertyType', type.value)} className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-transform active:scale-95 ${filters.propertyType === type.value ? "border-primary bg-primary/5 scale-105" : "border-border"}`}><Icon className="h-5 w-5" /><span className="text-[10px] font-bold text-center">{type.label}</span></button>)})}</div><Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg">التالي</Button></div>}

                {/* ✅✅ Card 5 Mobile: REUSED RENDER FUNCTION */}
                {activeCard === 5 && renderCard5Content()}

                {/* Mobile Card 6 */}
                {activeCard === 6 && <div className="space-y-4 flex flex-col justify-center h-full min-h-[300px]"><div><label className="text-xs font-medium mb-1.5 block">الميزانية</label><div className="grid grid-cols-2 gap-1.5">{getBudgetOptions().map(b => {
                  const value = 'value' in b ? b.value : b.v;
                  const label = 'label' in b ? b.label : b.l;
                  return <button key={value} onClick={() => setFilters(f => ({ ...f, maxPrice: value }))} className={`py-2 px-1 rounded border text-[10px] font-bold ${filters.maxPrice === value ? "bg-primary text-white" : "border-border"}`}>{label}</button>;
                })}</div></div><div><label className="text-xs font-medium mb-1.5 block">طريقة الشراء</label><div className="grid grid-cols-2 gap-2"><button onClick={() => handleSelection('paymentMethod', 'cash')} className={`p-2 rounded border text-xs font-bold ${filters.paymentMethod === "cash" ? "bg-primary/10 border-primary text-primary" : "border-border"}`}>كاش</button><button onClick={() => handleSelection('paymentMethod', 'finance')} className={`p-2 rounded border text-xs font-bold ${filters.paymentMethod === "finance" ? "bg-primary/10 border-primary text-primary" : "border-border"}`}>تمويل بنكي</button></div></div>{filters.paymentMethod === "finance" && (<div className="space-y-2"><label className="text-xs font-medium mb-1.5 block">البنك</label><div className="grid grid-cols-2 gap-1.5">{SAUDI_BANKS.map(bank => (<button key={bank} onClick={() => setFilters(f => ({ ...f, bankName: bank }))} className={`py-1.5 px-1 rounded border text-[9px] font-bold ${filters.bankName === bank ? "bg-primary text-white" : "border-border"}`}>{bank}</button>))}</div><Input type="number" placeholder="الراتب" value={filters.salary} onChange={e => setFilters(f => ({ ...f, salary: e.target.value }))} className="h-9 text-center" /></div>)}<Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-lg">التالي</Button></div>}

                {/* Mobile Card 7 */}
                {activeCard === 7 && <div className="space-y-3"><label className="text-xs font-medium mb-1.5 block">تفاصيل إضافية</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">{(SPECIFIC_TAGS[filters.propertyType] || SPECIFIC_TAGS["villa"]).map(tag => (
                  <button key={tag} onClick={() => toggleFeature(tag)} className={`px-3 py-2 rounded-full border text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap h-auto ${filters.smartTags.includes(tag) ? "bg-primary text-white border-primary shadow-sm" : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600"}`}>
                    {filters.smartTags.includes(tag) ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Plus className="w-3.5 h-3.5 flex-shrink-0" />} <span>{tag}</span>
                  </button>
                ))}</div>
                <Textarea value={filters.notes} onChange={e => setFilters(f => ({ ...f, notes: e.target.value }))} className="h-16 rounded-lg text-xs" />
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSearch();
                  }}
                  className="w-full h-10 rounded-lg bg-green-600 shadow-md text-white hover:bg-green-700"
                  type="button"
                >
                  إرسال الطلب
                </Button>
              </div>}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});