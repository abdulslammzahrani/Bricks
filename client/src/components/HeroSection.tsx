import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, Check, Users, Building2, 
  Eye, FileText, Activity, TrendingUp, MessageCircle, 
  Layers, UserPlus, Briefcase, Search 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
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

// --- Live Ticker Component ---
const LIVE_EVENTS = [
  { text: "فهد من الرياض يبحث عن فيلا", type: "search" },
  { text: "تمت إضافة عقار جديد في حي الملقا", type: "list" },
  { text: "سارة بدأت محادثة مع بائع في جدة", type: "chat" },
  { text: "تم توثيق صفقة بيع في الدمام", type: "deal" },
  { text: "عبدالله مهتم بأرض في مكة", type: "interest" },
  { text: "تم إغلاق جولة استثمارية لعمارة تجارية", type: "investment" },
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
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-slate-100 font-sans">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{LIVE_EVENTS[index].text}</span>
      </div>
    </div>
  );
}

export default function HeroSection({ onCompleteChange }: HeroSectionProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<UserMode>("buyer");
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [shuffledExamples, setShuffledExamples] = useState<Example[]>(() => getShuffledExamples("buyer"));
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [mapMarkers, setMapMarkers] = useState<Array<{city: string; lat: number; lng: number}>>([]);

  // --- Statistics ---
  const [liveViewers, setLiveViewers] = useState(0);
  const [requestsToday, setRequestsToday] = useState(0);
  const [dealsToday, setDealsToday] = useState(0);
  const [investmentDeals, setInvestmentDeals] = useState(0);
  const [activeChats, setActiveChats] = useState(0); 
  const [matchesFound, setMatchesFound] = useState(0); 
  const [interestedClients, setInterestedClients] = useState(0); 

  const [animatingStat, setAnimatingStat] = useState<string | null>(null);

  const fetchStats = async () => {
    const randomFlux = (base: number, variance: number) => base + Math.floor(Math.random() * variance);

    const newViewers = randomFlux(2400, 150);
    const newRequests = randomFlux(210, 15);
    const newDeals = randomFlux(12, 3);
    const newInvestments = randomFlux(5, 2);
    const newChats = randomFlux(85, 10);
    const newMatches = randomFlux(340, 20);
    const newInterests = randomFlux(120, 15);

    if (newViewers !== liveViewers) setAnimatingStat('viewers');
    else if (newRequests !== requestsToday) setAnimatingStat('requests');
    else if (newDeals !== dealsToday) setAnimatingStat('deals');
    else if (newInvestments !== investmentDeals) setAnimatingStat('investments');
    else if (newChats !== activeChats) setAnimatingStat('chats');
    else if (newMatches !== matchesFound) setAnimatingStat('matches');

    setTimeout(() => setAnimatingStat(null), 1000);

    setLiveViewers(newViewers);
    setRequestsToday(newRequests);
    setDealsToday(newDeals);
    setInvestmentDeals(newInvestments);
    setActiveChats(newChats);
    setMatchesFound(newMatches);
    setInterestedClients(newInterests);
  };

  useEffect(() => {
    fetchStats();
    const statsInterval = setInterval(fetchStats, 6000); 
    return () => clearInterval(statsInterval);
  }, []);

  const currentExample = shuffledExamples[exampleIndex % shuffledExamples.length];
  const fullExampleText = currentExample?.fullText || "";

  useEffect(() => {
    setExampleIndex(0);
    setMapMarkers([]);
    setShuffledExamples(getShuffledExamples(mode));
  }, [mode]);

  useEffect(() => {
    if (currentExample?.id) {
      markExampleViewed(mode, currentExample.id);
    }
  }, [currentExample?.id, mode]);

  useEffect(() => {
    const cityData = findCityInText(fullExampleText);
    if (cityData) {
      setMapMarkers([{
        city: cityData.city,
        lat: cityData.coordinates.lat,
        lng: cityData.coordinates.lng
      }]);
    } else {
      setMapMarkers([]);
    }
  }, [fullExampleText]);

  const sellerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/sellers/register", data);
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "تم يا بطل",
        description: "سجلنا عقارك وبنوصله للمشترين المناسبين",
      });
    },
    onError: () => {
      toast({
        title: "عذراً",
        description: "صار خطأ، جرب مرة ثانية",
        variant: "destructive",
      });
    },
  });

  const handleModeSwitch = useCallback((newMode: UserMode) => {
    setMode(newMode);
    setUploadedFiles([]);
    setIsComplete(false);
    setExtractedData({});
    setShowSearchForm(newMode === "buyer");
  }, []);

  const handleSearchFormSearch = useCallback((filters: any) => {
    toast({
      title: "تم استلام طلبك",
      description: "سنتواصل معك قريباً عند توفر عقار مناسب",
    });
    setShowSearchForm(false);
    setIsComplete(true);
    onCompleteChange?.(true);
  }, [toast, onCompleteChange]);

  const handleListPropertySubmit = useCallback((propertyData: any) => {
    toast({
      title: "تم استلام طلبك",
      description: "سنتواصل معك قريباً لإكمال عرض عقارك",
    });
    setIsComplete(true);
    onCompleteChange?.(true);
  }, [toast, onCompleteChange]);

  const noOp = () => {};

  const statsList = [
    { id: 'viewers', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50', label: 'متصفح نشط', value: liveViewers },
    { id: 'requests', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', label: 'طلب جديد', value: requestsToday },
    { id: 'deals', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', label: 'صفقة مكتملة', value: dealsToday },
    { id: 'investments', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'صفقة استثمارية', value: investmentDeals },
    { id: 'matches', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', label: 'عقار مطابق', value: matchesFound },
    { id: 'interests', icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50', label: 'اهتمام جديد', value: interestedClients },
    { id: 'chats', icon: MessageCircle, color: 'text-teal-600', bg: 'bg-teal-50', label: 'محادثة جارية', value: activeChats },
  ];

  return (
    <section className={`relative min-h-screen bg-slate-50 flex flex-col font-sans ${isComplete ? 'pb-0' : 'pb-12'}`}>

      {/* 1. Header Section - يظهر دائماً */}
      <div className="container mx-auto px-4 pt-8 pb-4 text-center z-10 relative shrink-0">
        <div className="absolute top-4 right-4 hidden md:block">
           <LiveTicker />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>منصة ذكية للعقارات</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3 text-slate-900 font-sans">
          {mode === "buyer" ? "ابحث عن عقارك المثالي" : "اعرض عقارك للبيع"}
        </h1>

        <p className="text-slate-600 text-sm md:text-lg max-w-2xl mx-auto font-sans">
          {mode === "buyer" 
            ? "أخبرنا ماذا تبحث عنه وسنجد لك الأفضل"
            : "سجّل بيانات عقارك وسنوصله للمشترين المناسبين"
          }
        </p>
      </div>

      {/* ======================================================== */}
      {/* 2. Map & Ticker - يظهر فقط في البداية (قبل الطلب) */}
      {/* ======================================================== */}
      {!isComplete && (
        <>
          {/* Mobile Ticker */}
          <div className="w-full md:hidden bg-white border-y border-slate-100 py-2 mb-0 z-20 shrink-0">
              <div className="flex gap-2 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex-shrink-0 h-9">
                      <Activity className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap font-sans">نبض السوق</span>
                  </div>
                  {statsList.map((stat) => (
                    <div key={stat.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex-shrink-0 h-9">
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color} ${animatingStat === stat.id ? 'scale-125 transition-transform duration-300' : ''}`} />
                      <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-900 font-sans">{stat.value.toLocaleString('ar-EG')}</span>
                          <span className="text-[9px] font-medium text-slate-500 whitespace-nowrap font-sans">{stat.label}</span>
                      </div>
                    </div>
                  ))}
              </div>
          </div>

          {/* Map */}
          <div className="relative w-full h-[500px] md:h-[650px] bg-slate-100 border-b border-slate-200 shadow-inner overflow-hidden group shrink-0">
            <SaudiMap markers={mapMarkers} className="w-full h-full" />
            <div className="absolute top-4 left-4 z-20 hidden md:block">
              <div className="bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/60 rounded-2xl p-4 min-w-[240px] transition-transform hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-800 font-sans">نبض السوق الآن</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {statsList.map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${stat.bg} ${stat.color}`}>
                          <stat.icon className={`h-3.5 w-3.5 ${animatingStat === stat.id ? 'scale-125 transition-transform' : ''}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 font-sans">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 font-sans">{stat.value.toLocaleString('ar-EG')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 3. Form & Success Section - تتوسط الشاشة عند النجاح */}
      {/* ======================================================== */}
      <div className={`container mx-auto px-4 relative z-20 ${!isComplete ? '-mt-20' : 'flex-1 flex flex-col justify-center items-center py-10'}`}>

        <Card className={`w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm p-2 md:p-4 ${isComplete ? 'shadow-none bg-transparent' : ''}`}>

          {/* Mode Toggle - Hidden when complete */}
          {!isComplete && (
            <div className="flex justify-center mb-6 pt-2">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                <Button
                  size="sm"
                  variant={mode === "buyer" ? "default" : "ghost"}
                  onClick={() => handleModeSwitch("buyer")}
                  className={`w-32 rounded-lg ${mode === 'buyer' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Users className="h-4 w-4 ml-2" />
                  مشتري
                </Button>
                <Button
                  size="sm"
                  variant={mode === "seller" ? "default" : "ghost"}
                  onClick={() => handleModeSwitch("seller")}
                  className={`w-32 rounded-lg ${mode === 'seller' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Building2 className="h-4 w-4 ml-2" />
                  بائع
                </Button>
              </div>
            </div>
          )}

          <div className="px-2 pb-4 w-full">
            {isComplete ? (
               // ✅ هذا القسم الآن يظهر في المنتصف بالضبط وبدون خلفية كارد بيضاء إضافية
               <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <style>{`
                      @keyframes scan { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                      @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
                      .radar-sweep { background: conic-gradient(from 0deg at 50% 50%, rgba(34, 197, 94, 0) 0deg, rgba(34, 197, 94, 0.1) 200deg, rgba(34, 197, 94, 0.6) 360deg); animation: scan 3s linear infinite; }
                      .radar-ring { border: 2px solid rgba(34, 197, 94, 0.4); animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                  `}</style>

                  {/* بطاقة الرادار */}
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center w-full max-w-md">
                      <div className="relative flex items-center justify-center w-36 h-36 mb-8">
                          <div className="absolute inset-0 border border-green-100 rounded-full"></div>
                          <div className="absolute inset-4 border border-green-200 rounded-full"></div>
                          <div className="absolute inset-1 rounded-full overflow-hidden z-10"><div className="radar-sweep absolute inset-0 rounded-full"></div></div>
                          <div className="absolute inset-0 rounded-full radar-ring"></div>
                          <div className="absolute inset-0 rounded-full radar-ring" style={{ animationDelay: '1s' }}></div>
                          <div className="relative z-20 w-5 h-5 bg-green-600 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
                          <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-sm z-30 animate-bounce"><Search className="h-4 w-4 text-green-600" /></div>
                      </div>

                      <h3 className="text-2xl font-bold mb-3 text-center text-slate-900 font-sans animate-pulse">جاري البحث عن عقارك...</h3>
                      <p className="text-slate-600 text-center text-sm mb-8 font-sans leading-relaxed">نظامنا الذكي يقوم الآن بمسح السوق ومطابقة طلبك مع أفضل الفرص المتاحة حالياً.</p>

                      <div className="flex gap-3 w-full flex-col">
                        <Button onClick={() => window.location.href = "/profile"} className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-base shadow-md transition-transform hover:scale-[1.02]">الذهاب لصفحتي</Button>
                        <Button variant="outline" onClick={() => { setIsComplete(false); setShowSearchForm(true); onCompleteChange?.(false); }} className="w-full h-11 text-base hover:bg-slate-50 border-slate-300">عودة للرئيسية</Button>
                      </div>
                  </div>
              </div>
            ) : (
              <>
                {mode === "buyer" && showSearchForm && (
                  <AdvancedSearchForm onSearch={handleSearchFormSearch} onSwitchToChat={noOp} />
                )}
                {mode === "seller" && (
                  <ListPropertyForm onSubmit={handleListPropertySubmit} onSwitchToChat={noOp} />
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      <LocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        onLocationSelect={(lat, lng) => {
          setExtractedData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
        }}
      />
    </section>
  );
}