import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Copy,
  ExternalLink,
  MousePointerClick,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  Link2,
} from "lucide-react";
import MemberLayout from "@/components/MemberLayout";

interface MarketerLink {
  id: string;
  landingPageId: string;
  marketerId: string | null;
  marketerName: string | null;
  trackingCode: string;
  clicks: number;
  conversions: number;
  bookings: number;
  commissionRate: number;
  totalCommission: number;
  isActive: boolean;
  createdAt: string;
}

interface MarketerStats {
  links: MarketerLink[];
  stats: {
    totalClicks: number;
    totalConversions: number;
    totalBookings: number;
    totalCommission: number;
    conversionRate: number;
    bookingRate: number;
  };
}

export default function MarketerDashboard() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [marketerName, setMarketerName] = useState("");
  const [selectedLandingPageId, setSelectedLandingPageId] = useState("");

  // Get current user ID
  const currentUserId = localStorage.getItem("currentUserId");

  // Fetch marketer stats
  const { data: stats, isLoading } = useQuery<MarketerStats>({
    queryKey: ["/api/marketer-links/stats", currentUserId],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/marketer-links/stats?marketerId=${currentUserId}`
      );
      return await res.json();
    },
    enabled: !!currentUserId,
  });

  // Fetch landing pages for dropdown
  const { data: landingPages = [] } = useQuery<any[]>({
    queryKey: ["/api/landing-pages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/landing-pages");
      return await res.json();
    },
  });

  // Create marketer link mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      landingPageId: string;
      trackingCode?: string;
      marketerName?: string;
    }) => {
      const res = await apiRequest("POST", "/api/marketer-links", {
        body: JSON.stringify({
          ...data,
          marketerId: currentUserId,
        }),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketer-links/stats"] });
      setShowCreateDialog(false);
      setTrackingCode("");
      setMarketerName("");
      setSelectedLandingPageId("");
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تم إنشاء رابط التتبع بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الرابط",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = (trackingCode: string, landingPageSlug: string) => {
    const url = `${window.location.origin}/offer/${landingPageSlug}?ref=${trackingCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رابط التتبع",
    });
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">لوحة تحكم المسوقين</h1>
                <p className="text-muted-foreground">
                  إدارة روابط التتبع والإحصائيات
                </p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء رابط تتبع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إنشاء رابط تتبع جديد</DialogTitle>
                    <DialogDescription>
                      أنشئ رابط تتبع خاص بك لصفحة هبوط
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="landingPage">صفحة الهبوط</Label>
                      <Select
                        value={selectedLandingPageId}
                        onValueChange={setSelectedLandingPageId}
                      >
                        <SelectTrigger id="landingPage" className="mt-2">
                          <SelectValue placeholder="اختر صفحة الهبوط" />
                        </SelectTrigger>
                        <SelectContent>
                          {landingPages.map(({ landingPage, property }) => (
                            <SelectItem key={landingPage.id} value={landingPage.id}>
                              {property
                                ? `${property.district}، ${property.city}`
                                : landingPage.slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="trackingCode">رمز التتبع (اختياري)</Label>
                      <Input
                        id="trackingCode"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="سيتم إنشاء رمز تلقائياً"
                        className="mt-2"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marketerName">اسم المسوق (اختياري)</Label>
                      <Input
                        id="marketerName"
                        value={marketerName}
                        onChange={(e) => setMarketerName(e.target.value)}
                        placeholder="للمسوقين الخارجيين"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={() => {
                        if (!selectedLandingPageId) {
                          toast({
                            title: "خطأ",
                            description: "يرجى اختيار صفحة الهبوط",
                            variant: "destructive",
                          });
                          return;
                        }
                        createMutation.mutate({
                          landingPageId: selectedLandingPageId,
                          trackingCode: trackingCode.trim() || undefined,
                          marketerName: marketerName.trim() || undefined,
                        });
                      }}
                      disabled={createMutation.isPending || !selectedLandingPageId}
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الإنشاء...
                        </>
                      ) : (
                        "إنشاء"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي النقرات</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.stats.totalClicks}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">التحويلات</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.stats.totalConversions}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.stats.conversionRate.toFixed(1)}% معدل التحويل
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الحجوزات</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.stats.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.stats.bookingRate.toFixed(1)}% معدل الحجز
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">العمولات</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('ar-SA').format(stats.stats.totalCommission)} ر.س
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Links List */}
            {stats && stats.links.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">روابط التتبع</h2>
                {stats.links.map((link) => {
                  const landingPage = landingPages.find(
                    (lp) => lp.landingPage.id === link.landingPageId
                  );
                  const slug = landingPage?.landingPage.slug || "";

                  return (
                    <Card key={link.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold">
                                {link.trackingCode}
                              </h3>
                              <Badge variant={link.isActive ? "default" : "secondary"}>
                                {link.isActive ? "نشط" : "غير نشط"}
                              </Badge>
                            </div>
                            {landingPage?.property && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {landingPage.property.district}، {landingPage.property.city}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <MousePointerClick className="h-4 w-4" />
                                {link.clicks} نقرة
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {link.conversions} تحويل
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {link.bookings} حجز
                              </div>
                              {link.commissionRate > 0 && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {link.totalCommission} ر.س ({link.commissionRate}%)
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                /offer/{slug}?ref={link.trackingCode}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyLink(link.trackingCode, slug)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={`/offer/${slug}?ref=${link.trackingCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    لا توجد روابط تتبع بعد
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء رابط تتبع جديد
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}

