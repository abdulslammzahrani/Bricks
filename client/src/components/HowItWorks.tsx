import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Search, Bell, Handshake, ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "سجل رغبتك",
    description: "أخبرنا بتفاصيل العقار الذي تبحث عنه: المدينة، الحي، النوع، والميزانية",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    title: "نبحث لك",
    description: "نطابق رغبتك مع العقارات المتاحة من البائعين والمطورين المسجلين",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Bell,
    title: "نرسل لك العروض",
    description: "تصلك أفضل العروض المطابقة أسبوعياً عبر واتساب والبريد الإلكتروني",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: Handshake,
    title: "تواصل مباشر",
    description: "اختر العرض المناسب وتواصل مباشرة مع البائع أو اطلب معاينة",
    color: "bg-chart-4/10 text-chart-4",
  },
];

export default function HowItWorks() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % steps.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-6 md:py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-how-it-works-title">
            كيف تعمل المنصة؟
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-how-it-works-description">
            أربع خطوات بسيطة تفصلك عن إيجاد عقارك المثالي
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <div className="relative h-[280px] flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              const isPrev = offset === -1 || (currentIndex === 0 && index === steps.length - 1);
              const isNext = offset === 1 || (currentIndex === steps.length - 1 && index === 0);
              
              let transform = "translateX(0) scale(0.85)";
              let zIndex = 0;
              let opacity = 0;
              
              if (isActive) {
                transform = "translateX(0) scale(1)";
                zIndex = 30;
                opacity = 1;
              } else if (isPrev) {
                transform = "translateX(30px) scale(0.9) rotate(3deg)";
                zIndex = 20;
                opacity = 0.6;
              } else if (isNext) {
                transform = "translateX(-30px) scale(0.9) rotate(-3deg)";
                zIndex = 10;
                opacity = 0.6;
              }

              return (
                <Card 
                  key={index} 
                  className="absolute w-full max-w-[300px] p-6 text-center transition-all duration-300 ease-out"
                  style={{
                    transform,
                    zIndex,
                    opacity,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  data-testid={`card-step-${index + 1}`}
                >
                  <div className="absolute top-4 right-4 text-3xl font-bold text-muted/40">
                    {index + 1}
                  </div>
                  <div className={`mx-auto h-14 w-14 rounded-full ${step.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              size="icon"
              variant="outline"
              onClick={goToNext}
              data-testid="button-how-next"
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                  data-testid={`dot-step-${index + 1}`}
                />
              ))}
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={goToPrev}
              data-testid="button-how-prev"
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-3">
            {currentIndex + 1} من {steps.length}
          </p>
        </div>
      </div>
    </section>
  );
}
