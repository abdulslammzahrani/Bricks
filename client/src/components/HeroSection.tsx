import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Send, Sparkles, Check, Users, Image, X, MapPin, TrendingUp, Brain, Eye, Zap, ArrowRight, Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUploadButton } from "./FileUploadButton";
import { LocationPicker } from "./LocationPicker";

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

interface ExampleSegment {
  text: string;
  color?: string;
  underline?: boolean;
}

// Multiple rotating buyer examples - realistic and varied Saudi conversational styles
const buyerExamplesData = [
  {
    segments: [
      { text: "يا شباب مين يوصلني " },
      { text: "شقة", color: "#3b82f6", underline: true },
      { text: " نظيفة في " },
      { text: "الرياض", color: "#22c55e", underline: true },
      { text: " حي " },
      { text: "الملقا", color: "#22c55e", underline: true },
      { text: " أو " },
      { text: "الياسمين", color: "#22c55e", underline: true },
      { text: "؟ معي " },
      { text: "750 ألف", color: "#22c55e", underline: true },
      { text: " " },
      { text: "كاش", color: "#3b82f6", underline: true },
      { text: " - " },
      { text: "تركي", color: "#f97316", underline: true },
      { text: " " },
      { text: "٠٥٠٤٥٦****", color: "#f97316", underline: true },
    ],
    fullText: "يا شباب مين يوصلني شقة نظيفة في الرياض حي الملقا أو الياسمين؟ معي 750 ألف كاش - تركي ٠٥٠٤٥٦****"
  },
  {
    segments: [
      { text: "أبحث عن " },
      { text: "فيلا دورين", color: "#3b82f6", underline: true },
      { text: " جديدة في " },
      { text: "جدة", color: "#22c55e", underline: true },
      { text: " حي " },
      { text: "الشاطئ", color: "#22c55e", underline: true },
      { text: " ، 5 غرف ومجلس ، حدود " },
      { text: "2 مليون", color: "#22c55e", underline: true },
      { text: " " },
      { text: "تمويل عقاري", color: "#3b82f6", underline: true },
      { text: " . " },
      { text: "منى الحربي", color: "#f97316", underline: true },
      { text: " " },
      { text: "055789****", color: "#f97316", underline: true },
    ],
    fullText: "أبحث عن فيلا دورين جديدة في جدة حي الشاطئ ، 5 غرف ومجلس ، حدود 2 مليون تمويل عقاري . منى الحربي 055789****"
  },
  {
    segments: [
      { text: "محتاج " },
      { text: "دبلكس", color: "#3b82f6", underline: true },
      { text: " عائلي في " },
      { text: "الخبر", color: "#22c55e", underline: true },
      { text: " " },
      { text: "العزيزية", color: "#22c55e", underline: true },
      { text: " أو " },
      { text: "الثقبة", color: "#22c55e", underline: true },
      { text: " ، المساحة 300+ متر ، ميزانيتي لين " },
      { text: "مليون و400", color: "#22c55e", underline: true },
      { text: " " },
      { text: "نقد", color: "#3b82f6", underline: true },
      { text: " - " },
      { text: "عبدالرحمن", color: "#f97316", underline: true },
      { text: " " },
      { text: "054321****", color: "#f97316", underline: true },
    ],
    fullText: "محتاج دبلكس عائلي في الخبر العزيزية أو الثقبة ، المساحة 300+ متر ، ميزانيتي لين مليون و400 نقد - عبدالرحمن 054321****"
  },
  {
    segments: [
      { text: "ودي ب" },
      { text: "شقة صغيرة", color: "#3b82f6", underline: true },
      { text: " غرفتين في " },
      { text: "المدينة المنورة", color: "#22c55e", underline: true },
      { text: " " },
      { text: "العزيزية", color: "#22c55e", underline: true },
      { text: " قريبة من الحرم ، السعر ما يتجاوز " },
      { text: "450 ألف", color: "#22c55e", underline: true },
      { text: " " },
      { text: "كاش", color: "#3b82f6", underline: true },
      { text: " .. " },
      { text: "هند", color: "#f97316", underline: true },
      { text: " " },
      { text: "٠٥٣٨٩٠****", color: "#f97316", underline: true },
    ],
    fullText: "ودي بشقة صغيرة غرفتين في المدينة المنورة العزيزية قريبة من الحرم ، السعر ما يتجاوز 450 ألف كاش .. هند ٠٥٣٨٩٠****"
  },
  {
    segments: [
      { text: "السلام عليكم ، أنا " },
      { text: "ماجد القرني", color: "#f97316", underline: true },
      { text: " " },
      { text: "056234****", color: "#f97316", underline: true },
      { text: " ، أدور " },
      { text: "أرض سكنية", color: "#3b82f6", underline: true },
      { text: " في " },
      { text: "أبها", color: "#22c55e", underline: true },
      { text: " " },
      { text: "المنسك", color: "#22c55e", underline: true },
      { text: " أو " },
      { text: "الخالدية", color: "#22c55e", underline: true },
      { text: " ، مساحة 500 متر ، معي " },
      { text: "350 ألف", color: "#22c55e", underline: true },
    ],
    fullText: "السلام عليكم ، أنا ماجد القرني 056234**** ، أدور أرض سكنية في أبها المنسك أو الخالدية ، مساحة 500 متر ، معي 350 ألف"
  },
  {
    segments: [
      { text: "ابي " },
      { text: "شقة تمليك", color: "#3b82f6", underline: true },
      { text: " 4 غرف في " },
      { text: "الدمام", color: "#22c55e", underline: true },
      { text: " " },
      { text: "الفيصلية", color: "#22c55e", underline: true },
      { text: " ، جاهزة وفيها مصعد ، لين " },
      { text: "680 ألف", color: "#22c55e", underline: true },
      { text: " " },
      { text: "تمويل", color: "#3b82f6", underline: true },
      { text: " - " },
      { text: "يوسف", color: "#f97316", underline: true },
      { text: " " },
      { text: "050876****", color: "#f97316", underline: true },
    ],
    fullText: "ابي شقة تمليك 4 غرف في الدمام الفيصلية ، جاهزة وفيها مصعد ، لين 680 ألف تمويل - يوسف 050876****"
  },
];

