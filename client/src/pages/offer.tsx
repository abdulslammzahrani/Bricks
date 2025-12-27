import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PropertyHero from "@/components/landing/PropertyHero";
import ContentLocker from "@/components/landing/ContentLocker";
import LeadCaptureForm from "@/components/landing/LeadCaptureForm";
import ViewingBookingModal from "@/components/landing/ViewingBookingModal";
import PreferencesDrawer from "@/components/landing/PreferencesDrawer";
import SimilarPropertiesBanner from "@/components/landing/SimilarPropertiesBanner";
import { MapPin, Calendar, Sparkles, Building2, Image as ImageIcon } from "lucide-react";
import MemberLayout from "@/components/MemberLayout";
import FormRenderer from "@/components/admin/FormBuilder/FormComponentRenderer";
import type { Property, LandingPage } from "@shared/schema";

interface LandingPageData {
  property: Property;
  landingPage: LandingPage;
  seller?: {
    id: string;
    name: string;
    phone: string;
  };
}

export default function OfferPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get marketer ref from URL
  const searchParams = new URLSearchParams(window.location.search);
  const marketerRef = searchParams.get("ref") || undefined;

  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [visitorData, setVisitorData] = useState<{
    name: string;
    phone: string;
    email?: string;
  } | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPreferencesDrawer, setShowPreferencesDrawer] = useState(false);
  const [matchingProperties, setMatchingProperties] = useState<any[]>([]);

  // Fetch landing page data
  const { data, isLoading, error } = useQuery<LandingPageData>({
    queryKey: ["/api/landing-pages", slug],
    queryFn: async () => {
      const url = `/api/landing-pages/${slug}${marketerRef ? `?ref=${marketerRef}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Landing page not found");
      return response.json();
    },
    enabled: !!slug,
  });

  // Check if content should be locked
  const lockedContent = data?.landingPage.lockedContent as Record<string, boolean> || {
    map: true,
    floorPlan: true,
    sellerContact: true,
    extraImages: true,
  };

  const isMapLocked = lockedContent.map !== false && !unlockToken;
  const isSellerContactLocked = lockedContent.sellerContact !== false && !unlockToken;
  const showExtraImages = !lockedContent.extraImages || unlockToken !== null;

  // Verify unlock token
  useEffect(() => {
    if (unlockToken && slug) {
      fetch(`/api/landing-pages/${slug}/unlock?token=${unlockToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.valid) {
            setUnlockToken(null);
          }
        })
        .catch(() => {
          setUnlockToken(null);
        });
    }
  }, [unlockToken, slug]);

  const handleLeadSuccess = (data: {
    name: string;
    phone: string;
    email?: string;
    unlockToken: string;
  }) => {
    setUnlockToken(data.unlockToken);
    setVisitorData({
      name: data.name,
      phone: data.phone,
      email: data.email,
    });
  };

  const handleBookingSuccess = () => {
    // Show preferences drawer after booking
    setTimeout(() => {
      setShowPreferencesDrawer(true);
    }, 1000);
  };

  const handlePreferencesSuccess = (properties: any[]) => {
    setMatchingProperties(properties);
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-background" dir="rtl">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-96 w-full rounded-lg mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error || !data) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <Card className="max-w-md text-center p-8">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-2">صفحة الهبوط غير موجودة</h1>
            <p className="text-muted-foreground mb-4">عذراً، لم نتمكن من إيجاد الصفحة المطلوبة</p>
            <Button onClick={() => setLocation("/")}>العودة للرئيسية</Button>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  const { property, landingPage, seller } = data;
  const images = property.images || [];
  const visibleImages = showExtraImages ? images : images.slice(0, 3);

  return (
    <MemberLayout>
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Lead Capture Form or Form Builder Form - Show if not registered */}
          {!unlockToken && (
            <div className="mb-8">
              {landingPage.formName ? (
                <FormRenderer
                  formName={landingPage.formName}
                  theme="default"
                  layout="default"
                  onSubmit={async (formData) => {
                    // Handle form submission
                    try {
                      const response = await fetch(`/api/form-builder/submit/${landingPage.formName}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                      });
                      
                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || "فشل في الإرسال");
                      }
                      
                      const result = await response.json();
                      
                      // Generate unlock token (similar to LeadCaptureForm)
                      if (result.success && result.data) {
                        // Try to get unlock token from the response or generate one
                        const unlockResponse = await fetch(`/api/landing-pages/${slug}/unlock`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: formData.name,
                            phone: formData.phone,
                            email: formData.email,
                          }),
                        });
                        
                        if (unlockResponse.ok) {
                          const unlockData = await unlockResponse.json();
                          handleLeadSuccess({
                            name: formData.name,
                            phone: formData.phone,
                            email: formData.email,
                            unlockToken: unlockData.token,
                          });
                        } else {
                          // Fallback: use form data directly
                          handleLeadSuccess({
                            name: formData.name,
                            phone: formData.phone,
                            email: formData.email,
                            unlockToken: `temp_${Date.now()}`,
                          });
                        }
                      }
                    } catch (error: any) {
                      toast({
                        title: "خطأ",
                        description: error.message || "حدث خطأ أثناء الإرسال",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ) : (
                <LeadCaptureForm
                  onSuccess={handleLeadSuccess}
                  slug={slug!}
                  marketerRef={marketerRef}
                />
              )}
            </div>
          )}

          {/* Property Hero */}
          <PropertyHero property={property} />

          {/* Additional Images */}
          {images.length > 1 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">صور العقار</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {visibleImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`صورة ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
              {!showExtraImages && images.length > 3 && (
                <ContentLocker
                  type="extraImages"
                  isLocked={true}
                  onUnlock={() => {
                    if (!unlockToken) {
                      toast({
                        title: "يرجى التسجيل أولاً",
                        description: "أدخل بياناتك لعرض جميع الصور",
                      });
                    }
                  }}
                >
                  <div className="mt-4 text-center">
                    <p className="text-muted-foreground">
                      +{images.length - 3} صورة إضافية
                    </p>
                  </div>
                </ContentLocker>
              )}
            </div>
          )}

          {/* Property Description */}
          {property.description && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>وصف العقار</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Map Location - Locked */}
          {property.latitude && property.longitude && (
            <div className="mt-6">
              <ContentLocker
                type="map"
                isLocked={isMapLocked}
                onUnlock={() => {
                  if (!unlockToken) {
                    toast({
                      title: "يرجى التسجيل أولاً",
                      description: "أدخل بياناتك لعرض الموقع",
                    });
                  }
                }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      الموقع الجغرافي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 rounded-lg bg-muted overflow-hidden relative border">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.latitude},${property.longitude}&zoom=15`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      {property.district}، {property.city}
                    </p>
                  </CardContent>
                </Card>
              </ContentLocker>
            </div>
          )}

          {/* Seller Contact - Locked */}
          {seller && (
            <div className="mt-6">
              <ContentLocker
                type="sellerContact"
                isLocked={isSellerContactLocked}
                onUnlock={() => {
                  if (!unlockToken) {
                    toast({
                      title: "يرجى التسجيل أولاً",
                      description: "أدخل بياناتك لعرض معلومات التواصل",
                    });
                  }
                }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات التواصل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">اسم المعلن</p>
                        <p className="font-bold text-lg">{seller.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">رقم الجوال</p>
                        <a
                          href={`tel:${seller.phone}`}
                          className="font-bold text-lg text-primary hover:underline"
                        >
                          {seller.phone}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ContentLocker>
            </div>
          )}

          {/* Booking CTA */}
          {unlockToken && visitorData && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Calendar className="h-10 w-10 mx-auto text-primary" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">معاينة العقار</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      احجز موعدك الآن لمعاينة هذا العقار
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowBookingModal(true)}
                    size="lg"
                    className="gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    حجز معاينة
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Similar Properties */}
          {matchingProperties.length > 0 && (
            <SimilarPropertiesBanner properties={matchingProperties} />
          )}

          {/* Preferences CTA */}
          {unlockToken && matchingProperties.length === 0 && (
            <Card className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Sparkles className="h-10 w-10 mx-auto text-primary" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">ابحث عن عقارات مشابهة</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      أكمل تفضيلاتك وسنرسل لك أفضل العقارات المطابقة
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPreferencesDrawer(true)}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    أكمل تفضيلاتك
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Modal */}
        {visitorData && (
          <ViewingBookingModal
            open={showBookingModal}
            onOpenChange={setShowBookingModal}
            propertyId={property.id}
            visitorPhone={visitorData.phone}
            slug={slug!}
            onSuccess={handleBookingSuccess}
          />
        )}

        {/* Preferences Drawer */}
        {visitorData && (
          <PreferencesDrawer
            open={showPreferencesDrawer}
            onOpenChange={setShowPreferencesDrawer}
            visitorPhone={visitorData.phone}
            slug={slug!}
            onSuccess={handlePreferencesSuccess}
          />
        )}
      </div>
    </MemberLayout>
  );
}

