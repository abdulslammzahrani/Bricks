import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property, User } from "@shared/schema";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Building2,
  MapPin,
  Ruler,
  BedDouble,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  Eye,
  Calendar,
  User as UserIcon,
  Home,
  Map,
  CheckCircle2,
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
  X,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";

interface PropertyWithSeller extends Property {
  seller: {
    id: string;
    name: string;
    phone: string;
    accountType: string | null;
    entityName: string | null;
    isVerified: boolean | null;
    verificationStatus: string | null;
    falLicenseNumber: string | null;
    adLicenseNumber: string | null;
    licenseIssueDate: string | null;
    licenseExpiryDate: string | null;
    commercialRegNumber: string | null;
    city: string | null;
    whatsappNumber: string | null;
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-SA').format(price);
}

function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون`;
  }
  return `${(price / 1000).toFixed(0)} ألف`;
}

const amenityIcons: Record<string, { icon: any; label: string }> = {
  parking: { icon: Car, label: "موقف سيارة" },
  ac: { icon: Snowflake, label: "تكييف مركزي" },
  wifi: { icon: Wifi, label: "إنترنت" },
  security: { icon: Shield, label: "حراسة أمنية" },
  garden: { icon: Trees, label: "حديقة" },
  gym: { icon: Dumbbell, label: "صالة رياضية" },
  maid_room: { icon: Users, label: "غرفة خادمة" },
  electricity: { icon: Zap, label: "عداد كهرباء مستقل" },
  water: { icon: Droplets, label: "عداد ماء مستقل" },
};

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const { data: property, isLoading, error } = useQuery<PropertyWithSeller>({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Property not found");
      return response.json();
    },
  });

  const startConversationMutation = useMutation({
    mutationFn: async () => {
      const currentUserId = localStorage.getItem("currentUserId");
      if (!currentUserId) {
        throw new Error("يرجى تسجيل الدخول أولاً");
      }
      if (!property?.seller?.id) {
        throw new Error("لا يمكن التواصل مع البائع");
      }
      
      const response = await apiRequest("POST", "/api/conversations", {
        buyerId: currentUserId,
        sellerId: property.seller.id,
        propertyId: property.id,
      });
      return response.json();
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate(`/profile?tab=messages&conversation=${conv.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle Escape key to close gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showGallery) {
        setShowGallery(false);
      }
      if (showGallery) {
        if (e.key === "ArrowLeft") {
          setSelectedImageIndex((prev) => (prev + 1) % (property?.images?.length || 1));
        }
        if (e.key === "ArrowRight") {
          setSelectedImageIndex((prev) => (prev - 1 + (property?.images?.length || 1)) % (property?.images?.length || 1));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGallery, property?.images?.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-80 w-full rounded-lg mb-4" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
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
    );
  }

