import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

interface ExtractedData {
  name: string;
  city: string;
  district: string;
  propertyType: string;
  propertyDetails: string;
  rooms: string;
  bathrooms: string;
  area: string;
  paymentMethod: string;
  budget: string;
  budgetMin: number | null;
  budgetMax: number | null;
  phone: string;
  email: string;
}

interface MissingField {
  key: keyof ExtractedData;
  label: string;
  question: string;
  required: boolean;
}

const requiredFields: MissingField[] = [
  { key: "name", label: "الاسم", question: "ما اسمك الكريم؟", required: true },
  { key: "phone", label: "رقم الجوال", question: "ما رقم جوالك للتواصل؟ (مثال: 0501234567)", required: true },
  { key: "city", label: "المدينة", question: "في أي مدينة تبحث عن العقار؟ (جدة، الرياض، مكة...)", required: true },
  { key: "district", label: "الحي", question: "في أي حي تفضل؟ (مثال: حي الروضة، حي النزهة...)", required: true },
  { key: "propertyType", label: "نوع العقار", question: "ما نوع العقار الذي تريده؟ (شقة، فيلا، عمارة، أرض)", required: true },
  { key: "propertyDetails", label: "تفاصيل العقار", question: "كم غرفة وحمام تحتاج؟ وما المساحة المطلوبة؟", required: true },
  { key: "paymentMethod", label: "طريقة الدفع", question: "هل الشراء كاش أم عن طريق البنك (تمويل عقاري)؟", required: true },
  { key: "email", label: "الإيميل", question: "هل لديك إيميل للتواصل؟ (اختياري)", required: false },
];

const suggestions = [
  "اسمي عبدالسلام محمد",
  "جوالي 0501234567",
  "من جدة حي الروضة",
  "أرغب بشراء شقة ثلاث غرف حمامين مساحة 120 متر",
  "الشراء كاش",
  "ميزانيتي 800 ألف",
];

const rotatingQuestions = [
  "اسمي عبدالسلام محمد",
  "جوالي 0501234567",
  "من جدة حي الروضة",
  "أرغب بشراء شقة ثلاث غرف حمامين مساحة 120 متر",
  "الشراء كاش",
  "ميزانيتي 800 ألف",
];

const propertyTypeMap: Record<string, string> = {
  "شقة": "apartment",
  "فيلا": "villa",
  "عمارة": "building",
  "أرض": "land",
  "دوبلكس": "apartment",
};

const paymentMethodMap: Record<string, string> = {
  "كاش": "cash",
  "نقد": "cash",
  "نقدي": "cash",
  "بنك": "bank",
  "تمويل": "bank",
  "قرض": "bank",
  "تمويل عقاري": "bank",
};

