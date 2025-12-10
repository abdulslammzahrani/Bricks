import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Ruler, 
  Calendar, 
  Banknote, 
  Compass, 
  Route,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from "lucide-react";

interface MatchBreakdown {
  location: { score: number; weight: number; details: string };
  area: { score: number; weight: number; details: string };
  propertyAge: { score: number; weight: number; details: string };
  price: { score: number; weight: number; details: string };
  facing: { score: number; weight: number; details: string };
  streetWidth: { score: number; weight: number; details: string };
  purpose: { score: number; weight: number; details: string };
  roi: { score: number; weight: number; details: string };
}

interface PropertyMatchCardProps {
  propertyId: string;
  title: string;
  district: string;
  city: string;
  area: number;
  price: number;
  propertyAge?: number;
  facing?: string;
  streetWidth?: number;
  roi?: number;
  matchScore: number;
  breakdown: MatchBreakdown;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips?: string[];
  imageUrl?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-blue-500";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "ممتاز";
  if (score >= 80) return "جيد جداً";
  if (score >= 70) return "جيد";
  if (score >= 60) return "مقبول";
  if (score >= 50) return "متوسط";
  return "ضعيف";
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)} ألف`;
  }
  return `${price}`;
}

export function PropertyMatchCard({
  propertyId,
  title,
  district,
  city,
  area,
  price,
  propertyAge,
  facing,
  streetWidth,
  roi,
  matchScore,
  breakdown,
  recommendation,
  strengths,
  weaknesses,
  improvementTips,
  imageUrl,
}: PropertyMatchCardProps) {
  return (
    <Card 
      className="overflow-visible hover-elevate" 
      data-testid={`card-property-match-${propertyId}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`text-property-title-${propertyId}`}>
              {title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>{district}، {city}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant={getScoreBadgeVariant(matchScore)}
              className="text-base px-3 py-1"
              data-testid={`badge-match-score-${propertyId}`}
            >
              مطابق {matchScore}%
            </Badge>
            <span className="text-xs text-muted-foreground">
              {getScoreLabel(matchScore)}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <span>{area} م²</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-muted-foreground" />
            <span>{formatPrice(price)} ريال</span>
          </div>
          
          {propertyAge !== undefined && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{propertyAge} سنة</span>
            </div>
          )}
          
          {facing && (
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-muted-foreground" />
              <span>{facing}</span>
            </div>
          )}
          
          {streetWidth && (
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-muted-foreground" />
              <span>شارع {streetWidth}م</span>
            </div>
          )}
          
          {roi !== undefined && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span>ROI {roi.toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">نسبة التطابق</span>
            <span className="font-medium">{matchScore}%</span>
          </div>
          <Progress value={matchScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>الموقع</span>
              <span className={breakdown.location.score >= 80 ? "text-green-600" : breakdown.location.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.location.score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>السعر</span>
              <span className={breakdown.price.score >= 80 ? "text-green-600" : breakdown.price.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.price.score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>المساحة</span>
              <span className={breakdown.area.score >= 80 ? "text-green-600" : breakdown.area.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.area.score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>العمر</span>
              <span className={breakdown.propertyAge.score >= 80 ? "text-green-600" : breakdown.propertyAge.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.propertyAge.score}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>الواجهة</span>
              <span className={breakdown.facing.score >= 80 ? "text-green-600" : breakdown.facing.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.facing.score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>الشارع</span>
              <span className={breakdown.streetWidth.score >= 80 ? "text-green-600" : breakdown.streetWidth.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.streetWidth.score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>الاستخدام</span>
              <span className={breakdown.purpose.score >= 80 ? "text-green-600" : breakdown.purpose.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.purpose.score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>ROI</span>
              <span className={breakdown.roi.score >= 80 ? "text-green-600" : breakdown.roi.score >= 50 ? "text-orange-500" : "text-red-500"}>
                {breakdown.roi.score}%
              </span>
            </div>
          </div>
        </div>

        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-sm font-medium">تحليل سريع</p>
            
            {strengths.length > 0 && (
              <div className="space-y-1">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
            
            {weaknesses.length > 0 && (
              <div className="space-y-1">
                {weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-orange-500">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
            
            {improvementTips && improvementTips.length > 0 && (
              <div className="space-y-1 mt-2">
                {improvementTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-blue-500">
                    <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground italic border-t pt-2">
          {recommendation}
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchScoreIndicator({ score }: { score: number }) {
  let color = "bg-red-500";
  let label = "ضعيف";
  
  if (score >= 80) {
    color = "bg-blue-500";
    label = "ممتاز";
  } else if (score >= 60) {
    color = "bg-orange-500";
    label = "متوسط";
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm">{label} ({score}%)</span>
    </div>
  );
}
