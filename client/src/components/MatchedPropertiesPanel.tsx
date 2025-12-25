import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Building2,
  MapPin,
  Ruler,
  BedDouble,
  Eye,
  Heart,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface MatchedProperty {
  id: string;
  propertyId: string;
  buyerPreferenceId: string;
  matchScore: number;
  status: string;
  property: {
    id: string;
    propertyType: string;
    city: string;
    district: string;
    price: number;
    area: string | null;
    rooms: string | null;
    images: string[] | null;
    status: string | null;
    smartTags?: string[];
    notes?: string | null;
  } | null;
}

interface BuyerPreference {
  id: string;
  city: string;
  districts: string[] | null;
  propertyType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  smartTags?: string[];
  notes?: string | null;
}

const propertyTypeNames: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  land: "أرض",
  building: "عمارة",
  duplex: "دوبلكس",
  floor: "دور",
  commercial: "تجاري",
};

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون`;
  }
  return `${(price / 1000).toFixed(0)} ألف`;
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50 dark:bg-green-950";
  if (score >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
  return "text-orange-600 bg-orange-50 dark:bg-orange-950";
}

interface MatchedPropertiesPanelProps {
  preferences: BuyerPreference[];
}

export function MatchedPropertiesPanel({ preferences }: MatchedPropertiesPanelProps) {
  if (!preferences || preferences.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-lg mb-2">لا توجد رغبات مسجلة</h3>
          <p className="text-muted-foreground text-sm">
            أضف رغباتك العقارية أولاً لنعرض لك العروض المتطابقة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {preferences.map((pref) => (
        <PreferenceMatches key={pref.id} preference={pref} />
      ))}
    </div>
  );
}

function PreferenceMatches({ preference }: { preference: BuyerPreference }) {
  const { data: matches, isLoading } = useQuery<MatchedProperty[]>({
    queryKey: ["matches", preference.id],
    queryFn: async () => {
      const res = await fetch(`/api/buyers/preferences/${preference.id}/matches`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
  });

  const validMatches = matches?.filter((m) => m.property) || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            عروض متطابقة مع:
          </h3>
          <Badge variant="outline">
            {propertyTypeNames[preference.propertyType] || preference.propertyType}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            {preference.city}
          </Badge>
          {preference.districts?.slice(0, 2).map((d, i) => (
            <Badge key={i} variant="outline">{d}</Badge>
          ))}
        </div>
        {preference.budgetMax && (
          <Badge variant="outline" className="gap-1">
            حتى {formatPrice(preference.budgetMax)} ريال
          </Badge>
        )}
      </div>
      
      {/* Smart Tags and Notes from preference */}
      {((preference.smartTags && Array.isArray(preference.smartTags) && preference.smartTags.length > 0) || 
        ((preference as any).smart_tags && Array.isArray((preference as any).smart_tags) && (preference as any).smart_tags.length > 0) ||
        (preference.notes && preference.notes.trim()) || 
        ((preference as any).notes && String((preference as any).notes).trim())) ? (
        <div className="mb-4 space-y-2">
          {((preference.smartTags && Array.isArray(preference.smartTags) && preference.smartTags.length > 0) || 
            ((preference as any).smart_tags && Array.isArray((preference as any).smart_tags) && (preference as any).smart_tags.length > 0)) && (
            <div className="flex flex-wrap gap-1.5">
              {((preference.smartTags && Array.isArray(preference.smartTags)) ? preference.smartTags : ((preference as any).smart_tags || [])).map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {((preference.notes && preference.notes.trim()) || ((preference as any).notes && String((preference as any).notes).trim())) && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <p className="font-medium mb-1">ملاحظات:</p>
              <p className="whitespace-pre-wrap">{preference.notes || (preference as any).notes || ""}</p>
            </div>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : validMatches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">لا توجد عروض متطابقة حالياً</p>
            <p className="text-sm text-muted-foreground mt-1">
              سنرسل لك إشعار فور وجود عقار يناسب طلبك
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {validMatches
            .sort((a, b) => b.matchScore - a.matchScore)
            .map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: MatchedProperty }) {
  const property = match.property!;
  const scoreColor = getMatchScoreColor(match.matchScore);

  return (
    <Card className="overflow-hidden hover-elevate">
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={`${propertyTypeNames[property.propertyType]} في ${property.district}`}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-40 w-full bg-muted flex items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <Badge className={`absolute top-2 left-2 gap-1 ${scoreColor}`}>
          <TrendingUp className="h-3 w-3" />
          {match.matchScore}% تطابق
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {propertyTypeNames[property.propertyType] || property.propertyType}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            {property.district}
          </Badge>
        </div>

        <div className="text-xl font-bold text-primary">
          {formatPrice(property.price)} ريال
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {property.area && (
            <span className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              {property.area} م²
            </span>
          )}
          {property.rooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              {property.rooms} غرف
            </span>
          )}
        </div>
        
        {/* Smart Tags from property */}
        {((property.smartTags && Array.isArray(property.smartTags) && property.smartTags.length > 0) || 
          ((property as any).smart_tags && Array.isArray((property as any).smart_tags) && (property as any).smart_tags.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
            {((property.smartTags && Array.isArray(property.smartTags)) ? property.smartTags : ((property as any).smart_tags || [])).map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Notes from property */}
        {((property.notes && property.notes.trim()) || ((property as any).notes && String((property as any).notes).trim())) && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium mb-1">ملاحظات:</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2">{property.notes || (property as any).notes || ""}</p>
          </div>
        )}

        <Link href={`/property/${property.id}`}>
          <Button variant="outline" className="w-full gap-2" data-testid={`button-view-property-${property.id}`}>
            <Eye className="h-4 w-4" />
            عرض التفاصيل
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
