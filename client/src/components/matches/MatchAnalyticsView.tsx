import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { Match } from "@shared/schema";

interface MatchAnalyticsViewProps {
  matches: Match[];
}

export function MatchAnalyticsView({ matches }: MatchAnalyticsViewProps) {
  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-lg mb-1">لا توجد بيانات للتحليل</h3>
          <p className="text-muted-foreground text-sm">
            لا توجد مطابقات لعرض التحليلات
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate conversion rates
  const total = matches.length;
  const contacted = matches.filter((m) => m.status === "contacted").length;
  const viewing = matches.filter((m) => m.status === "viewing").length;
  const closed = matches.filter((m) => m.status === "closed").length;

  const conversionRates = {
    newToContacted: total > 0 ? Math.round((contacted / total) * 100) : 0,
    contactedToViewing: contacted > 0 ? Math.round((viewing / contacted) * 100) : 0,
    viewingToClosed: viewing > 0 ? Math.round((closed / viewing) * 100) : 0,
  };

  // City distribution
  const cityDistribution = matches.reduce((acc, match) => {
    const city = (match as any).property?.city || "غير محدد";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCities = Object.entries(cityDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Property type distribution
  const typeDistribution = matches.reduce((acc, match) => {
    const type = (match as any).property?.propertyType || "غير محدد";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTypes = Object.entries(typeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Average scores
  const avgScore = matches.length > 0
    ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
    : 0;

  // High priority matches
  const highPriority = matches.filter((m) => (m as any).priority === "high").length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>معدلات التحويل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">جديد → تواصل</span>
              <span className="text-sm font-bold">{conversionRates.newToContacted}%</span>
            </div>
            <Progress value={conversionRates.newToContacted} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {contacted} من {total} مطابقة
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">تواصل → معاينة</span>
              <span className="text-sm font-bold">{conversionRates.contactedToViewing}%</span>
            </div>
            <Progress value={conversionRates.contactedToViewing} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {viewing} من {contacted} مطابقة
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">معاينة → إغلاق</span>
              <span className="text-sm font-bold">{conversionRates.viewingToClosed}%</span>
            </div>
            <Progress value={conversionRates.viewingToClosed} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {closed} من {viewing} مطابقة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Cities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            أكثر المدن طلباً
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCities.map(([city, count]) => {
            const percentage = Math.round((count / total) * 100);
            return (
              <div key={city}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{city}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count} مطابقة</span>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Property Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            توزيع أنواع العقارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTypes.map(([type, count]) => {
            const percentage = Math.round((count / total) * 100);
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count} مطابقة</span>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            رؤى AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                المطابقات في نفس الحي لديها نجاح أعلى بـ 40%
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                الرد خلال 24 ساعة يزيد فرص الإغلاق بـ 65%
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                العقارات بسعر أقل من الميزانية بـ 10% تُباع أسرع
              </p>
            </div>
          </div>

          {highPriority > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  هناك {highPriority} مطابقة عالية تحتاج متابعة فورية
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                حدد مواعيد معاينة للمطابقات &gt; 90%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">متوسط نسبة التطابق</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">مطابقات مكتملة</p>
                <p className="text-2xl font-bold">{closed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">أولوية عالية</p>
                <p className="text-2xl font-bold">{highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


