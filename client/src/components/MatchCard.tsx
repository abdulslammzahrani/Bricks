import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Home,
  Wallet,
  Bed,
  Maximize,
  MessageSquare,
  CheckCircle,
  ArrowLeftRight
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Match, BuyerPreference, Property, User } from "@shared/schema";

interface MatchCardProps {
  match: Match;
  buyerPreference?: BuyerPreference;
  property?: Property;
  buyer?: User;
  seller?: User;
  onContact?: () => void;
  onStartChat?: () => void;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  building: "عمارة",
  land: "أرض",
  duplex: "دوبلكس",
  townhouse: "تاون هاوس",
  studio: "استوديو",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const getWhatsAppLink = (phone: string) => {
  const cleanedPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanedPhone.startsWith('966') ? cleanedPhone : `966${cleanedPhone.replace(/^0/, '')}`;
  return `https://wa.me/${formattedPhone}`;
};

export function MatchCard({ 
  match, 
  buyerPreference, 
  property, 
  buyer, 
  seller,
  onContact,
  onStartChat 
}: MatchCardProps) {
  const matchScore = match.matchScore;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "تطابق ممتاز";
    if (score >= 60) return "تطابق جيد";
    if (score >= 40) return "تطابق متوسط";
    return "تطابق ضعيف";
  };

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat();
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl lg:rounded-[2.5rem] border-0 shadow-lg bg-white dark:bg-slate-900" data-testid={`match-card-${match.id}`}>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0" dir="rtl">
          
