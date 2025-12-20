import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Sparkles, Check, Users, FileText, Handshake, Brain, Eye, Zap, ArrowRight, Image, X, MapPin, MessageCircle, Send } from "lucide-react";
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

export default function HeroSection() {
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

  // Live counters
  const [liveViewers, setLiveViewers] = useState(0);
  const [requestsToday, setRequestsToday] = useState(0);
  const [dealsToday, setDealsToday] = useState(0);

  // Animation states
  const [viewersAnimating, setViewersAnimating] = useState(false);
  const [requestsAnimating, setRequestsAnimating] = useState(false);
  const [dealsAnimating, setDealsAnimating] = useState(false);
  const prevViewersRef = useRef(0);
  const prevRequestsRef = useRef(0);
  const prevDealsRef = useRef(0);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/daily');
      if (response.ok) {
        const data = await response.json();

        if (data.viewers !== prevViewersRef.current && prevViewersRef.current !== 0) {
          setViewersAnimating(true);
          setTimeout(() => setViewersAnimating(false), 600);
        }
        if (data.requests !== prevRequestsRef.current && prevRequestsRef.current !== 0) {
          setRequestsAnimating(true);
          setTimeout(() => setRequestsAnimating(false), 600);
        }
        if (data.deals !== prevDealsRef.current && prevDealsRef.current !== 0) {
          setDealsAnimating(true);
          setTimeout(() => setDealsAnimating(false), 600);
        }

        prevViewersRef.current = data.viewers;
        prevRequestsRef.current = data.requests;
        prevDealsRef.current = data.deals;

        setLiveViewers(data.viewers);
        setRequestsToday(data.requests);
        setDealsToday(data.deals);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const statsInterval = setInterval(fetchStats, 10000);
    return () => clearInterval(statsInterval);
  }, []);

  const currentExample = shuffledExamples[exampleIndex % shuffledExamples.length];
  const exampleSegments = currentExample?.segments || [];
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

  const handleExampleComplete = useCallback(() => {
    setExampleIndex(prev => prev + 1);
  }, []);

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
  }, [toast]);

  const handleListPropertySubmit = useCallback((propertyData: any) => {
    toast({
      title: "تم استلام طلبك",
      description: "سنتواصل معك قريباً لإكمال عرض عقارك",
    });
    setIsComplete(true);
  }, [toast]);

  const addSuggestion = (suggestion: string) => {};

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-6 md:py-8">

          {/* Header Section */}
          <div className="max-w-xl mx-auto text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>منصة ذكية للعقارات</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2" data-testid="text-hero-title">
              {mode === "buyer" ? "ابحث عن عقارك المثالي" : "اعرض عقارك للبيع"}
            </h1>

            <p className="text-muted-foreground text-sm" data-testid="text-hero-description">
              {mode === "buyer" 
                ? "أخبرنا ماذا تبحث عنه وسنجد لك الأفضل"
                : "سجّل بيانات عقارك وسنوصله للمشترين المناسبين"
              }
            </p>
          </div>

          {/* Main Card - ✅ التعديل الأساسي هنا: تم توسيع الكارد في الشاشات الكبيرة */}
          <Card className="w-full max-w-lg md:max-w-6xl mx-auto shadow-xl border">
            {isComplete ? (
              <div className="p-6 flex flex-col items-center justify-center h-auto w-full animate-in fade-in zoom-in duration-300">
                {/* ... (نفس محتوى النجاح لم يتغير) ... */}
                <div className="w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-center">
                  {mode === "buyer" ? "تم تسجيل رغبتك بنجاح!" : "تم تسجيل عقارك بنجاح!"}
                </h3>
                <div className="relative w-full max-w-md bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 mt-2 overflow-hidden">
                  <div className="absolute top-0 left-0 h-0.5 bg-primary/50 w-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
                  <div className="flex flex-col items-center justify-center gap-3 mb-2 relative z-10">
                    <div className="relative flex items-center justify-center w-10 h-10">
                      <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping opacity-75"></div>
                      <div className="relative w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center z-10 border border-primary/30">
                        <Brain className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-primary text-sm animate-pulse mb-1">
                        جارٍ البحث والمطابقة الذكية...
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {mode === "buyer" 
                          ? "يقوم نظامنا الآن بمسح آلاف العقارات لإيجاد الفرصة الأنسب لك"
                          : "نقوم الآن بتحليل طلبات المشترين النشطين لمطابقتها مع عقارك"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <p className="text-xs text-muted-foreground">
                    سيتم تحويلك إلى صفحتك الرئيسية لمتابعة طلباتك
                  </p>
                </div>
                <div className="w-full max-w-sm flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    onClick={() => window.location.href = "/profile"}
                    className="w-full gap-2 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                    data-testid="button-go-profile"
                  >
                    <ArrowRight className="h-5 w-5" />
                    الدخول لصفحتي الشخصية
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => {
                      setIsComplete(false);
                      setExtractedData({});
                      setUploadedFiles([]);
                      setShowSearchForm(true);
                    }}
                    className="w-full text-sm font-medium border-2 hover:bg-gray-50 transition-colors"
                    data-testid="button-add-another"
                  >
                    {mode === "buyer" ? "إضافة رغبة أخرى" : "إضافة عقار آخر"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Map Section */}
                {(mode === "buyer" || mode === "seller") && (
                  <div className="bg-muted/20 p-3 pb-3">
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 border border-border/30">
                        <Eye className={`h-3 w-3 text-blue-500 transition-transform duration-500 ${viewersAnimating ? 'scale-150' : ''}`} />
                        <span className={`font-bold text-[10px] text-foreground transition-all duration-500 ${viewersAnimating ? 'scale-125 text-blue-600' : ''}`}>
                          {liveViewers.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-[9px] text-muted-foreground">يتصفحون</span>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 border border-border/30">
                        <FileText className={`h-3 w-3 text-amber-500 transition-transform duration-500 ${requestsAnimating ? 'scale-150' : ''}`} />
                        <span className={`font-bold text-[10px] text-foreground transition-all duration-500 ${requestsAnimating ? 'scale-125 text-amber-600' : ''}`}>
                          {requestsToday.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-[9px] text-muted-foreground">طلب</span>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 border border-border/30">
                        <Handshake className={`h-3 w-3 text-green-500 transition-transform duration-500 ${dealsAnimating ? 'scale-150' : ''}`} />
                        <span className={`font-bold text-[10px] text-foreground transition-all duration-500 ${dealsAnimating ? 'scale-125 text-green-600' : ''}`}>
                          {dealsToday.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-[9px] text-muted-foreground">صفقة</span>
                      </div>
                    </div>

                    {/* ✅✅✅ الخريطة الآن كبيرة وتأخذ المساحة الكاملة في الديسكتوب ✅✅✅ */}
                    <div 
                      className="h-[500px] md:h-[750px] rounded-lg overflow-hidden border border-border/30 shadow-sm"
                    >
                      <SaudiMap 
                        markers={mapMarkers} 
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Smart Matching Header & Mode Toggle */}
                <div className="p-3 border-t bg-background">
                  <div className="text-center mb-2">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Brain className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-base">المطابقة الذكية</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {mode === "buyer" 
                        ? "أضف طلبك الآن ودع نظامنا الذكي يجلب لك العروض المطابقة"
                        : "أضف عقارك الآن ودع نظامنا الذكي يجلب لك المشترين المناسبين"
                      }
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/30">
                      <Button
                        size="sm"
                        variant={mode === "buyer" ? "default" : "ghost"}
                        onClick={() => handleModeSwitch("buyer")}
                        className="gap-1.5 rounded-full px-3 h-8 text-[11px]"
                        data-testid="button-mode-buyer"
                      >
                        <Users className="h-3 w-3" />
                        أبحث عن عقار
                      </Button>
                      <Button
                        size="sm"
                        variant={mode === "seller" ? "default" : "ghost"}
                        onClick={() => handleModeSwitch("seller")}
                        className="gap-1.5 rounded-full px-3 h-8 text-[11px]"
                        data-testid="button-mode-seller"
                      >
                        <Building2 className="h-3 w-3" />
                        اعرض عقارك
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Forms - محددة بعرض مناسب عشان ما تمط بشكل قبيح داخل الكارد العريض */}
                <div className="max-w-xl mx-auto">
                  {mode === "buyer" && showSearchForm && (
                    <div>
                      <AdvancedSearchForm onSearch={handleSearchFormSearch} />
                    </div>
                  )}

                  {mode === "seller" && (
                    <div>
                      <ListPropertyForm onSubmit={handleListPropertySubmit} />
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Location Picker Modal */}
          <LocationPicker
            open={showLocationPicker}
            onOpenChange={setShowLocationPicker}
            onLocationSelect={(lat, lng) => {
              setExtractedData(prev => ({
                ...prev,
                latitude: lat.toString(),
                longitude: lng.toString()
              }));
            }}
          />
        </div>
      </section>
    </>
  );
}