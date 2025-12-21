import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header"; // ✅ تم إعادة استيراد الهيدر
import Footer from "@/components/Footer"; 
import { 
  User, Check, MapPin, Building2, Wallet, 
  Activity, Search, Edit2, 
  Landmark, Factory, Hotel, Home, CheckCircle2,
  PieChart, ArrowUpRight, BarChart3, Briefcase
} from "lucide-react";
import { getCityNames } from "@shared/saudi-locations";

// 1️⃣ إعدادات البيانات
const SAUDI_CITIES = getCityNames();

const ASSET_CLASSES = [
  { id: "residential", label: "سكني (تطوير/إيجار)", icon: Home },
  { id: "commercial", label: "تجاري (مكتبي/تجزئة)", icon: Briefcase },
  { id: "industrial", label: "صناعي ولوجستي", icon: Factory },
  { id: "land", label: "أراضي خام/مخططات", icon: MapPin },
  { id: "hospitality", label: "فندقي وسياحي", icon: Hotel },
  { id: "mixed", label: "متعدد الاستخدامات", icon: Building2 },
];

const INVESTMENT_STRATEGIES = [
  { 
    id: "capital_growth", 
    label: "نمو رأس المال", 
    icon: ArrowUpRight, 
    desc: "شراء العقار الآن لبيعه بسعر مضاعف مستقبلاً" 
  },
  { 
    id: "rental_income", 
    label: "دخل إيجاري", 
    icon: Wallet, 
    desc: "عقار تملكه وتأجره ليأتيك منه دخل ثابت ودوري" 
  },
  { 
    id: "land_banking", 
    label: "ادخار في أراضي", 
    icon: Landmark, 
    desc: "تجميد المال في أراضي خام بمناطق واعدة للنمو" 
  },
  { 
    id: "flip", 
    label: "تطوير سريع (Flip)", 
    icon: Activity, 
    desc: "شراء، تحسين، ثم إعادة بيع سريع للربح الفوري" 
  },
];

const ROI_RANGES = ["5% - 7%", "7% - 9%", "9% - 12%", "+12%", "غير محدد"];

// 2️⃣ واجهة البيانات
interface InvestorFilters {
  name: string; phone: string; email: string;
  cities: string[];
  assetClasses: string[];
  strategy: string;
  budgetMin: string;
  budgetMax: string;
  roiTarget: string;
  notes: string;
}

