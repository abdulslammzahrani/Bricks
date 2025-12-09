import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, MapPin, Send, CheckCircle, Sparkles, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";

interface ExampleSegment {
  text: string;
  color?: string;
  underline?: boolean;
}

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

const fullInvestorExampleText = "اسمي خالد المحمد ، جوالي 0561234567 ، مستثمر أبحث عن فرص في الرياض وجدة ، مهتم بالعقارات التجارية والسكنية ، الميزانية من 5 إلى 20 مليون ، أفضل العائد المرتفع";

export default function InvestorPage() {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [conversation, setConversation] = useState<Array<{type: "user" | "system", text: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, string>>({});
  const [confirmationFields, setConfirmationFields] = useState<Array<{label: string, value: string}>>([]);

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

  useEffect(() => {
    const totalLength = investorExampleSegments.reduce((acc, seg) => acc + seg.text.length, 0);
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
    
    for (let i = 0; i < investorExampleSegments.length; i++) {
      const segment = investorExampleSegments[i];
      const segmentStart = currentPos;
      
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
      
      currentPos += segment.text.length;
    }
    
    return elements;
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

  const extractInvestorInfo = (text: string) => {
    const data: Record<string, string> = {};
    
    const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
    if (nameMatch) data.name = nameMatch[1];
    
    const phoneMatch = text.match(/(?:جوالي|رقمي|الجوال|هاتفي|موبايلي)?\s*(05\d{8})/);
    if (phoneMatch) data.phone = phoneMatch[1];
    
    const citiesMatch = text.match(/(?:في|مدينة|مدن)\s+((?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل)(?:\s*(?:و|،|,)\s*(?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|الطائف|تبوك|أبها|القصيم|الأحساء|نجران|جازان|ينبع|حائل|الجبيل))*)/i);
    if (citiesMatch) data.cities = citiesMatch[1];
    
    const investTypeMatch = text.match(/(تجاري|سكني|صناعي|أراضي|تجارية|سكنية|صناعية)/gi);
    if (investTypeMatch) data.investmentTypes = investTypeMatch.join("، ");
    
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
    }
    
    const returnMatch = text.match(/(عائد\s*(?:مرتفع|متوسط|منخفض)|المرتفع|المتوسط|المنخفض)/i);
    if (returnMatch) data.returnPreference = returnMatch[1];
    
    return data;
  };

  const formatBudget = (amount: string) => {
    const num = parseInt(amount);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} مليون`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} ألف`;
    return amount;
  };

  const generateConfirmationFields = (data: Record<string, string>) => {
    const fields = [
      { label: "الاسم", value: data.name },
      { label: "الجوال", value: data.phone },
      { label: "المدن المستهدفة", value: data.cities },
      data.investmentTypes ? { label: "نوع الاستثمار", value: data.investmentTypes } : null,
      (data.budgetMin && data.budgetMax) ? { label: "الميزانية", value: `من ${formatBudget(data.budgetMin)} إلى ${formatBudget(data.budgetMax)}` } : null,
      data.returnPreference ? { label: "هدف الاستثمار", value: data.returnPreference } : null,
    ].filter(Boolean) as Array<{label: string, value: string}>;
    return fields;
  };

  const handleSubmit = () => {
    const text = textareaRef.current?.textContent || inputText;
    if (!text.trim()) {
      toast({
        title: "يرجى كتابة طلبك",
        description: "اكتب معلوماتك الاستثمارية بالطريقة التي تفضلها",
        variant: "destructive",
      });
      return;
    }

    setConversation(prev => [...prev, { type: "user", text }]);
    setIsTyping(true);

    setTimeout(() => {
      const data = extractInvestorInfo(text);
      setIsTyping(false);

      if (!data.name || !data.phone || !data.cities) {
        let missing = [];
        if (!data.name) missing.push("الاسم");
        if (!data.phone) missing.push("رقم الجوال");
        if (!data.cities) missing.push("المدن المستهدفة");
        
        setConversation(prev => [
          ...prev,
          { type: "system", text: `لم أتمكن من استخراج: ${missing.join("، ")}. يرجى إضافة هذه المعلومات.` }
        ]);
        setInputText("");
        if (textareaRef.current) textareaRef.current.textContent = "";
        return;
      }

      const fields = generateConfirmationFields(data);
      setPendingData(data);
      setConfirmationFields(fields);
      setPendingConfirmation(true);
      setInputText("");
      if (textareaRef.current) textareaRef.current.textContent = "";
    }, 800);
  };

  const confirmSubmission = () => {
    investorMutation.mutate({
      name: pendingData.name,
      phone: pendingData.phone,
      cities: pendingData.cities,
      investmentTypes: pendingData.investmentTypes,
      budgetMin: pendingData.budgetMin ? parseInt(pendingData.budgetMin) : undefined,
      budgetMax: pendingData.budgetMax ? parseInt(pendingData.budgetMax) : undefined,
      returnPreference: pendingData.returnPreference,
    });
    setConversation(prev => [
      ...prev,
      { type: "system", text: "تم تسجيل اهتمامك بنجاح! سنتواصل معك عند توفر فرص استثمارية مناسبة." }
    ]);
    setPendingConfirmation(false);
  };

  const cancelSubmission = () => {
    setPendingConfirmation(false);
    setConversation(prev => [
      ...prev,
      { type: "system", text: "تم الإلغاء. يمكنك تعديل البيانات وإرسالها مرة أخرى." }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">تم التسجيل بنجاح!</h2>
              <p className="text-muted-foreground">
                سنتواصل معك عند توفر فرص استثمارية تناسب معاييرك
              </p>
            </div>
            <Button onClick={() => window.location.href = "/"} className="w-full bg-amber-600 hover:bg-amber-700">
              العودة للرئيسية
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/50 via-background to-background dark:from-amber-950/20">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Sparkles className="h-3 w-3 ml-1" />
              فرص استثمارية حصرية
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              استثمر بذكاء في العقارات السعودية
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              أخبرنا عن أهدافك الاستثمارية بكلماتك الخاصة، وسنفهم ونجد لك الفرص المناسبة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">تغطية شاملة</h3>
              <p className="text-sm text-muted-foreground">جميع المدن الرئيسية</p>
            </Card>
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">فرص متنوعة</h3>
              <p className="text-sm text-muted-foreground">سكني، تجاري، أراضي</p>
            </Card>
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">عوائد مجزية</h3>
              <p className="text-sm text-muted-foreground">تحليل دقيق للعائد</p>
            </Card>
          </div>

          <Card className="max-w-3xl mx-auto p-0 overflow-hidden shadow-2xl">
            {!isComplete && (
              <div className="p-4 border-b bg-amber-50 dark:bg-amber-950/20">
                <p className="text-sm text-muted-foreground mb-2 text-center">
                  مثال على طلب استثماري:
                </p>
                <div 
                  className="text-center cursor-pointer min-h-[100px] flex items-center justify-center"
                  onClick={() => addSuggestion(fullInvestorExampleText)}
                  data-testid="button-typewriter-example"
                >
                  <p className="text-lg leading-relaxed">
                    {renderTypedText()}
                    <span className="animate-pulse text-amber-600 font-bold">|</span>
                  </p>
                </div>
              </div>
            )}

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
                          ? "bg-amber-600 text-white rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {pendingConfirmation && confirmationFields.length > 0 && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-card border p-4" data-testid="confirmation-card">
                      <p className="font-bold text-base mb-3 text-center">تأكيد البيانات</p>
                      <div className="space-y-2">
                        {confirmationFields.map((field, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="text-muted-foreground">{field.label}:</span>
                            <span className="font-medium">{field.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                          onClick={confirmSubmission}
                          disabled={investorMutation.isPending}
                          data-testid="button-confirm"
                        >
                          <Check className="h-4 w-4 ml-1" />
                          تأكيد
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={cancelSubmission}
                          data-testid="button-cancel"
                        >
                          <X className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
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

            {!isComplete && !pendingConfirmation && (
              <div className="p-4">
                <div className="flex gap-2">
                  <div
                    ref={textareaRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setInputText(e.currentTarget.textContent || "")}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-h-[60px] max-h-[150px] overflow-y-auto border rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 bg-background"
                    data-placeholder="اكتب معلوماتك الاستثمارية هنا..."
                    style={{
                      direction: "rtl",
                    }}
                    data-testid="input-investor-text"
                  />
                  <Button
                    size="icon"
                    className="h-[60px] w-[60px] rounded-xl bg-amber-600 hover:bg-amber-700"
                    onClick={handleSubmit}
                    disabled={investorMutation.isPending}
                    data-testid="button-submit-investor"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
