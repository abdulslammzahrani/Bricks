import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, DollarSign, Eye, Phone } from "lucide-react";
import { PropertyMap } from "@/components/PropertyMap";
import type { Match } from "@shared/schema";

interface MatchMapViewProps {
  matches: Match[];
  onUpdateStatus?: (matchId: string, status: string) => void;
  onConvertToDeal?: (match: any) => void;
}

export function MatchMapView({ matches, onUpdateStatus, onConvertToDeal }: MatchMapViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Extract locations from matches
  const locations = matches
    .map((match) => {
      const property = (match as any).property;
      if (!property?.lat || !property?.lng) return null;
      return {
        id: match.id,
        lat: property.lat,
        lng: property.lng,
        type: "offer" as const,
        match,
      };
    })
    .filter(Boolean);

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-lg mb-1">لا توجد مطابقات</h3>
          <p className="text-muted-foreground text-sm">
            لم يتم العثور على مطابقات بناءً على الفلاتر المحددة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <PropertyMap
              properties={matches.map((match) => ({
                ...(match as any).property,
                matchId: match.id,
              }))}
              onMarkerClick={(property) => {
                const match = matches.find((m) => m.id === (property as any).matchId);
                if (match) setSelectedMatch(match);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => {
          const property = (match as any).property;
          const buyerPreference = (match as any).buyerPreference;

          return (
            <Card
              key={match.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedMatch?.id === match.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className={`text-2xl font-bold ${
                      match.matchScore >= 90 ? "text-green-600" :
                      match.matchScore >= 75 ? "text-blue-600" :
                      match.matchScore >= 60 ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {match.matchScore}%
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {match.status}
                  </Badge>
                </div>

                {property && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{property.propertyType}</span>
                    </div>
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
                  </div>
                )}

                {buyerPreference && (
                  <div className="pt-2 border-t mt-2">
                    <p className="text-xs text-muted-foreground mb-1">الطلب:</p>
                    <p className="text-sm font-medium">
                      {buyerPreference.city} - {buyerPreference.budgetMax?.toLocaleString("ar-SA")} ريال
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus?.(match.id, "contacted");
                    }}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    تواصل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus?.(match.id, "viewing");
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    عرض
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


