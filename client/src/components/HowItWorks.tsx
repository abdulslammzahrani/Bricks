import { Card } from "@/components/ui/card";
import { ClipboardList, Search, Bell, Handshake } from "lucide-react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="p-6 text-center relative" data-testid={`card-step-${index + 1}`}>
                <div className="absolute top-4 right-4 text-4xl font-bold text-muted/50">
                  {index + 1}
                </div>
                <div className={`mx-auto h-16 w-16 rounded-full ${step.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
