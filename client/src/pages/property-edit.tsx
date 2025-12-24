import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property } from "@shared/schema";
import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Ruler,
  BedDouble,
  Save,
  X,
  ChevronLeft,
  Bath,
  Car,
  Snowflake,
  Wifi,
  Shield,
  Trees,
  Dumbbell,
  Users,
  Zap,
  Droplets,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Settings2,
} from "lucide-react";
import MemberLayout from "@/components/MemberLayout";
import { FileUploadButton } from "@/components/FileUploadButton";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: LatLng | null; 
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

interface PropertyWithSeller extends Property {
  seller: {
    id: string;
    name: string;
  } | null;
}

const propertyTypeNames: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  land: "أرض",
  building: "عمارة",
  duplex: "دوبلكس",
  floor: "دور",
  commercial: "تجاري",
  townhouse: "تاون هاوس",
  residential_building: "عمارة سكنية",
  residential_land: "أرض سكنية",
  rest_house: "استراحة",
  chalet: "شاليه",
  room: "غرفة",
  commercial_building: "عمارة تجارية",
  tower: "برج",
  complex: "مجمع",
  commercial_land: "أرض تجارية",
  industrial_land: "أرض صناعية",
  farm: "مزرعة",
  warehouse: "مستودع",
  factory: "مصنع",
  school: "مدرسة",
  health_center: "مركز صحي",
  gas_station: "محطة",
  showroom: "معرض",
  office: "مكتب",
};

const statusNames: Record<string, string> = {
  ready: "جاهز",
  under_construction: "قيد الإنشاء",
};

const furnishingNames: Record<string, string> = {
  furnished: "مفروش",
  semi_furnished: "شبه مفروش",
  unfurnished: "غير مفروش",
};

