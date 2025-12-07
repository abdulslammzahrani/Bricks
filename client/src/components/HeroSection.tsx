import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, MapPin, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="secondary" className="mb-4" data-testid="badge-hero">
              منصة المطابقة العقارية الذكية
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" data-testid="text-hero-title">
              لا تشتري عقارك من إعلان…
              <span className="text-primary block mt-2">سجل رغبتك ودعنا نرشّح لك الأفضل</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl" data-testid="text-hero-description">
              نجمع رغبات الشراء ونطابقها مع العقارات المتاحة، ونرسل لك عروض مناسبة أسبوعياً عبر واتساب والإيميل
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/buyer-form">
                <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-register-wish">
                  <Home className="h-5 w-5" />
                  سجل رغبتك لشراء عقار
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/seller-form">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-list-property">
                  <Building2 className="h-5 w-5" />
                  اعرض عقارك الآن
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>+500 مشتري مسجل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>+200 عقار متاح</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="space-y-4">
              <Card className="p-4 animate-pulse-slow" data-testid="card-example-1">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">عم</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">اسمي <span className="text-primary font-bold">عبدالسلام محمد</span></p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        من مدينة <span className="text-primary font-semibold">جدة</span>
                      </span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      أرغب بشراء <span className="text-primary font-semibold">شقة</span> للسكن
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 mr-8" data-testid="card-example-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-chart-2">فأ</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">اسمي <span className="text-chart-2 font-bold">فاطمة أحمد</span></p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        من مدينة <span className="text-chart-2 font-semibold">الرياض</span>
                      </span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      أبحث عن <span className="text-chart-2 font-semibold">فيلا</span> للاستثمار
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 mr-4" data-testid="card-example-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-chart-3" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm"><span className="text-chart-3 font-bold">شركة التطوير العقاري</span></p>
                    <p className="text-muted-foreground text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        نعرض <span className="text-chart-3 font-semibold">15 عقار</span> في جدة
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
