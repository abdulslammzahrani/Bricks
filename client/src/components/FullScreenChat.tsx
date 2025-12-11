import { useState, useRef, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, Send, Mic, MicOff, Loader2, Brain, ArrowRight,
  Building2, MapPin, DollarSign, Home, User
} from "lucide-react";

interface Message {
  type: "user" | "assistant";
  text: string;
}

interface ExtractedData {
  name?: string;
  phone?: string;
  city?: string;
  district?: string;
  propertyType?: string;
  budgetMax?: string;
  paymentMethod?: string;
  purchaseTimeline?: string;
  area?: string;
  propertyAge?: string;
  facing?: string;
  streetWidth?: string;
  purchasePurpose?: string;
  latitude?: number;
  longitude?: number;
}

interface FullScreenChatProps {
  mode: "buyer" | "seller" | "investor";
  conversation: Message[];
  onClose: () => void;
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  isAnalyzing?: boolean;
  isTranscribing?: boolean;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  extractedData?: ExtractedData;
  pendingConfirmation?: boolean;
  confirmationFields?: { label: string; value: string; isCheck?: boolean }[];
  isSending?: boolean;
}

function calculateReliabilityScore(data: ExtractedData): number {
  let score = 0;
  if (data.name) score += 10;
  if (data.phone) score += 15;
  if (data.city) score += 15;
  if (data.district) score += 10;
  if (data.propertyType) score += 10;
  if (data.budgetMax) score += 15;
  if (data.paymentMethod) score += 5;
  if (data.purchaseTimeline) score += 5;
  if (data.area) score += 5;
  if (data.propertyAge) score += 3;
  if (data.facing) score += 3;
  if (data.streetWidth) score += 2;
  if (data.purchasePurpose) score += 2;
  return Math.min(score, 100);
}