          {/* Right Panel - Buyer */}
          <div className="p-4 md:p-6 border-b md:border-b-0 md:border-l border-border/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 md:rounded-r-[2.5rem]">
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              {/* Buyer Avatar */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-4 border-emerald-500" data-testid="avatar-buyer">
                <Building2 className="h-8 w-8 md:h-10 md:w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              {/* Buyer Name */}
              <div>
                <h3 className="font-bold text-base md:text-lg" data-testid="text-buyer-name">{buyer?.name || "المشتري"}</h3>
                <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  مشتري
                </Badge>
              </div>

              {/* Budget Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-buyer-budget">
                <Wallet className="h-4 w-4" />
                <span>
                  {buyerPreference?.budgetMin && buyerPreference?.budgetMax 
                    ? `${formatCurrency(buyerPreference.budgetMin)} - ${formatCurrency(buyerPreference.budgetMax)}`
                    : buyerPreference?.budgetMax 
                      ? `حتى ${formatCurrency(buyerPreference.budgetMax)}`
                      : "غير محدد"
                  }
                </span>
              </div>

              {/* Contact Buttons */}
              <div className="flex items-center gap-2">
                {buyer?.phone && (
                  <>
                    <Button size="icon" variant="ghost" className="rounded-full" asChild data-testid={`button-call-buyer-${match.id}`}>
                      <a href={`tel:${buyer.phone}`} aria-label="اتصال بالمشتري">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full" asChild data-testid={`button-whatsapp-buyer-${match.id}`}>
                      <a href={getWhatsAppLink(buyer.phone)} target="_blank" rel="noopener noreferrer" aria-label="واتساب المشتري">
                        <SiWhatsapp className="h-4 w-4 text-green-600" />
                      </a>
                    </Button>
                  </>
                )}
                {buyer?.email && (
                  <Button size="icon" variant="ghost" className="rounded-full" asChild data-testid={`button-email-buyer-${match.id}`}>
                    <a href={`mailto:${buyer.email}`} aria-label="بريد المشتري">
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Buyer Preferences Tags */}
              <div className="space-y-2 w-full">
                <p className="text-xs text-muted-foreground font-medium">رغبات المشتري</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {buyerPreference?.propertyType && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-buyer-property-type">
                      {propertyTypeLabels[buyerPreference.propertyType] || buyerPreference.propertyType}
                    </Badge>
                  )}
                  {buyerPreference?.city && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-buyer-city">
                      <MapPin className="h-3 w-3 ml-1" />
                      {buyerPreference.city}
                    </Badge>
                  )}
                  {buyerPreference?.rooms && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-buyer-rooms">
                      <Bed className="h-3 w-3 ml-1" />
                      {buyerPreference.rooms} غرف
                    </Badge>
                  )}
                  {buyerPreference?.area && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-buyer-area">
                      <Maximize className="h-3 w-3 ml-1" />
                      {buyerPreference.area} م²
                    </Badge>
                  )}
                </div>
                {/* Smart Tags from buyer preference */}
                {((buyerPreference?.smartTags && Array.isArray(buyerPreference.smartTags) && buyerPreference.smartTags.length > 0) || 
                  ((buyerPreference as any)?.smart_tags && Array.isArray((buyerPreference as any).smart_tags) && (buyerPreference as any).smart_tags.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2 pt-2 border-t">
                    {((buyerPreference?.smartTags && Array.isArray(buyerPreference.smartTags)) ? buyerPreference.smartTags : ((buyerPreference as any)?.smart_tags || [])).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {/* Notes from buyer preference */}
                {((buyerPreference?.notes && buyerPreference.notes.trim()) || ((buyerPreference as any)?.notes && String((buyerPreference as any).notes).trim())) && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground font-medium mb-1">ملاحظات المشتري:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{buyerPreference?.notes || (buyerPreference as any)?.notes || ""}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Match Score */}
          <div className="p-4 md:p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <p className="text-sm text-muted-foreground mb-3 md:mb-4">نسبة التطابق العقاري</p>
            
            {/* Circular Progress */}
            <div className="relative w-24 h-24 md:w-32 md:h-32" data-testid="match-score-circle">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`نسبة التطابق ${matchScore}%`}>
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={getScoreStrokeColor(matchScore)}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl md:text-3xl font-bold ${getScoreColor(matchScore)}`} data-testid="text-match-score">
                  {matchScore}%
                </span>
                <span className="text-xs text-muted-foreground">تطابق</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="mt-3 md:mt-4 space-y-1.5 w-full" data-testid="match-score-breakdown">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">الموقع/الحي (40 نقطة)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">مرونة السعر (30 نقطة)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">المواصفات (30 نقطة)</span>
              </div>
            </div>

            {/* Action Button - only show for high matches */}
            {matchScore >= 80 && onStartChat && (
              <Button 
                className="mt-3 md:mt-4 w-full rounded-full gap-2"
                variant="default"
                onClick={handleStartChat}
                data-testid={`button-start-chat-${match.id}`}
              >
                <MessageSquare className="h-4 w-4" />
                تسريع المطابقة
              </Button>
            )}
          </div>

          {/* Left Panel - Seller/Property */}
          <div className="p-4 md:p-6 border-t md:border-t-0 md:border-r border-border/50 bg-gradient-to-bl from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 md:rounded-l-[2.5rem]">
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              {/* Seller Avatar */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-blue-500" data-testid="avatar-seller">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-blue-600 dark:text-blue-400" />
              </div>
              
              {/* Seller Name */}
              <div>
                <h3 className="font-bold text-base md:text-lg" data-testid="text-seller-name">{seller?.name || "المالك"}</h3>
                <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {seller?.isVerified ? "موثوق" : "بائع"}
                </Badge>
              </div>

              {/* Property Price */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-property-price">
                <Wallet className="h-4 w-4" />
                <span className="font-bold text-foreground">
                  {property?.price ? formatCurrency(property.price) : "غير محدد"} ريال
                </span>
              </div>

              {/* Contact Buttons */}
              <div className="flex items-center gap-2">
                {seller?.phone && (
                  <>
                    <Button size="icon" variant="ghost" className="rounded-full" asChild data-testid={`button-call-seller-${match.id}`}>
                      <a href={`tel:${seller.phone}`} aria-label="اتصال بالبائع">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full" asChild data-testid={`button-whatsapp-seller-${match.id}`}>
                      <a href={getWhatsAppLink(seller.phone)} target="_blank" rel="noopener noreferrer" aria-label="واتساب البائع">
                        <SiWhatsapp className="h-4 w-4 text-green-600" />
                      </a>
                    </Button>
                  </>
                )}
                {seller?.email && (
                  <Button size="icon" variant="ghost" className="rounded-full" asChild data-testid={`button-email-seller-${match.id}`}>
                    <a href={`mailto:${seller.email}`} aria-label="بريد البائع">
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Property Tags */}
              <div className="space-y-2 w-full">
                <p className="text-xs text-muted-foreground font-medium">بيانات العقار</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {property?.propertyType && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-property-type">
                      {propertyTypeLabels[property.propertyType] || property.propertyType}
                    </Badge>
                  )}
                  {property?.district && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-property-district">
                      <MapPin className="h-3 w-3 ml-1" />
                      {property.district}
                    </Badge>
                  )}
                  {property?.rooms && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-property-rooms">
                      <Bed className="h-3 w-3 ml-1" />
                      {property.rooms} غرف
                    </Badge>
                  )}
                  {property?.area && (
                    <Badge variant="outline" className="text-xs rounded-full" data-testid="badge-property-area">
                      <Maximize className="h-3 w-3 ml-1" />
                      {property.area} م²
                    </Badge>
                  )}
                </div>
                {/* Smart Tags from property */}
                {((property?.smartTags && Array.isArray(property.smartTags) && property.smartTags.length > 0) || 
                  ((property as any)?.smart_tags && Array.isArray((property as any).smart_tags) && (property as any).smart_tags.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2 pt-2 border-t">
                    {((property?.smartTags && Array.isArray(property.smartTags)) ? property.smartTags : ((property as any)?.smart_tags || [])).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {/* Notes from property */}
                {((property?.notes && property.notes.trim()) || ((property as any)?.notes && String((property as any).notes).trim())) && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground font-medium mb-1">ملاحظات البائع:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{property?.notes || (property as any)?.notes || ""}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchCardCompact({ 
  match, 
  buyerPreference, 
  property, 
  buyer, 
  seller,
  onContact 
}: MatchCardProps) {
  const matchScore = match.matchScore;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/30";
    if (score >= 40) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <Card className="overflow-hidden rounded-2xl hover:shadow-md transition-shadow" data-testid={`match-card-compact-${match.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Match Score Circle */}
          <div className={`relative w-16 h-16 rounded-full ${getScoreBgColor(matchScore)} flex items-center justify-center flex-shrink-0`}>
            <div className="text-center">
              <span className="text-xl font-bold">{matchScore}</span>
              <span className="text-xs block -mt-1">%</span>
            </div>
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${getScoreColor(matchScore)} border-2 border-white dark:border-slate-900`} />
          </div>

          {/* Match Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{buyer?.name || "مشتري"}</span>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{seller?.name || "بائع"}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {propertyTypeLabels[property?.propertyType || ""] || "عقار"}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {property?.city || buyerPreference?.city}
              </Badge>
              {property?.price && (
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(property.price)} ريال
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {match.isContacted ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                <CheckCircle className="h-3 w-3" />
                تم التواصل
              </Badge>
            ) : (
              <Button size="sm" onClick={onContact} data-testid="button-contact-match">
                <Phone className="h-4 w-4 ml-2" />
                تواصل
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