// Multiple rotating seller examples - realistic Saudi conversational styles
const sellerExamplesData = [
  {
    segments: [
      { text: "عندي " },
      { text: "فيلا", color: "#3b82f6", underline: true },
      { text: " للبيع في " },
      { text: "الرياض", color: "#22c55e", underline: true },
      { text: " " },
      { text: "حي الملقا", color: "#22c55e", underline: true },
      { text: " ، 6 غرف ومسبح ، مساحة 450 متر ، السعر " },
      { text: "3.2 مليون", color: "#22c55e", underline: true },
      { text: " قابل للتفاوض - " },
      { text: "ناصر", color: "#f97316", underline: true },
      { text: " " },
      { text: "055678****", color: "#f97316", underline: true },
    ],
    fullText: "عندي فيلا للبيع في الرياض حي الملقا ، 6 غرف ومسبح ، مساحة 450 متر ، السعر 3.2 مليون قابل للتفاوض - ناصر 055678****"
  },
  {
    segments: [
      { text: "للبيع المستعجل " },
      { text: "شقة", color: "#3b82f6", underline: true },
      { text: " في " },
      { text: "جدة", color: "#22c55e", underline: true },
      { text: " " },
      { text: "الروضة", color: "#22c55e", underline: true },
      { text: " ، 3 غرف وصالة ، دور ثاني ، مجددة بالكامل ، " },
      { text: "720 ألف", color: "#22c55e", underline: true },
      { text: " .. " },
      { text: "سلطان الزهراني", color: "#f97316", underline: true },
      { text: " " },
      { text: "٠٥٠١٢٣****", color: "#f97316", underline: true },
    ],
    fullText: "للبيع المستعجل شقة في جدة الروضة ، 3 غرف وصالة ، دور ثاني ، مجددة بالكامل ، 720 ألف .. سلطان الزهراني ٠٥٠١٢٣****"
  },
  {
    segments: [
      { text: "أرض تجارية", color: "#3b82f6", underline: true },
      { text: " على شارعين في " },
      { text: "الخبر", color: "#22c55e", underline: true },
      { text: " " },
      { text: "الراكة", color: "#22c55e", underline: true },
      { text: " ، 800 متر ، موقع استراتيجي ، " },
      { text: "4.5 مليون", color: "#22c55e", underline: true },
      { text: " - " },
      { text: "فيصل", color: "#f97316", underline: true },
      { text: " " },
      { text: "054789****", color: "#f97316", underline: true },
    ],
    fullText: "أرض تجارية على شارعين في الخبر الراكة ، 800 متر ، موقع استراتيجي ، 4.5 مليون - فيصل 054789****"
  },
  {
    segments: [
      { text: "دبلكس", color: "#3b82f6", underline: true },
      { text: " جديد ما سكن في " },
      { text: "الدمام", color: "#22c55e", underline: true },
      { text: " " },
      { text: "الفيحاء", color: "#22c55e", underline: true },
      { text: " ، 5 غرف ، تشطيب سوبر ديلوكس ، " },
      { text: "1.6 مليون", color: "#22c55e", underline: true },
      { text: " - المالك " },
      { text: "عبدالعزيز", color: "#f97316", underline: true },
      { text: " " },
      { text: "056234****", color: "#f97316", underline: true },
    ],
    fullText: "دبلكس جديد ما سكن في الدمام الفيحاء ، 5 غرف ، تشطيب سوبر ديلوكس ، 1.6 مليون - المالك عبدالعزيز 056234****"
  },
];