export default function InteractiveWishForm() {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [conversation, setConversation] = useState<Array<{ type: "user" | "system"; text: string; highlights?: string[] }>>([
    { type: "system", text: "مرحباً بك في تطابق! أخبرني عن نفسك وما تبحث عنه، وسأساعدك في إيجاد العقار المناسب..." }
  ]);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    name: "",
    city: "",
    district: "",
    propertyType: "",
    propertyDetails: "",
    rooms: "",
    bathrooms: "",
    area: "",
    paymentMethod: "",
    budget: "",
    budgetMin: null,
    budgetMax: null,
    phone: "",
    email: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Rotate through questions every 3 seconds
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setCurrentQuestionIndex((prev) => (prev + 1) % rotatingQuestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isComplete]);

  const registerMutation = useMutation({
    mutationFn: async (data: ExtractedData) => {
      const response = await apiRequest("POST", "/api/buyers/register", {
        name: data.name,
        email: data.email || `${data.phone}@temp.tatabuq.sa`,
        phone: data.phone,
        city: data.city,
        districts: data.district ? [data.district] : [],
        propertyType: propertyTypeMap[data.propertyType] || "apartment",
        rooms: data.rooms || null,
        area: data.area || null,
        paymentMethod: paymentMethodMap[data.paymentMethod] || "cash",
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "تم تسجيل رغبتك بنجاح!",
        description: "سنرسل لك العروض المناسبة قريباً عبر واتساب والإيميل",
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

  const highlightPatterns = [
    { pattern: /(اسمي|أنا)\s+([\u0600-\u06FF\s]+?)(?=\s+(?:من|في|أبحث|أريد|أرغب|جوالي|$))/g, color: "text-primary" },
    { pattern: /(جدة|الرياض|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|خميس مشيط|نجران|جازان|الأحساء|القطيف)/g, color: "text-chart-2" },
    { pattern: /(حي\s+[\u0600-\u06FF]+)/g, color: "text-chart-2" },
    { pattern: /(شقة|فيلا|عمارة|أرض|دوبلكس)/g, color: "text-chart-3" },
    { pattern: /(كاش|نقد|نقدي|بنك|تمويل|قرض|تمويل عقاري)/g, color: "text-chart-4" },
    { pattern: /(\d+)\s*(ألف|مليون|ريال)/g, color: "text-chart-5" },
    { pattern: /(ثلاث|ثلاثة|اربع|أربع|أربعة|خمس|خمسة|ست|سته|ستة|سبع|سبعة|ثمان|ثمانية|غرفة|غرف|حمام|حمامين|حمامات)/g, color: "text-chart-3" },
    { pattern: /(\d+)\s*(غرف|غرفة|حمام|حمامات|متر|م)/g, color: "text-chart-3" },
    { pattern: /(05\d{8})/g, color: "text-primary" },
    { pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, color: "text-chart-3" },
  ];

  const extractInfo = (text: string) => {
    const newData = { ...extractedData };
    
    // Extract name - handle "اسمي محمد" or "أنا أحمد محمد" 
    const nameMatch = text.match(/(اسمي|أنا)\s+([\u0600-\u06FF\s]+)/);
    if (nameMatch) {
      // Clean up the name by removing trailing keywords
      let name = nameMatch[2].trim();
      const stopWords = ["من", "في", "أبحث", "أريد", "أرغب", "جوالي", "الشراء", "ميزانيتي"];
      for (const word of stopWords) {
        const idx = name.indexOf(word);
        if (idx > 0) {
          name = name.substring(0, idx).trim();
        }
      }
      if (name) newData.name = name;
    }
    
    // Extract city
    const cityMatch = text.match(/(جدة|الرياض|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|خميس مشيط|نجران|جازان|الأحساء|القطيف)/);
    if (cityMatch) newData.city = cityMatch[1];
    
    // Extract district
    const districtMatch = text.match(/حي\s+([\u0600-\u06FF]+)/);
    if (districtMatch) newData.district = districtMatch[1];
    
    // Extract property type
    const typeMatch = text.match(/(شقة|فيلا|عمارة|أرض|دوبلكس)/);
    if (typeMatch) newData.propertyType = typeMatch[1];
    
    // Extract payment method
    const paymentMatch = text.match(/(كاش|نقد|نقدي|بنك|تمويل|قرض|تمويل عقاري)/);
    if (paymentMatch) newData.paymentMethod = paymentMatch[1];
    
    // Extract rooms (Arabic numbers)
    const arabicRoomsMap: Record<string, string> = {
      "غرفة": "1", "غرفتين": "2", "ثلاث": "3", "ثلاثة": "3",
      "اربع": "4", "أربع": "4", "أربعة": "4", "خمس": "5", "خمسة": "5",
      "ست": "6", "سته": "6", "ستة": "6", "سبع": "7", "سبعة": "7"
    };
    
    const roomsMatch = text.match(/(ثلاث|ثلاثة|اربع|أربع|أربعة|خمس|خمسة|ست|سته|ستة|سبع|سبعة|\d+)\s*(غرف|غرفة)/);
    if (roomsMatch) {
      newData.rooms = arabicRoomsMap[roomsMatch[1]] || roomsMatch[1];
    }
    
    // Extract bathrooms
    const bathroomsMatch = text.match(/(حمام|حمامين|\d+\s*حمام)/);
    if (bathroomsMatch) {
      if (bathroomsMatch[1] === "حمامين") {
        newData.bathrooms = "2";
      } else if (bathroomsMatch[1] === "حمام") {
        newData.bathrooms = "1";
      } else {
        const numMatch = bathroomsMatch[1].match(/\d+/);
        if (numMatch) newData.bathrooms = numMatch[0];
      }
    }
    
    // Extract area
    const areaMatch = text.match(/(\d+)\s*(متر|م)/);
    if (areaMatch) newData.area = areaMatch[1];
    
    // Build property details string
    const details = [];
    if (newData.rooms) details.push(`${newData.rooms} غرف`);
    if (newData.bathrooms) details.push(`${newData.bathrooms} حمام`);
    if (newData.area) details.push(`${newData.area} متر`);
    if (details.length > 0) newData.propertyDetails = details.join("، ");
    
    // Extract budget
    const budgetMatch = text.match(/(\d+)\s*(ألف|مليون)/);
    if (budgetMatch) {
      const value = parseInt(budgetMatch[1]);
      const multiplier = budgetMatch[2] === "مليون" ? 1000000 : 1000;
      const budget = value * multiplier;
      newData.budget = `${budgetMatch[1]} ${budgetMatch[2]}`;
      newData.budgetMin = Math.round(budget * 0.8);
      newData.budgetMax = Math.round(budget * 1.2);
    }
    
    // Extract phone
    const phoneMatch = text.match(/(05\d{8})/);
    if (phoneMatch) newData.phone = phoneMatch[1];

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) newData.email = emailMatch[1];
    
    setExtractedData(newData);
    return newData;
  };

  const getHighlightedText = (text: string) => {
    let result = text;
    highlightPatterns.forEach(({ pattern, color }) => {
      result = result.replace(pattern, `<span class="${color} font-bold underline decoration-2 underline-offset-4">$&</span>`);
    });
    return result;
  };

  const getMissingRequiredFields = (data: ExtractedData): MissingField[] => {
    return requiredFields.filter(field => field.required && !data[field.key]);
  };

  const getNextQuestion = (data: ExtractedData): string | null => {
    const missing = getMissingRequiredFields(data);
    if (missing.length === 0) return null;
    return missing[0].question;
  };

  const isFormComplete = (data: ExtractedData): boolean => {
    return getMissingRequiredFields(data).length === 0;
  };

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    
    const newData = extractInfo(inputText);
    const highlightedText = getHighlightedText(inputText);
    
    setConversation(prev => [
      ...prev,
      { type: "user", text: inputText, highlights: [highlightedText] }
    ]);
    
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.textContent = "";
    }
    setIsTyping(true);
    
    setTimeout(() => {
      if (isFormComplete(newData)) {
        // All required fields collected - submit
        registerMutation.mutate(newData);
        setConversation(prev => [
          ...prev,
          { type: "system", text: "ممتاز! تم جمع كل المعلومات المطلوبة. جاري تسجيل رغبتك..." }
        ]);
      } else {
        // Ask for next missing field
        const nextQuestion = getNextQuestion(newData);
        const missingCount = getMissingRequiredFields(newData).length;
        setConversation(prev => [
          ...prev,
          { type: "system", text: `${nextQuestion} (متبقي ${missingCount} معلومات)` }
        ]);
      }
      setIsTyping(false);
    }, 800);
  };

  const addSuggestion = (suggestion: string) => {
    const newText = inputText ? `${inputText} ${suggestion}` : suggestion;
    setInputText(newText);
    if (textareaRef.current) {
      textareaRef.current.textContent = newText;
    }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filledRequiredFields = requiredFields.filter(f => f.required && extractedData[f.key]).length;
  const totalRequiredFields = requiredFields.filter(f => f.required).length;
  const progress = (filledRequiredFields / totalRequiredFields) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary">تجربة جديدة</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-interactive-title">
            أخبرنا عن عقارك المثالي
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-interactive-subtitle">
            اكتب بطريقتك الخاصة... وسنفهم ما تحتاجه
          </p>
        </div>

        <Card className="p-0 overflow-hidden shadow-2xl">
          <div className="p-4 border-b bg-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>جاهز للمساعدة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{filledRequiredFields}/{totalRequiredFields} معلومات مطلوبة</span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="min-h-[300px] max-h-[400px] overflow-y-auto p-6 space-y-4 bg-muted/20">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border rounded-tl-none"
                  }`}
                >
                  {msg.highlights ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.highlights[0] }} />
                  ) : (
                    <p>{msg.text}</p>
                  )}
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

          <div className="p-4 border-t bg-card">
            {!isComplete && (
              <>
                {/* Animated rotating questions */}
                <div className="mb-4 h-12 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="text-center"
                    >
                      <Button
                        variant="ghost"
                        onClick={() => addSuggestion(rotatingQuestions[currentQuestionIndex])}
                        className="text-muted-foreground text-base"
                        data-testid="button-rotating-question"
                      >
                        {rotatingQuestions[currentQuestionIndex]}
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Static suggestion buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggestion(suggestion)}
                      className="text-xs"
                      data-testid={`button-suggestion-${idx}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </>
            )}

            <div className="relative">
              <div
                ref={textareaRef}
                contentEditable={!isComplete}
                className="min-h-[60px] max-h-[150px] overflow-y-auto p-4 pr-14 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                onInput={(e) => setInputText(e.currentTarget.textContent || "")}
                onKeyDown={handleKeyDown}
                data-placeholder="اكتب هنا... مثال: اسمي عبدالسلام من جدة حي الروضة، أبحث عن شقة"
                data-testid="input-interactive"
              />
              <Button
                size="icon"
                className="absolute left-2 bottom-2"
                onClick={handleSubmit}
                disabled={!inputText.trim() || isComplete || registerMutation.isPending}
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {filledRequiredFields > 0 && (
          <Card className="mt-6 p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              المعلومات المستخرجة
            </h3>
            <div className="flex flex-wrap gap-2">
              {extractedData.name && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الاسم:</span>
                  <span className="text-primary font-bold">{extractedData.name}</span>
                </Badge>
              )}
              {extractedData.phone && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الجوال:</span>
                  <span className="text-primary font-bold" dir="ltr">{extractedData.phone}</span>
                </Badge>
              )}
              {extractedData.city && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">المدينة:</span>
                  <span className="text-chart-2 font-bold">{extractedData.city}</span>
                </Badge>
              )}
              {extractedData.district && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الحي:</span>
                  <span className="text-chart-2 font-bold">{extractedData.district}</span>
                </Badge>
              )}
              {extractedData.propertyType && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="text-chart-3 font-bold">{extractedData.propertyType}</span>
                </Badge>
              )}
              {extractedData.propertyDetails && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">التفاصيل:</span>
                  <span className="text-chart-3 font-bold">{extractedData.propertyDetails}</span>
                </Badge>
              )}
              {extractedData.paymentMethod && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الدفع:</span>
                  <span className="text-chart-4 font-bold">{extractedData.paymentMethod}</span>
                </Badge>
              )}
              {extractedData.budget && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الميزانية:</span>
                  <span className="text-chart-5 font-bold">{extractedData.budget}</span>
                </Badge>
              )}
              {extractedData.email && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الإيميل:</span>
                  <span className="text-chart-3 font-bold" dir="ltr">{extractedData.email}</span>
                </Badge>
              )}
            </div>

            {/* Show missing required fields */}
            {getMissingRequiredFields(extractedData).length > 0 && !isComplete && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  معلومات مطلوبة لم تُستخرج بعد:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getMissingRequiredFields(extractedData).map((field) => (
                    <Badge key={field.key} variant="outline" className="text-muted-foreground">
                      {field.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {isComplete && (
          <Card className="mt-6 p-6 bg-primary/5 border-primary/20 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">تم تسجيل رغبتك بنجاح!</h3>
            <p className="text-muted-foreground">
              سنبدأ بالبحث عن العقارات المناسبة لك وسنرسل لك العروض عبر واتساب والإيميل
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
