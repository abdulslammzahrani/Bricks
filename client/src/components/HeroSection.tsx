import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, Users, Building2, 
  Eye, FileText, Activity, TrendingUp, MessageCircle, 
  Layers, Search 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query"; 
import { apiRequest } from "@/lib/queryClient"; 
import { LocationPicker } from "./LocationPicker";
import { SaudiMap } from "./SaudiMap";
import { findCityInText } from "@shared/saudi-locations";
import { getShuffledExamples, markExampleViewed, type Example } from "@/data/examples";
import { useLocation } from "wouter";
import { AdvancedSearchForm } from "./AdvancedSearchForm";
import { ListPropertyForm } from "./ListPropertyForm";

type UserMode = "buyer" | "seller" | "investor";

interface HeroSectionProps {
  onCompleteChange?: (isComplete: boolean) => void;
}

// --- 1. شريط الأحداث المباشرة (Live Ticker) كما هو في كودك ---
const LIVE_EVENTS = [
  { text: "فهد من الرياض يبحث عن فيلا", type: "search" },
  { text: "تمت إضافة عقار جديد في حي الملقا", type: "list" },
  { text: "سارة بدأت محادثة مع بائع في جدة", type: "chat" },
  { text: "تم توثيق صفقة بيع في الدمام", type: "deal" },
  { text: "عبدالله مهتم بأرض في مكة", type: "interest" },
];

function LiveTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
        setVisible(true);
      }, 500); 
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-slate-100 font-sans text-xs font-medium text-slate-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        {LIVE_EVENTS[index].text}
      </div>
    </div>
  );
}

