import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ConversationStep = "intro" | "name" | "city" | "propertyType" | "purpose" | "budget" | "contact" | "complete";

interface ExtractedData {
  name: string;
  city: string;
  district: string;
  propertyType: string;
  purpose: string;
  budget: string;
  phone: string;
  email: string;
}

const stepPrompts: Record<ConversationStep, string> = {
  intro: "مرحباً! أخبرني عن نفسك وماذا تبحث...",
  name: "ما اسمك الكريم؟",
  city: "في أي مدينة تبحث عن العقار؟",
  propertyType: "ما نوع العقار الذي تريده؟ (شقة، فيلا، عمارة، أرض)",
  purpose: "هل الشراء للسكن أم للاستثمار؟",
  budget: "ما ميزانيتك المتوقعة؟",
  contact: "أخيراً، ما رقم جوالك للتواصل؟",
  complete: "شكراً! تم تسجيل رغبتك بنجاح",
};

const suggestions = [
  "اسمي عبدالسلام محمد",
  "من مدينة جدة",
  "أرغب بشراء شقة",
  "للسكن العائلي",
  "ميزانيتي 800 ألف",
];

export default function InteractiveWishForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<ConversationStep>("intro");
  const [inputText, setInputText] = useState("");
  const [conversation, setConversation] = useState<Array<{ type: "user" | "system"; text: string; highlights?: string[] }>>([
    { type: "system", text: "مرحباً بك في تطابق! صف لي ما تبحث عنه وسأساعدك..." }
  ]);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    name: "",
    city: "",
    district: "",
    propertyType: "",
    purpose: "",
    budget: "",
    phone: "",
    email: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isNewUser, setIsNewUser] = useState(false);

  const highlightPatterns = [
    { pattern: /(اسمي|أنا)\s+([\u0600-\u06FF\s]+)/g, type: "name", color: "text-primary" },
    { pattern: /(جدة|الرياض|مكة|المدينة|الدمام|الخبر)/g, type: "city", color: "text-chart-2" },
    { pattern: /(شقة|فيلا|عمارة|أرض|دوبلكس)/g, type: "propertyType", color: "text-chart-3" },
    { pattern: /(سكن|استثمار|للسكن|للاستثمار)/g, type: "purpose", color: "text-chart-4" },
    { pattern: /(\d+)\s*(ألف|مليون|ريال)/g, type: "budget", color: "text-chart-5" },
    { pattern: /(05\d{8})/g, type: "phone", color: "text-primary" },
  ];

  const registerMutation = useMutation({
    mutationFn: async (data: ExtractedData) => {
      const res = await apiRequest("POST", "/api/buyers/register", {
        name: data.name,
        phone: data.phone,
        city: data.city,
        district: data.district || "",
        propertyType: data.propertyType,
        purpose: data.purpose,
        budget: data.budget,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setIsNewUser(data.isNewUser || false);
      toast({
        title: "تم تسجيل رغبتك بنجاح!",
        description: "سنرسل لك العروض المناسبة قريباً",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (currentStep === "complete" && !registerMutation.isPending) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isNewUser) {
              setLocation("/setup-password");
            } else {
              setLocation("/login");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, registerMutation.isPending, isNewUser, setLocation]);

  const extractInfo = (text: string) => {
    const newData = { ...extractedData };
    
    const nameMatch = text.match(/(اسمي|أنا)\s+([\u0600-\u06FF\s]+?)(?:\s+(?:من|في|أبحث|أريد|أرغب)|$)/);
    if (nameMatch) newData.name = nameMatch[2].trim();
    
    const cityMatch = text.match(/(جدة|الرياض|مكة|المدينة|الدمام|الخبر)/);
    if (cityMatch) newData.city = cityMatch[1];
    
    const typeMatch = text.match(/(شقة|فيلا|عمارة|أرض|دوبلكس)/);
    if (typeMatch) newData.propertyType = typeMatch[1];
    
    const purposeMatch = text.match(/(سكن|استثمار|للسكن|للاستثمار)/);
    if (purposeMatch) newData.purpose = purposeMatch[1].replace("لل", "");
    
    const budgetMatch = text.match(/(\d+)\s*(ألف|مليون)/);
    if (budgetMatch) newData.budget = `${budgetMatch[1]} ${budgetMatch[2]}`;
    
    const phoneMatch = text.match(/(05\d{8})/);
    if (phoneMatch) newData.phone = phoneMatch[1];
    
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

  const determineNextStep = (data: ExtractedData): ConversationStep => {
    if (!data.name) return "name";
    if (!data.city) return "city";
    if (!data.propertyType) return "propertyType";
    if (!data.purpose) return "purpose";
    if (!data.budget) return "budget";
    if (!data.phone) return "contact";
    return "complete";
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
      const nextStep = determineNextStep(newData);
      setCurrentStep(nextStep);
      
      if (nextStep === "complete") {
        setConversation(prev => [
          ...prev,
          { type: "system", text: "ممتاز! تم جمع كل المعلومات. جاري تسجيل رغبتك..." }
        ]);
        registerMutation.mutate(newData);
      } else {
        setConversation(prev => [
          ...prev,
          { type: "system", text: stepPrompts[nextStep] }
        ]);
      }
      setIsTyping(false);
    }, 800);
  };

  const addSuggestion = (suggestion: string) => {
    setInputText(prev => prev ? `${prev} ${suggestion}` : suggestion);
    if (textareaRef.current) {
      textareaRef.current.textContent = inputText ? `${inputText} ${suggestion}` : suggestion;
    }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filledFields = Object.entries(extractedData).filter(([_, v]) => v).length;
  const totalFields = 6;
  const progress = (filledFields / totalFields) * 100;

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
              <span className="text-xs text-muted-foreground">{filledFields}/{totalFields} معلومات</span>
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
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => addSuggestion(suggestion)}
                  className="text-xs"
                  disabled={currentStep === "complete"}
                  data-testid={`button-suggestion-${idx}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            <div className="relative">
              <div
                ref={textareaRef}
                contentEditable={currentStep !== "complete"}
                className="min-h-[60px] max-h-[150px] overflow-y-auto p-4 pr-14 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                onInput={(e) => setInputText(e.currentTarget.textContent || "")}
                onKeyDown={handleKeyDown}
                data-placeholder="اكتب هنا... مثال: اسمي عبدالسلام من جدة، أبحث عن شقة للسكن"
                data-testid="input-interactive"
              />
              <Button
                size="icon"
                className="absolute left-2 bottom-2"
                onClick={handleSubmit}
                disabled={!inputText.trim() || currentStep === "complete"}
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {filledFields > 0 && (
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
              {extractedData.city && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">المدينة:</span>
                  <span className="text-chart-2 font-bold">{extractedData.city}</span>
                </Badge>
              )}
              {extractedData.propertyType && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="text-chart-3 font-bold">{extractedData.propertyType}</span>
                </Badge>
              )}
              {extractedData.purpose && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الغرض:</span>
                  <span className="text-chart-4 font-bold">{extractedData.purpose}</span>
                </Badge>
              )}
              {extractedData.budget && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الميزانية:</span>
                  <span className="text-chart-5 font-bold">{extractedData.budget}</span>
                </Badge>
              )}
              {extractedData.phone && (
                <Badge variant="secondary" className="gap-1">
                  <span className="text-muted-foreground">الجوال:</span>
                  <span className="text-primary font-bold" dir="ltr">{extractedData.phone}</span>
                </Badge>
              )}
            </div>
          </Card>
        )}

        {currentStep === "complete" && (
          <Card className="mt-6 p-6 bg-primary/5 border-primary/20 text-center">
            {registerMutation.isPending ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">جاري تسجيل رغبتك...</h3>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2" data-testid="text-completion-title">تم تسجيل رغبتك بنجاح!</h3>
                <p className="text-muted-foreground mb-4">
                  سنبدأ بالبحث عن العقارات المناسبة لك وسنرسل لك العروض عبر واتساب والإيميل
                </p>
                <div className="text-sm text-muted-foreground">
                  {isNewUser ? (
                    <p>سيتم تحويلك لإعداد كلمة المرور خلال {countdown} ثوانٍ...</p>
                  ) : (
                    <p>سيتم تحويلك لتسجيل الدخول خلال {countdown} ثوانٍ...</p>
                  )}
                </div>
                <Button 
                  className="mt-4" 
                  onClick={() => setLocation(isNewUser ? "/setup-password" : "/login")}
                  data-testid="button-go-to-login"
                >
                  {isNewUser ? "إعداد كلمة المرور الآن" : "تسجيل الدخول الآن"}
                </Button>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
