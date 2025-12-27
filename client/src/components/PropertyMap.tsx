import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Eye, Home, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Property {
  id: string;
  city: string;
  district: string;
  propertyType: string;
  price: number;
  viewsCount: number;
  latitude?: number | null;
  longitude?: number | null;
}

interface PropertyMapProps {
  properties: Property[];
}

const cityCoordinates: Record<string, [number, number]> = {
  "الرياض": [24.7136, 46.6753],
  "جدة": [21.4858, 39.1925],
  "مكة": [21.3891, 39.8579],
  "المدينة": [24.5247, 39.5692],
  "الدمام": [26.4207, 50.0888],
  "الخبر": [26.2172, 50.1971],
  "الطائف": [21.2703, 40.4158],
  "تبوك": [28.3998, 36.5715],
  "أبها": [18.2164, 42.5053],
  "القصيم": [26.3267, 43.9708],
};

const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  land: "أرض",
  duplex: "دوبلكس",
  building: "عمارة",
};

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DistrictCoords {
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

export function PropertyMap({ properties }: PropertyMapProps) {
  // Fetch district coordinates for properties that don't have coordinates
  const propertiesNeedingCoords = useMemo(() => {
    return properties.filter(p => !p.latitude || !p.longitude);
  }, [properties]);

  // Fetch district coordinates from API
  const { data: districtCoordsMap = {} } = useQuery<Record<string, DistrictCoords>>({
    queryKey: ["district-coords", propertiesNeedingCoords.map(p => `${p.city}-${p.district}`).join(",")],
    queryFn: async () => {
      const coordsMap: Record<string, DistrictCoords> = {};
      
      // Fetch coordinates for each unique city-district pair
      const uniquePairs = Array.from(
        new Set(propertiesNeedingCoords.map(p => `${p.city}-${p.district}`))
      );

      await Promise.all(
        uniquePairs.map(async (pair) => {
          const [city, district] = pair.split("-");
          try {
            // Try to get district coordinates from API
            const districtsRes = await apiRequest("GET", `/api/form-builder/districts/${city}`);
            const districts = await districtsRes.json();
            const districtData = districts.find((d: any) => d.name === district);
            
            if (districtData && districtData.latitude && districtData.longitude) {
              coordsMap[pair] = {
                city,
                district,
                latitude: districtData.latitude,
                longitude: districtData.longitude,
              };
            }
          } catch (error) {
            // Fallback to city coordinates
            console.warn(`Failed to fetch coordinates for ${city}-${district}:`, error);
          }
        })
      );

      return coordsMap;
    },
    enabled: propertiesNeedingCoords.length > 0,
  });

  const getPropertyCoordinates = (property: Property): [number, number] => {
    // 1. Use property's own coordinates if available
    if (property.latitude && property.longitude) {
      return [property.latitude, property.longitude];
    }

    // 2. Try to get district coordinates from API
    const districtKey = `${property.city}-${property.district}`;
    const districtCoords = districtCoordsMap[districtKey];
    if (districtCoords) {
      return [districtCoords.latitude, districtCoords.longitude];
    }

    // 3. Fallback to city coordinates with small random offset
    const cityCoord = cityCoordinates[property.city] || [24.7136, 46.6753];
    const offset = Math.random() * 0.05 - 0.025;
    return [cityCoord[0] + offset, cityCoord[1] + offset];
  };

  const propertiesWithCoords = properties.map(p => ({
    ...p,
    coords: getPropertyCoordinates(p),
  }));

  const defaultCenter: [number, number] = propertiesWithCoords.length > 0 
    ? propertiesWithCoords[0].coords 
    : [24.7136, 46.6753];

  if (properties.length === 0) {
    return (
      <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد عقارات لعرضها على الخريطة</p>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80 rounded-lg overflow-hidden border relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {propertiesWithCoords.map((property) => (
          <Marker 
            key={property.id} 
            position={property.coords}
            icon={customIcon}
          >
            <Popup>
              <div className="text-right p-1" dir="rtl">
                <div className="font-bold mb-1">
                  {propertyTypeLabels[property.propertyType] || property.propertyType}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {property.city} - {property.district}
                </div>
                <div className="text-primary font-bold mb-1">
                  {property.price.toLocaleString()} ريال
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{property.viewsCount} مشاهدة</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
