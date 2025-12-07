import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, MapPin, Send, Sparkles, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

const exampleTexts = [
  { text: "اسمي", highlight: "عبدالسلام محمد", color: "text-primary" },
  { text: "من مدينة", highlight: "جدة", color: "text-chart-2" },
  { text: "أرغب بشراء", highlight: "شقة", color: "text-chart-3" },
  { text: "الميزانية", highlight: "800 ألف", color: "text-chart-5" },
];

export default function HeroSection() {
  const [, navigate] = useLocation();
  const [inputValue, setInputValue] = useState("");

  const handleStartTyping = () => {
    navigate("/buyer-form");
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
            <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
              <Button variant="secondary" size="sm" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                أمثلة
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                اكتب رغبتك
              </Button>
            </div>
            
            <div className="p-6 md:p-8 text-right">
              <div className="text-xl md:text-2xl leading-relaxed space-y-2" data-testid="example-text">
                {exampleTexts.map((item, idx) => (
                  <span key={idx} className="inline">
                    {item.text}{" "}
                    <span className={`${item.color} font-bold underline decoration-2 underline-offset-4`}>
                      {item.highlight}
                    </span>
                    {idx < exampleTexts.length - 1 && " ، "}
                  </span>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div 
                  onClick={handleStartTyping}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-background cursor-text hover:border-primary/50 transition-colors"
                  data-testid="hero-input-trigger"
                >
                  <div className="flex-1 text-muted-foreground text-right">
                    اكتب هنا... مثال: اسمي أحمد من الرياض أبحث عن فيلا
                  </div>
                  <Button size="icon" variant="default">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/buyer-form">
              <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-register-wish">
                <Home className="h-5 w-5" />
                ابدأ الآن
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
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
