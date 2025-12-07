import { Card } from "@/components/ui/card";
import { 
  Target, 
  Clock, 
  Shield, 
  MessageSquare, 
  BarChart3, 
  Users 
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
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-features-title">
            لماذا تختار تطابق؟
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
            نقدم لك تجربة عقارية فريدة تجمع بين التقنية والخبرة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover-elevate" data-testid={`card-feature-${index + 1}`}>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
