import { useState, KeyboardEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Edit2, Trash2, MapPin, Sparkles, Loader2, Download, Upload, Search, ChevronDown, ChevronRight, ChevronUp, Building2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { City, District, Direction } from "@shared/schema";
import LocationMapPicker from "./LocationMapPicker";

// City Card Component with Districts and Directions inside
function CityCard({
  city,
  districts,
  directions,
  onEditCity,
  onDeleteCity,
  onEditDistrict,
  onDeleteDistrict,
  onEditDirection,
  onDeleteDirection,
  onAddDistrict,
  onAddDirection,
}: {
  city: City;
  districts: District[];
  directions: Direction[];
  onEditCity: (city: City) => void;
  onDeleteCity: (id: string) => void;
  onEditDistrict: (district: District) => void;
  onDeleteDistrict: (id: string) => void;
  onEditDirection: (direction: Direction) => void;
  onDeleteDirection: (id: string) => void;
  onAddDistrict: (cityId: string) => void;
  onAddDirection: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"info" | "districts" | "directions">("info");
  const cityDistricts = districts.filter(d => d.cityId === city.id);
  // Show all directions, not just those used by districts
  const cityDirections = directions;

  return (
    <Card className="w-full transition-all" style={{ height: 'auto' }}>
      <CardHeader 
        className={`${isExpanded ? 'pb-3 pt-4' : 'py-2.5'} px-4 cursor-pointer hover:bg-muted/50 transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <CardTitle className="text-sm font-semibold flex-1 leading-tight break-words" title={city.name}>{city.name}</CardTitle>
          <Badge variant="secondary" className="flex-shrink-0 text-xs px-2 py-0.5" title={city.region}>{city.region}</Badge>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 duration-200">
          <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as "info" | "districts" | "directions")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="info" className="text-xs">المعلومات</TabsTrigger>
              <TabsTrigger value="districts" className="text-xs">الأحياء ({cityDistricts.length})</TabsTrigger>
              <TabsTrigger value="directions" className="text-xs">الاتجاهات ({cityDirections.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-3 mt-0">
              <div>
                <div className="text-sm font-medium mb-1">الدولة</div>
                <div className="text-sm text-muted-foreground">المملكة العربية السعودية</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">المنطقة</div>
                <div className="text-sm text-muted-foreground">{city.region}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">الاسم الإنجليزي</div>
                <div className="text-sm text-muted-foreground">{city.nameEn || "غير محدد"}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">الإحداثيات</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEditCity(city); }} className="flex-1">
                  <Edit2 className="w-4 h-4 ml-2" /> تعديل
                </Button>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); if (confirm(`هل أنت متأكد من حذف ${city.name}؟`)) onDeleteCity(city.id); }} className="flex-1 text-destructive">
                  <Trash2 className="w-4 h-4 ml-2" /> حذف
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="districts" className="space-y-2 mt-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold">أحياء {city.name}</h4>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAddDistrict(city.id); }}>
                  <Plus className="w-3 h-3 ml-1" /> إضافة حي
                </Button>
              </div>
              {cityDistricts.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">لا توجد أحياء</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cityDistricts.map((district) => (
                    <div key={district.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium break-words">{district.name}</div>
                        {district.direction && (
                          <div className="text-xs text-muted-foreground">{district.direction}</div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEditDistrict(district); }} className="h-7 w-7 p-0">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); if (confirm(`هل أنت متأكد من حذف ${district.name}؟`)) onDeleteDistrict(district.id); }} className="h-7 w-7 p-0 text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="directions" className="space-y-2 mt-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold">اتجاهات {city.name}</h4>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAddDirection(); }}>
                  <Plus className="w-3 h-3 ml-1" /> إضافة اتجاه
                </Button>
              </div>
              {cityDirections.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">لا توجد اتجاهات</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cityDirections.map((direction) => (
                    <div key={direction.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium break-words">{direction.labelAr}</div>
                        <div className="text-xs text-muted-foreground">{direction.code}</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEditDirection(direction); }} className="h-7 w-7 p-0">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); if (confirm(`هل أنت متأكد من حذف ${direction.labelAr}؟`)) onDeleteDirection(direction.id); }} className="h-7 w-7 p-0 text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

// District Card Component
function DistrictCard({
  district,
  cityName,
  cityRegion,
  onEdit,
  onDelete,
}: {
  district: District;
  cityName?: string;
  cityRegion?: string;
  onEdit: (district: District) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full transition-all" style={{ height: 'auto' }}>
      <CardHeader 
        className={`${isExpanded ? 'pb-3 pt-4' : 'py-2.5'} px-4 cursor-pointer hover:bg-muted/50 transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <CardTitle className="text-sm font-semibold flex-1 leading-tight break-words" title={district.name}>{district.name}</CardTitle>
          <Badge variant="secondary" className="flex-shrink-0 text-xs px-2 py-0.5" title={cityName || "غير معروف"}>{cityName || "غير معروف"}</Badge>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 duration-200">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">الدولة</div>
              <div className="text-sm text-muted-foreground">المملكة العربية السعودية</div>
            </div>
            {cityRegion && (
              <div>
                <div className="text-sm font-medium mb-1">المنطقة</div>
                <div className="text-sm text-muted-foreground">{cityRegion}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium mb-1">المدينة</div>
              <div className="text-sm text-muted-foreground">{cityName || "غير معروف"}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">الاسم الإنجليزي</div>
              <div className="text-sm text-muted-foreground">{district.nameEn || "غير محدد"}</div>
            </div>
            {district.direction && (
              <div>
                <div className="text-sm font-medium mb-1">الاتجاه</div>
                <div className="text-sm text-muted-foreground">{district.direction}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium mb-1">الإحداثيات</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {district.latitude.toFixed(4)}, {district.longitude.toFixed(4)}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(district); }} className="flex-1">
                <Edit2 className="w-4 h-4 ml-2" /> تعديل
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); if (confirm(`هل أنت متأكد من حذف ${district.name}؟`)) onDelete(district.id); }} className="flex-1 text-destructive">
                <Trash2 className="w-4 h-4 ml-2" /> حذف
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Direction Card Component
function DirectionCard({
  direction,
  onEdit,
  onDelete,
}: {
  direction: Direction;
  onEdit: (direction: Direction) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full transition-all" style={{ height: 'auto' }}>
      <CardHeader 
        className={`${isExpanded ? 'pb-3 pt-4' : 'py-2.5'} px-4 cursor-pointer hover:bg-muted/50 transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <CardTitle className="text-sm font-semibold flex-1 leading-tight break-words" title={direction.labelAr}>{direction.labelAr}</CardTitle>
          <Badge variant="secondary" className="flex-shrink-0 text-xs px-2 py-0.5">{direction.code}</Badge>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 duration-200">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">الدولة</div>
              <div className="text-sm text-muted-foreground">المملكة العربية السعودية</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">الكود</div>
              <div className="text-sm text-muted-foreground">{direction.code}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">الاسم الإنجليزي</div>
              <div className="text-sm text-muted-foreground">{direction.labelEn || "غير محدد"}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(direction); }} className="flex-1">
                <Edit2 className="w-4 h-4 ml-2" /> تعديل
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); if (confirm(`هل أنت متأكد من حذف ${direction.labelAr}؟`)) onDelete(direction.id); }} className="flex-1 text-destructive">
                <Trash2 className="w-4 h-4 ml-2" /> حذف
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// City List Component with limited display - organized by region
function CityList({
  cities,
  districts,
  directions,
  onEditCity,
  onDeleteCity,
  onEditDistrict,
  onDeleteDistrict,
  onEditDirection,
  onDeleteDirection,
  onAddDistrict,
  onAddDirection,
}: {
  cities: City[];
  districts: District[];
  directions: Direction[];
  onEditCity: (city: City) => void;
  onDeleteCity: (id: string) => void;
  onEditDistrict: (district: District) => void;
  onDeleteDistrict: (id: string) => void;
  onEditDirection: (direction: Direction) => void;
  onDeleteDirection: (id: string) => void;
  onAddDistrict: (cityId: string) => void;
  onAddDirection: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  
  // Group cities by region and sort
  const citiesByRegion = cities.reduce((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = [];
    }
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, City[]>);

  // Sort cities within each region by order, then by name
  Object.keys(citiesByRegion).forEach(region => {
    citiesByRegion[region].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name, 'ar');
    });
  });

  // Sort regions alphabetically
  const sortedRegions = Object.keys(citiesByRegion).sort((a, b) => a.localeCompare(b, 'ar'));
  
  // Flatten sorted cities
  const sortedCities = sortedRegions.flatMap(region => citiesByRegion[region]);
  
  const displayedCities = showAll ? sortedCities : sortedCities.slice(0, 3);
  const hasMore = sortedCities.length > 3;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {displayedCities.map((city) => (
          <CityCard 
            key={city.id} 
            city={city}
            districts={districts}
            directions={directions}
            onEditCity={onEditCity}
            onDeleteCity={onDeleteCity}
            onEditDistrict={onEditDistrict}
            onDeleteDistrict={onDeleteDistrict}
            onEditDirection={onEditDirection}
            onDeleteDirection={onDeleteDirection}
            onAddDistrict={onAddDistrict}
            onAddDirection={onAddDirection}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                إخفاء
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                عرض المزيد ({sortedCities.length - 3})
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

// District List Component with limited display - organized by city and region
function DistrictList({
  districts,
  cities,
  onEdit,
  onDelete,
}: {
  districts: District[];
  cities: City[];
  onEdit: (district: District) => void;
  onDelete: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  
  // Sort districts: first by city region, then by city name, then by order, then by name
  const sortedDistricts = [...districts].sort((a, b) => {
    const cityA = cities.find(c => c.id === a.cityId);
    const cityB = cities.find(c => c.id === b.cityId);
    
    // Sort by region first
    if (cityA?.region && cityB?.region && cityA.region !== cityB.region) {
      return cityA.region.localeCompare(cityB.region, 'ar');
    }
    
    // Then by city name
    if (cityA?.name && cityB?.name && cityA.name !== cityB.name) {
      return cityA.name.localeCompare(cityB.name, 'ar');
    }
    
    // Then by order
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    
    // Finally by district name
    return a.name.localeCompare(b.name, 'ar');
  });
  
  const displayedDistricts = showAll ? sortedDistricts : sortedDistricts.slice(0, 3);
  const hasMore = sortedDistricts.length > 3;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {displayedDistricts.map((district) => {
          const city = cities.find(c => c.id === district.cityId);
          return (
            <DistrictCard
              key={district.id}
              district={district}
              cityName={city?.name}
              cityRegion={city?.region}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                إخفاء
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                عرض المزيد ({sortedDistricts.length - 3})
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

// Direction List Component with limited display - sorted by order
function DirectionList({
  directions,
  onEdit,
  onDelete,
}: {
  directions: Direction[];
  onEdit: (direction: Direction) => void;
  onDelete: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  
  // Sort directions by order, then by Arabic label
  const sortedDirections = [...directions].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.labelAr.localeCompare(b.labelAr, 'ar');
  });
  
  const displayedDirections = showAll ? sortedDirections : sortedDirections.slice(0, 3);
  const hasMore = sortedDirections.length > 3;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {displayedDirections.map((direction) => (
          <DirectionCard key={direction.id} direction={direction} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                إخفاء
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                عرض المزيد ({sortedDirections.length - 3})
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

export default function LocationsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Cities state
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityFormData, setCityFormData] = useState({
    name: "",
    nameEn: "",
    region: "",
    latitude: "",
    longitude: "",
    isActive: true,
    order: 0,
  });

  // Districts state
  const [showDistrictDialog, setShowDistrictDialog] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string>("all");
  const [districtFormData, setDistrictFormData] = useState({
    cityId: "",
    name: "",
    nameEn: "",
    direction: "",
    latitude: "",
    longitude: "",
    isActive: true,
    order: 0,
  });
  const [isGeocodingCity, setIsGeocodingCity] = useState(false);
  const [isGeocodingDistrict, setIsGeocodingDistrict] = useState(false);
  
  // Search and filter state
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");
  const [directionSearchQuery, setDirectionSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Directions state
  const [showDirectionDialog, setShowDirectionDialog] = useState(false);
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null);
  const [directionFormData, setDirectionFormData] = useState({
    code: "",
    labelAr: "",
    labelEn: "",
    isActive: true,
    order: 0,
  });

  // Fetch cities
  const { data: cities = [], isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["locations-cities"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/locations/cities");
      return await res.json();
    },
  });

  // Fetch districts - get all districts
  const { data: districts = [], isLoading: districtsLoading } = useQuery<District[]>({
    queryKey: ["locations-districts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/locations/districts");
      return await res.json();
    },
  });

  // Fetch directions
  const { data: directions = [], isLoading: directionsLoading } = useQuery<Direction[]>({
    queryKey: ["locations-directions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/locations/directions");
      return await res.json();
    },
  });

  // City mutations
  const createCityMutation = useMutation({
    mutationFn: async (data: typeof cityFormData) => {
      const res = await apiRequest("POST", "/api/admin/locations/cities", {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        order: parseInt(data.order.toString()) || 0,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-cities"] });
      setShowCityDialog(false);
      resetCityForm();
      toast({ title: "تم الحفظ", description: "تم إضافة المدينة بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة المدينة",
        variant: "destructive",
      });
    },
  });

  const updateCityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof cityFormData> }) => {
      const res = await apiRequest("PUT", `/api/admin/locations/cities/${id}`, {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude.toString()) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude.toString()) : undefined,
        order: data.order ? parseInt(data.order.toString()) : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-cities"] });
      setShowCityDialog(false);
      resetCityForm();
      toast({ title: "تم الحفظ", description: "تم تحديث المدينة بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث المدينة",
        variant: "destructive",
      });
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/locations/cities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-cities"] });
      toast({ title: "تم الحذف", description: "تم حذف المدينة بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف المدينة",
        variant: "destructive",
      });
    },
  });

  // District mutations
  const createDistrictMutation = useMutation({
    mutationFn: async (data: typeof districtFormData) => {
      const res = await apiRequest("POST", "/api/admin/locations/districts", {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        order: parseInt(data.order.toString()) || 0,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-districts"] });
      setShowDistrictDialog(false);
      resetDistrictForm();
      toast({ title: "تم الحفظ", description: "تم إضافة الحي بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الحي",
        variant: "destructive",
      });
    },
  });

  const updateDistrictMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof districtFormData> }) => {
      const res = await apiRequest("PUT", `/api/admin/locations/districts/${id}`, {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude.toString()) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude.toString()) : undefined,
        order: data.order ? parseInt(data.order.toString()) : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-districts"] });
      setShowDistrictDialog(false);
      resetDistrictForm();
      toast({ title: "تم الحفظ", description: "تم تحديث الحي بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الحي",
        variant: "destructive",
      });
    },
  });

  const deleteDistrictMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/locations/districts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-districts"] });
      toast({ title: "تم الحذف", description: "تم حذف الحي بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الحي",
        variant: "destructive",
      });
    },
  });

  // Direction mutations
  const createDirectionMutation = useMutation({
    mutationFn: async (data: typeof directionFormData) => {
      const res = await apiRequest("POST", "/api/admin/locations/directions", {
        ...data,
        order: parseInt(data.order.toString()) || 0,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-directions"] });
      setShowDirectionDialog(false);
      resetDirectionForm();
      toast({ title: "تم الحفظ", description: "تم إضافة الاتجاه بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الاتجاه",
        variant: "destructive",
      });
    },
  });

  const updateDirectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof directionFormData> }) => {
      const res = await apiRequest("PUT", `/api/admin/locations/directions/${id}`, {
        ...data,
        order: data.order ? parseInt(data.order.toString()) : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-directions"] });
      setShowDirectionDialog(false);
      resetDirectionForm();
      toast({ title: "تم الحفظ", description: "تم تحديث الاتجاه بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الاتجاه",
        variant: "destructive",
      });
    },
  });

  const deleteDirectionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/locations/directions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-directions"] });
      toast({ title: "تم الحذف", description: "تم حذف الاتجاه بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الاتجاه",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const resetCityForm = () => {
    setCityFormData({
      name: "",
      nameEn: "",
      region: "",
      latitude: "",
      longitude: "",
      isActive: true,
      order: 0,
    });
    setEditingCity(null);
  };

  const resetDistrictForm = () => {
    setDistrictFormData({
      cityId: "",
      name: "",
      nameEn: "",
      direction: "",
      latitude: "",
      longitude: "",
      isActive: true,
      order: 0,
    });
    setEditingDistrict(null);
  };

  const resetDirectionForm = () => {
    setDirectionFormData({
      code: "",
      labelAr: "",
      labelEn: "",
      isActive: true,
      order: 0,
    });
    setEditingDirection(null);
  };

  const openCityDialog = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setCityFormData({
        name: city.name,
        nameEn: city.nameEn || "",
        region: city.region,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        isActive: city.isActive,
        order: city.order,
      });
    } else {
      resetCityForm();
    }
    setShowCityDialog(true);
  };

  const openDistrictDialog = (district?: District) => {
    if (district) {
      setEditingDistrict(district);
      setDistrictFormData({
        cityId: district.cityId,
        name: district.name,
        nameEn: district.nameEn || "",
        direction: district.direction || "none",
        latitude: district.latitude.toString(),
        longitude: district.longitude.toString(),
        isActive: district.isActive,
        order: district.order,
      });
    } else {
      resetDistrictForm();
      if (selectedCityId && selectedCityId !== "all") {
        if (selectedCityId && selectedCityId !== "all") {
          setDistrictFormData(prev => ({ ...prev, cityId: selectedCityId }));
        }
      }
    }
    setShowDistrictDialog(true);
  };

  const openDirectionDialog = (direction?: Direction) => {
    if (direction) {
      setEditingDirection(direction);
      setDirectionFormData({
        code: direction.code,
        labelAr: direction.labelAr,
        labelEn: direction.labelEn || "",
        isActive: direction.isActive,
        order: direction.order,
      });
    } else {
      resetDirectionForm();
    }
    setShowDirectionDialog(true);
  };

  const handleCitySubmit = () => {
    // Validate required fields
    if (!cityFormData.name || !cityFormData.region || !cityFormData.latitude || !cityFormData.longitude) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Validate coordinates
    const lat = parseFloat(cityFormData.latitude);
    const lng = parseFloat(cityFormData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "خطأ",
        description: "الإحداثيات يجب أن تكون أرقام صحيحة",
        variant: "destructive",
      });
      return;
    }

    // Saudi Arabia bounds: lat 16-32, lng 34-55
    if (lat < 16 || lat > 32) {
      toast({
        title: "خطأ",
        description: `خط العرض يجب أن يكون بين 16 و 32 (السعودية)`,
        variant: "destructive",
      });
      return;
    }

    if (lng < 34 || lng > 55) {
      toast({
        title: "خطأ",
        description: `خط الطول يجب أن يكون بين 34 و 55 (السعودية)`,
        variant: "destructive",
      });
      return;
    }

    // Validate name length
    if (cityFormData.name.trim().length < 2) {
      toast({
        title: "خطأ",
        description: "اسم المدينة يجب أن يكون على الأقل حرفين",
        variant: "destructive",
      });
      return;
    }

    if (editingCity) {
      updateCityMutation.mutate({ id: editingCity.id, data: cityFormData });
    } else {
      createCityMutation.mutate(cityFormData);
    }
  };

  const handleDistrictSubmit = () => {
    // Validate required fields
    if (!districtFormData.cityId || !districtFormData.name || !districtFormData.latitude || !districtFormData.longitude) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة (المدينة، اسم الحي، والإحداثيات)",
        variant: "destructive",
      });
      return;
    }

    // Validate coordinates
    const lat = parseFloat(districtFormData.latitude);
    const lng = parseFloat(districtFormData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "خطأ",
        description: "الإحداثيات يجب أن تكون أرقام صحيحة",
        variant: "destructive",
      });
      return;
    }

    // Saudi Arabia bounds: lat 16-32, lng 34-55
    if (lat < 16 || lat > 32) {
      toast({
        title: "خطأ",
        description: `خط العرض يجب أن يكون بين 16 و 32 (السعودية)`,
        variant: "destructive",
      });
      return;
    }

    if (lng < 34 || lng > 55) {
      toast({
        title: "خطأ",
        description: `خط الطول يجب أن يكون بين 34 و 55 (السعودية)`,
        variant: "destructive",
      });
      return;
    }

    // Validate name length
    if (districtFormData.name.trim().length < 2) {
      toast({
        title: "خطأ",
        description: "اسم الحي يجب أن يكون على الأقل حرفين",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...districtFormData,
      direction: districtFormData.direction === "none" ? "" : districtFormData.direction,
    };

    if (editingDistrict) {
      updateDistrictMutation.mutate({ id: editingDistrict.id, data: submitData });
    } else {
      createDistrictMutation.mutate(submitData);
    }
  };

  const handleDirectionSubmit = () => {
    if (!directionFormData.code || !directionFormData.labelAr) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (editingDirection) {
      updateDirectionMutation.mutate({ id: editingDirection.id, data: directionFormData });
    } else {
      createDirectionMutation.mutate(directionFormData);
    }
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>إدارة المواقع</CardTitle>
        <CardDescription>إدارة المدن والأحياء والاتجاهات مع إحداثيات دقيقة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-4xl mx-auto">
          {/* Cities Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h3 className="text-lg font-semibold">المدن ({cities.length})</h3>
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث في المدن..."
                    value={citySearchQuery}
                    onChange={(e) => {
                      setCitySearchQuery(e.target.value);
                    }}
                    className="pr-8"
                  />
                </div>
              </div>
              <Button onClick={() => openCityDialog()}>
                <Plus className="w-4 h-4 ml-2" /> إضافة مدينة
              </Button>
            </div>
            {citiesLoading ? (
              <p className="text-muted-foreground">جاري التحميل...</p>
            ) : cities.length === 0 ? (
              <p className="text-muted-foreground">لا توجد مدن</p>
            ) : (() => {
              // Filter cities
              const filteredCities = cities.filter(city =>
                city.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
                (city.nameEn && city.nameEn.toLowerCase().includes(citySearchQuery.toLowerCase())) ||
                city.region.toLowerCase().includes(citySearchQuery.toLowerCase())
              );
              
              return <CityList 
                cities={filteredCities}
                districts={districts}
                directions={directions}
                onEditCity={openCityDialog}
                onDeleteCity={(id) => deleteCityMutation.mutate(id)}
                onEditDistrict={openDistrictDialog}
                onDeleteDistrict={(id) => deleteDistrictMutation.mutate(id)}
                onEditDirection={openDirectionDialog}
                onDeleteDirection={(id) => deleteDirectionMutation.mutate(id)}
                onAddDistrict={(cityId) => {
                  setSelectedCityId(cityId);
                  openDistrictDialog();
                }}
                onAddDirection={openDirectionDialog}
              />;
            })()}
          </div>
        </div>

        {/* City Dialog */}
        <Dialog open={showCityDialog} onOpenChange={setShowCityDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCity ? "تعديل مدينة" : "إضافة مدينة"}</DialogTitle>
              <DialogDescription>أدخل معلومات المدينة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اسم المدينة (عربي) *</Label>
                <div className="flex gap-2">
                  <Input
                    value={cityFormData.name}
                    onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                    placeholder="الرياض"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!cityFormData.name.trim()) {
                        toast({
                          title: "خطأ",
                          description: "يرجى إدخال اسم المدينة أولاً",
                          variant: "destructive",
                        });
                        return;
                      }
                      setIsGeocodingCity(true);
                      try {
                        const res = await apiRequest("POST", "/api/admin/locations/geocode/city", {
                          cityName: cityFormData.name,
                          region: cityFormData.region || undefined,
                        });
                        const data = await res.json();
                        if (data.latitude && data.longitude) {
                          setCityFormData({
                            ...cityFormData,
                            latitude: data.latitude.toString(),
                            longitude: data.longitude.toString(),
                            region: data.region || cityFormData.region,
                          });
                          toast({
                            title: "تم",
                            description: "تم الحصول على الإحداثيات تلقائياً",
                          });
                        } else {
                          toast({
                            title: "تحذير",
                            description: "لم يتم العثور على إحداثيات، يمكنك إدخالها يدوياً",
                            variant: "destructive",
                          });
                        }
                      } catch (error: any) {
                        toast({
                          title: "خطأ",
                          description: "فشل في الحصول على الإحداثيات",
                          variant: "destructive",
                        });
                      } finally {
                        setIsGeocodingCity(false);
                      }
                    }}
                    disabled={isGeocodingCity || !cityFormData.name.trim()}
                  >
                    {isGeocodingCity ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 ml-2" />
                    )}
                    {isGeocodingCity ? "جاري..." : "ملء تلقائي"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  اكتب اسم المدينة واضغط "ملء تلقائي" للحصول على الإحداثيات والمنطقة تلقائياً
                </p>
              </div>
              <div>
                <Label>اسم المدينة (إنجليزي)</Label>
                <Input
                  value={cityFormData.nameEn}
                  onChange={(e) => setCityFormData({ ...cityFormData, nameEn: e.target.value })}
                  placeholder="Riyadh"
                />
              </div>
              <div>
                <Label>المنطقة *</Label>
                <Input
                  value={cityFormData.region}
                  onChange={(e) => setCityFormData({ ...cityFormData, region: e.target.value })}
                  placeholder="منطقة الرياض"
                />
              </div>
              <div>
                <Label>الإحداثيات *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  اضغط على الخريطة أو أدخل الإحداثيات يدوياً
                </p>
                <LocationMapPicker
                  latitude={parseFloat(cityFormData.latitude) || 24.7136}
                  longitude={parseFloat(cityFormData.longitude) || 46.6753}
                  onLocationChange={(lat, lng) => {
                    setCityFormData({
                      ...cityFormData,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    });
                  }}
                  height="300px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>خط العرض (Latitude) *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={cityFormData.latitude}
                    onChange={(e) => setCityFormData({ ...cityFormData, latitude: e.target.value })}
                    placeholder="24.7136"
                  />
                </div>
                <div>
                  <Label>خط الطول (Longitude) *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={cityFormData.longitude}
                    onChange={(e) => setCityFormData({ ...cityFormData, longitude: e.target.value })}
                    placeholder="46.6753"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCityDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCitySubmit}>
                {editingCity ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* District Dialog */}
        <Dialog open={showDistrictDialog} onOpenChange={setShowDistrictDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDistrict ? "تعديل حي" : "إضافة حي"}</DialogTitle>
              <DialogDescription>أدخل معلومات الحي مع الإحداثيات الدقيقة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>المدينة *</Label>
                <Select
                  value={districtFormData.cityId}
                  onValueChange={(value) => setDistrictFormData({ ...districtFormData, cityId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>اسم الحي (عربي) *</Label>
                <div className="flex gap-2">
                  <Input
                    value={districtFormData.name}
                    onChange={(e) => setDistrictFormData({ ...districtFormData, name: e.target.value })}
                    placeholder="النرجس"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!districtFormData.name.trim() || !districtFormData.cityId) {
                        toast({
                          title: "خطأ",
                          description: "يرجى إدخال اسم الحي واختيار المدينة أولاً",
                          variant: "destructive",
                        });
                        return;
                      }
                      const selectedCity = cities.find(c => c.id === districtFormData.cityId);
                      if (!selectedCity) {
                        toast({
                          title: "خطأ",
                          description: "يرجى اختيار المدينة أولاً",
                          variant: "destructive",
                        });
                        return;
                      }
                      setIsGeocodingDistrict(true);
                      try {
                        const res = await apiRequest("POST", "/api/admin/locations/geocode/district", {
                          districtName: districtFormData.name,
                          cityName: selectedCity.name,
                          region: selectedCity.region || undefined,
                        });
                        const data = await res.json();
                        if (data.latitude && data.longitude) {
                          setDistrictFormData({
                            ...districtFormData,
                            latitude: data.latitude.toString(),
                            longitude: data.longitude.toString(),
                          });
                          toast({
                            title: "تم",
                            description: "تم الحصول على الإحداثيات تلقائياً",
                          });
                        } else {
                          toast({
                            title: "تحذير",
                            description: "لم يتم العثور على إحداثيات، يمكنك إدخالها يدوياً",
                            variant: "destructive",
                          });
                        }
                      } catch (error: any) {
                        toast({
                          title: "خطأ",
                          description: "فشل في الحصول على الإحداثيات",
                          variant: "destructive",
                        });
                      } finally {
                        setIsGeocodingDistrict(false);
                      }
                    }}
                    disabled={isGeocodingDistrict || !districtFormData.name.trim() || !districtFormData.cityId}
                  >
                    {isGeocodingDistrict ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 ml-2" />
                    )}
                    {isGeocodingDistrict ? "جاري..." : "ملء تلقائي"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  اكتب اسم الحي واختر المدينة، ثم اضغط "ملء تلقائي" للحصول على الإحداثيات تلقائياً
                </p>
              </div>
              <div>
                <Label>اسم الحي (إنجليزي)</Label>
                <Input
                  value={districtFormData.nameEn}
                  onChange={(e) => setDistrictFormData({ ...districtFormData, nameEn: e.target.value })}
                  placeholder="Al Narjis"
                />
              </div>
              <div>
                <Label>الاتجاه</Label>
                <Select
                  value={districtFormData.direction || "none"}
                  onValueChange={(value) => setDistrictFormData({ ...districtFormData, direction: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الاتجاه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد</SelectItem>
                    {directions.map((dir) => (
                      <SelectItem key={dir.id} value={dir.code}>
                        {dir.labelAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الإحداثيات *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  اضغط على الخريطة أو أدخل الإحداثيات يدوياً
                </p>
                <LocationMapPicker
                  latitude={parseFloat(districtFormData.latitude) || 24.7136}
                  longitude={parseFloat(districtFormData.longitude) || 46.6753}
                  onLocationChange={(lat, lng) => {
                    setDistrictFormData({
                      ...districtFormData,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    });
                  }}
                  height="300px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>خط العرض (Latitude) *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={districtFormData.latitude}
                    onChange={(e) => setDistrictFormData({ ...districtFormData, latitude: e.target.value })}
                    placeholder="24.7136"
                  />
                </div>
                <div>
                  <Label>خط الطول (Longitude) *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={districtFormData.longitude}
                    onChange={(e) => setDistrictFormData({ ...districtFormData, longitude: e.target.value })}
                    placeholder="46.6753"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDistrictDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleDistrictSubmit}>
                {editingDistrict ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Direction Dialog */}
        <Dialog open={showDirectionDialog} onOpenChange={setShowDirectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDirection ? "تعديل اتجاه" : "إضافة اتجاه"}</DialogTitle>
              <DialogDescription>أدخل معلومات الاتجاه</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الكود (Code) *</Label>
                <Input
                  value={directionFormData.code}
                  onChange={(e) => setDirectionFormData({ ...directionFormData, code: e.target.value })}
                  placeholder="north"
                  disabled={!!editingDirection}
                />
              </div>
              <div>
                <Label>التسمية (عربي) *</Label>
                <Input
                  value={directionFormData.labelAr}
                  onChange={(e) => setDirectionFormData({ ...directionFormData, labelAr: e.target.value })}
                  placeholder="شمال"
                />
              </div>
              <div>
                <Label>التسمية (إنجليزي)</Label>
                <Input
                  value={directionFormData.labelEn}
                  onChange={(e) => setDirectionFormData({ ...directionFormData, labelEn: e.target.value })}
                  placeholder="North"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDirectionDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleDirectionSubmit}>
                {editingDirection ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

