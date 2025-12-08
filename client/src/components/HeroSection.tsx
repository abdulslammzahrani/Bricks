import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, Send, Sparkles, ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExampleSegment {
  text: string;
  color?: string;
  underline?: boolean;
}

const exampleSegments: ExampleSegment[] = [
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

const fullExampleText = "اسمي عبدالسلام محمد ، رقم جوالي 0501234567 ، من مدينة جدة حي الروضة ، أرغب بشراء شقة ثلاث غرف حمامين مساحة 120 متر ، الميزانية 800 ألف ، الشراء كاش";

export default function HeroSection() {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [conversation, setConversation] = useState<Array<{type: "user" | "system", text: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
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
  }, [charIndex]);

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

  const extractInfo = (text: string) => {
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
    if (!inputText.trim()) return;
    
    const newData = extractInfo(inputText);
    setExtractedData(newData);
    
    setConversation(prev => [
      ...prev,
      { type: "user", text: inputText }
    ]);
    
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.textContent = "";
    }
    setIsTyping(true);
    
    setTimeout(() => {
      const hasRequired = newData.name && newData.phone && newData.city && newData.propertyType;
      if (hasRequired) {
        registerMutation.mutate({
          name: newData.name,
          phone: newData.phone,
          city: newData.city,
          districts: newData.district ? [newData.district] : [],
          propertyType: newData.propertyType,
          minBudget: 0,
          maxBudget: parseInt(newData.budget || "0"),
          paymentMethod: newData.paymentMethod || "cash",
        });
        setConversation(prev => [
          ...prev,
          { type: "system", text: "تم تسجيل رغبتك بنجاح! سنتواصل معك عند توفر عقار مناسب." }
        ]);
      } else {
        const missing: string[] = [];
        if (!newData.name) missing.push("الاسم");
        if (!newData.phone) missing.push("رقم الجوال");
        if (!newData.city) missing.push("المدينة");
        if (!newData.propertyType) missing.push("نوع العقار");
        setConversation(prev => [
          ...prev,
          { type: "system", text: `شكراً! يرجى إضافة: ${missing.join("، ")}` }
        ]);
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
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10" data-testid="text-hero-description">
            فقط أخبرنا ماذا تريد بكلماتك الخاصة، وسنفهم ونجد لك العقار المناسب
          </p>

          <Card className="max-w-3xl mx-auto p-0 overflow-hidden shadow-2xl mb-8">
            {/* Typewriter Example - Always visible */}
            {!isComplete && (
              <div className="p-4 border-b bg-muted/10">
                <p className="text-sm text-muted-foreground mb-2 text-center">مثال على طريقة الكتابة:</p>
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
                          ? "bg-primary text-primary-foreground rounded-tr-none"
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
                <div className="flex items-start gap-3">
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={!inputText.trim() || registerMutation.isPending}
                    data-testid="button-send"
                    className="flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <div
                      ref={textareaRef}
                      contentEditable
                      className="min-h-[50px] p-3 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                      onInput={(e) => setInputText(e.currentTarget.textContent || "")}
                      onKeyDown={handleKeyDown}
                      data-placeholder="اكتب هنا بطريقتك..."
                      data-testid="input-interactive"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-primary/5 text-center">
                <Check className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">تم تسجيل رغبتك بنجاح!</h3>
                <p className="text-muted-foreground">سنتواصل معك عند توفر عقار مناسب</p>
              </div>
            )}
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/seller-form">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-list-property">
                <Building2 className="h-5 w-5" />
                اعرض عقارك
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>+500 مشتري مسجل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>+200 عقار متاح</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>+50 مطابقة ناجحة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