const amenityOptions = [
  { id: "parking", label: "موقف سيارة", icon: Car },
  { id: "ac", label: "تكييف مركزي", icon: Snowflake },
  { id: "wifi", label: "إنترنت", icon: Wifi },
  { id: "security", label: "حراسة أمنية", icon: Shield },
  { id: "garden", label: "حديقة", icon: Trees },
  { id: "gym", label: "صالة رياضية", icon: Dumbbell },
  { id: "maid_room", label: "غرفة خادمة", icon: Users },
  { id: "electricity", label: "عداد كهرباء مستقل", icon: Zap },
  { id: "water", label: "عداد ماء مستقل", icon: Droplets },
];

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("currentUserId");

  const { data: property, isLoading, error } = useQuery<PropertyWithSeller>({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Property not found");
      return response.json();
    },
  });

  const [formData, setFormData] = useState({
    // Basic info
    images: [] as string[],
    description: "",
    amenities: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
    yearBuilt: "",
    furnishing: "unfurnished",
    rooms: "",
    bathrooms: "",
    area: "",
    propertyType: "",
    // From SellerPropertyForm
    propertyCategory: "residential" as "residential" | "commercial" | "",
    offerType: "sale" as "sale" | "rent" | "",
    propertyCondition: "new" as "new" | "used" | "under_construction" | "",
    livingRooms: "",
    hasMaidRoom: false,
    facade: "",
    streetWidth: "",
    plotLocation: "",
    annualIncome: "",
    roi: "",
    unitsCount: "",
    propertyAge: "",
    floorsCount: "",
    elevatorsCount: "",
    bua: "",
    buildingClass: "",
    parkingCapacity: "",
    facadeWidth: "",
    ceilingHeight: "",
    hasMezzanine: false,
    groundArea: "",
    mezzanineArea: "",
    powerCapacity: "",
    floorNumber: "",
    nla: "",
    finishingStatus: "",
    acType: "",
    studentCapacity: "",
    classroomsCount: "",
    labsCount: "",
    municipalityClass: "",
    hasCivilDefense: "",
    floorLoad: "",
    pumpsCount: "",
    tanksCapacity: "",
    stationCategory: "",
    shopsCount: "",
    apartmentsCount: "",
    buildingsCount: "",
    occupancyRate: "",
    zoning: "",
    activityType: "",
    buildingRatio: "",
    wellsCount: "",
    waterType: "",
    treesCount: "",
    farmFacade: "",
    productionArea: "",
    licenseType: "",
    craneLoad: "",
    clinicsCount: "",
    waitingArea: "",
    healthLicense: "",
    paymentPreference: "" as "cash" | "finance" | "",
    bankName: "",
  });

  // Load property data into form
  useEffect(() => {
    if (property) {
      // Check ownership
      if (property.sellerId !== currentUserId) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية لتعديل هذا العقار",
          variant: "destructive",
        });
        navigate(`/property/${id}`);
        return;
      }

      // Try to parse additional data from description if it's JSON
      let additionalData: any = {};
      let descriptionText = property.description || "";
      
      try {
        // Check if description contains JSON metadata
        const jsonMatch = descriptionText.match(/<metadata>(.*?)<\/metadata>/s);
        if (jsonMatch) {
          additionalData = JSON.parse(jsonMatch[1]);
          descriptionText = descriptionText.replace(/<metadata>.*?<\/metadata>/s, "").trim();
        }
      } catch (e) {
        // If parsing fails, use description as is
      }

      // Determine property category from propertyType
      const isCommercial = property.propertyType?.includes("commercial") || 
                           property.propertyType === "tower" || 
                           property.propertyType === "complex" ||
                           property.propertyType === "warehouse" ||
                           property.propertyType === "factory" ||
                           property.propertyType === "school" ||
                           property.propertyType === "health_center" ||
                           property.propertyType === "gas_station" ||
                           property.propertyType === "showroom" ||
                           property.propertyType === "office" ||
                           property.propertyType === "industrial_land" ||
                           property.propertyType === "farm";

      setFormData({
        images: Array.isArray(property.images) ? property.images : [],
        description: descriptionText,
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        latitude: property.latitude ? Number(property.latitude) : null,
        longitude: property.longitude ? Number(property.longitude) : null,
        yearBuilt: property.yearBuilt || "",
        furnishing: property.furnishing || "unfurnished",
        rooms: property.rooms || "",
        bathrooms: property.bathrooms || "",
        area: property.area || "",
        propertyType: property.propertyType || "",
        // Additional fields from SellerPropertyForm
        propertyCategory: additionalData.propertyCategory || (isCommercial ? "commercial" : "residential"),
        offerType: additionalData.offerType || "sale",
        propertyCondition: additionalData.propertyCondition || (property.status === "ready" ? "new" : property.status === "under_construction" ? "under_construction" : "used"),
        livingRooms: additionalData.livingRooms || "",
        hasMaidRoom: additionalData.hasMaidRoom || false,
        facade: additionalData.facade || "",
        streetWidth: additionalData.streetWidth || "",
        plotLocation: additionalData.plotLocation || "",
        annualIncome: additionalData.annualIncome || "",
        roi: additionalData.roi || "",
        unitsCount: additionalData.unitsCount || "",
        propertyAge: additionalData.propertyAge || "",
        floorsCount: additionalData.floorsCount || "",
        elevatorsCount: additionalData.elevatorsCount || "",
        bua: additionalData.bua || "",
        buildingClass: additionalData.buildingClass || "",
        parkingCapacity: additionalData.parkingCapacity || "",
        facadeWidth: additionalData.facadeWidth || "",
        ceilingHeight: additionalData.ceilingHeight || "",
        hasMezzanine: additionalData.hasMezzanine || false,
        groundArea: additionalData.groundArea || "",
        mezzanineArea: additionalData.mezzanineArea || "",
        powerCapacity: additionalData.powerCapacity || "",
        floorNumber: additionalData.floorNumber || "",
        nla: additionalData.nla || "",
        finishingStatus: additionalData.finishingStatus || "",
        acType: additionalData.acType || "",
        studentCapacity: additionalData.studentCapacity || "",
        classroomsCount: additionalData.classroomsCount || "",
        labsCount: additionalData.labsCount || "",
        municipalityClass: additionalData.municipalityClass || "",
        hasCivilDefense: additionalData.hasCivilDefense || "",
        floorLoad: additionalData.floorLoad || "",
        pumpsCount: additionalData.pumpsCount || "",
        tanksCapacity: additionalData.tanksCapacity || "",
        stationCategory: additionalData.stationCategory || "",
        shopsCount: additionalData.shopsCount || "",
        apartmentsCount: additionalData.apartmentsCount || "",
        buildingsCount: additionalData.buildingsCount || "",
        occupancyRate: additionalData.occupancyRate || "",
        zoning: additionalData.zoning || "",
        activityType: additionalData.activityType || "",
        buildingRatio: additionalData.buildingRatio || "",
        wellsCount: additionalData.wellsCount || "",
        waterType: additionalData.waterType || "",
        treesCount: additionalData.treesCount || "",
        farmFacade: additionalData.farmFacade || "",
        productionArea: additionalData.productionArea || "",
        licenseType: additionalData.licenseType || "",
        craneLoad: additionalData.craneLoad || "",
        clinicsCount: additionalData.clinicsCount || "",
        waitingArea: additionalData.waitingArea || "",
        healthLicense: additionalData.healthLicense || "",
        paymentPreference: additionalData.paymentPreference || "",
        bankName: additionalData.bankName || "",
      });
    }
  }, [property, currentUserId, id, navigate, toast]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: Partial<Property>) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات العقار بنجاح",
      });
      navigate(`/property/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث العقار",
        variant: "destructive",
      });
    },
  });

  const handleFilesUploaded = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setFormData(prev => {
      const newImages = [...prev.images];
      if (direction === "up" && index > 0) {
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === "down" && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      }
      return { ...prev, images: newImages };
    });
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare additional metadata
    const additionalMetadata = {
      propertyCategory: formData.propertyCategory,
      offerType: formData.offerType,
      propertyCondition: formData.propertyCondition,
      livingRooms: formData.livingRooms,
      hasMaidRoom: formData.hasMaidRoom,
      facade: formData.facade,
      streetWidth: formData.streetWidth,
      plotLocation: formData.plotLocation,
      annualIncome: formData.annualIncome,
      roi: formData.roi,
      unitsCount: formData.unitsCount,
      propertyAge: formData.propertyAge,
      floorsCount: formData.floorsCount,
      elevatorsCount: formData.elevatorsCount,
      bua: formData.bua,
      buildingClass: formData.buildingClass,
      parkingCapacity: formData.parkingCapacity,
      facadeWidth: formData.facadeWidth,
      ceilingHeight: formData.ceilingHeight,
      hasMezzanine: formData.hasMezzanine,
      groundArea: formData.groundArea,
      mezzanineArea: formData.mezzanineArea,
      powerCapacity: formData.powerCapacity,
      floorNumber: formData.floorNumber,
      nla: formData.nla,
      finishingStatus: formData.finishingStatus,
      acType: formData.acType,
      studentCapacity: formData.studentCapacity,
      classroomsCount: formData.classroomsCount,
      labsCount: formData.labsCount,
      municipalityClass: formData.municipalityClass,
      hasCivilDefense: formData.hasCivilDefense,
      floorLoad: formData.floorLoad,
      pumpsCount: formData.pumpsCount,
      tanksCapacity: formData.tanksCapacity,
      stationCategory: formData.stationCategory,
      shopsCount: formData.shopsCount,
      apartmentsCount: formData.apartmentsCount,
      buildingsCount: formData.buildingsCount,
      occupancyRate: formData.occupancyRate,
      zoning: formData.zoning,
      activityType: formData.activityType,
      buildingRatio: formData.buildingRatio,
      wellsCount: formData.wellsCount,
      waterType: formData.waterType,
      treesCount: formData.treesCount,
      farmFacade: formData.farmFacade,
      productionArea: formData.productionArea,
      licenseType: formData.licenseType,
      craneLoad: formData.craneLoad,
      clinicsCount: formData.clinicsCount,
      waitingArea: formData.waitingArea,
      healthLicense: formData.healthLicense,
      paymentPreference: formData.paymentPreference,
      bankName: formData.bankName,
    };

    // Combine description with metadata
    const descriptionWithMetadata = formData.description 
      ? `${formData.description}\n\n<metadata>${JSON.stringify(additionalMetadata)}</metadata>`
      : `<metadata>${JSON.stringify(additionalMetadata)}</metadata>`;

    // Determine which fields affect matching
    const matchingFields = ["city", "district", "price", "propertyType", "rooms", "area", "status", "amenities"];
    const updatedFields = Object.keys(formData);
    // Check if any matching fields were changed from original property
    const affectsMatching = updatedFields.some(field => {
      if (!matchingFields.includes(field)) return false;
      const originalValue = (property as any)?.[field];
      const newValue = (formData as any)[field];
      // For arrays, compare deeply
      if (Array.isArray(originalValue) && Array.isArray(newValue)) {
        return JSON.stringify(originalValue.sort()) !== JSON.stringify(newValue.sort());
      }
      return originalValue !== newValue;
    });

    // Prepare update data
    const updateData = {
      images: formData.images,
      description: descriptionWithMetadata,
      amenities: formData.amenities,
      latitude: formData.latitude,
      longitude: formData.longitude,
      yearBuilt: formData.yearBuilt || null,
      furnishing: formData.furnishing,
      rooms: formData.rooms || null,
      bathrooms: formData.bathrooms || null,
      area: formData.area || null,
      status: formData.propertyCondition === "new" ? "ready" : formData.propertyCondition === "under_construction" ? "under_construction" : "ready",
      _recalculateMatches: affectsMatching, // Flag to trigger match recalculation
    };

    updatePropertyMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-background" dir="rtl">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-80 w-full rounded-lg mb-4" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error || !property) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <Card className="max-w-md text-center p-8">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-2">العقار غير موجود</h1>
            <p className="text-muted-foreground mb-4">عذراً، لم نتمكن من إيجاد العقار المطلوب</p>
            <Button asChild>
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/property/${id}`}>
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">تعديل العقار</h1>
                  <p className="text-sm text-muted-foreground">
                    {propertyTypeNames[property.propertyType]} في {property.district}، {property.city}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  صور العقار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          {idx > 0 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              onClick={() => moveImage(idx, "up")}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                          )}
                          {idx < formData.images.length - 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              onClick={() => moveImage(idx, "down")}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeImage(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {idx === 0 && (
                          <Badge className="absolute top-2 right-2">صورة رئيسية</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <FileUploadButton
                  maxFiles={20}
                  onFilesUploaded={handleFilesUploaded}
                  buttonVariant="outline"
                  buttonSize="default"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  {formData.images.length > 0 ? "إضافة المزيد من الصور" : "رفع صور العقار"}
                </FileUploadButton>
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  الموقع على الخريطة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-80 rounded-lg overflow-hidden border">
                  <MapContainer
                    center={formData.latitude && formData.longitude 
                      ? [formData.latitude, formData.longitude] 
                      : [24.7136, 46.6753]}
                    zoom={formData.latitude && formData.longitude ? 15 : 12}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={formData.latitude && formData.longitude 
                        ? new LatLng(formData.latitude, formData.longitude) 
                        : null}
                      setPosition={(pos) => handleLocationChange(pos.lat, pos.lng)}
                    />
                  </MapContainer>
                </div>
                {formData.latitude && formData.longitude ? (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">
                      الموقع: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
                      }}
                    >
                      <X className="h-4 w-4 ml-2" />
                      إزالة الموقع
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    انقر على الخريطة لتحديد موقع العقار
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Amenities Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  المزايا والخدمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenityOptions.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = formData.amenities.includes(amenity.id);
                    return (
                      <div
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`
                          flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"}
                        `}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                          {amenity.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تصنيف العقار</Label>
                    <Select
                      value={formData.propertyCategory}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, propertyCategory: value as "residential" | "commercial" | "", propertyType: "" }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">سكني</SelectItem>
                        <SelectItem value="commercial">تجاري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العقار</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                      disabled={!formData.propertyCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العقار" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.propertyCategory === "residential" ? (
                          <>
                            <SelectItem value="apartment">شقة</SelectItem>
                            <SelectItem value="villa">فيلا</SelectItem>
                            <SelectItem value="floor">دور</SelectItem>
                            <SelectItem value="townhouse">تاون هاوس</SelectItem>
                            <SelectItem value="residential_building">عمارة سكنية</SelectItem>
                            <SelectItem value="residential_land">أرض سكنية</SelectItem>
                            <SelectItem value="rest_house">استراحة</SelectItem>
                            <SelectItem value="chalet">شاليه</SelectItem>
                            <SelectItem value="room">غرفة</SelectItem>
                          </>
                        ) : formData.propertyCategory === "commercial" ? (
                          <>
                            <SelectItem value="commercial_building">عمارة تجارية</SelectItem>
                            <SelectItem value="tower">برج</SelectItem>
                            <SelectItem value="complex">مجمع</SelectItem>
                            <SelectItem value="commercial_land">أرض تجارية</SelectItem>
                            <SelectItem value="industrial_land">أرض صناعية</SelectItem>
                            <SelectItem value="farm">مزرعة</SelectItem>
                            <SelectItem value="warehouse">مستودع</SelectItem>
                            <SelectItem value="factory">مصنع</SelectItem>
                            <SelectItem value="school">مدرسة</SelectItem>
                            <SelectItem value="health_center">مركز صحي</SelectItem>
                            <SelectItem value="gas_station">محطة</SelectItem>
                            <SelectItem value="showroom">معرض</SelectItem>
                            <SelectItem value="office">مكتب</SelectItem>
                          </>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العرض</Label>
                    <Select
                      value={formData.offerType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, offerType: value as "sale" | "rent" | "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">للبيع</SelectItem>
                        <SelectItem value="rent">للإيجار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>حالة العقار</Label>
                    <Select
                      value={formData.propertyCondition}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, propertyCondition: value as "new" | "used" | "under_construction" | "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="used">مستخدم</SelectItem>
                        <SelectItem value="under_construction">قيد الإنشاء</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>سنة البناء</Label>
                    <Input
                      type="text"
                      value={formData.yearBuilt}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearBuilt: e.target.value }))}
                      placeholder="مثال: 2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>التأثيث</Label>
                    <Select
                      value={formData.furnishing}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, furnishing: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfurnished">غير مفروش</SelectItem>
                        <SelectItem value="semi_furnished">شبه مفروش</SelectItem>
                        <SelectItem value="furnished">مفروش</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      عدد الغرف
                    </Label>
                    <Input
                      type="text"
                      value={formData.rooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: e.target.value }))}
                      placeholder="مثال: 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      دورات المياه
                    </Label>
                    <Input
                      type="text"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                      placeholder="مثال: 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      المساحة (م²)
                    </Label>
                    <Input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="مثال: 150"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>صالات الجلوس</Label>
                    <Input
                      type="text"
                      value={formData.livingRooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, livingRooms: e.target.value }))}
                      placeholder="مثال: 2"
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <Checkbox
                      checked={formData.hasMaidRoom}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasMaidRoom: checked === true }))}
                    />
                    <Label>يوجد غرفة خادمة</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  الوصف التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="اكتب وصفاً تفصيلياً للعقار... يمكنك ذكر الموقع، المواصفات، المزايا، وأي معلومات إضافية مهمة"
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  نصيحة: اكتب وصفاً واضحاً ومفصلاً يجذب المشترين. يمكنك ذكر الموقع، المواصفات، المزايا، وأي معلومات إضافية مهمة.
                </p>
              </CardContent>
            </Card>

            {/* Additional Property Details Section - Based on Property Type */}
            {(formData.propertyType === "tower" || formData.propertyType === "complex" || formData.propertyType === "commercial_building" || formData.propertyType === "showroom" || formData.propertyType === "office" || formData.propertyType === "school" || formData.propertyType === "warehouse" || formData.propertyType === "gas_station" || formData.propertyType === "residential_land" || formData.propertyType === "commercial_land" || formData.propertyType === "industrial_land" || formData.propertyType === "farm") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    تفاصيل إضافية حسب نوع العقار
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tower specific fields */}
                    {formData.propertyType === "tower" && (
                      <>
                        <div className="space-y-2">
                          <Label>عدد الأدوار</Label>
                          <Input
                            value={formData.floorsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, floorsCount: e.target.value }))}
                            placeholder="مثال: 20-30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد المصاعد</Label>
                          <Input
                            value={formData.elevatorsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, elevatorsCount: e.target.value }))}
                            placeholder="مثال: 4"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد الوحدات/المكاتب</Label>
                          <Input
                            value={formData.unitsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, unitsCount: e.target.value }))}
                            placeholder="مثال: 50-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>التصنيف (Class)</Label>
                          <Select
                            value={formData.buildingClass}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, buildingClass: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Showroom specific fields */}
                    {formData.propertyType === "showroom" && (
                      <>
                        <div className="space-y-2">
                          <Label>عرض الواجهة</Label>
                          <Input
                            value={formData.facadeWidth}
                            onChange={(e) => setFormData(prev => ({ ...prev, facadeWidth: e.target.value }))}
                            placeholder="مثال: 15-20m"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ارتفاع السقف</Label>
                          <Input
                            value={formData.ceilingHeight}
                            onChange={(e) => setFormData(prev => ({ ...prev, ceilingHeight: e.target.value }))}
                            placeholder="مثال: 4-6m"
                          />
                        </div>
                        <div className="space-y-2 flex items-center gap-2">
                          <Checkbox
                            checked={formData.hasMezzanine}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasMezzanine: checked === true }))}
                          />
                          <Label>يوجد ميزانين</Label>
                        </div>
                        <div className="space-y-2">
                          <Label>الحمل الكهربائي</Label>
                          <Input
                            value={formData.powerCapacity}
                            onChange={(e) => setFormData(prev => ({ ...prev, powerCapacity: e.target.value }))}
                            placeholder="مثال: 200 KVA"
                          />
                        </div>
                      </>
                    )}

                    {/* Office specific fields */}
                    {formData.propertyType === "office" && (
                      <>
                        <div className="space-y-2">
                          <Label>رقم الطابق</Label>
                          <Input
                            value={formData.floorNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: e.target.value }))}
                            placeholder="مثال: 1-5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>التشطيب</Label>
                          <Select
                            value={formData.finishingStatus}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, finishingStatus: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التشطيب" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="عظم">عظم</SelectItem>
                              <SelectItem value="نصف تشطيب">نصف تشطيب</SelectItem>
                              <SelectItem value="مؤثث بالكامل">مؤثث بالكامل</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>نوع التكييف</Label>
                          <Select
                            value={formData.acType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, acType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع التكييف" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="مركزي">مركزي</SelectItem>
                              <SelectItem value="سبليت">سبليت</SelectItem>
                              <SelectItem value="مخفي">مخفي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>المساحة الصافية (NLA)</Label>
                          <Input
                            value={formData.nla}
                            onChange={(e) => setFormData(prev => ({ ...prev, nla: e.target.value }))}
                            placeholder="مثال: 200"
                          />
                        </div>
                      </>
                    )}

                    {/* School specific fields */}
                    {formData.propertyType === "school" && (
                      <>
                        <div className="space-y-2">
                          <Label>الطاقة الاستيعابية (طلاب)</Label>
                          <Input
                            value={formData.studentCapacity}
                            onChange={(e) => setFormData(prev => ({ ...prev, studentCapacity: e.target.value }))}
                            placeholder="مثال: 100-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد الفصول</Label>
                          <Input
                            value={formData.classroomsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, classroomsCount: e.target.value }))}
                            placeholder="مثال: 10-20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد المعامل</Label>
                          <Input
                            value={formData.labsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, labsCount: e.target.value }))}
                            placeholder="مثال: 5"
                          />
                        </div>
                      </>
                    )}

                    {/* Commercial Building specific fields */}
                    {formData.propertyType === "commercial_building" && (
                      <>
                        <div className="space-y-2">
                          <Label>الدخل السنوي</Label>
                          <Input
                            value={formData.annualIncome}
                            onChange={(e) => setFormData(prev => ({ ...prev, annualIncome: e.target.value }))}
                            placeholder="مثال: 500k-1M"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد المعارض</Label>
                          <Input
                            value={formData.shopsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, shopsCount: e.target.value }))}
                            placeholder="مثال: 1-5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد الشقق/المكاتب</Label>
                          <Input
                            value={formData.apartmentsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, apartmentsCount: e.target.value }))}
                            placeholder="مثال: 6-10"
                          />
                        </div>
                      </>
                    )}

                    {/* Gas Station specific fields */}
                    {formData.propertyType === "gas_station" && (
                      <>
                        <div className="space-y-2">
                          <Label>الفئة</Label>
                          <Select
                            value={formData.stationCategory}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, stationCategory: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="أ">أ</SelectItem>
                              <SelectItem value="ب">ب</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>عدد المضخات</Label>
                          <Input
                            value={formData.pumpsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, pumpsCount: e.target.value }))}
                            placeholder="مثال: 4"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>سعة الخزانات</Label>
                          <Input
                            value={formData.tanksCapacity}
                            onChange={(e) => setFormData(prev => ({ ...prev, tanksCapacity: e.target.value }))}
                            placeholder="مثال: 50k"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الدخل اليومي</Label>
                          <Input
                            value={formData.annualIncome}
                            onChange={(e) => setFormData(prev => ({ ...prev, annualIncome: e.target.value }))}
                            placeholder="مثال: < 100k"
                          />
                        </div>
                      </>
                    )}

                    {/* Land specific fields */}
                    {(formData.propertyType === "residential_land" || formData.propertyType === "commercial_land" || formData.propertyType === "industrial_land") && (
                      <>
                        <div className="space-y-2">
                          <Label>الواجهة</Label>
                          <Select
                            value={formData.facade}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, facade: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الواجهة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="شمالية">شمالية</SelectItem>
                              <SelectItem value="جنوبية">جنوبية</SelectItem>
                              <SelectItem value="شرقية">شرقية</SelectItem>
                              <SelectItem value="غربية">غربية</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>عدد الشوارع</Label>
                          <Input
                            value={formData.streetWidth}
                            onChange={(e) => setFormData(prev => ({ ...prev, streetWidth: e.target.value }))}
                            placeholder="مثال: 2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>موقع القطعة</Label>
                          <Input
                            value={formData.plotLocation}
                            onChange={(e) => setFormData(prev => ({ ...prev, plotLocation: e.target.value }))}
                            placeholder="مثال: زاوية، وسط"
                          />
                        </div>
                      </>
                    )}

                    {/* Farm specific fields */}
                    {formData.propertyType === "farm" && (
                      <>
                        <div className="space-y-2">
                          <Label>عدد الآبار</Label>
                          <Input
                            value={formData.wellsCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, wellsCount: e.target.value }))}
                            placeholder="مثال: 2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>نوع الماء</Label>
                          <Input
                            value={formData.waterType}
                            onChange={(e) => setFormData(prev => ({ ...prev, waterType: e.target.value }))}
                            placeholder="مثال: عذب، مالح"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد الأشجار</Label>
                          <Input
                            value={formData.treesCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, treesCount: e.target.value }))}
                            placeholder="مثال: 100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>واجهة المزرعة</Label>
                          <Input
                            value={formData.farmFacade}
                            onChange={(e) => setFormData(prev => ({ ...prev, farmFacade: e.target.value }))}
                            placeholder="مثال: 50m"
                          />
                        </div>
                      </>
                    )}

                    {/* Warehouse specific fields */}
                    {formData.propertyType === "warehouse" && (
                      <>
                        <div className="space-y-2">
                          <Label>ارتفاع السقف</Label>
                          <Input
                            value={formData.ceilingHeight}
                            onChange={(e) => setFormData(prev => ({ ...prev, ceilingHeight: e.target.value }))}
                            placeholder="مثال: 4-6m"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الكهرباء</Label>
                          <Select
                            value={formData.powerCapacity}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, powerCapacity: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الكهرباء" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="عادي">عادي</SelectItem>
                              <SelectItem value="3 Phase">3 Phase</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>الدفاع المدني</Label>
                          <Select
                            value={formData.hasCivilDefense}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, hasCivilDefense: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مستوى الخطورة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="خطورة عالية">خطورة عالية</SelectItem>
                              <SelectItem value="متوسطة">متوسطة</SelectItem>
                              <SelectItem value="منخفضة">منخفضة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Payment Information */}
                    <div className="space-y-2">
                      <Label>خيارات الدفع المقبولة</Label>
                      <Select
                        value={formData.paymentPreference}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, paymentPreference: value as "cash" | "finance" | "" }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر خيار الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">كاش فقط</SelectItem>
                          <SelectItem value="finance">أقبل التمويل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.paymentPreference === "finance" && (
                      <div className="space-y-2">
                        <Label>اسم البنك</Label>
                        <Input
                          value={formData.bankName}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="مثال: الراجحي"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/property/${id}`)}
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={updatePropertyMutation.isPending}
              >
                <Save className="h-4 w-4 ml-2" />
                {updatePropertyMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MemberLayout>
  );
}

