import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Send, Sparkles, Check, Users, Image, X, MapPin, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUploadButton } from "./FileUploadButton";
import { LocationPicker } from "./LocationPicker";
import { InvestorModal } from "./InvestorModal";

type UserMode = "buyer" | "seller";

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

const fullBuyerExampleText = "اسمي عبدالسلام محمد ، رقم جوالي 0501234567 ، من مدينة جدة حي الروضة ، أرغب بشراء شقة ثلاث غرف حمامين مساحة 120 متر ، الميزانية 800 ألف ، الشراء كاش";
const fullSellerExampleText = "اسمي محمد العلي ، جوالي 0551234567 ، أعرض فيلا في الرياض حي النرجس ، المساحة 400 متر ، السعر 2.5 مليون ، جاهزة للسكن";

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
  const [showInvestorModal, setShowInvestorModal] = useState(false);

  const exampleSegments = mode === "buyer" ? buyerExampleSegments : sellerExampleSegments;
  const fullExampleText = mode === "buyer" ? fullBuyerExampleText : fullSellerExampleText;

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

  const extractBuyerInfo = (text: string) => {
    const data: Record<string, string> = { ...extractedData };
    
    const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    if (nameMatch) data.name = nameMatch[1];
    
    const phoneMatch = text.match(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    if (phoneMatch) data.phone = phoneMatch[1];
    
    const cityMatch = text.match(/(?:من|مدينة|في)\s+(الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)/i);
    if (cityMatch) data.city = cityMatch[1];
    
    const districtMatch = text.match(/(?:حي|منطقة)\s+([^\s,،.]+)/i);
    if (districtMatch) data.district = districtMatch[1];
    
    const typeMatch = text.match(/(شقة|فيلا|دوبلكس|أرض|عمارة|استوديو)/i);
    if (typeMatch) data.propertyType = typeMatch[1];
    
    const budgetMatch = text.match(/(?:الميزانية|ميزانيتي|بسعر|بمبلغ)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    if (budgetMatch) {
      let amount = parseFloat(budgetMatch[1]);
      if (budgetMatch[2]?.includes("مليون")) amount *= 1000000;
      else if (budgetMatch[2]) amount *= 1000;
      data.budget = amount.toString();
    }
    
    const paymentMatch = text.match(/(كاش|نقد|نقدي|بنك|تمويل|قرض)/i);
    if (paymentMatch) {
      data.paymentMethod = paymentMatch[1].match(/كاش|نقد|نقدي/i) ? "cash" : "bank";
    }
    
    return data;
  };

  const extractSellerInfo = (text: string) => {
    const data: Record<string, string> = { ...extractedData };
    
    const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    if (nameMatch) data.name = nameMatch[1];
    
    const phoneMatch = text.match(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    if (phoneMatch) data.phone = phoneMatch[1];
    
    const cityMatch = text.match(/(?:في|مدينة)\s+(الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)/i);
    if (cityMatch) data.city = cityMatch[1];
    
    const districtMatch = text.match(/(?:حي|منطقة)\s+([^\s,،.]+)/i);
    if (districtMatch) data.district = districtMatch[1];
    
    const typeMatch = text.match(/(?:أعرض|اعرض|لدي|عندي)?\s*(شقة|فيلا|دوبلكس|أرض|عمارة|استوديو)/i);
    if (typeMatch) data.propertyType = typeMatch[1];
    
    const priceMatch = text.match(/(?:السعر|بسعر|بمبلغ)?\s*(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)?/i);
    if (priceMatch) {
      let amount = parseFloat(priceMatch[1]);
      if (priceMatch[2]?.includes("مليون")) amount *= 1000000;
      else if (priceMatch[2]) amount *= 1000;
      data.price = amount.toString();
    }
    
    const statusMatch = text.match(/(جاهز|جاهزة|تحت الإنشاء|قيد الإنشاء)/i);
    if (statusMatch) {
      data.status = statusMatch[1].includes("جاهز") ? "ready" : "under_construction";
    }
    
    // Extract coordinates from Google Maps link
    const mapsLinkMatch = text.match(/(?:maps\.google\.com|google\.com\/maps|goo\.gl\/maps)[^\s]*[?&@](-?\d+\.?\d*)[,/](-?\d+\.?\d*)/i);
    if (mapsLinkMatch) {
      data.latitude = mapsLinkMatch[1];
      data.longitude = mapsLinkMatch[2];
    }
    
    // Extract coordinates from direct input (e.g., "24.7136, 46.6753" or "24.7136 46.6753")
    const coordMatch = text.match(/(-?\d{1,3}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/);
    if (coordMatch && !mapsLinkMatch) {
      data.latitude = coordMatch[1];
      data.longitude = coordMatch[2];
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

  const handleSubmit = () => {
    const hasInput = inputText.trim().length > 0;
    
    let mergedData = { ...extractedData };
    
    if (hasInput) {
      const newData = mode === "buyer" ? extractBuyerInfo(inputText) : extractSellerInfo(inputText);
      Object.keys(newData).forEach(key => {
        if (newData[key]) {
          mergedData[key] = newData[key];
        }
      });
      setExtractedData(mergedData);
      
      setConversation(prev => [
        ...prev,
        { type: "user", text: inputText }
      ]);
      
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.textContent = "";
      }
    }
    
    setIsTyping(true);
    
    setTimeout(() => {
      if (mode === "buyer") {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.propertyType;
        if (hasRequired) {
          buyerMutation.mutate({
            name: mergedData.name,
            email: `${mergedData.phone}@temp.com`,
            phone: mergedData.phone,
            city: mergedData.city,
            districts: mergedData.district ? [mergedData.district] : [],
            propertyType: mergedData.propertyType === "شقة" ? "apartment" : mergedData.propertyType === "فيلا" ? "villa" : mergedData.propertyType === "أرض" ? "land" : "apartment",
            budgetMin: 0,
            budgetMax: parseInt(mergedData.budget || "0"),
            paymentMethod: mergedData.paymentMethod || "cash",
          });
          setConversation(prev => [
            ...prev,
            { type: "system", text: "تم تسجيل رغبتك بنجاح! سنتواصل معك عند توفر عقار مناسب." }
          ]);
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
      } else {
        const hasRequired = mergedData.name && mergedData.phone && mergedData.city && mergedData.district && mergedData.propertyType && mergedData.price && uploadedFiles.length > 0 && mergedData.latitude && mergedData.longitude;
        if (hasRequired) {
          sellerMutation.mutate({
            name: mergedData.name,
            email: `${mergedData.phone}@temp.com`,
            phone: mergedData.phone,
            city: mergedData.city,
            district: mergedData.district,
            propertyType: mergedData.propertyType === "شقة" ? "apartment" : mergedData.propertyType === "فيلا" ? "villa" : mergedData.propertyType === "أرض" ? "land" : "apartment",
            price: parseInt(mergedData.price),
            status: mergedData.status || "ready",
            images: uploadedFiles,
            latitude: parseFloat(mergedData.latitude),
            longitude: parseFloat(mergedData.longitude),
          });
          setConversation(prev => [
            ...prev,
            { type: "system", text: "تم تسجيل عقارك بنجاح! سنتواصل معك عند وجود مشترين مهتمين." }
          ]);
        } else {
          const missing: string[] = [];
          if (!mergedData.name) missing.push("الاسم");
          if (!mergedData.phone) missing.push("رقم الجوال");
          if (!mergedData.city) missing.push("المدينة");
          if (!mergedData.district) missing.push("الحي");
          if (!mergedData.propertyType) missing.push("نوع العقار");
          if (!mergedData.price) missing.push("السعر");
          if (uploadedFiles.length === 0) missing.push("الصور أو الفيديوهات");
          if (!mergedData.latitude || !mergedData.longitude) missing.push("الموقع الدقيق (أرسل رابط خرائط جوجل أو الإحداثيات)");
          setConversation(prev => [
            ...prev,
            { type: "system", text: `شكراً! يرجى إضافة: ${missing.join("، ")}` }
          ]);
        }
      }
      setIsTyping(false);
    }, 800);
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

          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <Button
              size="lg"
              variant={mode === "buyer" ? "default" : "outline"}
              onClick={() => handleModeSwitch("buyer")}
              className="gap-2"
              data-testid="button-mode-buyer"
            >
              <Users className="h-5 w-5" />
              أبحث عن عقار
            </Button>
            <Button
              size="lg"
              variant={mode === "seller" ? "default" : "outline"}
              onClick={() => handleModeSwitch("seller")}
              className={`gap-2 ${mode === "seller" ? "bg-green-600 hover:bg-green-700" : "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"}`}
              data-testid="button-mode-seller"
            >
              <Building2 className="h-5 w-5" />
              اعرض عقارك
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowInvestorModal(true)}
              className="gap-2 border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
              data-testid="button-investor"
            >
              <TrendingUp className="h-5 w-5" />
              فرص للمستثمرين
            </Button>
          </div>

          <Card className="max-w-3xl mx-auto p-0 overflow-hidden shadow-2xl mb-8">
            {/* Typewriter Example - Always visible */}
            {!isComplete && (
              <div className={`p-4 border-b ${mode === "seller" ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/10"}`}>
                <p className="text-sm text-muted-foreground mb-2 text-center">
                  {mode === "buyer" ? "مثال على طلب شراء:" : "مثال على عرض عقار:"}
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
            {conversation.length > 0 && (
              <div className="min-h-[120px] max-h-[200px] overflow-y-auto p-4 space-y-3 bg-muted/20">
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.type === "user"
                          ? mode === "seller" ? "bg-green-600 text-white rounded-tr-none" : "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-end">
                    <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
      
      {/* Investor Modal */}
      <InvestorModal
        open={showInvestorModal}
        onOpenChange={setShowInvestorModal}
      />
    </section>
  );
}
