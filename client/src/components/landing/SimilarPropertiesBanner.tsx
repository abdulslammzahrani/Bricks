import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Property } from "@shared/schema";

interface SimilarPropertiesBannerProps {
  properties: Property[];
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
  return new Intl.NumberFormat('ar-SA').format(price);
}

export default function SimilarPropertiesBanner({ properties }: SimilarPropertiesBannerProps) {
  if (properties.length === 0) return null;

  return (
    <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">عقارات مشابهة قد تهمك</h3>
          <p className="text-sm text-muted-foreground">
            بناءً على تفضيلاتك، وجدنا {properties.length} عقار مطابق
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.slice(0, 3).map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {property.images?.[0] ? (
              <div className="relative h-48 w-full">
                <img
                  src={property.images[0]}
                  alt={propertyTypeNames[property.propertyType] || property.propertyType}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-muted flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary">
                  {propertyTypeNames[property.propertyType] || property.propertyType}
                </Badge>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(property.price)} <span className="text-xs">ر.س</span>
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4" />
                <span>{property.district}، {property.city}</span>
              </div>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={`/property/${property.id}`}>
                  عرض التفاصيل
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length > 3 && (
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              عرض جميع العقارات المطابقة ({properties.length})
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}


