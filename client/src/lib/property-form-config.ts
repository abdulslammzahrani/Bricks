// ==================================================================================
// 🔧🔧 إعدادات نماذج العقارات المشتركة 🔧🔧
// ==================================================================================

import { 
  Home, Building2, Building, Warehouse, LandPlot, Hotel, Store, Factory, 
  Blocks, Trees, Waves, School, Stethoscope, Fuel
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 1️⃣ التاقات الخاصة بكل نوع عقار
export const SPECIFIC_TAGS: Record<string, string[]> = {
  "villa": ["مسبح", "قبو", "مصعد", "تكييف مركزي", "ملحق خارجي", "مسطحات خضراء", "واجهة مودرن", "شقة استثمارية", "غرفة كبار سن", "درج داخلي", "نظام سمارت هوم", "عوازل حرارية", "إشراف هندسي", "ضمانات هيكل", "غرفة غسيل", "غرفة سينما"],
  "apartment": ["مدخل خاص", "سطح خاص", "موقف خاص", "غرفة سائق", "غرفة خادمة", "دخول ذكي", "بلكونة", "مطبخ راكب", "مكيفات راكبة", "خزان مستقل", "قريبة من مسجد", "ألياف بصرية", "تشطيب فاخر"],
  "residential_building": ["موقع زاوية", "واجهة كلادينج", "مصعد (ماركة عالمية)", "عدادات مستقلة", "تمديدات سبليت", "مدخل فندقي", "غرفة حارس", "أنظمة دفاع مدني", "خزان مياه كبير", "مواقف مرصوفة", "نظام انتركوم", "سطح معزول", "قريب من الخدمات", "صك إلكتروني", "عقود إلكترونية"],
  "tower": ["مهبط طائرات (Helipad)", "نظام إدارة مباني (BMS)", "مصاعد ذكية (Destination Control)", "واجهات زجاجية (Double Glazed)", "ردهة استقبال فندقية", "نادي صحي وسبا", "قاعة مؤتمرات مشتركة", "مصلى مركزي", "مواقف ذكية/Valet", "مولدات احتياطية كاملة", "تكييف مركزي (Chiller)", "أنظمة مراقبة CCTV", "ألياف بصرية (Fiber)", "نظام تنظيف واجهات", "حدائق معلقة (Roof Garden)", "كافتيريا داخلية"],
  "showroom": ["ارتفاع سقف مضاعف", "واجهة زجاجية (Curtain Wall)", "رخصة مطعم/كافيه", "جلسات خارجية مرخصة", "مواقف أمامية واسعة", "مدخل خدمة خلفي", "تمديدات غاز مركزية", "نظام تهوية (Ventilation)", "إمكانية التجزئة", "موقع زاوية", "مساحة إعلانية", "مدخل ذوي همم (Ramp)", "عداد كهرباء مستقل", "تكييف مركزي مستقل", "أرضيات فاخرة", "نظام صوتي مدمج"],
  "office": ["أرضيات مرتفعة (Raised Floors)", "إطلالة بانورامية", "دخول ذكي (Access Control)", "غرفة خوادم (Server Room)", "مطبخ تحضيري (Pantry)", "عوازل صوتية", "تصميم مرن (Open Plan)", "دورة مياه خاصة", "غرفة أرشيف", "إضاءة LED", "نظام سلامة (Sprinklers)", "ستائر ذكية", "أثاث مكتبي", "قاعة اجتماعات زجاجية", "خدمة نظافة", "واي فاي مركزي"],
  "commercial_building": ["على شارع تجاري", "معارض مؤجرة", "مكاتب جاهزة", "رخصة دفاع مدني", "عدادات مستقلة", "كاميرات مراقبة", "مصعد", "قبو مواقف"],
  "complex": ["سور وبوابات (Gated)", "حراسة 24/7", "مسبح مشترك", "نادي رياضي (Gym)", "حدائق (Landscape)", "ألعاب أطفال", "ميني ماركت", "قاعة مناسبات", "صيانة ونظافة دائمة", "مواقف مظللة", "دخول ذكي", "مسجد/مصلى", "محطة معالجة مياه", "مولد احتياطي", "مكافحة حريق مركزية", "كافيه لاونج"],
  "commercial_land": ["رخصة بناء جاهزة", "موقع حيوي", "أرض مستوية", "خدمات واصلة", "شارع مسفلت", "قريبة من معالم", "سهولة الوصول", "خالية من العوائق", "مصرحة متعدد", "إمكانية الدمج", "تقرير مساحي", "واجهة تجارية", "منطقة نمو", "بعيدة عن السيول", "مسموح القبو", "سور مؤقت"],
  "school": ["معامل حاسب آلي", "مختبرات علوم", "مكتبة شاملة", "مسرح مدرسي", "مسبح داخلي", "ملاعب رياضية", "عيادة طبية", "مقصف/كافيتيريا", "غرف معلمين مؤثثة", "مصلى واسع", "ساحات مظللة", "نظام مراقبة", "بوابات آمنة", "منطقة حافلات (Drop-off)", "تسهيلات لأصحاب الهمم", "غرف فنون/مرسم"],
  "warehouse": ["رصيف تحميل (Dock Levelers)", "أرضية إيبوكسي", "نظام رفوف (Racking Ready)", "عزل حراري (Sandwich Panel)", "إضاءة طبيعية", "مكتب إداري داخلي", "مرافق للعمال", "غرفة حارس", "سور خرساني", "كهرباء 3 فاز", "نظام إطفاء متطور", "ساحة مناورة شاحنات", "تهوية صناعية", "كاميرات مراقبة", "مخارج طوارئ", "غرف تبريد"],
  "gas_station": ["عقود Anchor Tenants", "سوبر ماركت (C-Store)", "طلبات سيارة (Drive-thru)", "منطقة مطاعم", "مغسلة أوتوماتيكية", "مغسلة يدوية", "مركز خدمة سيارات", "صراف آلي (ATM)", "مصلى ودورات مياه", "سكن عمال", "مضخات ديزل للشاحنات", "استرجاع أبخرة", "مظلة LED حديثة", "خدمات مجانية (هواء/ماء)", "ربط أمني (شموس)", "خزانات مزدوجة (Double Wall)"],
  "factory": ["رافعات علوية (Cranes)", "أرضيات صناعية", "نظام إطفاء آلي", "رصيف تحميل", "مبنى إداري", "مختبر جودة", "مستودع مواد", "شبكة هواء مضغوط", "نظام تهوية", "ميزان شاحنات", "غرفة مولدات", "سكن عمال", "خزانات وقود", "تصريف صناعي", "ورشة صيانة", "شهادات أيزو"],
  "health_center": ["غرفة أشعة (X-Ray)", "مختبر تحاليل", "صيدلية داخلية", "غرفة تعقيم", "مداخل ذوي همم", "غرفة نفايات طبية", "مولد طوارئ UPS", "غرفة طوارئ", "نظام استدعاء تمريض", "أرضيات فينيل طبي", "تكييف HEPA", "مواقف إسعاف", "استراحة أطباء", "دورات مياه خاصة", "شاشات انتظار", "دفاع مدني طبي"],
  "industrial_land": ["داخل مدينة صناعية", "طرق شاحنات", "قرب ميناء", "محطة كهرباء", "شبكة غاز صناعي", "تصريف صناعي", "تصريح سكن عمال", "أرضية صلبة", "خدمات لوجستية", "أمن صناعي", "مخططات معتمدة", "إمكانية التجزئة", "إعفاءات جمركية", "شبكة اتصال", "تخزين خارجي", "مسورة بالكامل"],
  "farm": ["فيلا/استراحة", "مجالس خارجية", "مسبح", "شبكة ري حديثة", "خزانات ضخمة", "بيوت محمية", "حظائر مواشي", "سكن عمال", "طرق مرصوفة", "مستودع أعلاف", "أشجار مثمرة", "مسطحات خضراء", "منطقة شواء", "سور كامل", "غطاسات ومضخات", "بوابة إلكترونية"]
};

// 2️⃣ إعدادات الأزرار الذكية
export const SMART_RANGES = {
  area: ["100-200", "200-300", "300-400", "400-600", "600-900", "900-1500", "1500-3000", "3000+"],
  floors: ["1-3", "4-7", "8-12", "13-20", "20-30", "30+"],
  elevators: ["1", "2", "3", "4", "6", "8", "10+"],
  units_small: ["1-5", "6-10", "11-20", "21-35"],
  units_large: ["20-50", "50-100", "100-200", "200+"],
  rooms: ["1", "2", "3", "4", "5", "6", "7+"],
  bathrooms: ["1", "2", "3", "4", "5+"],
  streets: ["1", "2", "3", "4"],
  pumps: ["2", "4", "6", "8", "10", "12+"],
  tanks: ["30k", "50k", "70k", "100k+"],
  income: ["< 100k", "100k-200k", "200k-500k", "500k-1M", "1M+"],
  roi: ["5%", "6%", "7%", "8%", "9%", "10%+"],
  facadeWidth: ["10-15m", "15-20m", "20-30m", "30m+"],
  ceilingHeight: ["3-4m", "4-6m", "6-8m", "8m+"],
  power: ["Normal", "200 KVA", "500 KVA", "1000 KVA+"],
  capacity: ["< 100", "100-300", "300-500", "500-1000", "1000+"]
};

// 3️⃣ البنوك السعودية
export const SAUDI_BANKS = ["الراجحي", "الأهلي (SNB)", "الرياض", "الإنماء", "الأول (SAB)", "البلاد", "الجزيرة", "العربي", "الاستثمار", "الفرنسي"];

// 4️⃣ أنواع العقارات السكنية
export interface PropertyType {
  value: string;
  label: string;
  icon: LucideIcon;
  category: "residential" | "commercial";
}

export const RESIDENTIAL_PROPERTY_TYPES: PropertyType[] = [
  { value: "villa", label: "فيلا", icon: Home, category: "residential" },
  { value: "apartment", label: "شقة", icon: Building2, category: "residential" },
  { value: "residential_building", label: "عمارة سكنية", icon: Building, category: "residential" },
  { value: "residential_land", label: "أرض سكنية", icon: LandPlot, category: "residential" },
];

// 5️⃣ أنواع العقارات التجارية
export const COMMERCIAL_PROPERTY_TYPES: PropertyType[] = [
  { value: "tower", label: "برج", icon: Building2, category: "commercial" },
  { value: "showroom", label: "معرض", icon: Store, category: "commercial" },
  { value: "office", label: "مكتب", icon: Blocks, category: "commercial" },
  { value: "commercial_building", label: "عمارة تجارية", icon: Building, category: "commercial" },
  { value: "complex", label: "مجمع سكني", icon: Hotel, category: "commercial" },
  { value: "commercial_land", label: "أرض تجارية", icon: LandPlot, category: "commercial" },
  { value: "school", label: "مدرسة", icon: School, category: "commercial" },
  { value: "warehouse", label: "مستودع", icon: Warehouse, category: "commercial" },
  { value: "gas_station", label: "محطة وقود", icon: Fuel, category: "commercial" },
  { value: "factory", label: "مصنع", icon: Factory, category: "commercial" },
  { value: "health_center", label: "مركز صحي", icon: Stethoscope, category: "commercial" },
  { value: "industrial_land", label: "أرض صناعية", icon: LandPlot, category: "commercial" },
  { value: "farm", label: "مزرعة", icon: Trees, category: "commercial" },
  { value: "resort", label: "استراحة", icon: Waves, category: "commercial" },
];

// 6️⃣ جميع أنواع العقارات
export const ALL_PROPERTY_TYPES = [...RESIDENTIAL_PROPERTY_TYPES, ...COMMERCIAL_PROPERTY_TYPES];

// 7️⃣ دالة للحصول على أنواع العقارات حسب الفئة
export function getPropertyTypesByCategory(category: "residential" | "commercial" | ""): PropertyType[] {
  if (category === "residential") return RESIDENTIAL_PROPERTY_TYPES;
  if (category === "commercial") return COMMERCIAL_PROPERTY_TYPES;
  return ALL_PROPERTY_TYPES;
}

// 8️⃣ دالة للحصول على التاقات حسب نوع العقار
export function getTagsForPropertyType(propertyType: string): string[] {
  return SPECIFIC_TAGS[propertyType] || [];
}

// 9️⃣ بيانات النموذج المشتركة
export interface ListingData {
  name: string; 
  phone: string; 
  email: string; 
  propertyCategory: "residential" | "commercial" | "";
  offerType: "sale" | "rent" | ""; 
  propertyCondition: "new" | "used" | "under_construction" | "";
  cities: string[]; 
  districts: string[]; 
  propertyType: string; 
  // Specs
  minArea: string; 
  maxArea: string;
  rooms: string; 
  bathrooms: string; 
  livingRooms: string; 
  hasMaidRoom: boolean;
  facade: string; 
  streetWidth: string; 
  plotLocation: string;
  annualIncome: string; 
  roi: string; 
  unitsCount: string; 
  propertyAge: string;
  floorsCount: string; 
  elevatorsCount: string; 
  bua: string; 
  buildingClass: string; 
  parkingCapacity: string;
  facadeWidth: string; 
  ceilingHeight: string; 
  hasMezzanine: boolean; 
  groundArea: string; 
  mezzanineArea: string; 
  powerCapacity: string;
  floorNumber: string; 
  nla: string; 
  finishingStatus: string; 
  acType: string;
  studentCapacity: string; 
  classroomsCount: string; 
  labsCount: string; 
  municipalityClass: string;
  hasCivilDefense: string; 
  floorLoad: string;
  pumpsCount: string; 
  tanksCapacity: string; 
  stationCategory: string;
  shopsCount: string; 
  apartmentsCount: string;
  buildingsCount: string; 
  occupancyRate: string;
  zoning: string;
  activityType: string; 
  buildingRatio: string;
  wellsCount: string; 
  waterType: string; 
  treesCount: string; 
  farmFacade: string;
  productionArea: string; 
  licenseType: string; 
  craneLoad: string;
  clinicsCount: string; 
  waitingArea: string; 
  healthLicense: string;
  // Price & Location
  targetPrice: string; 
  paymentPreference: "cash" | "finance" | ""; 
  bankName: string; 
  smartTags: string[]; 
  notes: string; 
  latitude?: number | null;
  longitude?: number | null;
}

// 🔟 القيم الافتراضية للنموذج
export const DEFAULT_LISTING_DATA: ListingData = {
  name: "", phone: "", email: "", 
  propertyCategory: "", offerType: "", propertyCondition: "",
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
  targetPrice: "", paymentPreference: "", bankName: "", 
  smartTags: [], notes: "",
  latitude: null, longitude: null
};



