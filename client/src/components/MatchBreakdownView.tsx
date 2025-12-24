import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Wallet, 
  Building2, 
  FileText, 
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Target
} from "lucide-react";
import { MatchScoreCard } from "./MatchScoreCard";
import type { Match, Property, BuyerPreference } from "@shared/schema";

interface MatchBreakdownViewProps {
  match: Match;
  property: Property;
  preference: BuyerPreference;
  breakdown: {
    location: number;
    price: number;
    specifications: number;
    details: number;
    bonus: number;
    total: number;
  };
  explanations?: {
    location: string;
    price: string;
    specifications: string;
    details: string;
    bonus: string;
  };
}

const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  building: "عمارة",
  land: "أرض",
  duplex: "دوبلكس",
  townhouse: "تاون هاوس",
  studio: "استوديو",
  tower: "برج",
  showroom: "صالة عرض",
  office: "مكتب",
  school: "مدرسة",
  warehouse: "مستودع",
  gas_station: "محطة وقود",
  commercial_building: "مبنى تجاري",
  farm: "مزرعة",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} مليون ريال`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} ألف ريال`;
  }
  return `${value} ريال`;
};

const formatArea = (area: string | null | undefined) => {
  if (!area) return "غير محدد";
  return `${area} م²`;
};

const formatRooms = (rooms: string | null | undefined) => {
  if (!rooms) return "غير محدد";
  return rooms;
};

