import { Button } from "@/components/ui/button";
import { Home, Building2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-cta-title">
          ابدأ رحلتك العقارية اليوم
        </h2>
        <p className="text-primary-foreground/80 mb-8 text-lg" data-testid="text-cta-description">
          سواء كنت تبحث عن عقار أو تريد بيع عقارك، نحن هنا لمساعدتك في الوصول لهدفك بسرعة وسهولة
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/buyer-form">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2" data-testid="cta-button-buyer">
              <Home className="h-5 w-5" />
              سجل رغبتك لشراء عقار
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/seller-form">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="cta-button-seller">
              <Building2 className="h-5 w-5" />
              اعرض عقارك الآن
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