export default function InvestorPage() {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // حالة النموذج
  const [filters, setFilters] = useState<InvestorFilters>({
    name: "", phone: "", email: "",
    cities: [],
    assetClasses: [],
    strategy: "",
    budgetMin: "",
    budgetMax: "",
    roiTarget: "",
    notes: ""
  });

  const [citySearch, setCitySearch] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function validateSaudiPhone(phone: string) {
    let normalized = phone.replace(/[^\d]/g, '');
    if (normalized.startsWith('966')) normalized = '0' + normalized.slice(3);
    return normalized.startsWith('05') && normalized.length === 10 
      ? { isValid: true, normalized, error: '' } 
      : { isValid: false, normalized: '', error: 'رقم غير صحيح' };
  }

  const handlePhoneChange = (value: string) => {
    const validation = validateSaudiPhone(value);
    setFilters(f => ({ ...f, phone: value }));
    setPhoneError(value.trim() ? (validation.isValid ? "" : validation.error) : "");
  };

  const isPhoneValid = useMemo(() => filters.phone.trim() ? validateSaudiPhone(filters.phone).isValid : false, [filters.phone]);
  const filteredCities = useMemo(() => SAUDI_CITIES.filter(c => c.includes(citySearch)), [citySearch]);

  const cards = useMemo(() => [
    { id: 0, icon: User, title: "بيانات المستثمر", color: "bg-amber-500", lightColor: "bg-amber-100" },
    { id: 1, icon: PieChart, title: "استراتيجية الاستثمار", color: "bg-blue-500", lightColor: "bg-blue-100" },
    { id: 2, icon: MapPin, title: "النطاق الجغرافي", color: "bg-emerald-500", lightColor: "bg-emerald-100" },
    { id: 3, icon: Building2, title: "الأصول المستهدفة", color: "bg-purple-500", lightColor: "bg-purple-100" },
    { id: 4, icon: Wallet, title: "حجم المحفظة", color: "bg-indigo-500", lightColor: "bg-indigo-100" },
  ], []);

  const totalCards = cards.length;

  const advance = () => { setIsAnimating(true); setTimeout(() => { setActiveCard(p => p + 1); setIsAnimating(false); }, 200); };
  const goBack = (idx: number) => { if (idx < activeCard && !isAnimating) { setIsAnimating(true); setTimeout(() => { setActiveCard(idx); setIsAnimating(false); }, 200); }};

  const goNext = () => {
    if (activeCard < totalCards - 1 && !isAnimating) {
      advance();
    } else if (activeCard === totalCards - 1) {
      handleSubmit();
    }
  };

  const toggleCity = (cityName: string) => {
    setFilters(prev => {
      const isSelected = prev.cities.includes(cityName);
      return { ...prev, cities: isSelected ? prev.cities.filter(c => c !== cityName) : [...prev.cities, cityName] };
    });
  };

  const toggleAsset = (assetId: string) => {
    setFilters(prev => {
      const isSelected = prev.assetClasses.includes(assetId);
      return { ...prev, assetClasses: isSelected ? prev.assetClasses.filter(a => a !== assetId) : [...prev.assetClasses, assetId] };
    });
  };

  const canProceed = () => {
    if (activeCard === 0) return filters.name && isPhoneValid;
    if (activeCard === 1) return filters.strategy;
    if (activeCard === 2) return filters.cities.length > 0;
    if (activeCard === 3) return filters.assetClasses.length > 0;
    if (activeCard === 4) return filters.budgetMax;
    return true;
  };

  const completionScore = useMemo(() => {
    let score = 0;
    if (filters.name) score += 20;
    if (filters.strategy) score += 20;
    if (filters.cities.length) score += 20;
    if (filters.assetClasses.length) score += 20;
    if (filters.budgetMax) score += 20;
    return score;
  }, [filters]);

  const investorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/investors/register", {
        ...data,
        budgetMin: parseInt(data.budgetMin) || 0,
        budgetMax: parseInt(data.budgetMax) || 0,
        investmentTypes: data.assetClasses.join(", "),
        cities: data.cities.join(", "),
      });
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({ title: "تم تسجيل ملفك الاستثماري بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ", variant: "destructive" });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    investorMutation.mutate(filters);
  };

  const DESKTOP_HEADER_HEIGHT = 50;
  const BASE_CONTENT_HEIGHT_DESKTOP = 600; 
  const containerHeightDesktop = (activeCard * DESKTOP_HEADER_HEIGHT) + BASE_CONTENT_HEIGHT_DESKTOP;

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header /> {/* ✅ تم إضافة الهيدر هنا أيضاً */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 text-center max-w-md w-full animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">تم استلام طلبك!</h2>
            <p className="text-slate-500 mb-8">
              شكراً {filters.name.split(' ')[0]}، تم تسجيلك في قائمة "كبار المستثمرين". سنقوم بمطابقة الفرص {filters.strategy === 'capital_growth' ? 'عالية النمو' : 'المدرة للدخل'} مع محفظتك.
            </p>
            <Button onClick={() => window.location.href = "/"} className="w-full h-12 text-lg rounded-xl bg-slate-900 hover:bg-slate-800">
              العودة للرئيسية
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header /> {/* ✅ تم إضافة الهيدر في الشاشة الرئيسية */}

      <div className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="max-w-xl mx-auto">

          {/* Header Score */}
          {activeCard >= 0 && (
            <div className="mb-6 max-w-md mx-auto px-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">اكتمال الملف الاستثماري</span>
                <span className="text-sm font-bold text-amber-600">{completionScore}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${completionScore}%` }} 
                />
              </div>
            </div>
          )}

          {/* Cards Container */}
          <div 
            className="relative transition-all duration-500 ease-in-out" 
            style={{ height: `${containerHeightDesktop}px`, minHeight: '600px' }}
          >
            {/* Stacked Headers */}
            {cards.slice(0, activeCard).map((card, idx) => (
              <div 
                key={card.id} 
                onClick={() => goBack(card.id)} 
                className="absolute inset-x-0 cursor-pointer hover:brightness-95 z-20 transition-all duration-300" 
                style={{ top: `${idx * DESKTOP_HEADER_HEIGHT}px`, height: '60px' }}
              >
                <div className={`${card.lightColor} rounded-t-2xl border-x-2 border-t-2 border-white/40 shadow-sm h-full flex items-center justify-between px-6 backdrop-blur-sm`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${card.color} text-white flex items-center justify-center shadow-sm`}>
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-800">{card.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">تعديل</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Active Card Content */}
            <div 
              className={`absolute inset-x-0 transition-all duration-500 ease-out z-10 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`} 
              style={{ top: `${activeCard * DESKTOP_HEADER_HEIGHT}px` }}
            >
              <div className="bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden pb-4 min-h-[500px]">

                <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${cards[activeCard]?.lightColor || 'bg-gray-100'} flex items-center justify-center shadow-inner`}>
                      {(() => { 
                        const Icon = cards[activeCard].icon; 
                        return <Icon className={`w-6 h-6 ${cards[activeCard].color.replace('bg-', 'text-')}`} />; 
                      })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">{cards[activeCard]?.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">الخطوة {activeCard + 1} من {totalCards}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">

                  {/* CARD 0 */}
                  {activeCard === 0 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block text-slate-700">الاسم الكامل (أو اسم الجهة)</label>
                          <Input 
                            placeholder="أدخل الاسم" 
                            value={filters.name} 
                            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))} 
                            className="h-12 text-lg rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all focus:ring-amber-500" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block text-slate-700">رقم الجوال</label>
                          <Input 
                            type="tel" 
                            placeholder="05xxxxxxxx" 
                            value={filters.phone} 
                            onChange={(e) => handlePhoneChange(e.target.value)} 
                            className={`h-12 text-lg text-left rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all focus:ring-amber-500 ${phoneError ? 'border-red-500 ring-red-100' : ''}`} 
                            dir="ltr" 
                          />
                          {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block text-slate-700">البريد الإلكتروني (اختياري)</label>
                          <Input 
                            type="email" 
                            placeholder="email@example.com" 
                            value={filters.email} 
                            onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))} 
                            className="h-12 text-lg text-left rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all focus:ring-amber-500" 
                            dir="ltr" 
                          />
                        </div>
                      </div>
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-14 rounded-xl text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 mt-4">
                        بدء الملف الاستثماري
                      </Button>
                    </div>
                  )}

                  {/* CARD 1 */}
                  {activeCard === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {INVESTMENT_STRATEGIES.map(st => {
                          const Icon = st.icon;
                          const isSelected = filters.strategy === st.id;
                          return (
                            <div 
                              key={st.id}
                              onClick={() => setFilters(f => ({ ...f, strategy: st.id }))}
                              className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                            >
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <div className="text-center">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{st.label}</h4>
                                <p className="text-xs text-slate-500 mt-1">{st.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-14 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 mt-2">
                        التالي
                      </Button>
                    </div>
                  )}

                  {/* CARD 2 */}
                  {activeCard === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">
                      <div className="relative">
                        <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
                        <Input 
                          placeholder="ابحث عن مدينة..." 
                          value={citySearch} 
                          onChange={(e) => setCitySearch(e.target.value)} 
                          className="h-12 pr-12 rounded-xl bg-slate-50 border-slate-200" 
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {filters.cities.map(c => (
                          <Badge key={c} variant="secondary" className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer" onClick={() => toggleCity(c)}>
                            {c} <span className="mr-2">×</span>
                          </Badge>
                        ))}
                      </div>

                      <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredCities.map(city => {
                          const isSelected = filters.cities.includes(city);
                          return (
                            <button 
                              key={city} 
                              onClick={() => toggleCity(city)} 
                              className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-between group ${isSelected ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"}`}
                            >
                              <span>{city}</span>
                              {isSelected && <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-14 rounded-xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                        التالي
                      </Button>
                    </div>
                  )}

                  {/* CARD 3 */}
                  {activeCard === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ASSET_CLASSES.map(asset => {
                          const Icon = asset.icon;
                          const isSelected = filters.assetClasses.includes(asset.id);
                          return (
                            <button 
                              key={asset.id} 
                              onClick={() => toggleAsset(asset.id)} 
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:scale-[1.02] ${isSelected ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md" : "border-slate-100 hover:border-purple-200 text-slate-600"}`}
                            >
                              <Icon className={`h-8 w-8 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                              <span className="text-sm font-bold text-center">{asset.label}</span>
                            </button>
                          )
                        })}
                      </div>
                      <Button onClick={goNext} disabled={!canProceed()} className="w-full h-14 rounded-xl text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200">
                        التالي
                      </Button>
                    </div>
                  )}

                  {/* CARD 4 */}
                  {activeCard === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">

                      <div className="space-y-4">
                        <label className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-indigo-500" />
                          حجم المحفظة المرصودة
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 mb-1 block">الحد الأدنى (ريال)</span>
                            <Input 
                              type="number" 
                              placeholder="مثال: 1000000" 
                              value={filters.budgetMin} 
                              onChange={e => setFilters(f => ({...f, budgetMin: e.target.value}))} 
                              className="h-12 text-center text-lg rounded-xl bg-slate-50"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 mb-1 block">الحد الأقصى (ريال)</span>
                            <Input 
                              type="number" 
                              placeholder="مثال: 50000000" 
                              value={filters.budgetMax} 
                              onChange={e => setFilters(f => ({...f, budgetMax: e.target.value}))} 
                              className="h-12 text-center text-lg rounded-xl bg-slate-50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-500" />
                          العائد السنوي المتوقع (ROI)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ROI_RANGES.map(roi => (
                            <button 
                              key={roi} 
                              onClick={() => setFilters(f => ({...f, roiTarget: roi}))}
                              className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${filters.roiTarget === roi ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                            >
                              {roi}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium text-slate-700">ملاحظات إضافية</label>
                        <Textarea 
                          value={filters.notes} 
                          onChange={e => setFilters(f => ({...f, notes: e.target.value}))}
                          placeholder="هل تبحث عن فرص Off-Market؟ هل تفضل الدخول كشريك؟"
                          className="rounded-xl resize-none h-24 bg-slate-50"
                        />
                      </div>

                      <Button 
                        onClick={handleSubmit} 
                        disabled={!canProceed() || isSubmitting} 
                        className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200"
                      >
                        {isSubmitting ? "جاري التسجيل..." : "اعتماد الملف الاستثماري"}
                      </Button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}