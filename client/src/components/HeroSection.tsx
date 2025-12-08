import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Send, Sparkles, Check, Users, Image, X, MapPin, TrendingUp, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUploadButton } from "./FileUploadButton";
import { LocationPicker } from "./LocationPicker";

interface AIAnalysisResult {
  success: boolean;
  role: "buyer" | "seller" | "investor" | null;
  data: {
    name: string | null;
    phone: string | null;
    city: string | null;
    districts: string[];
    propertyType: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    paymentMethod: string | null;
    purchasePurpose: string | null;
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

const buyerExampleSegments: ExampleSegment[] = [
  { text: "اسمي " },
  { text: "عبدالسلام محمد", color: "#f97316", underline: true },
  { text: " ، رقم جوالي " },
  { text: "0501234567", color: "#f97316", underline: true },
  { text: " ، من مدينة " },
  { text: "جدة", color: "#22c55e", underline: true },
  { text: " حي " },
  { text: "الروضة", color: "#22c55e", underline: true },
  { text: " ، أرغب بشراء " },
  { text: "شقة", color: "#3b82f6", underline: true },
  { text: " ثلاث غرف حمامين مساحة 120 متر ، الميزانية " },
  { text: "800 ألف", color: "#22c55e", underline: true },
  { text: " ، الشراء " },
  { text: "كاش", color: "#3b82f6", underline: true },
];

const sellerExampleSegments: ExampleSegment[] = [
  { text: "اسمي " },
  { text: "محمد العلي", color: "#f97316", underline: true },
  { text: " ، جوالي " },
  { text: "0551234567", color: "#f97316", underline: true },
  { text: " ، أعرض " },
  { text: "فيلا", color: "#3b82f6", underline: true },
  { text: " في " },
  { text: "الرياض", color: "#22c55e", underline: true },
  { text: " حي " },
  { text: "النرجس", color: "#22c55e", underline: true },
  { text: " ، المساحة 400 متر ، السعر " },
  { text: "2.5 مليون", color: "#22c55e", underline: true },
  { text: " ، " },
  { text: "جاهزة للسكن", color: "#3b82f6", underline: true },
];

const investorExampleSegments: ExampleSegment[] = [
  { text: "اسمي " },
  { text: "خالد المحمد", color: "#f97316", underline: true },
  { text: " ، جوالي " },
  { text: "0561234567", color: "#f97316", underline: true },
  { text: " ، مستثمر أبحث عن فرص في " },
  { text: "الرياض وجدة", color: "#22c55e", underline: true },
  { text: " ، مهتم بالعقارات " },
  { text: "التجارية والسكنية", color: "#d97706", underline: true },
  { text: " ، الميزانية من " },
  { text: "5 إلى 20 مليون", color: "#22c55e", underline: true },
  { text: " ، أفضل العائد " },
  { text: "المرتفع", color: "#d97706", underline: true },
];

const fullBuyerExampleText = "اسمي عبدالسلام محمد ، رقم جوالي 0501234567 ، من مدينة جدة حي الروضة ، أرغب بشراء شقة ثلاث غرف حمامين مساحة 120 متر ، الميزانية 800 ألف ، الشراء كاش";
const fullSellerExampleText = "اسمي محمد العلي ، جوالي 0551234567 ، أعرض فيلا في الرياض حي النرجس ، المساحة 400 متر ، السعر 2.5 مليون ، جاهزة للسكن";
const fullInvestorExampleText = "اسمي خالد المحمد ، جوالي 0561234567 ، مستثمر أبحث عن فرص في الرياض وجدة ، مهتم بالعقارات التجارية والسكنية ، الميزانية من 5 إلى 20 مليون ، أفضل العائد المرتفع";

export default function HeroSection() {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<UserMode>("buyer");
  const [inputText, setInputText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [conversation, setConversation] = useState<Array<{type: "user" | "system", text: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, string>>({});
  const [confirmationFields, setConfirmationFields] = useState<Array<{label: string, value: string, isCheck?: boolean}>>([]);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const exampleSegments = mode === "buyer" ? buyerExampleSegments : mode === "seller" ? sellerExampleSegments : investorExampleSegments;
  const fullExampleText = mode === "buyer" ? fullBuyerExampleText : mode === "seller" ? fullSellerExampleText : fullInvestorExampleText;

  const buyerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/buyers/register", data);
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "تم تسجيل رغبتك بنجاح!",
        description: "سنتواصل معك عند توفر عقار مناسب",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
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
        title: "تم تسجيل عقارك بنجاح!",
        description: "سنتواصل معك عند وجود مشترين مهتمين",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
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
        title: "تم تسجيل اهتمامك بنجاح!",
        description: "سنتواصل معك عند توفر فرص استثمارية مناسبة",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const aiAnalysisMutation = useMutation({
    mutationFn: async (text: string): Promise<AIAnalysisResult> => {
      const res = await apiRequest("POST", "/api/intake/analyze", { text });
      return res.json();
    },
  });

  useEffect(() => {
    const totalLength = exampleSegments.reduce((acc, seg) => acc + seg.text.length, 0);
    if (charIndex < totalLength) {
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setCharIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
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

  const generateConfirmationFields = (data: Record<string, string>, currentMode: UserMode) => {
    if (currentMode === "buyer") {
      const fields = [
        { label: "الاسم", value: data.name },
        { label: "الجوال", value: data.phone },
        { label: "المدينة", value: data.city },
        data.district ? { label: "الحي", value: data.district } : null,
        { label: "نوع العقار", value: data.propertyType },
        data.budget ? { label: "الميزانية", value: formatBudget(data.budget) } : null,
        data.paymentMethod ? { label: "طريقة الدفع", value: data.paymentMethod === "cash" ? "كاش" : "تمويل بنكي" } : null,
        data.additionalNotes ? { label: "معلومات إضافية", value: data.additionalNotes } : null,
      ].filter(Boolean) as Array<{label: string, value: string}>;
      return fields;
    } else if (currentMode === "seller") {
      const fields = [
        { label: "الاسم", value: data.name },
        { label: "الجوال", value: data.phone },
        { label: "المدينة", value: data.city },
        { label: "الحي", value: data.district },
        { label: "نوع العقار", value: data.propertyType },
        { label: "السعر", value: formatBudget(data.price) },
        data.status ? { label: "الحالة", value: data.status === "ready" ? "جاهز للسكن" : "تحت الإنشاء" } : null,
        (data.latitude && data.longitude) ? { label: "الموقع", value: "✓ تم تحديده", isCheck: true } : { label: "الموقع", value: "لم يتم تحديده" },
        uploadedFiles.length > 0 ? { label: "الصور", value: `✓ تم رفع ${uploadedFiles.length} ملف`, isCheck: true } : { label: "الصور", value: "لم يتم رفع صور" },
        data.additionalNotes ? { label: "معلومات إضافية", value: data.additionalNotes } : null,
      ].filter(Boolean) as Array<{label: string, value: string, isCheck?: boolean}>;
      return fields;
    } else {
      const fields = [
        { label: "الاسم", value: data.name },
        { label: "الجوال", value: data.phone },
        { label: "المدن المستهدفة", value: data.cities },
        data.investmentTypes ? { label: "نوع الاستثمار", value: data.investmentTypes } : null,
        (data.budgetMin && data.budgetMax) ? { label: "الميزانية", value: `من ${formatBudget(data.budgetMin)} إلى ${formatBudget(data.budgetMax)}` } : null,
        data.returnPreference ? { label: "هدف الاستثمار", value: data.returnPreference } : null,
        data.additionalNotes ? { label: "معلومات إضافية", value: data.additionalNotes } : null,
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
        { type: "system", text: "تم تسجيل رغبتك بنجاح! سنتواصل معك عند توفر عقار مناسب." }
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
        { type: "system", text: "تم تسجيل عقارك بنجاح! سنتواصل معك عند وجود مشترين مهتمين." }
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
        { type: "system", text: "تم تسجيل اهتمامك بنجاح! سنتواصل معك عند توفر فرص استثمارية مناسبة." }
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
      const aiResult = await aiAnalysisMutation.mutateAsync(userText);
      
      // Convert AI result to merged data format
      let mergedData = { ...extractedData };
      
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
      } else if (aiResult.data) {
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
              { type: "system", text: "يبدو أنك تريد عرض عقار للبيع. هل تريد التبديل لوضع البائع؟" }
            ]);
          }
        }
        
        setAiConfidence(aiResult.confidence);
        setExtractedData(mergedData);
      }
      
      // Check required fields based on mode
      if (mode === "buyer") {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.propertyType;
        if (hasRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          const missing: string[] = (aiResult?.missingFields && aiResult.missingFields.length > 0) ? [...aiResult.missingFields] : [];
          if (!mergedData.name && !missing.includes("الاسم")) missing.push("الاسم");
          if (!mergedData.phone && !missing.includes("رقم الجوال")) missing.push("رقم الجوال");
          if (!mergedData.city && !missing.includes("المدينة")) missing.push("المدينة");
          if (!mergedData.propertyType && !missing.includes("نوع العقار")) missing.push("نوع العقار");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `فهمت طلبك! يرجى إضافة: ${missing.join("، ")}` }
          ]);
        }
      } else if (mode === "seller") {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.district && mergedData.propertyType && mergedData.price && uploadedFiles.length > 0 && mergedData.latitude && mergedData.longitude;
        if (hasRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          const missing: string[] = [];
          if (!mergedData.name) missing.push("الاسم");
          if (!mergedData.phone) missing.push("رقم الجوال");
          if (!mergedData.city) missing.push("المدينة");
          if (!mergedData.district) missing.push("الحي");
          if (!mergedData.propertyType) missing.push("نوع العقار");
          if (!mergedData.price) missing.push("السعر");
          if (uploadedFiles.length === 0) missing.push("الصور أو الفيديوهات");
          if (!mergedData.latitude || !mergedData.longitude) missing.push("الموقع الدقيق");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `فهمت طلبك! يرجى إضافة: ${missing.join("، ")}` }
          ]);
        }
      } else {
        // Investor mode - use cities from AI
        if (aiResult?.data?.city) {
          mergedData.cities = aiResult.data.city;
        }
        const hasRequired = mergedData.name && mergedData.phone && mergedData.cities;
        if (hasRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          const missing: string[] = [];
          if (!mergedData.name) missing.push("الاسم");
          if (!mergedData.phone) missing.push("رقم الجوال");
          if (!mergedData.cities) missing.push("المدن المستهدفة");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `فهمت طلبك! يرجى إضافة: ${missing.join("، ")}` }
          ]);
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
      
      // Check required fields
      if (mode === "buyer") {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.propertyType;
        if (hasRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          const missing: string[] = [];
          if (!mergedData.name) missing.push("الاسم");
          if (!mergedData.phone) missing.push("رقم الجوال");
          if (!mergedData.city) missing.push("المدينة");
          if (!mergedData.propertyType) missing.push("نوع العقار");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `شكراً! يرجى إضافة: ${missing.join("، ")}` }
          ]);
        }
      } else if (mode === "seller") {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.district && mergedData.propertyType && mergedData.price && uploadedFiles.length > 0 && mergedData.latitude && mergedData.longitude;
        if (hasRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          const missing: string[] = [];
          if (!mergedData.name) missing.push("الاسم");
          if (!mergedData.phone) missing.push("رقم الجوال");
          if (!mergedData.city) missing.push("المدينة");
          if (!mergedData.district) missing.push("الحي");
          if (!mergedData.propertyType) missing.push("نوع العقار");
          if (!mergedData.price) missing.push("السعر");
          if (uploadedFiles.length === 0) missing.push("الصور أو الفيديوهات");
          if (!mergedData.latitude || !mergedData.longitude) missing.push("الموقع الدقيق");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `شكراً! يرجى إضافة: ${missing.join("، ")}` }
          ]);
        }
      } else {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.cities;
        if (hasRequired) {
          setPendingConfirmation(true);
          setPendingData(mergedData);
          setConfirmationFields(generateConfirmationFields(mergedData, mode));
        } else {
          const missing: string[] = [];
          if (!mergedData.name) missing.push("الاسم");
          if (!mergedData.phone) missing.push("رقم الجوال");
          if (!mergedData.cities) missing.push("المدن المستهدفة");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `شكراً! يرجى إضافة: ${missing.join("، ")}` }
          ]);
        }
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
          <div className="flex justify-center gap-2 mb-6">
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
          </div>

          <Card className="max-w-3xl mx-auto p-0 overflow-hidden shadow-2xl mb-8">
            {/* Typewriter Example - Always visible */}
            {!isComplete && (
              <div className={`p-4 border-b ${mode === "seller" ? "bg-green-50 dark:bg-green-950/20" : mode === "investor" ? "bg-amber-50 dark:bg-amber-950/20" : "bg-muted/10"}`}>
                <p className="text-sm text-muted-foreground mb-2 text-center">
                  {mode === "buyer" ? "مثال على طلب شراء:" : mode === "seller" ? "مثال على عرض عقار:" : "مثال على طلب استثماري:"}
                </p>
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
                      data-placeholder={mode === "buyer" ? "اكتب رغبتك هنا..." : "اكتب تفاصيل عقارك هنا..."}
                      data-testid="input-interactive"
                    />
                  </div>
                </div>
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
