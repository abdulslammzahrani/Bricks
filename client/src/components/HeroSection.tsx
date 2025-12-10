import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Send, Sparkles, Check, Users, Image, X, MapPin, TrendingUp, Brain, Eye, Zap, ArrowRight, Mic, MicOff, Loader2, ArrowDown, FileText, Handshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUploadButton } from "./FileUploadButton";
import { LocationPicker } from "./LocationPicker";
import { SaudiMap } from "./SaudiMap";
import { findCityInText } from "@shared/saudi-locations";
import { getShuffledExamples, markExampleViewed, type Example } from "@/data/examples";
import { useLocation } from "wouter";
import { ReliabilityScore, calculateReliabilityScore, getMissingFieldsForScore } from "./ReliabilityScore";

interface AIAnalysisResult {
  success: boolean;
  role: "buyer" | "seller" | "investor" | null;
  intent: "question" | "data" | "greeting" | "other";
  assistantReply: string | null;
  data: {
    name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    districts: string[];
    propertyType: string | null;
    transactionType: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    paymentMethod: string | null;
    purchasePurpose: string | null;
    purchaseTimeline: string | null;
    clientType: string | null;
    area: number | null;
    rooms: number | null;
    floor: number | null;
    additionalNotes: string | null;
  };
  confidence: number;
  classificationTags: string[];
  missingFields: string[];
}

type UserMode = "buyer" | "seller" | "investor";

// Helper function for friendly Saudi-style messages
type MessageType = "greeting" | "missingInfo" | "confirmation" | "success" | "modeSwitch";

const formatFriendlyMessage = (
  type: MessageType,
  mode: UserMode,
  name?: string,
  missingFields?: string[]
): string => {
  // Get first name only for more personal greeting
  const firstName = name ? name.split(" ")[0] : "";
  const greeting = firstName ? `يا ${firstName}` : "يا غالي";
  
  switch (type) {
    case "greeting":
      return firstName 
        ? `حياك الله ${greeting}، وش أقدر أساعدك فيه اليوم؟`
        : `حياك الله، وش أقدر أساعدك فيه اليوم؟`;
    
    case "missingInfo":
      const fieldsList = missingFields?.join(" و ") || "";
      if (mode === "buyer") {
        return firstName
          ? `طيب ${greeting}، عشان أقدر أبحث لك العقار المناسب، أحتاج منك ${fieldsList}`
          : `طيب يا غالي، عشان أبحث لك العقار المناسب، أحتاج منك ${fieldsList}`;
      } else if (mode === "seller") {
        return firstName
          ? `تمام ${greeting}، عشان أوصّل عقارك للمشترين المناسبين، باقي عندي ${fieldsList}`
          : `تمام يا غالي، عشان أوصّل عقارك للمشترين المناسبين، باقي عندي ${fieldsList}`;
      } else {
        return firstName
          ? `حلو ${greeting}، عشان أرسل لك أفضل الفرص الاستثمارية، أحتاج منك ${fieldsList}`
          : `حلو يا غالي، عشان أرسل لك أفضل الفرص الاستثمارية، أحتاج منك ${fieldsList}`;
      }
    
    case "confirmation":
      return firstName
        ? `تمام ${greeting}، راجع البيانات وإذا كل شي صحيح قل لي "موافق"`
        : `تمام، راجع البيانات وإذا كل شي صحيح قل لي "موافق"`;
    
    case "success":
      if (mode === "buyer") {
        return firstName
          ? `تم ${greeting}، سجلنا طلبك وإن شاء الله أول ما نلقى عقار يناسبك بنتواصل معك`
          : `تم يا غالي، سجلنا طلبك وإن شاء الله أول ما نلقى عقار يناسبك بنتواصل معك`;
      } else if (mode === "seller") {
        return firstName
          ? `تم ${greeting}، سجلنا عقارك وإن شاء الله أول ما نلقى مشتري مناسب بنتواصل معك`
          : `تم يا غالي، سجلنا عقارك وإن شاء الله أول ما نلقى مشتري مناسب بنتواصل معك`;
      } else {
        return firstName
          ? `تم ${greeting}، سجلنا اهتمامك وإن شاء الله أول ما تطلع فرصة استثمارية مناسبة بنتواصل معك`
          : `تم يا غالي، سجلنا اهتمامك وإن شاء الله أول ما تطلع فرصة استثمارية مناسبة بنتواصل معك`;
      }
    
    case "modeSwitch":
      return `يبدو أنك تبي تعرض عقار للبيع، تبيني أحولك لوضع البائع؟`;
    
    default:
      return "";
  }
};

