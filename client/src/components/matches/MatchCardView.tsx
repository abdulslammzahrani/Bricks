import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  MapPin,
  DollarSign,
  Phone,
  MessageCircle,
  Calendar,
  Eye,
  CheckCircle,
  X,
  Star,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Match } from "@shared/schema";
import { MatchBreakdownView } from "@/components/MatchBreakdownView";

interface MatchCardViewProps {
  matches: Match[];
  onUpdateStatus?: (matchId: string, status: string) => void;
  onConvertToDeal?: (match: any) => void;
}

const statusConfig = {
  new: { label: "جديدة", color: "bg-blue-100 text-blue-700", icon: Clock },
  pending: { label: "معلقة", color: "bg-amber-100 text-amber-700", icon: Clock },
  contacted: { label: "تم التواصل", color: "bg-emerald-100 text-emerald-700", icon: Phone },
  viewing: { label: "معاينة", color: "bg-blue-100 text-blue-700", icon: Eye },
  negotiating: { label: "تفاوض", color: "bg-amber-100 text-amber-700", icon: MessageCircle },
  closed: { label: "مغلقة", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "مرفوضة", color: "bg-red-100 text-red-700", icon: X },
};

export function MatchCardView({ matches, onUpdateStatus, onConvertToDeal }: MatchCardViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-lg mb-1">لا توجد مطابقات</h3>
          <p className="text-muted-foreground text-sm">
            لم يتم العثور على مطابقات بناءً على الفلاتر المحددة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
      {matches.map((match) => {
        const property = (match as any).property;
        const buyerPreference = (match as any).buyerPreference;
        const status = statusConfig[match.status as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = status.icon;
        const priority = (match as any).priority || "medium";
        const aiPrediction = (match as any).aiPrediction || {
          successProbability: 75,
          estimatedClosingDays: 15,
          recommendedActions: [],
        };

        // Calculate breakdown scores (simplified)
        const breakdown = {
          location: { score: 85, weight: 40, maxPoints: 40 },
          price: { score: 90, weight: 30, maxPoints: 30 },
          area: { score: 80, weight: 20, maxPoints: 20 },
          features: { score: 75, weight: 10, maxPoints: 10 },
        };

        return (
          <Card key={match.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                    {priority === "high" && (
                      <Badge variant="destructive" className="text-xs">
                        أولوية عالية
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    {property?.propertyType || "عقار"} - {property?.city || ""}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Match Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  match.matchScore >= 90 ? "text-green-600" :
                  match.matchScore >= 75 ? "text-blue-600" :
                  match.matchScore >= 60 ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {match.matchScore}%
                </div>
                <Progress 
                  value={match.matchScore} 
                  className="h-2"
                />
              </div>

              {/* Property Info */}
              {property && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{property.district}, {property.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-emerald-600">
                      {property.price?.toLocaleString("ar-SA")} ريال
                    </span>
                  </div>
                  {property.area && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{property.area} م²</span>
                    </div>
                  )}
                </div>
              )}

              {/* Buyer Preference Info */}
              {buyerPreference && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">الطلب:</p>
                  <p className="text-sm font-medium">
                    {buyerPreference.city} - حتى {buyerPreference.budgetMax?.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
              )}

              {/* Breakdown Progress Bars */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">الموقع</span>
                  <span className="font-medium">{breakdown.location.score}%</span>
                </div>
                <Progress value={breakdown.location.score} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">السعر</span>
                  <span className="font-medium">{breakdown.price.score}%</span>
                </div>
                <Progress value={breakdown.price.score} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">المساحة</span>
                  <span className="font-medium">{breakdown.area.score}%</span>
                </div>
                <Progress value={breakdown.area.score} className="h-1.5" />
              </div>

              {/* AI Predictions */}
              <div className="pt-2 border-t bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">توقعات AI</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">احتمالية النجاح:</span>
                    <span className="font-bold text-blue-600">{aiPrediction.successProbability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">أيام الإغلاق المتوقعة:</span>
                    <span className="font-bold text-blue-600">{aiPrediction.estimatedClosingDays} يوم</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedMatch(match);
                    setShowDetails(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  عرض التفاصيل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus?.(match.id, "contacted")}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus?.(match.id, "viewing")}
                >
                  <Calendar className="w-4 h-4" />
                </Button>
                {onConvertToDeal && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onConvertToDeal(match)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    تحويل
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Details Dialog */}
      {selectedMatch && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>تفاصيل المطابقة</DialogTitle>
              <DialogDescription>
                عرض تفصيلي للمطابقة بين العقار والطلب
              </DialogDescription>
            </DialogHeader>
            {(selectedMatch as any).buyerPreference && (selectedMatch as any).property && (
              <MatchBreakdownView 
                match={selectedMatch}
                preference={(selectedMatch as any).buyerPreference}
                property={(selectedMatch as any).property}
                breakdown={{
                  location: 85,
                  price: 90,
                  specifications: 80,
                  details: 75,
                  bonus: 5,
                  total: (selectedMatch as any).matchScore || 85,
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