export default function HeroSection({ onCompleteChange }: HeroSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient(); 
  const [mode, setMode] = useState<UserMode>("buyer");
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapMarkers, setMapMarkers] = useState<Array<{city: string; lat: number; lng: number}>>([]);

  const [liveStats] = useState({ viewers: 2450, requests: 215, deals: 14, matches: 345 });

  // ✅ ربط المشتري وتحديث الداشبورد
  const buyerMutation = useMutation({
    mutationFn: async (filters: any) => {
      // تحويل بيانات AdvancedSearchForm إلى التنسيق المتوقع من API
      const parsedBudgetMin = filters.minPrice 
        ? parseInt(String(filters.minPrice).replace(/[^\d]/g, ""), 10)
        : null;
      const parsedBudgetMax = filters.maxPrice 
        ? parseInt(String(filters.maxPrice).replace(/[^\d]/g, ""), 10)
        : null;

      const response = await apiRequest("POST", "/api/buyers/register", {
        name: filters.name || "",
        phone: filters.phone || "",
        email: filters.email || `${filters.phone}@temp.com`,
        city: filters.cities && filters.cities.length > 0 ? filters.cities[0] : "",
        districts: filters.districts || [],
        propertyType: filters.propertyType || "apartment",
        rooms: filters.rooms || null,
        area: filters.minArea || null,
        budgetMin: isNaN(parsedBudgetMin!) ? null : parsedBudgetMin,
        budgetMax: isNaN(parsedBudgetMax!) ? null : parsedBudgetMax,
        paymentMethod: filters.paymentMethod || null,
        purpose: filters.purpose || null,
        purchaseTimeline: filters.purchaseTimeline || null,
        transactionType: filters.transactionType === "rent" ? "rent" : "buy",
        clientType: filters.clientType || "direct",
        smartTags: filters.smartTags || [],
        notes: filters.notes || "",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsComplete(true);
      onCompleteChange?.(true);
      toast({ title: "تم تسجيل رغبتك بنجاح 🚀" });
    },
    onError: (error: any) => {
      console.error("Error registering buyer:", error);
      toast({ 
        title: "حدث خطأ", 
        description: error.message || "فشل في تسجيل الرغبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  });

  // ✅ ربط البائع وتحديث الداشبورد
  const sellerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/sellers/register", { ...data, ...extractedData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsComplete(true);
      onCompleteChange?.(true);
      toast({ title: "تم تسجيل عقارك بنجاح 🎉" });
    }
  });

  const handleModeSwitch = useCallback((newMode: UserMode) => {
    setMode(newMode);
    setIsComplete(false);
    onCompleteChange?.(false);
  }, [onCompleteChange]);

  const statsList = [
    { id: 'viewers', icon: Eye, color: 'text-blue-600', label: 'متصفح نشط', value: liveStats.viewers },
    { id: 'requests', icon: FileText, color: 'text-amber-600', label: 'طلب جديد', value: liveStats.requests },
    { id: 'deals', icon: TrendingUp, color: 'text-green-600', label: 'صفقة مكتملة', value: liveStats.deals },
    { id: 'matches', icon: Layers, color: 'text-purple-600', label: 'عقار مطابق', value: liveStats.matches },
  ];

  return (
    <section className="relative min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
      {/* أنماط الرادار CSS */}
      <style>{`
        @keyframes scan { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
        .radar-sweep { background: conic-gradient(from 0deg at 50% 50%, rgba(34, 197, 94, 0) 0deg, rgba(34, 197, 94, 0.1) 200deg, rgba(34, 197, 94, 0.6) 360deg); animation: scan 3s linear infinite; }
        .radar-ring { border: 2px solid rgba(34, 197, 94, 0.4); animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* 1. Header */}
      <div className="container mx-auto px-4 pt-8 pb-4 text-center z-10 relative">
        <div className="absolute top-4 right-4 hidden md:block"><LiveTicker /></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <Sparkles className="h-3.5 w-3.5" /> <span>منصة ذكية للعقارات</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3">
          {mode === "buyer" ? "ابحث عن عقارك المثالي" : "اعرض عقارك للبيع"}
        </h1>
      </div>

      {/* 2. Map Section (يختفي فقط عند النجاح) */}
      {!isComplete && (
        <div className="relative w-full h-[500px] md:h-[600px] bg-slate-100 border-b border-slate-200">
          <SaudiMap markers={mapMarkers} className="w-full h-full" />
          <div className="absolute top-4 left-4 z-20 hidden md:block">
            <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-4 min-w-[200px] border border-slate-100">
               {statsList.map(stat => (
                <div key={stat.id} className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 flex items-center gap-2">
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} /> {stat.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{stat.value.toLocaleString('ar-EG')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Action Form Card */}
      <div className={`container mx-auto px-4 relative z-20 ${!isComplete ? '-mt-24' : 'flex-1 flex items-center py-10'}`}>
        <Card className={`w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/95 p-4 ${isComplete ? 'shadow-none bg-transparent' : ''}`}>

          {!isComplete ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                  <Button size="sm" variant={mode === "buyer" ? "default" : "ghost"} onClick={() => handleModeSwitch("buyer")} className="w-32">مشتري</Button>
                  <Button size="sm" variant={mode === "seller" ? "default" : "ghost"} onClick={() => handleModeSwitch("seller")} className="w-32">بائع</Button>
                </div>
              </div>
              <div className="w-full">
                {mode === "buyer" ? (
                  <AdvancedSearchForm onSearch={(f) => buyerMutation.mutate(f)} onSwitchToChat={() => {}} />
                ) : (
                  <ListPropertyForm onSubmit={(p) => sellerMutation.mutate(p)} />
                )}
              </div>
            </>
          ) : (
            /* 🟢 شاشة الرادار المتطورة (تظهر عند النجاح) 🟢 */
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md mx-auto">
              <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border border-green-100 rounded-full"></div>
                <div className="absolute inset-4 border border-green-200 rounded-full"></div>
                <div className="absolute inset-0 rounded-full radar-ring"></div>
                <div className="absolute inset-0 rounded-full radar-ring" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-1 rounded-full overflow-hidden z-10">
                  <div className="radar-sweep absolute inset-0 rounded-full"></div>
                </div>
                <div className="relative z-20 w-5 h-5 bg-green-600 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <Search className="absolute -top-2 -right-2 h-6 w-6 text-green-600 animate-bounce bg-white p-1 rounded-full shadow-sm" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 text-center">جاري المطابقة...</h3>
              <p className="text-slate-600 text-center text-sm mb-8 leading-relaxed">
                تم تسجيل بياناتك بنجاح. نظامنا الذكي يقوم الآن بمسح السوق ومطابقة طلبك مع أفضل الفرص المتاحة حالياً.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Button onClick={() => window.location.href = "/dashboard"} className="w-full bg-green-600 hover:bg-green-700 h-12 text-white font-bold text-lg shadow-lg">الذهاب للوحة التحكم</Button>
                <Button variant="ghost" onClick={() => { setIsComplete(false); onCompleteChange?.(false); }} className="text-slate-500">إرسال طلب آخر</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <LocationPicker 
        open={showLocationPicker} 
        onOpenChange={setShowLocationPicker} 
        onLocationSelect={(lat, lng) => setExtractedData({ latitude: lat.toString(), longitude: lng.toString() })} 
      />
    </section>
  );
}