export function MatchBreakdownView({
  match,
  property,
  preference,
  breakdown,
  explanations = {},
}: MatchBreakdownViewProps) {
  const maxScore = 105;
  const percentage = Math.round((match.matchScore / maxScore) * 100);

  // دالة للحصول على لون حسب النسبة
  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" };
    if (percentage >= 60) return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" };
    if (percentage >= 40) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" };
    return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50", border: "border-red-200" };
  };

  // دالة لتوليد نصائح عملية
  const getTips = (criterion: string, score: number, max: number) => {
    const percentage = (score / max) * 100;
    const tips: string[] = [];

    if (criterion === "location") {
      if (percentage < 50) {
        tips.push("الموقع لا يطابق الحي المطلوب - يمكن التفاوض على السعر");
      } else if (percentage < 80) {
        tips.push("الموقع قريب من المطلوب - خيار جيد للمتابعة");
      }
    } else if (criterion === "price") {
      if (percentage < 50) {
        const diff = property.price - (preference.budgetMax || 0);
        if (diff > 0) {
          const diffPercent = ((diff / (preference.budgetMax || 1)) * 100).toFixed(1);
          tips.push(`السعر أعلى بـ ${diffPercent}% عن الميزانية - يمكن التفاوض`);
        }
      } else if (percentage < 80) {
        tips.push("السعر قريب من الميزانية - خيار مناسب");
      }
    } else if (criterion === "specifications") {
      if (percentage < 50) {
        tips.push("المواصفات تختلف عن المطلوب - راجع التفاصيل بعناية");
      } else if (percentage < 80) {
        tips.push("المواصفات قريبة من المطلوب - خيار جيد");
      }
    }

    return tips;
  };

  // دالة لتوليد شرح تلقائي إذا لم يكن موجوداً
  const getExplanation = (criterion: string, score: number, max: number) => {
    if (explanations[criterion as keyof typeof explanations]) {
      return explanations[criterion as keyof typeof explanations];
    }

    const percentage = (score / max) * 100;
    
    if (criterion === "location") {
      if (preference.districts && preference.districts.includes(property.district)) {
        return "الحي مطابق تماماً للمطلوب";
      } else if (property.city === preference.city) {
        return "نفس المدينة لكن الحي مختلف";
      }
      return "الموقع لا يطابق المطلوب";
    } else if (criterion === "price") {
      if (property.price <= (preference.budgetMax || 0)) {
        return "السعر ضمن الميزانية المحددة";
      } else {
        const diff = property.price - (preference.budgetMax || 0);
        const diffPercent = ((diff / (preference.budgetMax || 1)) * 100).toFixed(1);
        return `السعر أعلى بـ ${diffPercent}% عن الميزانية`;
      }
    } else if (criterion === "specifications") {
      if (property.propertyType === preference.propertyType) {
        return "نوع العقار مطابق تماماً";
      }
      return "نوع العقار يختلف عن المطلوب";
    } else if (criterion === "details") {
      return "التفاصيل الإضافية متوفرة";
    } else if (criterion === "bonus") {
      return "بونص إضافي للعقار (حديث الإعلان، شائع، نشط)";
    }

    return "";
  };

  // دالة للتحقق من المطابقة
  const isMatch = (buyerValue: any, propertyValue: any) => {
    if (typeof buyerValue === "string" && typeof propertyValue === "string") {
      return buyerValue.toLowerCase() === propertyValue.toLowerCase();
    }
    if (Array.isArray(buyerValue)) {
      return buyerValue.includes(propertyValue);
    }
    return buyerValue === propertyValue;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* النسبة الإجمالية */}
      <div className="flex justify-center">
        <MatchScoreCard score={match.matchScore} maxScore={maxScore} size="lg" />
      </div>

      {/* تفصيل المعايير */}
      <div className="space-y-4">
        {/* 1. الموقع (35 نقطة) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              الموقع الجغرافي
              <Badge variant="outline" className="mr-auto">
                {breakdown.location}/35
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress 
              value={(breakdown.location / 35) * 100} 
              className="h-2"
            />
            
            {/* مقارنة جنباً إلى جنب */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">رغبة المشتري</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">المدينة:</span>
                    <Badge variant="outline">{preference.city}</Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">الأحياء:</span>
                    {preference.districts && preference.districts.length > 0 ? (
                      preference.districts.map((district) => (
                        <Badge 
                          key={district} 
                          variant={isMatch(district, property.district) ? "default" : "outline"}
                          className={isMatch(district, property.district) ? "bg-green-500" : ""}
                        >
                          {district}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">غير محدد</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">بيانات العقار</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">المدينة:</span>
                    <Badge 
                      variant={isMatch(preference.city, property.city) ? "default" : "outline"}
                      className={isMatch(preference.city, property.city) ? "bg-green-500" : ""}
                    >
                      {property.city}
                      {isMatch(preference.city, property.city) && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">الحي:</span>
                    <Badge 
                      variant={preference.districts?.includes(property.district) ? "default" : "outline"}
                      className={preference.districts?.includes(property.district) ? "bg-green-500" : ""}
                    >
                      {property.district}
                      {preference.districts?.includes(property.district) && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* الشرح */}
            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {getExplanation("location", breakdown.location, 35)}
              </span>
            </div>

            {/* النصائح */}
            {getTips("location", breakdown.location, 35).length > 0 && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {getTips("location", breakdown.location, 35).map((tip, idx) => (
                    <div key={idx} className="text-xs text-amber-700">{tip}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. السعر (30 نقطة) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              التوافق السعري
              <Badge variant="outline" className="mr-auto">
                {breakdown.price}/30
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress 
              value={(breakdown.price / 30) * 100} 
              className="h-2"
            />
            
            {/* مقارنة جنباً إلى جنب */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">ميزانية المشتري</div>
                <div className="space-y-1.5">
                  {preference.budgetMin && preference.budgetMax ? (
                    <div className="text-sm font-medium">
                      {formatCurrency(preference.budgetMin)} - {formatCurrency(preference.budgetMax)}
                    </div>
                  ) : preference.budgetMax ? (
                    <div className="text-sm font-medium">
                      حتى {formatCurrency(preference.budgetMax)}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">غير محدد</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">سعر العقار</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatCurrency(property.price)}</span>
                    {preference.budgetMax && property.price <= preference.budgetMax ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {preference.budgetMax && property.price > preference.budgetMax && (
                    <div className="text-xs text-red-600">
                      أعلى بـ {formatCurrency(property.price - preference.budgetMax)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* الشرح */}
            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
              <Info className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {getExplanation("price", breakdown.price, 30)}
              </span>
            </div>

            {/* النصائح */}
            {getTips("price", breakdown.price, 30).length > 0 && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {getTips("price", breakdown.price, 30).map((tip, idx) => (
                    <div key={idx} className="text-xs text-amber-700">{tip}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. المواصفات (25 نقطة) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              المواصفات الفنية
              <Badge variant="outline" className="mr-auto">
                {breakdown.specifications}/25
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress 
              value={(breakdown.specifications / 25) * 100} 
              className="h-2"
            />
            
            {/* مقارنة جنباً إلى جنب */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">رغبة المشتري</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">النوع:</span>
                    <Badge variant="outline">
                      {propertyTypeLabels[preference.propertyType] || preference.propertyType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">الغرف:</span>
                    <span className="text-xs">{formatRooms(preference.rooms)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">المساحة:</span>
                    <span className="text-xs">{formatArea(preference.area)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">بيانات العقار</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">النوع:</span>
                    <Badge 
                      variant={isMatch(preference.propertyType, property.propertyType) ? "default" : "outline"}
                      className={isMatch(preference.propertyType, property.propertyType) ? "bg-green-500" : ""}
                    >
                      {propertyTypeLabels[property.propertyType] || property.propertyType}
                      {isMatch(preference.propertyType, property.propertyType) && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">الغرف:</span>
                    <span className="text-xs flex items-center gap-1">
                      {formatRooms(property.rooms)}
                      {isMatch(preference.rooms, property.rooms) && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">المساحة:</span>
                    <span className="text-xs flex items-center gap-1">
                      {formatArea(property.area)}
                      {isMatch(preference.area, property.area) && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* الشرح */}
            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
              <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {getExplanation("specifications", breakdown.specifications, 25)}
              </span>
            </div>

            {/* النصائح */}
            {getTips("specifications", breakdown.specifications, 25).length > 0 && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {getTips("specifications", breakdown.specifications, 25).map((tip, idx) => (
                    <div key={idx} className="text-xs text-amber-700">{tip}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. التفاصيل الإضافية (10 نقاط) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              التفاصيل الإضافية
              <Badge variant="outline" className="mr-auto">
                {breakdown.details}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress 
              value={(breakdown.details / 10) * 100} 
              className="h-2"
            />
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">رغبة المشتري</div>
                <div className="space-y-1.5 text-xs">
                  <div>نوع المعاملة: {preference.transactionType === "buy" ? "شراء" : "تأجير"}</div>
                  <div>الغرض: {preference.purpose === "residence" ? "سكن" : preference.purpose === "investment" ? "استثمار" : "غير محدد"}</div>
                  <div>طريقة الدفع: {preference.paymentMethod || "غير محدد"}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">بيانات العقار</div>
                <div className="space-y-1.5 text-xs">
                  <div>الحالة: {property.status === "ready" ? "جاهز" : "تحت الإنشاء"}</div>
                  <div>المرافق: {property.amenities?.length || 0} مرافق</div>
                  <div>التأثيث: {property.furnishing || "غير محدد"}</div>
                </div>
              </div>
            </div>

            {/* الشرح */}
            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
              <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {getExplanation("details", breakdown.details, 10)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 5. البونص (5 نقاط) */}
        {breakdown.bonus > 0 && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                البونص الإضافي
                <Badge variant="outline" className="mr-auto bg-amber-100 border-amber-300">
                  +{breakdown.bonus}/5
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground space-y-1">
                {property.createdAt && (() => {
                  const daysSinceCreation = Math.floor((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  if (daysSinceCreation <= 7) return <div>✓ إعلان حديث (أقل من أسبوع)</div>;
                  if (daysSinceCreation <= 30) return <div>✓ إعلان جديد (أقل من شهر)</div>;
                  return null;
                })()}
                {property.viewsCount && property.viewsCount > 0 && (
                  <div>✓ عقار شائع ({property.viewsCount} مشاهدة)</div>
                )}
                {property.isActive && <div>✓ عقار نشط</div>}
              </div>
              
              {/* الشرح */}
              <div className="flex items-start gap-2 p-2 bg-amber-100 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-700">
                  {getExplanation("bonus", breakdown.bonus, 5)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* النتيجة الإجمالية */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">النتيجة الإجمالية</span>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2 border-2 border-primary">
              {match.matchScore}/105 ({percentage}%)
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

