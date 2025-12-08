import { useState, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Search, Bell, Handshake, RotateCcw } from "lucide-react";
import TinderCard from "react-tinder-card";

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
  const [currentIndex, setCurrentIndex] = useState(steps.length - 1);
  const [lastDirection, setLastDirection] = useState<string>("");
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(steps.length)
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
    if (canSwipe && currentIndex < steps.length && childRefs[currentIndex]?.current) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  const goBack = async () => {
    if (currentIndex >= steps.length - 1) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    if (childRefs[newIndex]?.current) {
      await childRefs[newIndex].current.restoreCard();
    }
  };

  const resetCards = () => {
    updateCurrentIndex(steps.length - 1);
    childRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.restoreCard();
      }
    });
  };

  const allSwiped = currentIndex < 0;

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

        <div className="relative max-w-sm mx-auto">
          <div className="relative h-[300px] flex items-center justify-center">
            {allSwiped ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">انتهت الخطوات!</p>
                <Button onClick={resetCards} variant="outline" data-testid="button-reset-steps">
                  <RotateCcw className="h-4 w-4 ml-2" />
                  إعادة العرض
                </Button>
              </div>
            ) : (
              steps.map((step, index) => {
                const Icon = step.icon;
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
                      className="w-[300px] p-6 text-center cursor-grab active:cursor-grabbing select-none"
                      style={{
                        transform: `translateY(${(steps.length - 1 - index) * 4}px) scale(${1 - (steps.length - 1 - index) * 0.02})`,
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
                {currentIndex + 1} من {steps.length}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