export default function HeroSection() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<UserMode>("buyer");
  const [inputText, setInputText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [conversation, setConversation] = useState<Array<{type: "user" | "system", text: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMicTooltip, setShowMicTooltip] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, string>>({});
  const [confirmationFields, setConfirmationFields] = useState<Array<{label: string, value: string, isCheck?: boolean}>>([]);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [shuffledExamples, setShuffledExamples] = useState<Example[]>(() => getShuffledExamples("buyer"));
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<Array<{city: string; lat: number; lng: number}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
    
  // Live counters for social proof (herd effect) - synced from server
  const [liveViewers, setLiveViewers] = useState(0);
  const [requestsToday, setRequestsToday] = useState(0);
  const [dealsToday, setDealsToday] = useState(0);
  
  // Animation states for counter changes
  const [viewersAnimating, setViewersAnimating] = useState(false);
  const [requestsAnimating, setRequestsAnimating] = useState(false);
  const [dealsAnimating, setDealsAnimating] = useState(false);
  const prevViewersRef = useRef(0);
  const prevRequestsRef = useRef(0);
  const prevDealsRef = useRef(0);
  
  // Fetch stats from server (same for all users)
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/daily');
      if (response.ok) {
        const data = await response.json();
        
        // Trigger animations if values changed
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
  
  // Initialize and poll stats from server
  useEffect(() => {
    // Fetch immediately
    fetchStats();
    
    // Poll every 10 seconds (server handles deterministic calculation)
    const statsInterval = setInterval(fetchStats, 10000);
    
    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  // Track if user initiated a send (to know when to refocus)
  const userSentMessage = useRef(false);
  
  // Auto-scroll to bottom when conversation updates - NO auto-focus (causes keyboard issues on mobile)
  useEffect(() => {
    // Scroll to bottom after each new message
    if (messagesEndRef.current && (conversation.length > 0 || isTyping)) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 50);
    }
    
    // Only refocus if user manually sent a message (not on AI response)
    if (userSentMessage.current && !isTyping && isFullScreenChat && !isComplete) {
      userSentMessage.current = false;
      // Delay focus to let keyboard settle
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 150);
    }
  }, [conversation, isTyping, isFullScreenChat, isComplete]);

  // Set --vh variable for iOS viewport height fix
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    // Also update on orientation change
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  // Lock body scroll when fullscreen chat is active - using overflow only (not position:fixed which breaks keyboard)
  useEffect(() => {
    if (isFullScreenChat) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isFullScreenChat]);

  
  // Get current example based on index from shuffled examples
  const currentExample = shuffledExamples[exampleIndex % shuffledExamples.length];
  const exampleSegments = currentExample?.segments || [];
  const fullExampleText = currentExample?.fullText || "";
  
  // No interval needed - rotation happens after typewriter finishes + 3 second delay
  
  // Reset example index and get new shuffled examples when mode changes
  useEffect(() => {
    setExampleIndex(0);
    setCharIndex(0);
    setMapMarkers([]);
    setShuffledExamples(getShuffledExamples(mode));
  }, [mode]);
  
  // Mark current example as viewed when it's shown
  useEffect(() => {
    if (currentExample?.id) {
      markExampleViewed(mode, currentExample.id);
    }
  }, [currentExample?.id, mode]);
  
  // Update map markers when example changes
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
  
  // Add mic hint as a message after first AI response
  useEffect(() => {
    if (conversation.length === 2 && !showMicTooltip) {
      // Mark that we've shown the hint
      setShowMicTooltip(true);
      // Add mic hint as a system message after a short delay
      const timer = setTimeout(() => {
        setConversation(prev => [
          ...prev,
          { type: "system", text: "💡 تقدر تسجل طلبك صوتياً بالضغط على زر المايكروفون وبنحلله لك فوراً!" }
        ]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [conversation.length, showMicTooltip]);

  const buyerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/buyers/register", data);
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "تم يا بطل",
        description: "سجلنا طلبك وإن شاء الله بنتواصل معك قريب",
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

  const investorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/investors/register", data);
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "تم يا بطل",
        description: "سجلنا اهتمامك وبنرسل لك أفضل الفرص الاستثمارية",
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

  const aiAnalysisMutation = useMutation({
    mutationFn: async ({ text, context }: { text: string; context?: Record<string, any> }): Promise<AIAnalysisResult> => {
      const res = await apiRequest("POST", "/api/intake/analyze", { text, context });
      return res.json();
    },
  });

  // Typewriter effect - types then waits 3 seconds before next example
  useEffect(() => {
    const totalLength = exampleSegments.reduce((acc, seg) => acc + seg.text.length, 0);
    if (charIndex < totalLength) {
      // Still typing - advance one character every 50ms
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Finished typing - wait 3 seconds then go to next example
      const timer = setTimeout(() => {
        setExampleIndex(prev => prev + 1);
        setCharIndex(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, exampleSegments]);

  const handleModeSwitch = (newMode: UserMode) => {
    setMode(newMode);
    setCharIndex(0);
    setInputText("");
    setUploadedFiles([]);
    setConversation([]);
    setIsComplete(false);
    setExtractedData({});
  };

  const renderTypedText = () => {
    let currentPos = 0;
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < exampleSegments.length; i++) {
      const segment = exampleSegments[i];
      const segmentStart = currentPos;
      const segmentEnd = currentPos + segment.text.length;
      
      if (charIndex > segmentStart) {
        const visibleLength = Math.min(charIndex - segmentStart, segment.text.length);
        const visibleText = segment.text.substring(0, visibleLength);
        
        elements.push(
          <span 
            key={i}
            style={{
              color: segment.color || "inherit",
              textDecoration: segment.underline ? "underline" : "none",
              textUnderlineOffset: "4px",
              fontWeight: segment.color ? "bold" : "normal",
            }}
          >
            {visibleText}
          </span>
        );
      }
      
      currentPos = segmentEnd;
    }
    
    return elements;
  };

  const extractAdditionalNotes = (text: string, matchedPatterns: RegExp[]) => {
    let remaining = text;
    matchedPatterns.forEach(pattern => {
      remaining = remaining.replace(pattern, "");
    });
    remaining = remaining.replace(/[،,\s]+/g, " ").trim();
    if (remaining.length > 3) {
      return remaining;
    }
    return "";
  };

  // Convert Arabic numerals to English
  const arabicToEnglish = (str: string): string => {
    const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
    return str.replace(/[٠-٩]/g, d => String(arabicNumerals.indexOf(d)));
  };

  // Real-time extraction for live preview
  const extractLiveData = (text: string): { found: { key: string; value: string }[]; missing: string[] } => {
    const foundMap: Record<string, string> = {};
    const requiredFields = mode === "buyer" 
      ? ["الاسم", "رقم الجوال", "المدينة", "الحي", "نوع العقار", "الميزانية", "طريقة الدفع", "توقيت الشراء"]
      : mode === "seller"
      ? ["الاسم", "رقم الجوال", "المدينة", "الحي", "نوع العقار"]
      : ["الاسم", "رقم الجوال", "المدينة", "نوع الاستثمار"];
    
    // Normalize text - convert Arabic numbers to English for matching
    const normalizedText = arabicToEnglish(text);
    
    // Extract name - matches Arabic names (2-4 words starting text or after specific keywords)
    const namePatterns = [
      /^([أ-ي]{2,}(?:\s+[أ-ي]{2,}){0,3})/,
      /(?:اسمي|انا|أنا)\s+([أ-ي]{2,}(?:\s+[أ-ي]{2,}){0,3})/i
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        foundMap["الاسم"] = match[1].trim();
        break;
      }
    }
    
    // Extract phone - support both Arabic and English numerals
    const phoneMatch = normalizedText.match(/(05\d{8})/);
    if (phoneMatch) {
      foundMap["رقم الجوال"] = phoneMatch[1];
    }
    
    // Extract city
    const cities = ["الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها", "القصيم", "الأحساء", "نجران", "جازان", "ينبع", "حائل", "الجبيل", "بريدة", "خميس مشيط", "الظهران", "القطيف"];
    for (const city of cities) {
      if (text.includes(city)) {
        foundMap["المدينة"] = city;
        break;
      }
    }
    
    // Extract district/neighborhood - common districts
    const commonDistricts = ["الصفا", "النزهة", "العليا", "الملز", "السليمانية", "الروضة", "النسيم", "الشفا", "العزيزية", "الحمراء", "المروج", "الياسمين", "الرمال", "النخيل", "الورود", "الفيحاء", "السلامة", "الربوة", "المرسلات", "الفيصلية", "الخالدية", "البوادي", "الزهراء", "السامر", "المحمدية", "الشاطئ", "الكورنيش", "الروابي", "اشبيليا", "غرناطة", "قرطبة", "الملقا", "حطين", "العارض", "النرجس", "طويق", "لبن", "السعادة", "الدار البيضاء"];
    
    // First try pattern matching
    const districtMatch = text.match(/(?:حي|منطقة)\s+([أ-ي\u0621-\u064A\s]{2,20}?)(?:\s|،|$)/i);
    if (districtMatch) {
      foundMap["الحي"] = districtMatch[1].trim();
    } else {
      // Then try direct match from common districts
      for (const district of commonDistricts) {
        if (text.includes(district)) {
          foundMap["الحي"] = district;
          break;
        }
      }
    }
    
    // Extract property type
    const propertyTypes = ["شقة", "فيلا", "دوبلكس", "أرض", "عمارة", "استوديو", "دور", "محل", "مكتب", "مستودع", "مزرعة"];
    for (const type of propertyTypes) {
      if (text.includes(type)) {
        foundMap["نوع العقار"] = type;
        foundMap["نوع الاستثمار"] = type;
        break;
      }
    }
    
    // Extract budget/price (for buyers)
    const budgetMatch = normalizedText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:ريال|الف|ألف|مليون)?/);
    if (budgetMatch) {
      let budget = budgetMatch[1].replace(/,/g, '');
      const fullMatch = normalizedText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(الف|ألف|مليون)?/);
      if (fullMatch && fullMatch[2]) {
        if (fullMatch[2] === "مليون") {
          budget = String(parseFloat(budget) * 1000000);
        } else if (fullMatch[2] === "الف" || fullMatch[2] === "ألف") {
          budget = String(parseFloat(budget) * 1000);
        }
      }
      foundMap["الميزانية"] = budget + " ريال";
    }
    
    // Extract payment method (cash or financing)
    if (text.includes("كاش") || text.includes("نقد") || text.includes("نقدي") || text.includes("نقداً")) {
      foundMap["طريقة الدفع"] = "كاش";
    } else if (text.includes("تمويل") || text.includes("بنك") || text.includes("قرض") || text.includes("أقساط") || text.includes("اقساط")) {
      foundMap["طريقة الدفع"] = "تمويل";
    }
    
    // Extract timeline/timing - comprehensive patterns
    const timelinePatterns = [
      // فوري/عاجل
      { pattern: /فور[يا]?|عاجل|سريع|الآن|الان|حالاً|حالا/, value: "فوري" },
      // خلال أسبوع
      { pattern: /خلال\s*(اسبوع|أسبوع)|بعد\s*(اسبوع|أسبوع)/, value: "خلال أسبوع" },
      // خلال شهر
      { pattern: /خلال\s*شهر|بعد\s*شهر/, value: "خلال شهر" },
      // شهرين
      { pattern: /خلال\s*شهرين|بعد\s*شهرين|ممكن\s*شهرين|شهرين/, value: "خلال شهرين" },
      // 3 أشهر
      { pattern: /خلال\s*(ثلاث[ة]?\s*[أا]شهر|٣\s*[أا]شهر|3\s*[أا]شهر)|بعد\s*(ثلاث[ة]?\s*[أا]شهر|٣\s*[أا]شهر|3\s*[أا]شهر)|من\s*شهرين\s*(الى|إلى|ل)\s*(٣|3|ثلاث)/, value: "خلال 3 أشهر" },
      // 6 أشهر
      { pattern: /خلال\s*(ست[ة]?\s*[أا]شهر|٦\s*[أا]شهر|6\s*[أا]شهر)|بعد\s*(ست[ة]?\s*[أا]شهر|٦\s*[أا]شهر|6\s*[أا]شهر)|نص\s*سنة|نصف\s*سنة/, value: "خلال 6 أشهر" },
      // خلال سنة
      { pattern: /خلال\s*سنة|خلال\s*عام|بعد\s*سنة|بعد\s*عام|هذا\s*العام|هذه\s*السنة/, value: "خلال سنة" },
      // أكثر من سنة
      { pattern: /بعد\s*(سنتين|عامين)|أكثر\s*من\s*سنة/, value: "أكثر من سنة" },
      // قريباً (عام)
      { pattern: /قريب/, value: "قريباً" },
    ];
    for (const { pattern, value } of timelinePatterns) {
      if (pattern.test(text)) {
        foundMap["توقيت الشراء"] = value;
        break;
      }
    }
    
    // Build found array in display order (only relevant fields for current mode)
    const found: { key: string; value: string }[] = [];
    for (const field of requiredFields) {
      if (foundMap[field]) {
        found.push({ key: field, value: foundMap[field] });
      }
    }
    
    // Calculate missing fields
    const missing = requiredFields.filter(field => !foundMap[field]);
    
    return { found, missing };
  };

  const extractBuyerInfo = (text: string) => {
    const data: Record<string, string> = { ...extractedData };
    const matchedPatterns: RegExp[] = [];
    
    const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    if (nameMatch) {
      data.name = nameMatch[1];
      matchedPatterns.push(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    }
    
    const phoneMatch = text.match(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    if (phoneMatch) {
      data.phone = phoneMatch[1];
      matchedPatterns.push(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    }
    
    const cityMatch = text.match(/(?:من|مدينة|في)\s+(الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)/i);
    if (cityMatch) {
      data.city = cityMatch[1];
      matchedPatterns.push(/(?:من|مدينة|في)\s+(الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)/i);
    }
    
    const districtMatch = text.match(/(?:حي|منطقة)\s+([^\s,،.]+)/i);
    if (districtMatch) {
      data.district = districtMatch[1];
      matchedPatterns.push(/(?:حي|منطقة)\s+([^\s,،.]+)/i);
    }
    
    const typeMatch = text.match(/(شقة|فيلا|دوبلكس|أرض|عمارة|استوديو)/i);
    if (typeMatch) {
      data.propertyType = typeMatch[1];
      matchedPatterns.push(/(شقة|فيلا|دوبلكس|أرض|عمارة|استوديو)/i);
    }
    
    const budgetMatch = text.match(/(?:الميزانية|ميزانيتي|بسعر|بمبلغ)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    if (budgetMatch) {
      let amount = parseFloat(budgetMatch[1]);
      if (budgetMatch[2]?.includes("مليون")) amount *= 1000000;
      else if (budgetMatch[2]) amount *= 1000;
      data.budget = amount.toString();
      matchedPatterns.push(/(?:الميزانية|ميزانيتي|بسعر|بمبلغ)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    }
    
    const paymentMatch = text.match(/(كاش|نقد|نقدي|بنك|تمويل|قرض)/i);
    if (paymentMatch) {
      data.paymentMethod = paymentMatch[1].match(/كاش|نقد|نقدي/i) ? "cash" : "bank";
      matchedPatterns.push(/(كاش|نقد|نقدي|بنك|تمويل|قرض)/i);
    }
    
    const additionalNotes = extractAdditionalNotes(text, matchedPatterns);
    if (additionalNotes) {
      data.additionalNotes = additionalNotes;
    }
    
    return data;
  };

  const extractSellerInfo = (text: string) => {
    const data: Record<string, string> = { ...extractedData };
    const matchedPatterns: RegExp[] = [];
    
    const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    if (nameMatch) {
      data.name = nameMatch[1];
      matchedPatterns.push(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    }
    
    const phoneMatch = text.match(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    if (phoneMatch) {
      data.phone = phoneMatch[1];
      matchedPatterns.push(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    }
    
    const cityMatch = text.match(/(?:في|مدينة)\s+(الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)/i);
    if (cityMatch) {
      data.city = cityMatch[1];
      matchedPatterns.push(/(?:في|مدينة)\s+(الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)/i);
    }
    
    const districtMatch = text.match(/(?:حي|منطقة)\s+([^\s,،.]+)/i);
    if (districtMatch) {
      data.district = districtMatch[1];
      matchedPatterns.push(/(?:حي|منطقة)\s+([^\s,،.]+)/i);
    }
    
    const typeMatch = text.match(/(?:أعرض|اعرض|لدي|عندي)?\s*(شقة|فيلا|دوبلكس|أرض|عمارة|استوديو)/i);
    if (typeMatch) {
      data.propertyType = typeMatch[1];
      matchedPatterns.push(/(?:أعرض|اعرض|لدي|عندي)?\s*(شقة|فيلا|دوبلكس|أرض|عمارة|استوديو)/i);
    }
    
    const priceMatch = text.match(/(?:السعر|بسعر|بمبلغ)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    if (priceMatch) {
      let amount = parseFloat(priceMatch[1]);
      if (priceMatch[2]?.includes("مليون")) amount *= 1000000;
      else if (priceMatch[2]) amount *= 1000;
      data.price = amount.toString();
      matchedPatterns.push(/(?:السعر|بسعر|بمبلغ)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    }
    
    const statusMatch = text.match(/(جاهز|جاهزة|تحت الإنشاء|قيد الإنشاء)/i);
    if (statusMatch) {
      data.status = statusMatch[1].includes("جاهز") ? "ready" : "under_construction";
      matchedPatterns.push(/(جاهز|جاهزة|تحت الإنشاء|قيد الإنشاء)/i);
    }
    
    // Extract coordinates from Google Maps link
    const mapsLinkMatch = text.match(/(?:maps\.google\.com|google\.com\/maps|goo\.gl\/maps)[^\s]*[?&@](-?\d+\.?\d*)[,/](-?\d+\.?\d*)/i);
    if (mapsLinkMatch) {
      data.latitude = mapsLinkMatch[1];
      data.longitude = mapsLinkMatch[2];
      matchedPatterns.push(/(?:maps\.google\.com|google\.com\/maps|goo\.gl\/maps)[^\s]*[?&@](-?\d+\.?\d*)[,/](-?\d+\.?\d*)/i);
    }
    
    // Extract coordinates from direct input (e.g., "24.7136, 46.6753" or "24.7136 46.6753")
    const coordMatch = text.match(/(-?\d{1,3}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/);
    if (coordMatch && !mapsLinkMatch) {
      data.latitude = coordMatch[1];
      data.longitude = coordMatch[2];
      matchedPatterns.push(/(-?\d{1,3}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/);
    }
    
    const additionalNotes = extractAdditionalNotes(text, matchedPatterns);
    if (additionalNotes) {
      data.additionalNotes = additionalNotes;
    }
    
    return data;
  };

  const extractInvestorInfo = (text: string) => {
    const data: Record<string, string> = { ...extractedData };
    const matchedPatterns: RegExp[] = [];
    
    const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    if (nameMatch) {
      data.name = nameMatch[1];
      matchedPatterns.push(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    }
    
    const phoneMatch = text.match(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    if (phoneMatch) {
      data.phone = phoneMatch[1];
      matchedPatterns.push(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    }
    
    // Extract multiple cities
    const citiesMatch = text.match(/(?:في|مدينة|مدن)\s+((?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)(?:\s*(?:و|،|,)\s*(?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل))*)/i);
    if (citiesMatch) {
      data.cities = citiesMatch[1];
      matchedPatterns.push(/(?:في|مدينة|مدن)\s+((?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)(?:\s*(?:و|،|,)\s*(?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل))*)/i);
    }
    
    // Extract investment types
    const investTypeMatch = text.match(/(تجاري|سكني|صناعي|أراضي|تجارية|سكنية|صناعية)/gi);
    if (investTypeMatch) {
      data.investmentTypes = investTypeMatch.join("، ");
      matchedPatterns.push(/(تجاري|سكني|صناعي|أراضي|تجارية|سكنية|صناعية)/gi);
    }
    
    // Extract budget range
    const budgetRangeMatch = text.match(/(?:الميزانية|ميزانيتي)?\s*(?:من)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?\s*(?:إلى|الى|ل|حتى|-)\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    if (budgetRangeMatch) {
      let minAmount = parseFloat(budgetRangeMatch[1]);
      if (budgetRangeMatch[2]?.includes("مليون")) minAmount *= 1000000;
      else if (budgetRangeMatch[2]) minAmount *= 1000;
      data.budgetMin = minAmount.toString();
      
      let maxAmount = parseFloat(budgetRangeMatch[3]);
      if (budgetRangeMatch[4]?.includes("مليون")) maxAmount *= 1000000;
      else if (budgetRangeMatch[4]) maxAmount *= 1000;
      data.budgetMax = maxAmount.toString();
      matchedPatterns.push(/(?:الميزانية|ميزانيتي)?\s*(?:من)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?\s*(?:إلى|الى|ل|حتى|-)\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    }
    
    // Extract return preference
    const returnMatch = text.match(/(عائد\s*(?:مرتفع|متوسط|منخفض)|المرتفع|المتوسط|المنخفض)/i);
    if (returnMatch) {
      data.returnPreference = returnMatch[1];
      matchedPatterns.push(/(عائد\s*(?:مرتفع|متوسط|منخفض)|المرتفع|المتوسط|المنخفض)/i);
    }
    
    const additionalNotes = extractAdditionalNotes(text, matchedPatterns);
    if (additionalNotes) {
      data.additionalNotes = additionalNotes;
    }
    
    return data;
  };

  const addSuggestion = (suggestion: string) => {
    const newText = inputText ? `${inputText} ${suggestion}` : suggestion;
    setInputText(newText);
  };

  const formatBudget = (amount: string) => {
    const num = parseInt(amount);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} مليون`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} ألف`;
    return amount;
  };

  // Generate confirmation fields - shows ALL data mentioned without missing anything
  const generateConfirmationFields = (data: Record<string, string>, currentMode: UserMode) => {
    if (currentMode === "buyer") {
      const fields = [
        // Required fields
        { label: "الاسم", value: data.name },
        { label: "الجوال", value: data.phone },
        data.email ? { label: "الإيميل", value: data.email } : null,
        { label: "المدينة", value: data.city },
        data.district ? { label: "الحي", value: data.district } : null,
        { label: "نوع العقار", value: data.propertyType },
        // Budget - show range if available
        (data.budgetMin && data.budgetMax) ? { label: "الميزانية", value: `من ${formatBudget(data.budgetMin)} إلى ${formatBudget(data.budgetMax)}` } : 
          (data.budgetMin ? { label: "الميزانية (من)", value: formatBudget(data.budgetMin) } : null),
        (data.budgetMax && !data.budgetMin) ? { label: "الميزانية (إلى)", value: formatBudget(data.budgetMax) } : null,
        data.budget && !data.budgetMin && !data.budgetMax ? { label: "الميزانية", value: formatBudget(data.budget) } : null,
        // Payment method
        data.paymentMethod ? { label: "طريقة الدفع", value: data.paymentMethod === "cash" ? "كاش" : data.paymentMethod === "mortgage" ? "تمويل بنكي" : data.paymentMethod } : null,
        // Timeline
        data.purchaseTimeline ? { label: "موعد الشراء", value: data.purchaseTimeline } : null,
        // Purpose
        data.purchasePurpose ? { label: "الغرض", value: data.purchasePurpose === "personal" ? "سكن شخصي" : data.purchasePurpose === "investment" ? "استثمار" : data.purchasePurpose } : null,
        // Client type
        data.clientType ? { label: "نوع العميل", value: data.clientType === "individual" ? "فرد" : data.clientType === "company" ? "شركة" : data.clientType } : null,
        // Property details
        data.rooms ? { label: "عدد الغرف", value: data.rooms } : null,
        data.bathrooms ? { label: "عدد دورات المياه", value: data.bathrooms } : null,
        data.area ? { label: "المساحة", value: `${data.area} م²` } : null,
        data.floor ? { label: "الطابق", value: data.floor } : null,
        data.age ? { label: "عمر العقار", value: data.age } : null,
        // Additional notes
        data.additionalNotes ? { label: "ملاحظات إضافية", value: data.additionalNotes } : null,
      ].filter(Boolean) as Array<{label: string, value: string}>;
      return fields;
    } else if (currentMode === "seller") {
      const fields = [
        { label: "الاسم", value: data.name },
        { label: "الجوال", value: data.phone },
        data.email ? { label: "الإيميل", value: data.email } : null,
        { label: "المدينة", value: data.city },
        { label: "الحي", value: data.district },
        { label: "نوع العقار", value: data.propertyType },
        { label: "السعر", value: formatBudget(data.price) },
        data.area ? { label: "المساحة", value: `${data.area} م²` } : null,
        data.rooms ? { label: "عدد الغرف", value: data.rooms } : null,
        data.bathrooms ? { label: "عدد دورات المياه", value: data.bathrooms } : null,
        data.floor ? { label: "الطابق", value: data.floor } : null,
        data.age ? { label: "عمر العقار", value: data.age } : null,
        data.status ? { label: "الحالة", value: data.status === "ready" ? "جاهز للسكن" : "تحت الإنشاء" } : null,
        data.features ? { label: "المميزات", value: data.features } : null,
        (data.latitude && data.longitude) ? { label: "الموقع", value: "تم تحديده", isCheck: true } : { label: "الموقع", value: "لم يتم تحديده" },
        uploadedFiles.length > 0 ? { label: "الصور", value: `تم رفع ${uploadedFiles.length} ملف`, isCheck: true } : { label: "الصور", value: "لم يتم رفع صور" },
        data.additionalNotes ? { label: "ملاحظات إضافية", value: data.additionalNotes } : null,
      ].filter(Boolean) as Array<{label: string, value: string, isCheck?: boolean}>;
      return fields;
    } else {
      // Investor mode
      const fields = [
        { label: "الاسم", value: data.name },
        { label: "الجوال", value: data.phone },
        data.email ? { label: "الإيميل", value: data.email } : null,
        { label: "المدن المستهدفة", value: data.cities },
        data.investmentTypes ? { label: "نوع الاستثمار", value: data.investmentTypes } : null,
        data.propertyType ? { label: "نوع العقار", value: data.propertyType } : null,
        (data.budgetMin && data.budgetMax) ? { label: "الميزانية", value: `من ${formatBudget(data.budgetMin)} إلى ${formatBudget(data.budgetMax)}` } : 
          (data.budgetMin ? { label: "الميزانية (من)", value: formatBudget(data.budgetMin) } : null),
        (data.budgetMax && !data.budgetMin) ? { label: "الميزانية (إلى)", value: formatBudget(data.budgetMax) } : null,
        data.returnPreference ? { label: "هدف الاستثمار", value: data.returnPreference } : null,
        data.clientType ? { label: "نوع العميل", value: data.clientType === "individual" ? "فرد" : data.clientType === "company" ? "شركة" : data.clientType } : null,
        data.additionalNotes ? { label: "ملاحظات إضافية", value: data.additionalNotes } : null,
      ].filter(Boolean) as Array<{label: string, value: string}>;
      return fields;
    }
  };

  const submitData = async (data: Record<string, string>) => {
    if (mode === "buyer") {
      // Use AI-extracted budgetMin/Max if available
      const budgetMinVal = data.budgetMin ? parseInt(data.budgetMin) : 0;
      const budgetMaxVal = data.budgetMax ? parseInt(data.budgetMax) : (data.budget ? parseInt(data.budget) : 0);
      
      try {
        // Use auto-register endpoint which creates user with password
        const response = await apiRequest("POST", "/api/auth/auto-register", {
          name: data.name,
          phone: data.phone,
          email: data.email || `${data.phone}@tatabuk.sa`,
          city: data.city,
          districts: data.district ? [data.district] : [],
          propertyType: data.propertyType === "شقة" ? "apartment" : data.propertyType === "فيلا" ? "villa" : data.propertyType === "أرض" ? "land" : "apartment",
          budgetMin: budgetMinVal,
          budgetMax: budgetMaxVal,
          paymentMethod: data.paymentMethod || "cash",
          transactionType: data.transactionType || "buy",
        });
        
        const result = await response.json();
        
        if (result.success && result.user) {
          // Session cookie is automatically set by the server
          // Show success message
          setConversation(prev => [
            ...prev,
            { type: "system", text: `تم تسجيل طلبك بنجاح يا ${data.name.split(" ")[0]}! رقم جوالك هو اسم المستخدم. جاري تحويلك لصفحتك الخاصة...` }
          ]);
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } catch (error: any) {
        console.error("Auto-register error:", error);
        toast({
          title: "خطأ في التسجيل",
          description: error.message || "حدث خطأ، حاول مرة ثانية",
          variant: "destructive",
        });
      }
    } else if (mode === "seller") {
      sellerMutation.mutate({
        name: data.name,
        email: `${data.phone}@temp.com`,
        phone: data.phone,
        city: data.city,
        district: data.district,
        propertyType: data.propertyType === "شقة" ? "apartment" : data.propertyType === "فيلا" ? "villa" : data.propertyType === "أرض" ? "land" : "apartment",
        price: parseInt(data.price),
        status: data.status || "ready",
        images: uploadedFiles,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      });
      setConversation(prev => [
        ...prev,
        { type: "system", text: formatFriendlyMessage("success", "seller", data.name) }
      ]);
    } else {
      investorMutation.mutate({
        name: data.name,
        email: `${data.phone}@temp.com`,
        phone: data.phone,
        cities: data.cities,
        investmentTypes: data.investmentTypes || "",
        budgetMin: parseInt(data.budgetMin || "0"),
        budgetMax: parseInt(data.budgetMax || "0"),
        returnPreference: data.returnPreference || "",
      });
      setConversation(prev => [
        ...prev,
        { type: "system", text: formatFriendlyMessage("success", "investor", data.name) }
      ]);
    }
    setPendingConfirmation(false);
    setPendingData({});
    setConfirmationFields([]);
  };

  const handleSubmit = async () => {
    const hasInput = inputText.trim().length > 0;
    const userText = inputText.trim();
    
    // Mark that user initiated this send (for refocus logic)
    userSentMessage.current = true;
    
    // Check if user is confirming
    if (pendingConfirmation && userText.includes("موافق")) {
      setConversation(prev => [
        ...prev,
        { type: "user", text: userText }
      ]);
      setInputText("");
      setIsTyping(true);
      setTimeout(() => {
        submitData(pendingData);
        setIsTyping(false);
      }, 500);
      return;
    }
    
    if (!hasInput) return;
    
    // Switch to fullscreen chat mode on first message
    if (!isFullScreenChat) {
      setIsFullScreenChat(true);
    }
    
    // Add user message to conversation
    setConversation(prev => [
      ...prev,
      { type: "user", text: inputText }
    ]);
    
    setInputText("");
    
    // Use AI analysis
    setIsAnalyzing(true);
    setIsTyping(true);
    
    try {
      // Build context from previously extracted data
      const context = {
        name: extractedData.name || undefined,
        phone: extractedData.phone || undefined,
        city: extractedData.city || undefined,
        districts: extractedData.district ? [extractedData.district] : undefined,
        propertyType: extractedData.propertyType || undefined,
        transactionType: extractedData.transactionType || undefined,
        budgetMin: extractedData.budgetMin ? parseInt(extractedData.budgetMin) : undefined,
        budgetMax: extractedData.budgetMax ? parseInt(extractedData.budgetMax) : undefined,
        paymentMethod: extractedData.paymentMethod || undefined,
        purchasePurpose: extractedData.purchasePurpose || undefined,
        purchaseTimeline: extractedData.purchaseTimeline || undefined,
        clientType: extractedData.clientType || undefined,
        area: extractedData.area ? parseInt(extractedData.area) : undefined,
        rooms: extractedData.rooms ? parseInt(extractedData.rooms) : undefined,
        role: mode,
      };
      
      const aiResult = await aiAnalysisMutation.mutateAsync({ text: userText, context });
      
      // Convert AI result to merged data format
      let mergedData = { ...extractedData };
      
      // Handle questions and greetings first
      if (aiResult && aiResult.success && (aiResult.intent === "question" || aiResult.intent === "greeting")) {
        if (aiResult.assistantReply) {
          setConversation(prev => [
            ...prev,
            { type: "system", text: aiResult.assistantReply! }
          ]);
        }
        // Still extract any data that might be in the message
        if (aiResult.data) {
          if (aiResult.data.name) mergedData.name = aiResult.data.name;
          if (aiResult.data.phone) mergedData.phone = aiResult.data.phone;
          if (aiResult.data.city) mergedData.city = aiResult.data.city;
          if (aiResult.data.districts && aiResult.data.districts.length > 0) {
            mergedData.district = aiResult.data.districts[0];
          }
          if (aiResult.data.propertyType) mergedData.propertyType = aiResult.data.propertyType;
          setExtractedData(mergedData);
        }
        setIsAnalyzing(false);
        setIsTyping(false);
        return; // Don't ask for missing fields after answering a question
      }
      
      // Handle case when AI analysis didn't succeed - fall back to regex
      if (!aiResult || !aiResult.success) {
        const newData = mode === "buyer" ? extractBuyerInfo(userText) : mode === "seller" ? extractSellerInfo(userText) : extractInvestorInfo(userText);
        Object.keys(newData).forEach(key => {
          if (newData[key]) {
            mergedData[key] = newData[key];
          }
        });
        setExtractedData(mergedData);
        setAiConfidence(50);
      } else {
        // Add AI assistant reply to conversation (for data intent)
        if (aiResult.assistantReply) {
          setConversation(prev => [
            ...prev,
            { type: "system", text: aiResult.assistantReply! }
          ]);
        }
        
        if (aiResult.data) {
          if (aiResult.data.name) mergedData.name = aiResult.data.name;
          if (aiResult.data.phone) mergedData.phone = aiResult.data.phone;
          if (aiResult.data.city) mergedData.city = aiResult.data.city;
          if (aiResult.data.districts && aiResult.data.districts.length > 0) {
            mergedData.district = aiResult.data.districts[0];
          }
          if (aiResult.data.propertyType) mergedData.propertyType = aiResult.data.propertyType;
          if (aiResult.data.transactionType) mergedData.transactionType = aiResult.data.transactionType;
          if (aiResult.data.budgetMax) mergedData.budget = aiResult.data.budgetMax.toString();
          if (aiResult.data.budgetMin) mergedData.budgetMin = aiResult.data.budgetMin.toString();
          if (aiResult.data.budgetMax) mergedData.budgetMax = aiResult.data.budgetMax.toString();
          if (aiResult.data.paymentMethod) mergedData.paymentMethod = aiResult.data.paymentMethod;
          if (aiResult.data.purchaseTimeline) mergedData.purchaseTimeline = aiResult.data.purchaseTimeline;
          if (aiResult.data.clientType) mergedData.clientType = aiResult.data.clientType;
          if (aiResult.data.additionalNotes) mergedData.additionalNotes = aiResult.data.additionalNotes;
          
          // For sellers
          if (aiResult.data.budgetMax && mode === "seller") {
            mergedData.price = aiResult.data.budgetMax.toString();
          }
          
          // Auto-detect role if not set
          if (aiResult.role && mode === "buyer" && aiResult.role !== "buyer") {
            // Suggest switching mode
            if (aiResult.role === "seller") {
              setConversation(prev => [
                ...prev,
                { type: "system", text: formatFriendlyMessage("modeSwitch", mode, mergedData.name) }
              ]);
            }
          }
          
          setAiConfidence(aiResult.confidence);
          setExtractedData(mergedData);
        }
      }
      
      // Check required fields based on mode - 6 fields required
      if (mode === "buyer") {
        // التحقق من اكتمال المؤشر 100% قبل التأكيد
        const reliabilityScore = calculateReliabilityScore({
          name: mergedData.name,
          phone: mergedData.phone,
          city: mergedData.city,
          districts: mergedData.district ? [mergedData.district] : (Array.isArray(mergedData.districts) ? mergedData.districts : []),
          propertyType: mergedData.propertyType,
          budgetMax: mergedData.budgetMax ? parseInt(mergedData.budgetMax) : (mergedData.budget ? parseInt(mergedData.budget) : null),
          paymentMethod: mergedData.paymentMethod,
          purchaseTimeline: mergedData.purchaseTimeline,
          area: mergedData.area ? parseInt(mergedData.area) : null,
          purchasePurpose: mergedData.purchasePurpose,
        });
        
        if (reliabilityScore >= 100) {
          // Show confirmation card only when score is 100%
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
          // Add confirmation message
          setConversation(prev => [
            ...prev,
            { type: "system", text: formatFriendlyMessage("confirmation", mode, mergedData.name) }
          ]);
        } else {
          // AI already asks follow-up questions, no need to add system message
          // The conversation continues naturally
        }
      } else if (mode === "seller") {
        // Required for seller: name, phone, city, district, propertyType, price, images, location
        const hasAllRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.district && 
          mergedData.propertyType && mergedData.price && uploadedFiles.length > 0 && 
          mergedData.latitude && mergedData.longitude;
        
        if (hasAllRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          // AI already asks follow-up questions, conversation continues naturally
        }
      } else {
        // Investor mode - use cities from AI
        if (aiResult?.data?.city) {
          mergedData.cities = aiResult.data.city;
        }
        // Required for investor: name, phone, cities, budget, clientType
        const hasAllRequired = mergedData.name && mergedData.phone && mergedData.cities &&
          (mergedData.budgetMin || mergedData.budgetMax) && mergedData.clientType;
        
        if (hasAllRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          // AI already asks follow-up questions, conversation continues naturally
        }
      }
    } catch (error) {
      // Fallback to regex extraction if AI fails
      let mergedData = { ...extractedData };
      const newData = mode === "buyer" ? extractBuyerInfo(userText) : mode === "seller" ? extractSellerInfo(userText) : extractInvestorInfo(userText);
      Object.keys(newData).forEach(key => {
        if (newData[key]) {
          mergedData[key] = newData[key];
        }
      });
      setExtractedData(mergedData);
      
      // Check core required fields (fallback mode) - use reliability score
      if (mode === "buyer") {
        const reliabilityScore = calculateReliabilityScore({
          name: mergedData.name,
          phone: mergedData.phone,
          city: mergedData.city,
          districts: mergedData.district ? [mergedData.district] : (Array.isArray(mergedData.districts) ? mergedData.districts : []),
          propertyType: mergedData.propertyType,
          budgetMax: mergedData.budgetMax ? parseInt(mergedData.budgetMax) : (mergedData.budget ? parseInt(mergedData.budget) : null),
          paymentMethod: mergedData.paymentMethod,
          purchaseTimeline: mergedData.purchaseTimeline,
          area: mergedData.area ? parseInt(mergedData.area) : null,
          purchasePurpose: mergedData.purchasePurpose,
        });
        
        if (reliabilityScore >= 100) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
          setConversation(prev => [
            ...prev,
            { type: "system", text: formatFriendlyMessage("confirmation", mode, mergedData.name) }
          ]);
        }
        // No else - conversation continues naturally
      } else if (mode === "seller") {
        const hasAllRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.district && 
          mergedData.propertyType && mergedData.price && uploadedFiles.length > 0 && 
          mergedData.latitude && mergedData.longitude;
        
        if (hasAllRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        }
        // No else - conversation continues naturally
      } else {
        const hasAllRequired = mergedData.name && mergedData.phone && mergedData.cities &&
          (mergedData.budgetMin || mergedData.budgetMax) && mergedData.clientType;
        
        if (hasAllRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        }
        // No else - conversation continues naturally
      }
    } finally {
      setIsAnalyzing(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Voice recording using Web Speech API - LIVE CONVERSATION MODE
  // Analyzes and asks questions while still recording!
  const startRecording = () => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "غير مدعوم",
        description: "متصفحك لا يدعم التسجيل الصوتي. جرب Chrome أو Edge.",
        variant: "destructive",
      });
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA"; // Arabic - Saudi Arabia
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let lastProcessedText = "";
    let processingTimeout: NodeJS.Timeout | null = null;
    
    recognition.onstart = () => {
      setIsRecording(true);
      setIsFullScreenChat(true);
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Show current text in input field
      const currentText = finalTranscript + interimTranscript;
      setInputText(currentText);
      
      // Auto-analyze when we have new final text (after pause in speech)
      if (finalTranscript.trim() && finalTranscript.trim() !== lastProcessedText) {
        // Clear any pending timeout
        if (processingTimeout) {
          clearTimeout(processingTimeout);
        }
        
        // Wait 1.5 seconds of no new speech before analyzing
        processingTimeout = setTimeout(() => {
          const textToProcess = finalTranscript.trim();
          if (textToProcess && textToProcess !== lastProcessedText && textToProcess.length > 5) {
            lastProcessedText = textToProcess;
            
            // Clear input and submit for analysis (keeps recording active!)
            setInputText("");
            
            // Submit for live analysis while still recording
            handleSubmitWithText(textToProcess);
          }
        }, 1500);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === "not-allowed") {
        setIsRecording(false);
        toast({
          title: "خطأ",
          description: "لم نتمكن من الوصول للميكروفون. تأكد من إعطاء الإذن.",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        // Don't stop on no-speech, just continue listening
        console.log("No speech detected, continuing...");
      } else if (event.error === "aborted") {
        // Ignore aborted errors
      }
    };
    
    recognition.onend = () => {
      // Auto-restart if still in recording mode (keeps conversation alive)
      if (isRecording) {
        try {
          recognition.start();
        } catch (e) {
          setIsRecording(false);
        }
      }
    };
    
    // Store recognition instance for stopping later
    (window as any).currentRecognition = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    const recognition = (window as any).currentRecognition;
    if (recognition) {
      recognition.stop();
      (window as any).currentRecognition = null;
    }
  };

  // Submit with specific text (for voice transcription)
  const handleSubmitWithText = async (text: string) => {
    if (!text.trim()) return;
    
    setConversation(prev => [
      ...prev,
      { type: "user", text: text }
    ]);
    
    setInputText("");
    
    setIsAnalyzing(true);
    setIsTyping(true);
    
    try {
      const context = {
        name: extractedData.name || undefined,
        phone: extractedData.phone || undefined,
        city: extractedData.city || undefined,
        districts: extractedData.district ? [extractedData.district] : undefined,
        propertyType: extractedData.propertyType || undefined,
        budgetMin: extractedData.budgetMin ? parseInt(extractedData.budgetMin) : undefined,
        budgetMax: extractedData.budgetMax ? parseInt(extractedData.budgetMax) : undefined,
        role: mode,
      };
      
      const response = await fetch("/api/intake/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context }),
      });
      
      const result: AIAnalysisResult = await response.json();
      
      if (result.success && result.assistantReply) {
        setConversation(prev => [
          ...prev,
          { type: "system", text: result.assistantReply! }
        ]);
        
        // Merge ALL new data with existing - don't miss any field!
        const newData: Record<string, string> = { ...extractedData };
        // Basic info
        if (result.data.name) newData.name = result.data.name;
        if (result.data.phone) newData.phone = result.data.phone;
        if (result.data.email) newData.email = result.data.email;
        // Location
        if (result.data.city) newData.city = result.data.city;
        if (result.data.districts && result.data.districts.length > 0) newData.district = result.data.districts.join("، ");
        // Property
        if (result.data.propertyType) newData.propertyType = result.data.propertyType;
        if (result.data.transactionType) newData.transactionType = result.data.transactionType;
        // Budget
        if (result.data.budgetMin) newData.budgetMin = String(result.data.budgetMin);
        if (result.data.budgetMax) newData.budgetMax = String(result.data.budgetMax);
        // Details
        if (result.data.paymentMethod) newData.paymentMethod = result.data.paymentMethod;
        if (result.data.purchasePurpose) newData.purchasePurpose = result.data.purchasePurpose;
        if (result.data.purchaseTimeline) newData.purchaseTimeline = result.data.purchaseTimeline;
        if (result.data.clientType) newData.clientType = result.data.clientType;
        // Property specs
        if (result.data.area) newData.area = String(result.data.area);
        if (result.data.rooms) newData.rooms = String(result.data.rooms);
        if (result.data.floor) newData.floor = String(result.data.floor);
        // Notes
        if (result.data.additionalNotes) newData.additionalNotes = result.data.additionalNotes;
        
        setExtractedData(newData);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحليل النص",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setIsTyping(false);
    }
  };


  return (
    <>
      {/* Full-screen WhatsApp-like chat view - rendered as overlay */}
      {isFullScreenChat && (
      <div 
        className="fixed left-0 right-0 top-0 z-50 flex flex-col bg-background"
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      >
        {/* Chat Header */}
        <div className={`flex items-center gap-3 p-4 border-b ${mode === "seller" ? "bg-green-600" : mode === "investor" ? "bg-amber-600" : "bg-primary"} text-primary-foreground`}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setIsFullScreenChat(false);
              setConversation([]);
              setExtractedData({});
              setPendingConfirmation(false);
              setIsComplete(false);
            }}
            className="text-primary-foreground"
            data-testid="button-back-chat"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode === "seller" ? "bg-green-700" : mode === "investor" ? "bg-amber-700" : "bg-primary-foreground/20"}`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">تطابق</h2>
              <p className="text-xs opacity-80">
                {mode === "buyer" ? "مساعد البحث عن عقار" : mode === "seller" ? "مساعد عرض العقارات" : "مساعد الاستثمار العقاري"}
              </p>
            </div>
          </div>
        </div>

        {/* Reliability Score Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">اكتمال الطلب</span>
          </div>
          <ReliabilityScore 
            score={calculateReliabilityScore({
              name: extractedData.name,
              phone: extractedData.phone,
              city: extractedData.city,
              districts: extractedData.district ? [extractedData.district] : [],
              propertyType: extractedData.propertyType,
              budgetMax: extractedData.budgetMax ? parseInt(extractedData.budgetMax) : null,
              paymentMethod: extractedData.paymentMethod,
              purchaseTimeline: extractedData.purchaseTimeline,
              area: extractedData.area ? parseInt(extractedData.area) : null,
              propertyAge: extractedData.propertyAge ? parseInt(extractedData.propertyAge) : null,
              facing: extractedData.facing,
              streetWidth: extractedData.streetWidth ? parseInt(extractedData.streetWidth) : null,
              purchasePurpose: extractedData.purchasePurpose,
            })}
            size="sm"
            label=""
          />
        </div>

        {/* Messages Area - WhatsApp style - min-h-0 is critical for flex scroll */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3"
          style={{ 
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
          }}
        >
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.type === "user"
                    ? mode === "seller" ? "bg-green-600 text-white rounded-tr-none" : mode === "investor" ? "bg-amber-600 text-white rounded-tr-none" : "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-card border rounded-tl-none"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {/* Confirmation Card */}
          {pendingConfirmation && confirmationFields.length > 0 && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-card border p-4 shadow-sm" data-testid="confirmation-card">
                <p className="font-bold text-base mb-3 text-center">تأكيد البيانات</p>
                <div className="space-y-2">
                  {confirmationFields.map((field, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <span className="font-bold text-muted-foreground">{field.label}:</span>
                      <span className={field.isCheck ? "text-green-600 font-medium" : ""}>{field.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 pt-3 border-t text-center">
                  إذا كانت المعلومات صحيحة اكتب <span className="font-bold text-primary">"موافق"</span> لاعتمادها
                </p>
              </div>
            </div>
          )}
          
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  {isAnalyzing && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Brain className="h-3 w-3 animate-pulse" />
                      <span>جارٍ التحليل</span>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - WhatsApp style */}
        {!isComplete ? (
          <div className="p-3 border-t bg-muted/30">
            {/* Transcribing indicator */}
            {isTranscribing && (
              <div className="flex items-center justify-center gap-2 mb-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ تحويل الصوت لنص...</span>
              </div>
            )}
            {(() => {
              const liveData = extractLiveData(inputText);
              // Check if essential data already saved OR currently typed
              // Note: API returns 'districts' (array) not 'district'
              const savedEssentialData = !!(extractedData.name && extractedData.phone && extractedData.city && (extractedData.district || extractedData.districts) && extractedData.propertyType);
              const typedEssentialData = liveData.missing.length === 0 && liveData.found.length > 0;
              const hasEssentialData = savedEssentialData || typedEssentialData;
              return (
            <div className="flex items-center gap-2 bg-card border rounded-full px-2 py-1.5 max-w-3xl mx-auto">
              {/* Send button */}
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!inputText.trim() && !pendingConfirmation}
                className="rounded-full h-10 w-10 flex-shrink-0"
                data-testid="button-send-fullscreen"
              >
                <Send className="h-4 w-4" />
              </Button>
              
              {/* Microphone button - always visible */}
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "ghost"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`rounded-full h-10 w-10 flex-shrink-0 ${isRecording ? "animate-pulse" : ""}`}
                data-testid="button-voice-record"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              {/* Upload button for sellers - always visible */}
              {mode === "seller" && (
                <FileUploadButton
                  onFilesUploaded={(urls) => setUploadedFiles(prev => [...prev, ...urls])}
                  buttonVariant="ghost"
                  buttonSize="icon"
                  buttonClassName="rounded-full h-10 w-10 flex-shrink-0"
                >
                  <Image className="h-4 w-4" />
                </FileUploadButton>
              )}
              
              {/* Location picker button for sellers - always visible */}
              {mode === "seller" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLocationPicker(true)}
                  className={`rounded-full h-10 w-10 flex-shrink-0 ${extractedData.latitude ? "bg-primary/10 text-primary" : ""}`}
                  data-testid="button-open-map-fullscreen"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              )}
              
              {/* Input field - auto-expanding textarea like WhatsApp */}
              <div className="flex-1 flex flex-col">
                {/* Live extraction preview - only show when typing new data */}
                {inputText.trim().length > 0 && !savedEssentialData && (
                  <div className="text-xs text-right mb-1 px-1" dir="rtl">
                    {liveData.found.length > 0 && (
                      <span className="text-foreground">
                        {liveData.found.map((item, i) => (
                          <span key={item.key}>
                            <span className="font-medium">{item.value}</span>
                            {i < liveData.found.length - 1 && " "}
                          </span>
                        ))}
                      </span>
                    )}
                    {liveData.missing.length > 0 && (
                      <span className="text-muted-foreground mr-1">
                        (متبقي {liveData.missing.join(" - ")})
                      </span>
                    )}
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  dir="rtl"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    // Auto-resize textarea
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={isRecording ? "جارٍ التسجيل..." : (hasEssentialData ? "" : "لتجهيز طلبك اكتب اسمك ورقم جوالك والمدينة والحي ونوع العقار والميزانية وكاش أو تمويل ومتى ترغب بالشراء...")}
                  className="w-full min-h-[40px] max-h-[120px] py-2 px-3 outline-none text-[15px] bg-transparent resize-none overflow-y-auto"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  rows={1}
                  data-testid="input-chat"
                />
              </div>
            </div>
              );
            })()}
            {isRecording && (
              <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
                جارٍ التسجيل... اضغط مرة أخرى للإيقاف
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 border-t bg-green-50 dark:bg-green-950/30 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">تم تسجيل طلبك بنجاح!</span>
            </div>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => {
                setIsFullScreenChat(false);
                setConversation([]);
                setExtractedData({});
                setIsComplete(false);
              }}
              data-testid="button-new-request"
            >
              طلب جديد
            </Button>
          </div>
        )}
      </div>
      )}

      {/* Main landing section */}
      {!isFullScreenChat && (
      <section 
        className="relative flex items-start overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pt-4 md:pt-8"
        style={{ minHeight: 'calc(var(--vh, 1vh) * 85)' }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
          
          {/* Icon above title */}
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          {/* Main Headline - Larger */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3" data-testid="text-hero-title">
            سجّل رغبتك العقارية
            <span className="text-primary block mt-2">ودعنا نجد لك الأفضل</span>
          </h1>
          
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-4" data-testid="text-hero-description">
            أخبرنا ماذا تريد بكلماتك أو صوتك، وسنفهم ونوصلك بالعقار المناسب
          </p>

          {/* Mode Toggle - Larger Segmented Control */}
          <div className="flex flex-col items-center gap-3 mb-5">
            <div className="inline-flex rounded-xl border p-1.5 bg-muted/30 shadow-sm">
              <Button
                size="lg"
                variant={mode === "buyer" ? "default" : "ghost"}
                onClick={() => handleModeSwitch("buyer")}
                className="gap-2 rounded-lg"
                data-testid="button-mode-buyer"
              >
                <Users className="h-5 w-5" />
                أبحث عن عقار
              </Button>
              <Button
                size="lg"
                variant={mode === "seller" ? "default" : "ghost"}
                onClick={() => handleModeSwitch("seller")}
                className="gap-2 rounded-lg"
                data-testid="button-mode-seller"
              >
                <Building2 className="h-5 w-5" />
                اعرض عقارك
              </Button>
            </div>
          </div>

          <Card className="max-w-3xl mx-auto p-0 overflow-hidden shadow-xl">
            {/* Typewriter Example + Map Panel */}
            {!isComplete && conversation.length === 0 && !pendingConfirmation && (
              <div 
                className={`${mode === "seller" ? "bg-green-50 dark:bg-green-950/20" : mode === "investor" ? "bg-amber-50 dark:bg-amber-950/20" : "bg-muted/10"}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}>
                {/* Stats Bar + Typewriter (Top) */}
                <div className="p-3 pb-2">
                  {/* Stats Bar - Integrated */}
                  <div className="flex items-center justify-between gap-3 mb-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="font-semibold text-foreground text-[12px] leading-none">{liveViewers.toLocaleString('ar-EG')}</span>
                      <span>يتصفحون</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className={`h-3.5 w-3.5 text-amber-500 transition-transform duration-500 origin-center ${requestsAnimating ? 'scale-[2] rotate-12' : ''}`} />
                      <span className={`font-semibold text-foreground text-[12px] leading-none transition-all duration-500 ${requestsAnimating ? 'scale-150 text-amber-600' : ''}`}>
                        {requestsToday.toLocaleString('ar-EG')}
                      </span>
                      <span>طلب</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Handshake className={`h-3.5 w-3.5 text-green-500 transition-transform duration-500 origin-center ${dealsAnimating ? 'scale-[2] animate-pulse' : ''}`} />
                      <span className={`font-semibold text-foreground text-[12px] leading-none transition-all duration-500 ${dealsAnimating ? 'scale-150 text-green-600' : ''}`}>
                        {dealsToday.toLocaleString('ar-EG')}
                      </span>
                      <span>صفقة</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {mode === "buyer" ? "عميل يطلب الآن:" : mode === "seller" ? "بائع يعرض الآن:" : "مستثمر يبحث الآن:"}
                    </p>
                  </div>
                  <div 
                    className="text-center cursor-pointer min-h-[80px] flex items-center justify-center px-2 overflow-hidden"
                    onClick={() => addSuggestion(fullExampleText)}
                    data-testid="button-typewriter-example"
                  >
                    <p className="text-base leading-relaxed line-clamp-2">
                      {renderTypedText()}
                      <span className="text-muted-foreground">...</span>
                      <span className="animate-pulse text-primary font-bold">|</span>
                    </p>
                  </div>
                </div>
                
                {/* Saudi Map inside the panel (Bottom) */}
                <div className="px-3 pb-3">
                  <SaudiMap 
                    markers={mapMarkers} 
                    className="h-36 md:h-44 rounded-lg border border-border/30 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Conversation area */}
            {(conversation.length > 0 || pendingConfirmation) && (
              <div className="flex flex-col h-[600px]">
                {/* Reliability Score Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">مؤشر اكتمال الطلب</span>
                  </div>
                  <ReliabilityScore 
                    score={calculateReliabilityScore({
                      name: extractedData.name,
                      phone: extractedData.phone,
                      city: extractedData.city,
                      districts: extractedData.district ? [extractedData.district] : [],
                      propertyType: extractedData.propertyType,
                      budgetMax: extractedData.budgetMax ? parseInt(extractedData.budgetMax) : null,
                      paymentMethod: extractedData.paymentMethod,
                      purchaseTimeline: extractedData.purchaseTimeline,
                      area: extractedData.area ? parseInt(extractedData.area) : null,
                      propertyAge: extractedData.propertyAge ? parseInt(extractedData.propertyAge) : null,
                      facing: extractedData.facing,
                      streetWidth: extractedData.streetWidth ? parseInt(extractedData.streetWidth) : null,
                      purchasePurpose: extractedData.purchasePurpose,
                    })}
                    size="sm"
                    label=""
                  />
                </div>
                
                {/* Messages area */}
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  style={{
                    backgroundColor: "hsl(var(--muted) / 0.2)",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}>
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.type === "user"
                          ? mode === "seller" ? "bg-green-600 text-white rounded-tr-none" : mode === "investor" ? "bg-amber-600 text-white rounded-tr-none" : "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Confirmation Card */}
                {pendingConfirmation && confirmationFields.length > 0 && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-card border p-4" data-testid="confirmation-card">
                      <p className="font-bold text-base mb-3 text-center">تأكيد البيانات</p>
                      <div className="space-y-2">
                        {confirmationFields.map((field, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="font-bold text-muted-foreground">{field.label}:</span>
                            <span className={field.isCheck ? "text-green-600 font-medium" : ""}>{field.value}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 pt-3 border-t text-center">
                        إذا كانت المعلومات صحيحة اكتب <span className="font-bold text-primary">"موافق"</span> لاعتمادها
                      </p>
                    </div>
                  </div>
                )}
                
                {isTyping && (
                  <div className="flex justify-end">
                    <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isAnalyzing && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Brain className="h-3 w-3 animate-pulse" />
                            <span>جارٍ التحليل بالذكاء الاصطناعي</span>
                          </div>
                        )}
                        {!isAnalyzing && (
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
              </div>
            )}

            {/* Input area */}
            {!isComplete ? (
              <div 
                className="p-4 border-t"
                style={{
                  backgroundColor: "hsl(var(--card))",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}>
                {/* Uploaded files preview and location status */}
                {mode === "seller" && (uploadedFiles.length > 0 || extractedData.latitude) && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center border overflow-hidden">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-uploaded-${idx}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {uploadedFiles.length > 0 && (
                      <Badge variant="secondary" className="self-center">
                        {uploadedFiles.length} ملفات مرفوعة
                      </Badge>
                    )}
                    {extractedData.latitude && extractedData.longitude && (
                      <Badge variant="secondary" className="self-center bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <MapPin className="h-3 w-3 ml-1" />
                        تم تحديد الموقع
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Transcribing indicator */}
                {isTranscribing && (
                  <div className="flex items-center justify-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جارٍ تحويل الصوت لنص...</span>
                  </div>
                )}
                
                {(() => {
                  const liveData = extractLiveData(inputText);
                  const hasEssentialData = liveData.missing.length === 0 && liveData.found.length > 0;
                  return (
                <div className="flex items-start gap-3">
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={buyerMutation.isPending || sellerMutation.isPending}
                    data-testid="button-send"
                    className="flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                  
                  {/* Voice recording button - always visible */}
                  <Button
                    size="icon"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                    className={`flex-shrink-0 ${isRecording ? "animate-pulse" : ""}`}
                    data-testid="button-voice-record-landing"
                  >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex-1 flex flex-col">
                    {/* Live extraction preview */}
                    {inputText.trim().length > 0 && (
                      <div className="text-sm text-right mb-2 px-2 py-1.5 bg-muted/50 rounded-lg" dir="rtl">
                        {liveData.found.length > 0 && (
                          <span className="text-foreground">
                            {liveData.found.map((item, i) => (
                              <span key={item.key}>
                                <span className="font-medium">{item.value}</span>
                                {i < liveData.found.length - 1 && " "}
                              </span>
                            ))}
                          </span>
                        )}
                        {liveData.missing.length > 0 && (
                          <span className="text-muted-foreground mr-1">
                            (متبقي {liveData.missing.join(" - ")})
                          </span>
                        )}
                      </div>
                    )}
                    <textarea
                      dir="rtl"
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder={isRecording ? "جارٍ التسجيل..." : (hasEssentialData ? "" : "لتجهيز طلبك اكتب اسمك ورقم جوالك والمدينة والحي ونوع العقار والميزانية وكاش أو تمويل ومتى ترغب بالشراء...")}
                      className="w-full min-h-[50px] max-h-[120px] p-3 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-y-auto"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      rows={1}
                      data-testid="input-interactive"
                    />
                  </div>
                </div>
                  );
                })()}
                
                {isRecording && (
                  <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
                    جارٍ التسجيل... اضغط مرة أخرى للإيقاف
                  </p>
                )}
              </div>
            ) : (
              <div className={`p-6 text-center ${mode === "seller" ? "bg-green-50 dark:bg-green-950/20" : "bg-primary/5"}`}>
                <Check className={`h-12 w-12 mx-auto mb-3 ${mode === "seller" ? "text-green-600" : "text-primary"}`} />
                <h3 className="text-xl font-bold mb-2">
                  {mode === "buyer" ? "تم تسجيل رغبتك بنجاح!" : "تم تسجيل عقارك بنجاح!"}
                </h3>
                <p className="text-muted-foreground mb-2">
                  {mode === "buyer" ? "سنتواصل معك عند توفر عقار مناسب" : "سنتواصل معك عند وجود مشترين مهتمين"}
                </p>
                
                {/* Registration info */}
                <div className="bg-card border rounded-lg p-4 my-4 text-right max-w-sm mx-auto">
                  <p className="text-sm mb-2">
                    <span className="text-muted-foreground">تم تسجيلك بالموقع:</span>
                  </p>
                  <p className="text-sm mb-1">
                    <span className="text-muted-foreground">رقم الجوال: </span>
                    <span className="font-bold" dir="ltr">{extractedData.phone || "—"}</span>
                  </p>
                  <p className="text-sm mb-3">
                    <span className="text-muted-foreground">كلمة المرور: </span>
                    <span className="font-bold" dir="ltr">{extractedData.phone || "—"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    بتسجيلك، أنت توافق على الشروط والأحكام وسياسة الخصوصية
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="default"
                    onClick={() => window.location.href = "/profile"}
                    data-testid="button-go-profile"
                  >
                    الدخول لصفحتي الشخصية
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsComplete(false);
                      setConversation([]);
                      setExtractedData({});
                      setUploadedFiles([]);
                    }}
                    data-testid="button-add-another"
                  >
                    {mode === "buyer" ? "إضافة رغبة أخرى" : "إضافة عقار آخر"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
      
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
          setConversation(prev => [
            ...prev,
            { type: "system", text: `تم تحديد الموقع: ${lat.toFixed(6)}, ${lng.toFixed(6)}` }
          ]);
        }}
      />
    </section>
      )}
    </>
  );
}
