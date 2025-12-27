import { Building2, MapPin, Ruler, BedDouble, Bath } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@shared/schema";

interface PropertyHeroProps {
  property: Property;
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

export default function PropertyHero({ property }: PropertyHeroProps) {
  const mainImage = property.images?.[0];

  return (
    <div className="relative w-full">
      {/* Main Image */}
      {mainImage ? (
        <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden">
          <img
            src={mainImage}
            alt={`${propertyTypeNames[property.propertyType] || property.propertyType} في ${property.district}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Price Badge */}
          <div className="absolute bottom-6 right-6">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <p className="text-3xl md:text-4xl font-bold text-primary">
                {formatPrice(property.price)} <span className="text-lg font-normal">ر.س</span>
              </p>
              {property.area && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(Math.round(property.price / property.area))} ر.س/م²
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-96 md:h-[500px] rounded-lg bg-muted flex items-center justify-center">
          <Building2 className="h-24 w-24 text-muted-foreground/50" />
        </div>
      )}

      {/* Property Info */}
      <div className="mt-6 space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {propertyTypeNames[property.propertyType] || property.propertyType} للبيع في {property.district}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-lg">{property.district}، {property.city}</span>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="flex flex-wrap gap-6">
          {property.rooms && (
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.rooms}</span>
              <span className="text-muted-foreground">غرف نوم</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.bathrooms}</span>
              <span className="text-muted-foreground">دورات مياه</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.area}</span>
              <span className="text-muted-foreground">م²</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