export const FullScreenChat = memo(function FullScreenChat({
  mode,
  conversation,
  onClose,
  onSendMessage,
  isTyping = false,
  isAnalyzing = false,
  isTranscribing = false,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  extractedData = {},
  pendingConfirmation = false,
  confirmationFields = [],
  isSending = false,
}: FullScreenChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const reliabilityScore = calculateReliabilityScore(extractedData);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  const handleSend = () => {
    if (inputText.trim() && !isSending) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "seller": return "bg-amber-500";
      case "investor": return "bg-purple-500";
      default: return "bg-primary";
    }
  };

  const getUserBubbleColor = () => {
    switch (mode) {
      case "seller": return "bg-amber-500 text-white";
      case "investor": return "bg-purple-500 text-white";
      default: return "bg-primary text-primary-foreground";
    }
  };

  const getExtractedDataItems = () => {
    const items: { icon: typeof Home; label: string; value: string }[] = [];
    if (extractedData.city) items.push({ icon: MapPin, label: "المدينة", value: extractedData.city });
    if (extractedData.district) items.push({ icon: MapPin, label: "الحي", value: extractedData.district });
    if (extractedData.propertyType) items.push({ icon: Home, label: "النوع", value: extractedData.propertyType });
    if (extractedData.budgetMax) items.push({ icon: DollarSign, label: "الميزانية", value: `${parseInt(extractedData.budgetMax).toLocaleString('ar-EG')} ريال` });
    return items;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9"
            data-testid="button-close-fullscreen-chat"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full ${getModeColor()} flex items-center justify-center`}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">مستشار تطابق العقاري</h3>
              <p className="text-xs text-muted-foreground">
                {mode === "buyer" ? "مساعدك في البحث عن عقارك" : mode === "seller" ? "مساعدك في عرض عقارك" : "مستشارك الاستثماري"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Reliability Score */}
        <div className="flex items-center gap-2">
          <div className="text-left">
            <span className="text-xs text-muted-foreground">اكتمال الطلب</span>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-bold ${reliabilityScore >= 70 ? 'text-green-600' : reliabilityScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                {reliabilityScore}%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 relative">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(reliabilityScore / 100) * 100.53} 100.53`}
                className={reliabilityScore >= 70 ? 'text-green-500' : reliabilityScore >= 40 ? 'text-amber-500' : 'text-red-500'}
              />
            </svg>
          </div>
        </div>
      </header>

      {/* Extracted Data Summary - Collapsible */}
      {getExtractedDataItems().length > 0 && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {getExtractedDataItems().slice(0, 4).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border text-xs">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundColor: "hsl(var(--muted) / 0.15)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Welcome Message */}
        {conversation.length === 0 && (
          <div className="flex justify-end mb-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-card border p-4 shadow-sm">
              <p className="text-sm leading-relaxed">
                {mode === "buyer" 
                  ? "مرحباً! أنا مستشارك العقاري الذكي. كيف يمكنني مساعدتك في البحث عن عقارك المثالي؟ يمكنك إخباري عن المدينة والحي المفضل والميزانية ونوع العقار الذي تبحث عنه."
                  : mode === "seller"
                  ? "مرحباً! أنا مستشارك لعرض عقارك. أخبرني عن تفاصيل العقار الذي تريد عرضه وسأساعدك في الوصول للمشترين المناسبين."
                  : "مرحباً! أنا مستشارك الاستثماري العقاري. كيف يمكنني مساعدتك اليوم؟"
                }
              </p>
            </div>
          </div>
        )}

        {/* Conversation Messages */}
        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.type === "user"
                  ? `${getUserBubbleColor()} rounded-tr-none`
                  : "bg-card border rounded-tl-none"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Confirmation Card */}
        {pendingConfirmation && confirmationFields.length > 0 && (
          <div className="flex justify-end">
            <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-card border p-4 shadow-sm" data-testid="confirmation-card">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <p className="font-bold">تأكيد البيانات</p>
              </div>
              <div className="space-y-2">
                {confirmationFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="font-medium text-muted-foreground min-w-[80px]">{field.label}:</span>
                    <span className={field.isCheck ? "text-green-600 font-medium" : ""}>{field.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 -mx-1">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                  إذا كانت المعلومات صحيحة اكتب <span className="font-bold">"موافق"</span> لاعتمادها
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-end">
            <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Brain className="h-4 w-4 animate-pulse" />
                    <span>جارٍ التحليل بالذكاء الاصطناعي...</span>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-3 safe-area-bottom">
        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="flex items-center justify-center gap-2 mb-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>جارٍ تحويل الصوت لنص...</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Send Button */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className={`flex-shrink-0 h-11 w-11 rounded-full ${getModeColor()}`}
            data-testid="button-send-fullscreen"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>

          {/* Voice Recording Button */}
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={isTranscribing}
            className={`flex-shrink-0 h-11 w-11 rounded-full ${isRecording ? "animate-pulse" : ""}`}
            data-testid="button-voice-fullscreen"
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === "buyer" ? "اكتب طلبك هنا..." : mode === "seller" ? "اكتب تفاصيل عقارك..." : "اكتب استفسارك..."}
              className="w-full min-h-[44px] max-h-[120px] px-4 py-3 rounded-2xl border bg-background resize-none text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={1}
              dir="rtl"
              data-testid="input-message-fullscreen"
            />
          </div>
        </div>

        {/* Quick Actions */}
        {conversation.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {mode === "buyer" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText("أبحث عن شقة في الرياض")}
                  className="text-xs rounded-full"
                >
                  شقة في الرياض
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText("أريد فيلا في جدة")}
                  className="text-xs rounded-full"
                >
                  فيلا في جدة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText("أرض للبيع في الدمام")}
                  className="text-xs rounded-full"
                >
                  أرض في الدمام
                </Button>
              </>
            ) : mode === "seller" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText("أريد بيع شقتي")}
                  className="text-xs rounded-full"
                >
                  بيع شقة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText("عندي فيلا للبيع")}
                  className="text-xs rounded-full"
                >
                  بيع فيلا
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText("أريد تأجير عقاري")}
                  className="text-xs rounded-full"
                >
                  تأجير عقار
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
});
