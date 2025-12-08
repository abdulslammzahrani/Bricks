import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property, User } from "@shared/schema";
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
} from "lucide-react";

interface PropertyWithSeller extends Property {
  seller: {
    id: string;
    name: string;
    phone: string;
    accountType: string | null;
    entityName: string | null;
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
  ready: "جاهز للسكن",
  under_construction: "قيد الإنشاء",
};

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون ريال`;
  }
  return `${(price / 1000).toFixed(0)} ألف ريال`;
}

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: property, isLoading, error } = useQuery<PropertyWithSeller>({
    queryKey: ["/api/properties", id],
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full" />
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
  const mainImage = images[0];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-2" data-testid="button-back">
            <Link href="/">
              <ArrowRight className="h-4 w-4" />
              رجوع
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-share">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-favorite">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {mainImage ? (
          <div className="relative rounded-lg overflow-hidden mb-6 bg-muted">
            <img
              src={mainImage}
              alt={`${propertyTypeNames[property.propertyType]} في ${property.district}`}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Badge variant="secondary" className="bg-background/90">
                <Eye className="h-3 w-3 ml-1" />
                {property.viewsCount} مشاهدة
              </Badge>
              {images.length > 1 && (
                <Badge variant="secondary" className="bg-background/90">
                  {images.length} صور
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted h-64 md:h-96 flex items-center justify-center mb-6">
            <Building2 className="h-24 w-24 text-muted-foreground/50" />
          </div>
        )}

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {images.slice(1).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`صورة ${idx + 2}`}
                className="h-20 w-28 object-cover rounded-md flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Badge className="mb-2">{propertyTypeNames[property.propertyType] || property.propertyType}</Badge>
                  <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-property-title">
                    {propertyTypeNames[property.propertyType]} في {property.district}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-property-location">{property.district}، {property.city}</span>
              </div>

              <div className="text-3xl font-bold text-primary" data-testid="text-property-price">
                {formatPrice(property.price)}
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <h2 className="font-bold text-lg">تفاصيل العقار</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.area && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">المساحة</p>
                        <p className="font-medium">{property.area} م²</p>
                      </div>
                    </div>
                  )}
                  {property.rooms && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <BedDouble className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">الغرف</p>
                        <p className="font-medium">{property.rooms} غرف</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Home className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">النوع</p>
                      <p className="font-medium">{propertyTypeNames[property.propertyType]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">الحالة</p>
                      <p className="font-medium">{statusNames[property.status] || property.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {property.description && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-bold text-lg">الوصف</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-property-description">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {property.latitude && property.longitude && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    الموقع على الخريطة
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="h-48 rounded-lg bg-muted flex items-center justify-center">
                    <a
                      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <MapPin className="h-5 w-5" />
                      فتح في خرائط جوجل
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {property.seller && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-bold text-lg">معلومات المعلن</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold" data-testid="text-seller-name">{property.seller.name}</p>
                      {property.seller.entityName && (
                        <p className="text-sm text-muted-foreground">{property.seller.entityName}</p>
                      )}
                      {property.seller.accountType && (
                        <Badge variant="outline" className="mt-1">
                          {property.seller.accountType === "individual" ? "فرد" : 
                           property.seller.accountType === "developer" ? "مطور" : "مكتب عقاري"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => startConversationMutation.mutate()}
                      disabled={startConversationMutation.isPending}
                      data-testid="button-start-conversation"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {startConversationMutation.isPending ? "جارٍ الفتح..." : "تواصل مع المعلن"}
                    </Button>
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={`tel:${property.seller.phone}`} data-testid="button-call-seller">
                        <Phone className="h-4 w-4" />
                        اتصال مباشر
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="font-bold mb-1">هل تبحث عن عقار مشابه؟</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    سجّل رغبتك وسنجد لك العقار المناسب
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
    </div>
  );
}