  const images = property.images || [];
  const mainImage = images[selectedImageIndex] || images[0];
  const amenities = property.amenities || [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-home">
              الرئيسية
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span>للبيع</span>
            <ChevronLeft className="h-4 w-4" />
            <span>{propertyTypeNames[property.propertyType] || property.propertyType}</span>
            <ChevronLeft className="h-4 w-4" />
            <span>{property.city}</span>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-foreground font-medium">{property.district}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="mb-6">
          {mainImage ? (
            <div className="grid md:grid-cols-4 gap-2">
              {/* Main Image */}
              <div 
                className="md:col-span-3 relative rounded-lg overflow-hidden bg-muted cursor-pointer group"
                onClick={() => setShowGallery(true)}
              >
                <img
                  src={mainImage}
                  alt={`${propertyTypeNames[property.propertyType]} في ${property.district}`}
                  className="w-full h-72 md:h-96 object-cover transition-transform group-hover:scale-[1.02]"
                  data-testid="img-property-main"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {images.length > 1 && (
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {images.length} صورة
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                    <Eye className="h-3 w-3 ml-1" />
                    {property.viewsCount || 0} مشاهدة
                  </Badge>
                </div>
              </div>

              {/* Thumbnail Grid */}
              {images.length > 1 && (
                <div className="hidden md:grid grid-rows-3 gap-2">
                  {images.slice(1, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden cursor-pointer group"
                      data-testid={`img-thumbnail-${idx}`}
                      onClick={() => {
                        setSelectedImageIndex(idx + 1);
                        setShowGallery(true);
                      }}
                    >
                      <img
                        src={img}
                        alt={`صورة ${idx + 2}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {idx === 2 && images.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-muted h-72 md:h-96 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Mobile Thumbnails */}
        {images.length > 1 && (
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`صورة ${idx + 1}`}
                className={`h-16 w-24 object-cover rounded-md flex-shrink-0 cursor-pointer transition-all ${
                  selectedImageIndex === idx ? "ring-2 ring-primary" : "opacity-70"
                }`}
                onClick={() => setSelectedImageIndex(idx)}
                data-testid={`img-mobile-thumbnail-${idx}`}
              />
            ))}
          </div>
        )}

        {/* Price and Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="text-property-price">
              {formatPrice(property.price)} <span className="text-lg font-normal">ر.س</span>
            </p>
            {property.area && (
              <p className="text-muted-foreground mt-1">
                {formatPrice(Math.round(property.price / property.area))} ر.س/م²
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" data-testid="button-share">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" data-testid="button-favorite">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-lg" data-testid="text-property-location">
            {property.district}، {property.city}
          </span>
        </div>

        {/* Quick Specs Row */}
        <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-property-title">
                {propertyTypeNames[property.propertyType]} للبيع في {property.district}
              </h1>
              <Badge className="bg-primary/10 text-primary border-0">
                {propertyTypeNames[property.propertyType] || property.propertyType}
              </Badge>
            </div>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-bold text-lg">وصف العقار</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-property-description">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Property Info Table */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="font-bold text-lg">معلومات العقار</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">نوع العقار</span>
                    <span className="font-medium">{propertyTypeNames[property.propertyType]}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">نوع العرض</span>
                    <span className="font-medium">للبيع</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">حالة البناء</span>
                    <span className="font-medium">{statusNames[property.status] || property.status}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">التأثيث</span>
                    <span className="font-medium">{furnishingNames[property.furnishing || "unfurnished"] || "غير مفروش"}</span>
                  </div>
                  {property.area && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">المساحة</span>
                      <span className="font-medium">{property.area} م²</span>
                    </div>
                  )}
                  {property.rooms && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">عدد الغرف</span>
                      <span className="font-medium">{property.rooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">دورات المياه</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">سنة البناء</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            {amenities.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-bold text-lg">المزايا والخدمات</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity, idx) => {
                      const amenityInfo = amenityIcons[amenity];
                      const Icon = amenityInfo?.icon || CheckCircle2;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid={`amenity-${amenity}`}>
                          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{amenityInfo?.label || amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Location */}
            {property.latitude && property.longitude && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    الموقع على الخريطة
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-lg bg-muted overflow-hidden relative">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.latitude},${property.longitude}&zoom=15`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 left-3"
                    >
                      <Button size="sm" variant="secondary" className="gap-2">
                        <MapPin className="h-4 w-4" />
                        فتح في الخرائط
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Seller Card */}
            {property.seller && (
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-lg">العقار معلن من قبل</h2>
                    {property.seller.isVerified && (
                      <Badge className="bg-green-600 text-white gap-1" data-testid="badge-verified">
                        <ShieldCheck className="h-3 w-3" />
                        موثوق
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center relative">
                      <UserIcon className="h-7 w-7 text-primary" />
                      {property.seller.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-0.5">
                          <BadgeCheck className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg" data-testid="text-seller-name">{property.seller.name}</p>
                      {property.seller.entityName && (
                        <p className="text-sm text-muted-foreground">{property.seller.entityName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {property.seller.accountType && (
                          <Badge variant="outline">
                            {property.seller.accountType === "individual" ? "فرد" : 
                             property.seller.accountType === "developer" ? "مطور عقاري" : "مكتب عقاري"}
                          </Badge>
                        )}
                        {property.seller.city && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.seller.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* License Info */}
                  {(property.seller.falLicenseNumber || property.seller.adLicenseNumber) && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          معلومات ترخيص الإعلان
                        </p>
                        {property.seller.falLicenseNumber && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">رقم رخصة فال</span>
                            <span className="font-medium" data-testid="text-fal-license">{property.seller.falLicenseNumber}</span>
                          </div>
                        )}
                        {property.seller.adLicenseNumber && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">رقم ترخيص الإعلان</span>
                            <span className="font-medium" data-testid="text-ad-license">{property.seller.adLicenseNumber}</span>
                          </div>
                        )}
                        {property.seller.licenseExpiryDate && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">صالح حتى</span>
                            <span className="font-medium">{property.seller.licenseExpiryDate}</span>
                          </div>
                        )}
                        {property.seller.commercialRegNumber && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">السجل التجاري</span>
                            <span className="font-medium">{property.seller.commercialRegNumber}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Unverified Notice */}
                  {!property.seller.isVerified && (
                    <>
                      <Separator />
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          لم يتم التحقق من هذا المعلن بعد
                        </p>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={() => startConversationMutation.mutate()}
                      disabled={startConversationMutation.isPending}
                      data-testid="button-start-conversation"
                    >
                      <MessageCircle className="h-5 w-5" />
                      {startConversationMutation.isPending ? "جارٍ الفتح..." : "راسل المعلن"}
                    </Button>
                    <Button variant="outline" className="w-full gap-2" size="lg" asChild>
                      <a href={`tel:${property.seller.phone}`} data-testid="button-call-seller">
                        <Phone className="h-5 w-5" />
                        اتصال: {property.seller.phone}
                      </a>
                    </Button>
                    {property.seller.whatsappNumber && (
                      <Button variant="outline" className="w-full gap-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" size="lg" asChild>
                        <a href={`https://wa.me/${property.seller.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" data-testid="button-whatsapp">
                          <MessageCircle className="h-5 w-5" />
                          واتساب
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-10 w-10 mx-auto text-primary mb-3" />
                  <p className="font-bold text-lg mb-2">تبحث عن عقار مشابه؟</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    سجّل رغبتك وسنرسل لك عقارات مطابقة أسبوعياً
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">سجّل رغبتك الآن</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGallery && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            data-testid="button-close-gallery"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
            className="absolute left-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="button-gallery-next"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <button
            onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute right-16 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="button-gallery-prev"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          <img
            src={images[selectedImageIndex]}
            alt={`صورة ${selectedImageIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
          />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
