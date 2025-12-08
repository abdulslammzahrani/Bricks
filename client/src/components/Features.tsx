import { useState, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Clock, 
  Shield, 
  MessageSquare, 
  BarChart3, 
  Users,
  RotateCcw
} from "lucide-react";
import TinderCard from "react-tinder-card";

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
  const [currentIndex, setCurrentIndex] = useState(features.length - 1);
  const [lastDirection, setLastDirection] = useState<string>("");
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(features.length)
        .fill(0)
        .map(() => ({ current: null as any })),
    []
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;

  const swiped = (direction: string, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (idx: number) => {
    if (currentIndexRef.current >= idx && childRefs[idx].current) {
      childRefs[idx].current.restoreCard();
    }
  };

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < features.length && childRefs[currentIndex]?.current) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  const goBack = async () => {
    if (currentIndex >= features.length - 1) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    if (childRefs[newIndex]?.current) {
      await childRefs[newIndex].current.restoreCard();
    }
  };

  const resetCards = () => {
    updateCurrentIndex(features.length - 1);
    childRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.restoreCard();
      }
    });
  };

  const allSwiped = currentIndex < 0;

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

        <div className="relative max-w-sm mx-auto">
          <div className="relative h-[260px] flex items-center justify-center">
            {allSwiped ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">اكتشفت كل المميزات!</p>
                <Button onClick={resetCards} variant="outline" data-testid="button-reset-features">
                  <RotateCcw className="h-4 w-4 ml-2" />
                  إعادة العرض
                </Button>
              </div>
            ) : (
              features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <TinderCard
                    ref={childRefs[index]}
                    key={index}
                    onSwipe={(dir) => swiped(dir, index)}
                    onCardLeftScreen={() => outOfFrame(index)}
                    preventSwipe={["up", "down"]}
                    className="absolute"
                    swipeRequirementType="position"
                    swipeThreshold={100}
                  >
                    <Card 
                      className="w-[300px] p-6 cursor-grab active:cursor-grabbing select-none"
                      style={{
                        transform: `translateY(${(features.length - 1 - index) * 4}px) scale(${1 - (features.length - 1 - index) * 0.02})`,
                      }}
                      data-testid={`card-feature-${index + 1}`}
                    >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </Card>
                  </TinderCard>
                );
              })
            )}
          </div>

          {!allSwiped && (
            <>
              <p className="text-center text-sm text-muted-foreground mt-2">
                اسحب الكارت يمين أو يسار
              </p>
              <p className="text-center text-sm text-muted-foreground">
                {currentIndex + 1} من {features.length}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