// Multiple rotating investor examples - varied conversational styles
const investorExamplesData = [
  {
    segments: [
      { text: "مستثمر أبحث عن " },
      { text: "عمارة سكنية", color: "#d97706", underline: true },
      { text: " مؤجرة في " },
      { text: "الرياض", color: "#22c55e", underline: true },
      { text: " أو " },
      { text: "جدة", color: "#22c55e", underline: true },
      { text: " ، رأس المال " },
      { text: "8 إلى 15 مليون", color: "#22c55e", underline: true },
      { text: " ، أبي عائد " },
      { text: "7%+", color: "#d97706", underline: true },
      { text: " - " },
      { text: "خالد", color: "#f97316", underline: true },
      { text: " " },
      { text: "055432****", color: "#f97316", underline: true },
    ],
    fullText: "مستثمر أبحث عن عمارة سكنية مؤجرة في الرياض أو جدة ، رأس المال 8 إلى 15 مليون ، أبي عائد 7%+ - خالد 055432****"
  },
  {
    segments: [
      { text: "مهتم ب" },
      { text: "أراضي تجارية", color: "#d97706", underline: true },
      { text: " في " },
      { text: "المنطقة الشرقية", color: "#22c55e", underline: true },
      { text: " ، خصوصاً " },
      { text: "الدمام والخبر", color: "#22c55e", underline: true },
      { text: " ، الميزانية " },
      { text: "5 إلى 25 مليون", color: "#22c55e", underline: true },
      { text: " - " },
      { text: "راشد العتيبي", color: "#f97316", underline: true },
      { text: " " },
      { text: "٠٥٠٨٧٦****", color: "#f97316", underline: true },
    ],
    fullText: "مهتم بأراضي تجارية في المنطقة الشرقية ، خصوصاً الدمام والخبر ، الميزانية 5 إلى 25 مليون - راشد العتيبي ٠٥٠٨٧٦****"
  },
  {
    segments: [
      { text: "أدور " },
      { text: "مجمع سكني", color: "#d97706", underline: true },
      { text: " أو " },
      { text: "شقق مفروشة", color: "#d97706", underline: true },
      { text: " للاستثمار في " },
      { text: "مكة", color: "#22c55e", underline: true },
      { text: " قريب من الحرم ، معي " },
      { text: "20 مليون", color: "#22c55e", underline: true },
      { text: " - " },
      { text: "بندر", color: "#f97316", underline: true },
      { text: " " },
      { text: "054321****", color: "#f97316", underline: true },
    ],
    fullText: "أدور مجمع سكني أو شقق مفروشة للاستثمار في مكة قريب من الحرم ، معي 20 مليون - بندر 054321****"
  },
];

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
  const textareaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Live viewer counter for social proof (herd effect)
  const [liveViewers, setLiveViewers] = useState(0);
  const [requestsToday, setRequestsToday] = useState(0);
  
  // Initialize and animate live viewer count
  useEffect(() => {
    // Initial values
    const baseViewers = 45 + Math.floor(Math.random() * 30);
    const baseRequests = 127 + Math.floor(Math.random() * 50);
    setLiveViewers(baseViewers);
    setRequestsToday(baseRequests);
    
    // Fluctuate viewer count every 3-7 seconds
    const viewerInterval = setInterval(() => {
      setLiveViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newValue = prev + change;
        return Math.max(35, Math.min(95, newValue)); // Keep between 35-95
      });
    }, 3000 + Math.random() * 4000);
    
    // Occasionally increment requests (every 15-30 seconds)
    const requestInterval = setInterval(() => {
      setRequestsToday(prev => prev + 1);
    }, 15000 + Math.random() * 15000);
    
    return () => {
      clearInterval(viewerInterval);
      clearInterval(requestInterval);
    };
  }, []);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, isTyping, pendingConfirmation]);

  // Get the current examples array based on mode
  const currentExamplesData = mode === "buyer" ? buyerExamplesData : mode === "seller" ? sellerExamplesData : investorExamplesData;
  
  // Get current example based on index
  const currentExample = currentExamplesData[exampleIndex % currentExamplesData.length];
  const exampleSegments = currentExample.segments;
  const fullExampleText = currentExample.fullText;
  
  // Rotate examples every 8 seconds (after typewriter finishes)
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex(prev => prev + 1);
      setCharIndex(0); // Reset typewriter for new example
    }, 12000); // 12 seconds to allow typewriter to complete
    
    return () => clearInterval(interval);
  }, [mode]);
  
  // Reset example index when mode changes
  useEffect(() => {
    setExampleIndex(0);
    setCharIndex(0);
  }, [mode]);
  
  // Show mic tooltip when chat first expands (1 message = first AI greeting)
  useEffect(() => {
    if (conversation.length === 1) {
      // Delay a bit to let the UI render first
      const showTimer = setTimeout(() => {
        setShowMicTooltip(true);
      }, 500);
      // Auto-hide after 8 seconds
      const hideTimer = setTimeout(() => {
        setShowMicTooltip(false);
      }, 8000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [conversation.length]);

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

  // Typewriter effect - only types, doesn't reset (rotation interval handles that)
  useEffect(() => {
    const totalLength = exampleSegments.reduce((acc, seg) => acc + seg.text.length, 0);
    if (charIndex < totalLength) {
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
    // No auto-reset here - the rotation interval handles cycling to next example
  }, [charIndex, exampleSegments]);

  const handleModeSwitch = (newMode: UserMode) => {
    setMode(newMode);
    setCharIndex(0);
    setInputText("");
    setUploadedFiles([]);
    setConversation([]);
    setIsComplete(false);
    setExtractedData({});
    if (textareaRef.current) {
      textareaRef.current.textContent = "";
    }
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
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.textContent = newText;
        textareaRef.current.focus();
      }
    }, 50);
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

  const submitData = (data: Record<string, string>) => {
    if (mode === "buyer") {
      // Use AI-extracted budgetMin/Max if available
      const budgetMinVal = data.budgetMin ? parseInt(data.budgetMin) : 0;
      const budgetMaxVal = data.budgetMax ? parseInt(data.budgetMax) : (data.budget ? parseInt(data.budget) : 0);
      
      buyerMutation.mutate({
        name: data.name,
        email: `${data.phone}@temp.com`,
        phone: data.phone,
        city: data.city,
        districts: data.district ? [data.district] : [],
        propertyType: data.propertyType === "شقة" ? "apartment" : data.propertyType === "فيلا" ? "villa" : data.propertyType === "أرض" ? "land" : "apartment",
        budgetMin: budgetMinVal,
        budgetMax: budgetMaxVal,
        paymentMethod: data.paymentMethod || "cash",
      });
      setConversation(prev => [
        ...prev,
        { type: "system", text: formatFriendlyMessage("success", "buyer", data.name) }
      ]);
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
    
    // Check if user is confirming
    if (pendingConfirmation && userText.includes("موافق")) {
      setConversation(prev => [
        ...prev,
        { type: "user", text: userText }
      ]);
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.textContent = "";
      }
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
    if (textareaRef.current) {
      textareaRef.current.textContent = "";
    }
    
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
        budgetMin: extractedData.budgetMin ? parseInt(extractedData.budgetMin) : undefined,
        budgetMax: extractedData.budgetMax ? parseInt(extractedData.budgetMax) : undefined,
        paymentMethod: extractedData.paymentMethod || undefined,
        purchasePurpose: extractedData.purchasePurpose || undefined,
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
          if (aiResult.data.budgetMax) mergedData.budget = aiResult.data.budgetMax.toString();
          if (aiResult.data.budgetMin) mergedData.budgetMin = aiResult.data.budgetMin.toString();
          if (aiResult.data.budgetMax) mergedData.budgetMax = aiResult.data.budgetMax.toString();
          if (aiResult.data.paymentMethod) mergedData.paymentMethod = aiResult.data.paymentMethod;
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
      
      // Check required fields based on mode - ALL fields must be complete!
      if (mode === "buyer") {
        // Required: name, phone, city, propertyType, budget, purchaseTimeline, clientType
        const hasAllRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.propertyType && 
          (mergedData.budgetMin || mergedData.budgetMax || mergedData.budget) && 
          mergedData.purchaseTimeline && mergedData.clientType;
        
        if (hasAllRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
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
      
      // Check ALL required fields (fallback mode)
      if (mode === "buyer") {
        const hasAllRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.propertyType && 
          (mergedData.budgetMin || mergedData.budgetMax || mergedData.budget) && 
          mergedData.purchaseTimeline && mergedData.clientType;
        
        if (hasAllRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
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
      if (textareaRef.current) {
        textareaRef.current.textContent = currentText;
      }
      
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
            if (textareaRef.current) {
              textareaRef.current.textContent = "";
            }
            
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
    if (textareaRef.current) {
      textareaRef.current.textContent = "";
    }
    
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

  // Full-screen WhatsApp-like chat view
  if (isFullScreenChat) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
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
            className="text-primary-foreground hover:bg-white/20"
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

        {/* Messages Area - WhatsApp style */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-3"
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
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              {/* Microphone button */}
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`rounded-full h-11 w-11 ${isRecording ? "animate-pulse" : ""}`}
                data-testid="button-voice-record"
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1 bg-card border rounded-3xl px-4 py-2 flex items-center gap-2">
                <div
                  ref={textareaRef}
                  contentEditable
                  dir="rtl"
                  onInput={(e) => setInputText(e.currentTarget.textContent || "")}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-h-[24px] max-h-[120px] overflow-y-auto outline-none text-[15px]"
                  data-placeholder={isRecording ? "جارٍ التسجيل..." : "اكتب رسالتك أو سجل صوتك..."}
                  style={{ 
                    wordBreak: "break-word",
                  }}
                  data-testid="input-chat-fullscreen"
                />
              </div>
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!inputText.trim() && !pendingConfirmation}
                className={`rounded-full h-11 w-11 ${mode === "seller" ? "bg-green-600 hover:bg-green-700" : mode === "investor" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                data-testid="button-send-fullscreen"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
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
    );
  }

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
            <Sparkles className="h-3 w-3 ml-1" />
            تجربة عقارية ذكية
          </Badge>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6" data-testid="text-hero-title">
            لا تشتري عقارك من إعلان…
            <span className="text-primary block mt-2">سجل رغبتك ودعنا نرشّح لك الأفضل</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8" data-testid="text-hero-description">
            فقط أخبرنا ماذا تريد بكلماتك الخاصة، وسنفهم ونجد لك العقار المناسب
          </p>

          {/* Mode Toggle - Segmented Control for Buyer/Seller */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="inline-flex rounded-lg border p-1 bg-muted/50">
              <Button
                size="lg"
                variant={mode === "buyer" ? "default" : "ghost"}
                onClick={() => handleModeSwitch("buyer")}
                className="gap-2 rounded-md"
                data-testid="button-mode-buyer"
              >
                <Users className="h-5 w-5" />
                أبحث عن عقار
              </Button>
              <Button
                size="lg"
                variant={mode === "seller" ? "default" : "ghost"}
                onClick={() => handleModeSwitch("seller")}
                className={`gap-2 rounded-md ${mode === "seller" ? "bg-green-600 hover:bg-green-700" : ""}`}
                data-testid="button-mode-seller"
              >
                <Building2 className="h-5 w-5" />
                اعرض عقارك
              </Button>
            </div>
            
            {/* Live Viewer Counter - Social Proof */}
            <div className="flex items-center justify-center gap-4" data-testid="live-stats">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <Eye className="h-4 w-4" />
                <span className="font-medium text-foreground">{liveViewers}</span>
                <span>يتصفحون الآن</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-foreground">{requestsToday}</span>
                <span>طلب اليوم</span>
              </div>
            </div>
          </div>

          <Card className="max-w-3xl mx-auto p-0 overflow-hidden shadow-2xl mb-8">
            {/* Typewriter Example - Live Request Indicator */}
            {!isComplete && (
              <div className={`p-4 border-b ${mode === "seller" ? "bg-green-50 dark:bg-green-950/20" : mode === "investor" ? "bg-amber-50 dark:bg-amber-950/20" : "bg-muted/10"}`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {mode === "buyer" ? "عميل يطلب الآن:" : mode === "seller" ? "بائع يعرض الآن:" : "مستثمر يبحث الآن:"}
                  </p>
                </div>
                <div 
                  className="text-center cursor-pointer min-h-[100px] flex items-center justify-center"
                  onClick={() => addSuggestion(fullExampleText)}
                  data-testid="button-typewriter-example"
                >
                  <p className="text-lg leading-relaxed">
                    {renderTypedText()}
                    <span className="animate-pulse text-primary font-bold">|</span>
                  </p>
                </div>
              </div>
            )}

            {/* Conversation area */}
            {(conversation.length > 0 || pendingConfirmation) && (
              <div className="min-h-[120px] max-h-[300px] overflow-y-auto p-4 space-y-3 bg-muted/20">
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
            )}

            {/* Input area */}
            {!isComplete ? (
              <div className="p-4 border-t bg-card">
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
                
                <div className="flex items-start gap-3">
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={buyerMutation.isPending || sellerMutation.isPending}
                    data-testid="button-send"
                    className={`flex-shrink-0 ${mode === "seller" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                  
                  {/* Voice recording button with tooltip */}
                  <div className="relative flex-shrink-0">
                    <Button
                      size="icon"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={() => {
                        setShowMicTooltip(false);
                        isRecording ? stopRecording() : startRecording();
                      }}
                      disabled={isTranscribing}
                      className={`${isRecording ? "animate-pulse" : ""} ${showMicTooltip ? "ring-2 ring-primary ring-offset-2 animate-pulse" : ""}`}
                      data-testid="button-voice-record-landing"
                    >
                      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    
                    {/* Mic tooltip */}
                    {showMicTooltip && !isRecording && (
                      <div 
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm shadow-lg z-50"
                        onClick={() => setShowMicTooltip(false)}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Mic className="h-4 w-4 flex-shrink-0" />
                          <span>سجّل طلبك صوتياً وسنحلله فوراً</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload button for sellers */}
                  {mode === "seller" && (
                    <FileUploadButton
                      onFilesUploaded={(urls) => setUploadedFiles(prev => [...prev, ...urls])}
                      buttonVariant="outline"
                      buttonSize="icon"
                      buttonClassName="flex-shrink-0 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <Image className="h-5 w-5" />
                    </FileUploadButton>
                  )}
                  
                  {/* Location picker button for sellers */}
                  {mode === "seller" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowLocationPicker(true)}
                      className={`flex-shrink-0 ${extractedData.latitude ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-600" : "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"}`}
                      data-testid="button-open-map"
                    >
                      <MapPin className="h-5 w-5" />
                    </Button>
                  )}
                  
                  <div className="flex-1">
                    <div
                      ref={textareaRef}
                      contentEditable
                      className={`min-h-[50px] p-3 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 ${mode === "seller" ? "focus:ring-green-500/50" : "focus:ring-primary/50"}`}
                      onInput={(e) => setInputText(e.currentTarget.textContent || "")}
                      onKeyDown={handleKeyDown}
                      data-placeholder={isRecording ? "جارٍ التسجيل..." : mode === "buyer" ? "اكتب أو سجل صوتك..." : "اكتب أو سجل صوتك..."}
                      data-testid="input-interactive"
                    />
                  </div>
                </div>
                
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
                    className={mode === "seller" ? "bg-green-600 hover:bg-green-700" : ""}
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

          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>+500 مشتري مسجل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>+200 عقار متاح</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>+50 مطابقة ناجحة</span>
            </div>
          </div>
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
  );
}
