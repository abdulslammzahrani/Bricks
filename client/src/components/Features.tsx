import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Clock, 
  Shield, 
  MessageSquare, 
  BarChart3, 
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "مطابقة ذكية",
    description: "خوارزمية متقدمة تطابق رغباتك مع العقارات المناسبة بدقة عالية",
  },
  {
    icon: Clock,
    title: "توفير الوقت",
    description: "لا تضيع وقتك في البحث، نحن نجلب لك العروض المناسبة",
  },
  {
    icon: Shield,
    title: "موثوقية عالية",
    description: "نتحقق من جميع العقارات والبائعين المسجلين على المنصة",
  },
  {
    icon: MessageSquare,
    title: "تواصل مباشر",
    description: "تواصل فوري عبر واتساب مع البائعين دون وسطاء",
  },
  {
    icon: BarChart3,
    title: "تحليلات السوق",
    description: "اطلع على أسعار السوق ومتوسط الأسعار في الأحياء المختلفة",
  },
  {
    icon: Users,
    title: "مجتمع عقاري",
    description: "انضم لمجتمع من المشترين والبائعين الموثوقين",
  },
];

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-features-title">
            لماذا تختار تطابق؟
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
            نقدم لك تجربة عقارية فريدة تجمع بين التقنية والخبرة
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <div className="relative h-[220px] flex items-center justify-center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              const isPrev = offset === -1 || (currentIndex === 0 && index === features.length - 1);
              const isNext = offset === 1 || (currentIndex === features.length - 1 && index === 0);
              
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
                  className="absolute w-full max-w-[300px] p-6 transition-all duration-300 ease-out"
                  style={{
                    transform,
                    zIndex,
                    opacity,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  data-testid={`card-feature-${index + 1}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              size="icon"
              variant="outline"
              onClick={goToNext}
              data-testid="button-features-next"
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                  data-testid={`dot-feature-${index + 1}`}
                />
              ))}
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={goToPrev}
              data-testid="button-features-prev"
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-3">
            {currentIndex + 1} من {features.length}
          </p>
        </div>
      </div>
    </section>
  );
}
